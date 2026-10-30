import { FUNCTIONS } from "./keywords";
import { tokenize, TokenType } from "./tokenizer";

export type KeywordCase = "upper" | "lower" | "preserve";

export interface FormatOptions {
  keywordCase: KeywordCase;
  indentSize: number;
  useTabs: boolean;
}

export const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  keywordCase: "upper",
  indentSize: 2,
  useTabs: false,
};

interface Lexeme {
  text: string;
  up: string; // uppercase text
  type: TokenType;
  from: number;
  to: number;
  nlBefore: number; // newlines in the whitespace before this lexeme
}

type BlockKind = "declare" | "unit" | "begin" | "if" | "loop" | "case";

interface BlockFrame {
  kind: BlockKind;
  base: number; // indent of the opening/closing keywords
  body: number; // indent of statements inside
  exc?: boolean; // begin block: inside EXCEPTION section
  stmt?: boolean; // case: CASE statement (vs. CASE expression)
}

interface SqlState {
  base: number; // indent of clause keywords (SELECT/FROM/WHERE...)
  kind: string; // first keyword of the statement (SELECT, UPDATE, MERGE...)
  clause: string; // current clause
}

interface ParenFrame {
  kind: "paren" | "subquery" | "list";
  base: number; // indent of the line holding "("
  savedSql: SqlState | null;
}

const DML_START = new Set(["SELECT", "INSERT", "UPDATE", "DELETE", "MERGE", "WITH"]);
const UNIT_PREFIX = new Set([
  "CREATE", "OR", "REPLACE", "EDITIONABLE", "NONEDITIONABLE", "MEMBER", "STATIC",
  "CONSTRUCTOR", "OVERRIDING", "FINAL", "NOT", "INSTANTIABLE", "MAP", "ORDER",
]);
const NO_SPACE_BEFORE_PAREN_KW = new Set(["EXCEPTION_INIT", "RESTRICT_REFERENCES"]);
const CASED_TYPES = new Set<TokenType>(["keyword", "type", "constant", "exception", "attribute"]);

