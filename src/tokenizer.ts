import {
  CONSTANTS,
  EXCEPTIONS,
  FUNCTIONS,
  KEYWORDS,
  PACKAGE_RE,
  PSEUDO,
  SQLPLUS,
  SQLPLUS_SET_OPTIONS,
  TYPES,
} from "./keywords";

export type TokenType =
  | "comment"
  | "hint"
  | "string"
  | "number"
  | "keyword"
  | "type"
  | "function"
  | "package"
  | "constant"
  | "exception"
  | "variable"
  | "label"
  | "attribute"
  | "operator"
  | "punctuation"
  | "sqlplus"
  | "quoted-ident"
  | "ident" // only with { identifiers: true }
  | "other"; // only with { identifiers: true }

export interface Token {
  from: number;
  to: number;
  type: TokenType;
}

const IDENT_START = /[\p{L}_]/u;
const IDENT_PART = /[\p{L}\p{N}_$#]/u;
const Q_CLOSERS: Record<string, string> = { "[": "]", "(": ")", "{": "}", "<": ">" };
const MULTI_OPS = [":=", "=>", "||", "**", "..", "<>", "!=", "^=", "~=", "<=", ">="];
const SINGLE_OPS = "+-*/=<>@|^~!";
const PUNCT = "(),;.[]";

export interface TokenizeOptions {
  /** Also emit plain identifiers ("ident") and unknown characters ("other"). Used by the formatter. */
  identifiers?: boolean;
}

/** Tokenizes Oracle SQL / PL/SQL / SQL*Plus source. Whitespace is never emitted. */
export function tokenize(src: string, opts: TokenizeOptions = {}): Token[] {
  const tokens: Token[] = [];
  const n = src.length;
  let i = 0;
  let lineStart = true; // only whitespace seen since the last newline
  let prevSignificant = ""; // previous non-whitespace char, used to detect `obj.member`

  const push = (from: number, to: number, type: TokenType) => {
    if (to > from) tokens.push({ from, to, type });
  };
  const eol = (from: number) => {
    const e = src.indexOf("\n", from);
    return e === -1 ? n : e;
  };
  const readIdent = (from: number) => {
    let j = from;
    while (j < n && IDENT_PART.test(src[j])) j++;
    return j;
  };
  const skipSpaces = (from: number) => {
    let j = from;
    while (j < n && (src[j] === " " || src[j] === "\t")) j++;
    return j;
  };
  const nextWord = (from: number) => {
    const s = skipSpaces(from);
    return src.slice(s, readIdent(s)).toUpperCase();
  };

  while (i < n) {
    const c = src[i];

    if (c === "\n") {
      lineStart = true;
      i++;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      i++;
      continue;
    }

    const atLineStart = lineStart;
    lineStart = false;
    const start = i;

    // -- line comment
    if (c === "-" && src[i + 1] === "-") {
      i = eol(i);
      push(start, i, "comment");
      prevSignificant = "";
      continue;
    }

    // /* block comment */ and /*+ optimizer hint */
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      push(start, i, src[start + 2] === "+" ? "hint" : "comment");
      prevSignificant = "";
      continue;
    }

    // SQL*Plus constructs at the start of a line
    if (atLineStart) {
      const lineEnd = eol(i);
      const lineText = src.slice(i, lineEnd).trim();

      // "/" alone on a line executes the buffer
      if (lineText === "/") {
        i++;
        push(start, i, "sqlplus");
        continue;
      }
      // @script.sql / @@script.sql
      if (c === "@") {
        i = lineEnd;
        push(start, i, "sqlplus");
        continue;
      }
      if (IDENT_START.test(c)) {
        const wEnd = readIdent(i);
        const word = src.slice(i, wEnd).toUpperCase();
        if (isSqlPlusCommand(word, src, wEnd, nextWord)) {
          push(start, wEnd, "sqlplus");
          if (word === "REM" || word === "REMARK") {
            push(wEnd, lineEnd, "comment");
            i = lineEnd;
          } else if (word === "PROMPT") {
            push(skipSpaces(wEnd), lineEnd, "string");
            i = lineEnd;
          } else {
            i = wEnd;
          }
          prevSignificant = "";
          continue;
        }
      }
    }

    // q'[alternative quoting]' (also nq'...')
    const qMatch = /^[nN]?[qQ]'/.exec(src.slice(i, i + 3));
    if (qMatch && i + qMatch[0].length < n) {
      const open = src[i + qMatch[0].length];
      const close = (Q_CLOSERS[open] ?? open) + "'";
      const end = src.indexOf(close, i + qMatch[0].length + 1);
      i = end === -1 ? n : end + 2;
      push(start, i, "string");
      prevSignificant = "'";
      continue;
    }

    // 'string' / N'national string' with '' escapes
    if (c === "'" || ((c === "n" || c === "N") && src[i + 1] === "'")) {
      i += c === "'" ? 1 : 2;
      while (i < n) {
        if (src[i] === "'") {
          if (src[i + 1] === "'") {
            i += 2;
            continue;
          }
          i++;
          break;
        }
        i++;
      }
      push(start, i, "string");
      prevSignificant = "'";
      continue;
    }

    // "Quoted Identifier"
    if (c === '"') {
      const end = src.indexOf('"', i + 1);
      i = end === -1 ? n : end + 1;
      push(start, i, "quoted-ident");
      prevSignificant = '"';
      continue;
    }

    // numbers: 42, 3.14, .5, 1e-10, 2.5f, 3d
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? "") && prevSignificant !== ".")) {
      const m = /^(\d+(\.(?!\.)\d*)?|\.\d+)([eE][+-]?\d+)?[fFdD]?/.exec(src.slice(i));
      i += m ? m[0].length : 1;
      push(start, i, "number");
      prevSignificant = "0";
      continue;
    }

    // :bind / :new / :1 (but not :=)
    if (c === ":" && src[i + 1] !== "=" && i + 1 < n && (IDENT_START.test(src[i + 1]) || /[0-9]/.test(src[i + 1]))) {
      i = readIdent(i + 1);
      push(start, i, "variable");
      prevSignificant = "a";
      continue;
    }

    // &substitution / &&substitution (optionally terminated by '.')
    if (c === "&") {
      let j = i + 1;
      if (src[j] === "&") j++;
      if (j < n && IDENT_START.test(src[j])) {
        i = readIdent(j);
        if (src[i] === ".") i++;
        push(start, i, "variable");
        prevSignificant = "a";
        continue;
      }
    }

    // <<label>>
    if (c === "<" && src[i + 1] === "<") {
      const m = /^<<\s*[\p{L}_][\p{L}\p{N}_$#]*\s*>>/u.exec(src.slice(i));
      if (m) {
        i += m[0].length;
        push(start, i, "label");
        prevSignificant = ">";
        continue;
      }
    }

    // %TYPE, %ROWTYPE, %FOUND, %NOTFOUND, %ISOPEN, %ROWCOUNT, ...
    if (c === "%" && i + 1 < n && IDENT_START.test(src[i + 1])) {
      i = readIdent(i + 1);
      push(start, i, "attribute");
      prevSignificant = "a";
      continue;
    }

    // identifiers & keywords
    if (IDENT_START.test(c)) {
      i = readIdent(i);
      const word = src.slice(start, i).toUpperCase();
      const afterDot = prevSignificant === ".";
      const followedByParen = src[skipSpaces(i)] === "(";
      const type = classifyWord(word, afterDot, followedByParen);
      if (type) push(start, i, type);
      else if (opts.identifiers) push(start, i, "ident");
      prevSignificant = "a";
      continue;
    }

    // operators
    const two = src.slice(i, i + 2);
    if (MULTI_OPS.includes(two)) {
      i += 2;
      push(start, i, "operator");
      prevSignificant = two[1];
      continue;
    }
    if (SINGLE_OPS.includes(c)) {
      i++;
      push(start, i, "operator");
      prevSignificant = c;
      continue;
    }
    if (PUNCT.includes(c)) {
      i++;
      push(start, i, "punctuation");
      prevSignificant = c;
      continue;
    }

    // anything else
    i++;
    if (opts.identifiers) push(start, i, "other");
    prevSignificant = c;
  }

  return tokens;
}