/** Formats Oracle SQL / PL/SQL / SQL*Plus source. */
export function formatOracle(src: string, options: Partial<FormatOptions> = {}): string {
  const opts = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const lex = toLexemes(src);
  const unit = opts.useTabs ? "\t" : " ".repeat(opts.indentSize);
  const ind = (n: number) => unit.repeat(Math.max(0, n));

  // ---------- output ----------
  const lines: string[] = [];
  let cur = ""; // current line without indent
  let curIndent = 0;
  let nextIndent = 0;
  let prev: Lexeme | null = null;
  let prevUnary = false;

  const nl = (indent: number) => {
    if (cur.trim()) lines.push(ind(curIndent) + cur.replace(/\s+$/, ""));
    cur = "";
    nextIndent = indent;
  };
  const blankLine = () => {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
  };
  const needSpace = (l: Lexeme): boolean => {
    if (!prev) return false;
    const p = prev.text;
    const c = l.text;
    if (c === "," || c === ";" || c === ")" || c === "." || c === "..") return false;
    if (p === "(" || p === "." || p === ".." || p === "@" || c === "@") return false;
    if (l.type === "attribute") return false;
    if (prevUnary) return false;
    if (c === "(") {
      if (["ident", "function", "type", "quoted-ident", "package", "variable", "attribute"].includes(prev.type)) return false;
      if (prev.type === "keyword" && NO_SPACE_BEFORE_PAREN_KW.has(prev.up)) return false;
    }
    return true;
  };
  const write = (l: Lexeme, text = caseOf(l)) => {
    if (!cur) {
      if (l.nlBefore >= 2) blankLine();
      curIndent = nextIndent;
      cur = text;
    } else {
      cur += (needSpace(l) ? " " : "") + text;
    }
    prevUnary =
      (l.text === "-" || l.text === "+") &&
      (!prev || ["operator", "keyword"].includes(prev.type) || prev.text === "(" || prev.text === ",") &&
      !(prev && prev.text === ")");
    prev = l;
  };
  const caseOf = (l: Lexeme): string => {
    const cased =
      CASED_TYPES.has(l.type) || (l.type === "function" && FUNCTIONS.has(l.up));
    if (!cased || opts.keywordCase === "preserve") return l.text;
    return opts.keywordCase === "upper" ? l.text.toUpperCase() : l.text.toLowerCase();
  };

  // ---------- state ----------
  const blocks: BlockFrame[] = [];
  let parens: ParenFrame[] = [];
  let sql: SqlState | null = null;
  let atStmtStart = true;
  let stmtWords: string[] = [];
  let unitPending = false;
  let betweenPending = false;

  const top = () => blocks[blocks.length - 1];
  const topParen = () => parens[parens.length - 1];
  const stmtIndent = () => (top() ? top().body : 0);
  const startStatement = () => {
    atStmtStart = true;
    stmtWords = [];
    sql = null;
    parens = [];
    unitPending = false;
    betweenPending = false;
  };
  // SQL clause rules apply when we are not inside a plain (non-subquery) parenthesis
  const sqlActive = () => sql !== null && (!topParen() || topParen().kind === "subquery");
  const peek = (i: number, k = 1): Lexeme | undefined => {
    let j = i;
    let left = k;
    while (++j < lex.length) {
      if (lex[j].type === "comment") continue;
      if (--left === 0) return lex[j];
    }
    return undefined;
  };
  const isKw = (l: Lexeme | undefined, ...words: string[]) =>
    !!l && l.type === "keyword" && words.includes(l.up);
  const clause = (indent: number) => {
    if (cur) nl(indent);
    else nextIndent = indent;
  };

  for (let i = 0; i < lex.length; i++) {
    const l = lex[i];
    const kw = l.type === "keyword" ? l.up : "";

    // ---- comments ----
    if (l.type === "comment") {
      const ownLine = l.nlBefore > 0 || i === 0;
      if (ownLine) {
        const indent = cur ? curIndent : nextIndent;
        nl(indent);
        write(l, l.text);
        nl(indent);
      } else if (cur) {
        cur += " " + l.text;
        if (l.text.startsWith("--")) nl(curIndent);
      } else if (lines.length) {
        // trailing comment after a statement that already ended its line
        lines[lines.length - 1] += " " + l.text;
      } else {
        write(l, l.text);
      }
      continue;
    }

    // ---- SQL*Plus lines are kept verbatim ----
    if (l.type === "sqlplus") {
      const eol = src.indexOf("\n", l.from);
      const end = eol === -1 ? src.length : eol;
      nl(0);
      write({ ...l }, src.slice(l.from, end).trimEnd());
      if (l.text === "/") blocks.length = 0;
      nl(stmtIndent());
      while (i + 1 < lex.length && lex[i + 1].from < end) i++;
      startStatement();
      continue;
    }

    const wasStmtStart = atStmtStart;
    atStmtStart = false;
    if (l.type === "keyword" || l.type === "ident") stmtWords.push(l.up);

    // ---- labels ----
    if (l.type === "label") {
      nl(stmtIndent());
      write(l);
      nl(stmtIndent());
      atStmtStart = true;
      continue;
    }

    // ---- statement terminator ----
    if (l.text === ";") {
      write(l);
      startStatement();
      nl(stmtIndent());
      continue;
    }

    // ---- PL/SQL block structure ----
    if (kw === "DECLARE") {
      clause(stmtIndent());
      const base = stmtIndent();
      write(l);
      blocks.push({ kind: "declare", base, body: base + 1 });
      startStatement();
      nl(base + 1);
      continue;
    }

    if (kw === "BEGIN") {
      let base = stmtIndent();
      const t = top();
      if (t && (t.kind === "declare" || t.kind === "unit") && !parens.length) {
        blocks.pop();
        base = t.base;
      }
      clause(base);
      write(l);
      blocks.push({ kind: "begin", base, body: base + 1 });
      startStatement();
      nl(base + 1);
      continue;
    }

    if (kw === "EXCEPTION" && isKw(peek(i), "WHEN") && top()?.kind === "begin") {
      const t = top();
      clause(t.base);
      write(l);
      t.exc = true;
      t.body = t.base + 1;
      startStatement();
      nl(t.base + 1);
      continue;
    }

    if (kw === "END") {
      const next = peek(i);
      const pair = isKw(next, "IF", "LOOP", "CASE") ? next!.up : "";
      let frame: BlockFrame | undefined;
      if (pair) {
        const want: BlockKind = pair === "IF" ? "if" : pair === "LOOP" ? "loop" : "case";
        while (blocks.length && top().kind !== want) blocks.pop();
        frame = blocks.pop();
      } else {
        frame = blocks.pop();
      }
      const base = frame ? frame.base : 0;
      const isCaseExpr = frame?.kind === "case" && !frame.stmt;
      clause(base);
      write(l);
      if (pair) {
        i = lex.indexOf(next!);
        write(next!);
      }
      if (!isCaseExpr) {
        sql = null;
        parens = [];
      }
      continue;
    }

    if (kw === "IF" && wasStmtStart) {
      const base = stmtIndent();
      clause(base);
      write(l);
      blocks.push({ kind: "if", base, body: base + 1 });
      continue;
    }
    if (kw === "ELSIF" && top()?.kind === "if") {
      clause(top().base);
      write(l);
      continue;
    }

    if (kw === "CASE") {
      const stmt = wasStmtStart && !sql;
      let base: number;
      if (stmt) {
        base = stmtIndent();
        clause(base);
      } else {
        base = cur ? curIndent : nextIndent;
        if (sql) base = Math.max(base, sql.base + 1);
      }
      write(l);
      blocks.push({ kind: "case", base, body: base + 2, stmt });
      continue;
    }

    if (kw === "WHEN" && top()?.kind === "case") {
      clause(top().base + 1);
      write(l);
      continue;
    }
    if (kw === "WHEN" && sqlActive() && sql!.kind === "MERGE") {
      clause(sql!.base);
      write(l);
      sql!.clause = "WHEN";
      continue;
    }
    if (kw === "WHEN" && top()?.kind === "begin" && top().exc && !sql) {
      clause(top().base + 1);
      write(l);
      continue;
    }

    if (kw === "THEN") {
      const t = top();
      if (t && !sqlActive() && !parens.length) {
        if (t.kind === "if" || (t.kind === "case" && t.stmt) || (t.kind === "begin" && t.exc)) {
          write(l);
          const body = t.kind === "if" ? t.base + 1 : t.base + 2;
          t.body = body;
          startStatement();
          nl(body);
          continue;
        }
      }
      write(l);
      continue;
    }

    if (kw === "ELSE") {
      const t = top();
      if (t?.kind === "case") {
        clause(t.base + 1);
        write(l);
        if (t.stmt) {
          t.body = t.base + 2;
          startStatement();
          nl(t.body);
        }
        continue;
      }
      if (t?.kind === "if" && !parens.length) {
        clause(t.base);
        write(l);
        startStatement();
        nl(t.body);
        continue;
      }
    }

    if (kw === "LOOP" && !parens.length) {
      const base = stmtIndent();
      if (wasStmtStart) clause(base);
      write(l);
      blocks.push({ kind: "loop", base, body: base + 1 });
      startStatement();
      nl(base + 1);
      continue;
    }

    // ---- program unit headers: PROCEDURE p IS / FUNCTION f RETURN x AS / PACKAGE [BODY] p AS ----
    if (["PROCEDURE", "FUNCTION", "PACKAGE"].includes(kw) || (kw === "TYPE" && isKw(peek(i), "BODY"))) {
      const before = stmtWords.slice(0, -1);
      if (before.every((w) => UNIT_PREFIX.has(w))) unitPending = true;
    }
    if ((kw === "IS" || kw === "AS") && unitPending && !parens.length) {
      const base = stmtIndent();
      write(l);
      blocks.push({ kind: "unit", base, body: base + 1 });
      startStatement();
      nl(base + 1);
      continue;
    }

    // ---- SQL ----
    if (wasStmtStart && DML_START.has(kw)) {
      if (sql && sql.clause === "") {
        // first keyword of a subquery
        sql.kind = kw;
        sql.clause = kw;
      } else {
        sql = { base: stmtIndent(), kind: kw, clause: kw };
      }
      write(l);
      continue;
    }

    if (kw === "SELECT" && !sqlActive()) {
      // CURSOR c IS SELECT / OPEN c FOR SELECT / CREATE VIEW v AS SELECT
      sql = { base: stmtIndent() + 1, kind: "SELECT", clause: "SELECT" };
      clause(sql.base);
      write(l);
      continue;
    }

    if (sqlActive() && l.type === "keyword") {
      const s = sql!;
      const n1 = peek(i);
      const n2 = peek(i, 2);
      const prevUp = (prev as Lexeme | null)?.up ?? ""; // `prev` is reassigned inside write()
      let words = 0; // how many extra keywords belong to this clause
      let name = "";

      if (["SELECT", "FROM", "WHERE", "HAVING", "VALUES", "RETURNING", "INTERSECT", "MINUS", "EXCEPT", "OFFSET"].includes(kw)) {
        if (!(kw === "FROM" && s.clause === "DELETE" && prevUp === "DELETE")) name = kw;
      } else if (kw === "INTO" && !["INSERT", "MERGE", "COLLECT"].includes(prevUp)) {
        name = kw;
      } else if (["GROUP", "ORDER", "CONNECT"].includes(kw) && isKw(n1, "BY")) {
        name = kw;
        words = 1;
      } else if (kw === "START" && isKw(n1, "WITH")) {
        name = kw;
        words = 1;
      } else if (kw === "UNION") {
        name = kw;
        words = isKw(n1, "ALL") ? 1 : 0;
      } else if (kw === "JOIN") {
        name = "JOIN";
      } else if (["LEFT", "RIGHT", "FULL"].includes(kw) && (isKw(n1, "JOIN") || (isKw(n1, "OUTER") && isKw(n2, "JOIN")))) {
        name = "JOIN";
        words = isKw(n1, "OUTER") ? 2 : 1;
      } else if (["INNER", "CROSS", "NATURAL"].includes(kw) && isKw(n1, "JOIN", "APPLY")) {
        name = "JOIN";
        words = 1;
      } else if (kw === "OUTER" && isKw(n1, "APPLY")) {
        name = "JOIN";
        words = 1;
      } else if (kw === "BULK" && isKw(n1, "COLLECT")) {
        name = "INTO";
        words = 1;
      } else if (kw === "FOR" && isKw(n1, "UPDATE")) {
        name = "FOR UPDATE";
        words = 1;
      } else if (kw === "FETCH" && isKw(n1, "FIRST", "NEXT")) {
        name = "FETCH";
      } else if (kw === "SET" && (s.kind === "UPDATE" || s.kind === "MERGE")) {
        name = "SET";
      } else if (kw === "USING" && s.kind === "MERGE" && s.clause === "MERGE") {
        name = "USING";
      } else if (kw === "ON" && s.kind === "MERGE" && s.clause === "USING") {
        name = "ON";
      } else if (kw === "ON" && s.clause === "JOIN") {
        s.clause = "ON";
      }

      if (name) {
        clause(s.base);
        write(l);
        for (let k = 0; k < words; k++) {
          const nx = peek(i)!;
          i = lex.indexOf(nx);
          write(nx);
        }
        s.clause = name;
        continue;
      }

      if (kw === "BETWEEN") betweenPending = true;
      if ((kw === "AND" || kw === "OR") && top()?.kind !== "case") {
        if (kw === "AND" && betweenPending) {
          betweenPending = false;
        } else if (["WHERE", "HAVING", "ON", "START", "CONNECT", "WHEN"].includes(s.clause)) {
          clause(s.base + 1);
        }
      }
    }

    // ---- parentheses ----
    if (l.text === "(") {
      const lineIndent = cur ? curIndent : nextIndent;
      const n1 = peek(i);
      if (isKw(n1, "SELECT", "WITH")) {
        write(l);
        parens.push({ kind: "subquery", base: lineIndent, savedSql: sql });
        sql = { base: lineIndent + 1, kind: n1!.up, clause: "" };
        nl(lineIndent + 1);
        atStmtStart = true;
        continue;
      }
      const isCreateTable =
        !parens.length && stmtWords[0] === "CREATE" && stmtWords.includes("TABLE") && !sql;
      if (isCreateTable && cur) cur += " ";
      write(l);
      if (isCreateTable) {
        parens.push({ kind: "list", base: lineIndent, savedSql: sql });
        nl(lineIndent + 1);
      } else {
        parens.push({ kind: "paren", base: lineIndent, savedSql: sql });
      }
      continue;
    }

    if (l.text === ")") {
      const p = parens.pop();
      if (p && (p.kind === "subquery" || p.kind === "list")) {
        nl(p.base);
        write(l);
        sql = p.savedSql;
        continue;
      }
      write(l);
      continue;
    }

    if (l.text === ",") {
      write(l);
      const p = topParen();
      if (p?.kind === "list") {
        nl(p.base + 1);
      } else if (sqlActive()) {
        const s = sql!;
        if (s.clause === "SELECT" || s.clause === "SET") nl(s.base + 1);
        else if (s.clause === "WITH") nl(s.base);
      }
      continue;
    }

    write(l);
  }

  nl(0);
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function toLexemes(src: string): Lexeme[] {
  const out: Lexeme[] = [];
  let pos = 0;
  for (const t of tokenize(src, { identifiers: true })) {
    const gap = src.slice(pos, t.from);
    const text = src.slice(t.from, t.to);
    out.push({
      text,
      up: text.toUpperCase(),
      type: t.type === "hint" ? "other" : t.type,
      from: t.from,
      to: t.to,
      nlBefore: (gap.match(/\n/g) || []).length,
    });
    pos = t.to;
  }
  return out;
}