function isSqlPlusCommand(
  word: string,
  src: string,
  wordEnd: number,
  nextWord: (from: number) => string,
): boolean {
  if (!SQLPLUS.has(word)) return false;
  // `name := ...`, `set(...)`, `show.x` -> not a command
  const after = src.slice(wordEnd).match(/^[ \t]*(\S)/);
  if (after && /[:=(.,;]/.test(after[1]) && word !== "PROMPT") {
    // `SHOW ERRORS;` style is fine, but `x := ` / `f(` are not commands
    if (after[1] !== ";") return false;
  }
  const next = nextWord(wordEnd);
  switch (word) {
    case "SET":
      return SQLPLUS_SET_OPTIONS.has(next); // otherwise UPDATE ... SET col = ...
    case "CONNECT":
      return next !== "BY"; // CONNECT BY PRIOR ...
    case "EXEC":
    case "EXECUTE":
      return next !== "IMMEDIATE";
    case "COLUMN":
      return next !== "" && !KEYWORDS.has(next) && !TYPES.has(next);
    case "DESC":
      return next !== "";
    default:
      return true;
  }
}

function classifyWord(word: string, afterDot: boolean, followedByParen: boolean): TokenType | null {
  if (afterDot) {
    // members of records/packages/sequences: rec.level, seq.NEXTVAL, pkg.proc(...)
    if (PSEUDO.has(word)) return "constant";
    if (followedByParen) return "function";
    return null;
  }
  if (CONSTANTS.has(word)) return "constant";
  if (EXCEPTIONS.has(word)) return "exception";
  if (PACKAGE_RE.test(word)) return "package";
  if (FUNCTIONS.has(word) && (followedByParen || !KEYWORDS.has(word))) return "function";
  if (TYPES.has(word)) return "type";
  if (KEYWORDS.has(word)) return "keyword";
  if (PSEUDO.has(word)) return "constant";
  if (followedByParen) return "function";
  return null;
}
