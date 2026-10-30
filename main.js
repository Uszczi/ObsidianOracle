"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => OracleHighlightPlugin
});
module.exports = __toCommonJS(main_exports);
var import_state2 = require("@codemirror/state");
var import_obsidian = require("obsidian");

// src/editorExtension.ts
var import_state = require("@codemirror/state");
var import_view = require("@codemirror/view");

// src/keywords.ts
var words = (s) => new Set(s.trim().split(/\s+/).map((w) => w.toUpperCase()));
var KEYWORDS = words(`
  ACCESS ADD AFTER AGGREGATE ALL ALTER ANALYZE AND ANY ARRAY AS ASC AT AUDIT AUTHID
  AUTONOMOUS_TRANSACTION BEFORE BEGIN BETWEEN BODY BULK BULK_EXCEPTIONS BY
  CACHE CALL CASCADE CASE CHECK CLOSE CLUSTER COALESCE COLLECT COLUMN COLUMNS COMMENT
  COMMIT COMMITTED COMPILE COMPOUND COMPRESS CONNECT CONSTANT CONSTRAINT CONSTRAINTS
  CONTINUE CREATE CROSS CUBE CURRENT CURRENT_USER CURSOR CYCLE
  DATABASE DEBUG DECLARE DEFAULT DEFERRABLE DEFERRED DEFINER DELETE DESC DETERMINISTIC
  DIRECTORY DISABLE DISTINCT DO DROP EACH EDITIONABLE ELSE ELSIF ELSEIF ENABLE END
  ERRORS ESCAPE EXCEPT EXCEPTION EXCEPTIONS EXCEPTION_INIT EXCLUSIVE EXECUTE EXISTS EXIT EXPLAIN
  EXTERNAL FETCH FINAL FIRST FOLLOWING FOR FORALL FORCE FOREIGN FROM FULL FUNCTION
  GLOBAL GOTO GRANT GROUP GROUPING HAVING IDENTIFIED IDENTITY IF IMMEDIATE IN INCLUDING INCREMENT INDEX
  INDEXED INDICES INHERIT INITIALLY INNER INSERT INSTANTIABLE INSTEAD INTERSECT INTO INVISIBLE
  IS ISOLATION JAVA JOIN KEEP KEY LANGUAGE LAST LATERAL LEFT LEVELS LIBRARY LIKE LIKE2 LIKE4 LIKEC
  LIMIT LOCK LOG LOGGING LOOP MATCHED MATERIALIZED MAXVALUE MEMBER MERGE MINUS MINVALUE MODE
  MODIFY MULTISET NATURAL NESTED NEW NEXT NOAUDIT NOCACHE NOCOMPRESS NOCOPY NOCYCLE NOLOGGING
  NOMAXVALUE NOMINVALUE NONE NONEDITIONABLE NOORDER NOPARALLEL NOT NOVALIDATE NOWAIT NULLS OBJECT OF
  OFF OFFSET OLD ON ONLY OPEN OPTION OR ORDER ORGANIZATION OTHERS OUT OUTER OVER OVERRIDING
  PACKAGE PARALLEL PARALLEL_ENABLE PARTITION PARTITIONS PERCENT PIPE PIPELINED PIPE PIVOT PRAGMA
  PRECEDING PRESERVE PRIMARY PRIOR PRIVILEGES PROCEDURE PUBLIC PURGE QUERY RAISE RANGE READ
  RECORD RECURSIVE REF REFERENCES REFERENCING REFRESH RELIES_ON RENAME REPLACE RESOURCE RESTRICT_REFERENCES
  RESULT RESULT_CACHE RETURN RETURNING REUSE REVERSE REVOKE RIGHT ROLE ROLLBACK ROLLUP ROW ROWS
  SAMPLE SAVE SAVEPOINT SCHEMA SEARCH SEGMENT SELECT SELF SEQUENCE SERIALIZABLE SERIALLY_REUSABLE
  SESSION SET SETS SHARE SIBLINGS SIZE SOME SQL START STATEMENT STATIC STORAGE SUBPARTITION SUBTYPE
  SYNONYM SYSTEM TABLE TABLES TABLESPACE TEMPORARY THEN TIES TO TRANSACTION TRIGGER TRUNCATE TYPE
  UNBOUNDED UNDER UNION UNIQUE UNLIMITED UNPIVOT UNTIL UPDATE UPSERT USE USING VALIDATE VALUES
  VARRAY VARYING VIEW VIRTUAL VISIBLE WAIT WHEN WHENEVER WHERE WHILE WITH WITHIN WORK WRAPPED WRITE
  XMLTABLE JSON_TABLE ZONE MATCH_RECOGNIZE PATTERN DEFINE MEASURES APPLY ACCESSIBLE SHARING EDITION
  ROWTYPE MODEL DIMENSION MEASURES RULES ITERATE NOCOPY BYTE CHAR_CS
`);
var TYPES = words(`
  BFILE BINARY_DOUBLE BINARY_FLOAT BINARY_INTEGER BLOB BOOLEAN CHAR CHARACTER CLOB DATE DEC DECIMAL
  DOUBLE FLOAT INT INTEGER INTERVAL JSON LONG MLSLABEL NATURALN NATURAL NCHAR NCLOB NUMBER NUMERIC
  NVARCHAR2 PLS_INTEGER POSITIVE POSITIVEN PRECISION RAW REAL ROWID SIGNTYPE SIMPLE_DOUBLE SIMPLE_FLOAT
  SIMPLE_INTEGER SMALLINT STRING TIMESTAMP UROWID VARCHAR VARCHAR2 XMLTYPE YEAR MONTH DAY HOUR MINUTE
  SECOND LOCAL SYS_REFCURSOR ANYDATA ANYTYPE SDO_GEOMETRY VECTOR
`);
var CONSTANTS = words(`NULL TRUE FALSE`);
var PSEUDO = words(`
  ROWNUM LEVEL SYSDATE SYSTIMESTAMP CURRENT_DATE CURRENT_TIMESTAMP LOCALTIMESTAMP DBTIMEZONE
  SESSIONTIMEZONE USER UID NEXTVAL CURRVAL ORA_ROWSCN COLUMN_VALUE OBJECT_VALUE SQLCODE SQLERRM
  CONNECT_BY_ISLEAF CONNECT_BY_ISCYCLE
`);
var EXCEPTIONS = words(`
  ACCESS_INTO_NULL CASE_NOT_FOUND COLLECTION_IS_NULL CURSOR_ALREADY_OPEN DUP_VAL_ON_INDEX
  INVALID_CURSOR INVALID_NUMBER LOGIN_DENIED NO_DATA_FOUND NO_DATA_NEEDED NOT_LOGGED_ON
  PROGRAM_ERROR ROWTYPE_MISMATCH SELF_IS_NULL STORAGE_ERROR SUBSCRIPT_BEYOND_COUNT
  SUBSCRIPT_OUTSIDE_LIMIT SYS_INVALID_ROWID TIMEOUT_ON_RESOURCE TOO_MANY_ROWS VALUE_ERROR
  ZERO_DIVIDE
`);
var FUNCTIONS = words(`
  ABS ACOS ADD_MONTHS APPROX_COUNT_DISTINCT ASCII ASCIISTR ASIN ATAN ATAN2 AVG BIN_TO_NUM BITAND
  CARDINALITY CAST CEIL CHARTOREOWID CHARTOROWID CHR COLLECT COMPOSE CONCAT CONVERT CORR COS COSH COUNT
  COVAR_POP COVAR_SAMP CUME_DIST DBTIMEZONE DECODE DECOMPOSE DENSE_RANK DEPTH DEREF DUMP EMPTY_BLOB
  EMPTY_CLOB EXP EXTRACT EXTRACTVALUE FIRST_VALUE FLOOR FROM_TZ GREATEST GROUP_ID GROUPING_ID HEXTORAW
  INITCAP INSTR INSTRB LAG LAST_DAY LAST_VALUE LEAD LEAST LENGTH LENGTHB LISTAGG LN LNNVL LOCALTIMESTAMP
  LOG LOWER LPAD LTRIM MAKE_REF MAX MEDIAN MIN MOD MONTHS_BETWEEN NANVL NCHR NEW_TIME NEXT_DAY NLSSORT
  NLS_CHARSET_ID NLS_CHARSET_NAME NLS_INITCAP NLS_LOWER NLS_UPPER NTH_VALUE NTILE NULLIF NUMTODSINTERVAL
  NUMTOYMINTERVAL NVL NVL2 ORA_HASH PERCENT_RANK PERCENTILE_CONT PERCENTILE_DISC POWER RANK RATIO_TO_REPORT
  RAWTOHEX RAWTONHEX REGEXP_COUNT REGEXP_INSTR REGEXP_LIKE REGEXP_REPLACE REGEXP_SUBSTR REMAINDER REPLACE
  ROUND ROW_NUMBER RPAD RTRIM SCN_TO_TIMESTAMP SIGN SIN SINH SOUNDEX SQRT STANDARD_HASH STDDEV
  STDDEV_POP STDDEV_SAMP SUBSTR SUBSTRB SUM SYS_CONNECT_BY_PATH SYS_CONTEXT SYS_EXTRACT_UTC SYS_GUID
  TAN TANH TIMESTAMP_TO_SCN TO_BINARY_DOUBLE TO_BINARY_FLOAT TO_BLOB TO_CHAR TO_CLOB TO_DATE TO_DSINTERVAL
  TO_LOB TO_MULTI_BYTE TO_NCHAR TO_NCLOB TO_NUMBER TO_SINGLE_BYTE TO_TIMESTAMP TO_TIMESTAMP_TZ
  TO_YMINTERVAL TRANSLATE TREAT TRIM TRUNC TZ_OFFSET UNISTR UPPER USERENV VALUE VAR_POP VAR_SAMP
  VARIANCE VSIZE WIDTH_BUCKET XMLAGG XMLATTRIBUTES XMLCAST XMLCDATA XMLCOLATTVAL XMLCOMMENT XMLCONCAT
  XMLELEMENT XMLEXISTS XMLFOREST XMLPARSE XMLQUERY XMLROOT XMLSERIALIZE JSON_ARRAY JSON_ARRAYAGG
  JSON_OBJECT JSON_OBJECTAGG JSON_QUERY JSON_VALUE JSON_EXISTS JSON_MERGEPATCH JSON_SERIALIZE
  RAISE_APPLICATION_ERROR SQLCODE SQLERRM VALIDATE_CONVERSION
`);
var PACKAGE_RE = /^(DBMS_|UTL_|APEX_|OWA_|CTX_|SDO_|WWV_|HTP$|HTF$|OWA$|STANDARD$)/;
var SQLPLUS = words(`
  ACCEPT BREAK BTITLE CLEAR COLUMN COMPUTE CONNECT DEFINE DESC DESCRIBE DISCONNECT EXEC EXECUTE
  HOST PAUSE PRINT PROMPT QUIT REM REMARK REPFOOTER REPHEADER SET SHOW SHUTDOWN SPOOL STARTUP
  TIMING TTITLE UNDEFINE VARIABLE VAR WHENEVER
`);
var SQLPLUS_SET_OPTIONS = words(`
  APPINFO ARRAYSIZE AUTOCOMMIT AUTOPRINT AUTORECOVERY AUTOTRACE BLOCKTERMINATOR CMDSEP COLSEP
  CONCAT COPYCOMMIT COPYTYPECHECK DEFINE DESCRIBE ECHO EDITFILE EMBEDDED ERRORLOGGING ESCAPE
  ESCCHAR EXITCOMMIT FEEDBACK FEED FLAGGER FLUSH HEADING HEAD HEADSEP INSTANCE LINESIZE LINES LOBOFFSET
  LOGSOURCE LONG LONGCHUNKSIZE MARKUP NEWPAGE NULL NUMFORMAT NUMWIDTH PAGESIZE PAGES PAUSE RECSEP
  RECSEPCHAR SECUREDCOL SERVEROUTPUT SERVEROUT SHIFTINOUT SHOWMODE SQLBLANKLINES SQLCASE SQLCONTINUE
  SQLNUMBER SQLPLUSCOMPATIBILITY SQLPREFIX SQLPROMPT SQLTERMINATOR SUFFIX TAB TERMOUT TERM TIME TIMING
  TRIMOUT TRIMSPOOL UNDERLINE VERIFY VER WRAP SQLFORMAT ENCODING
`);

// src/tokenizer.ts
var IDENT_START = /[\p{L}_]/u;
var IDENT_PART = /[\p{L}\p{N}_$#]/u;
var Q_CLOSERS = { "[": "]", "(": ")", "{": "}", "<": ">" };
var MULTI_OPS = [":=", "=>", "||", "**", "..", "<>", "!=", "^=", "~=", "<=", ">="];
var SINGLE_OPS = "+-*/=<>@|^~!";
var PUNCT = "(),;.[]";
function tokenize(src, opts = {}) {
  var _a, _b;
  const tokens = [];
  const n = src.length;
  let i = 0;
  let lineStart = true;
  let prevSignificant = "";
  const push = (from, to, type) => {
    if (to > from) tokens.push({ from, to, type });
  };
  const eol = (from) => {
    const e = src.indexOf("\n", from);
    return e === -1 ? n : e;
  };
  const readIdent = (from) => {
    let j = from;
    while (j < n && IDENT_PART.test(src[j])) j++;
    return j;
  };
  const skipSpaces = (from) => {
    let j = from;
    while (j < n && (src[j] === " " || src[j] === "	")) j++;
    return j;
  };
  const nextWord = (from) => {
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
    if (c === " " || c === "	" || c === "\r") {
      i++;
      continue;
    }
    const atLineStart = lineStart;
    lineStart = false;
    const start = i;
    if (c === "-" && src[i + 1] === "-") {
      i = eol(i);
      push(start, i, "comment");
      prevSignificant = "";
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      push(start, i, src[start + 2] === "+" ? "hint" : "comment");
      prevSignificant = "";
      continue;
    }
    if (atLineStart) {
      const lineEnd = eol(i);
      const lineText = src.slice(i, lineEnd).trim();
      if (lineText === "/") {
        i++;
        push(start, i, "sqlplus");
        continue;
      }
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
    const qMatch = /^[nN]?[qQ]'/.exec(src.slice(i, i + 3));
    if (qMatch && i + qMatch[0].length < n) {
      const open = src[i + qMatch[0].length];
      const close = ((_a = Q_CLOSERS[open]) != null ? _a : open) + "'";
      const end = src.indexOf(close, i + qMatch[0].length + 1);
      i = end === -1 ? n : end + 2;
      push(start, i, "string");
      prevSignificant = "'";
      continue;
    }
    if (c === "'" || (c === "n" || c === "N") && src[i + 1] === "'") {
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
    if (c === '"') {
      const end = src.indexOf('"', i + 1);
      i = end === -1 ? n : end + 1;
      push(start, i, "quoted-ident");
      prevSignificant = '"';
      continue;
    }
    if (/[0-9]/.test(c) || c === "." && /[0-9]/.test((_b = src[i + 1]) != null ? _b : "") && prevSignificant !== ".") {
      const m = /^(\d+(\.(?!\.)\d*)?|\.\d+)([eE][+-]?\d+)?[fFdD]?/.exec(src.slice(i));
      i += m ? m[0].length : 1;
      push(start, i, "number");
      prevSignificant = "0";
      continue;
    }
    if (c === ":" && src[i + 1] !== "=" && i + 1 < n && (IDENT_START.test(src[i + 1]) || /[0-9]/.test(src[i + 1]))) {
      i = readIdent(i + 1);
      push(start, i, "variable");
      prevSignificant = "a";
      continue;
    }
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
    if (c === "<" && src[i + 1] === "<") {
      const m = /^<<\s*[\p{L}_][\p{L}\p{N}_$#]*\s*>>/u.exec(src.slice(i));
      if (m) {
        i += m[0].length;
        push(start, i, "label");
        prevSignificant = ">";
        continue;
      }
    }
    if (c === "%" && i + 1 < n && IDENT_START.test(src[i + 1])) {
      i = readIdent(i + 1);
      push(start, i, "attribute");
      prevSignificant = "a";
      continue;
    }
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
    i++;
    if (opts.identifiers) push(start, i, "other");
    prevSignificant = c;
  }
  return tokens;
}
function isSqlPlusCommand(word, src, wordEnd, nextWord) {
  if (!SQLPLUS.has(word)) return false;
  const after = src.slice(wordEnd).match(/^[ \t]*(\S)/);
  if (after && /[:=(.,;]/.test(after[1]) && word !== "PROMPT") {
    if (after[1] !== ";") return false;
  }
  const next = nextWord(wordEnd);
  switch (word) {
    case "SET":
      return SQLPLUS_SET_OPTIONS.has(next);
    case "CONNECT":
      return next !== "BY";
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
function classifyWord(word, afterDot, followedByParen) {
  if (afterDot) {
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

// src/editorExtension.ts
var markCache = /* @__PURE__ */ new Map();
var mark = (type) => {
  let d = markCache.get(type);
  if (!d) {
    d = import_view.Decoration.mark({ class: `ora-${type}` });
    markCache.set(type, d);
  }
  return d;
};
var OPEN_FENCE = /^[ \t]*(`{3,}|~{3,})[ \t]*([^\s`{]*)/;
function findBlocks(doc, languages) {
  const blocks = [];
  let open = null;
  for (let ln = 1; ln <= doc.lines; ln++) {
    const line = doc.line(ln);
    const text = line.text;
    if (!open) {
      const m = OPEN_FENCE.exec(text);
      if (m) {
        const indent = /^[ \t]*/.exec(text)[0];
        open = { fence: m[1], lang: m[2].toLowerCase(), contentFrom: line.to + 1, indent };
      }
      continue;
    }
    const trimmed = text.trim();
    if (trimmed.length >= open.fence.length && trimmed[0] === open.fence[0] && /^(`+|~+)$/.test(trimmed)) {
      if (languages.has(open.lang) && line.from - 1 >= open.contentFrom) {
        blocks.push({ from: open.contentFrom, to: line.from - 1, indent: open.indent });
      }
      open = null;
    }
  }
  if (open && languages.has(open.lang) && doc.length >= open.contentFrom) {
    blocks.push({ from: open.contentFrom, to: doc.length, indent: open.indent });
  }
  return blocks;
}
function oracleEditorExtension(getLanguages) {
  return import_view.ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = this.build(view);
      }
      update(u) {
        if (u.docChanged || u.viewportChanged) this.decorations = this.build(u.view);
      }
      build(view) {
        const builder = new import_state.RangeSetBuilder();
        const doc = view.state.doc;
        const visible = view.visibleRanges;
        if (!visible.length) return builder.finish();
        const vFrom = visible[0].from;
        const vTo = visible[visible.length - 1].to;
        for (const block of findBlocks(doc, getLanguages())) {
          if (block.to < vFrom || block.from > vTo) continue;
          const text = doc.sliceString(block.from, block.to);
          for (const t of tokenize(text)) {
            builder.add(block.from + t.from, block.from + t.to, mark(t.type));
          }
        }
        return builder.finish();
      }
    },
    { decorations: (v) => v.decorations }
  );
}

// src/formatter.ts
var DEFAULT_FORMAT_OPTIONS = {
  keywordCase: "upper",
  indentSize: 2,
  useTabs: false
};
var DML_START = /* @__PURE__ */ new Set(["SELECT", "INSERT", "UPDATE", "DELETE", "MERGE", "WITH"]);
var UNIT_PREFIX = /* @__PURE__ */ new Set([
  "CREATE",
  "OR",
  "REPLACE",
  "EDITIONABLE",
  "NONEDITIONABLE",
  "MEMBER",
  "STATIC",
  "CONSTRUCTOR",
  "OVERRIDING",
  "FINAL",
  "NOT",
  "INSTANTIABLE",
  "MAP",
  "ORDER"
]);
var NO_SPACE_BEFORE_PAREN_KW = /* @__PURE__ */ new Set(["EXCEPTION_INIT", "RESTRICT_REFERENCES"]);
var CASED_TYPES = /* @__PURE__ */ new Set(["keyword", "type", "constant", "exception", "attribute"]);
function formatOracle(src, options = {}) {
  var _a, _b, _c, _d, _e, _f;
  const opts = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const lex = toLexemes(src);
  const unit = opts.useTabs ? "	" : " ".repeat(opts.indentSize);
  const ind = (n) => unit.repeat(Math.max(0, n));
  const lines = [];
  let cur = "";
  let curIndent = 0;
  let nextIndent = 0;
  let prev = null;
  let prevUnary = false;
  const nl = (indent) => {
    if (cur.trim()) lines.push(ind(curIndent) + cur.replace(/\s+$/, ""));
    cur = "";
    nextIndent = indent;
  };
  const blankLine = () => {
    if (lines.length && lines[lines.length - 1] !== "") lines.push("");
  };
  const needSpace = (l) => {
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
  const write = (l, text = caseOf(l)) => {
    if (!cur) {
      if (l.nlBefore >= 2) blankLine();
      curIndent = nextIndent;
      cur = text;
    } else {
      cur += (needSpace(l) ? " " : "") + text;
    }
    prevUnary = (l.text === "-" || l.text === "+") && (!prev || ["operator", "keyword"].includes(prev.type) || prev.text === "(" || prev.text === ",") && !(prev && prev.text === ")");
    prev = l;
  };
  const caseOf = (l) => {
    const cased = CASED_TYPES.has(l.type) || l.type === "function" && FUNCTIONS.has(l.up);
    if (!cased || opts.keywordCase === "preserve") return l.text;
    return opts.keywordCase === "upper" ? l.text.toUpperCase() : l.text.toLowerCase();
  };
  const blocks = [];
  let parens = [];
  let sql = null;
  let atStmtStart = true;
  let stmtWords = [];
  let unitPending = false;
  let betweenPending = false;
  const top = () => blocks[blocks.length - 1];
  const topParen = () => parens[parens.length - 1];
  const stmtIndent = () => top() ? top().body : 0;
  const startStatement = () => {
    atStmtStart = true;
    stmtWords = [];
    sql = null;
    parens = [];
    unitPending = false;
    betweenPending = false;
  };
  const sqlActive = () => sql !== null && (!topParen() || topParen().kind === "subquery");
  const peek = (i, k = 1) => {
    let j = i;
    let left = k;
    while (++j < lex.length) {
      if (lex[j].type === "comment") continue;
      if (--left === 0) return lex[j];
    }
    return void 0;
  };
  const isKw = (l, ...words2) => !!l && l.type === "keyword" && words2.includes(l.up);
  const clause = (indent) => {
    if (cur) nl(indent);
    else nextIndent = indent;
  };
  for (let i = 0; i < lex.length; i++) {
    const l = lex[i];
    const kw = l.type === "keyword" ? l.up : "";
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
        lines[lines.length - 1] += " " + l.text;
      } else {
        write(l, l.text);
      }
      continue;
    }
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
    if (l.type === "label") {
      nl(stmtIndent());
      write(l);
      nl(stmtIndent());
      atStmtStart = true;
      continue;
    }
    if (l.text === ";") {
      write(l);
      startStatement();
      nl(stmtIndent());
      continue;
    }
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
    if (kw === "EXCEPTION" && isKw(peek(i), "WHEN") && ((_a = top()) == null ? void 0 : _a.kind) === "begin") {
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
      const pair = isKw(next, "IF", "LOOP", "CASE") ? next.up : "";
      let frame;
      if (pair) {
        const want = pair === "IF" ? "if" : pair === "LOOP" ? "loop" : "case";
        while (blocks.length && top().kind !== want) blocks.pop();
        frame = blocks.pop();
      } else {
        frame = blocks.pop();
      }
      const base = frame ? frame.base : 0;
      const isCaseExpr = (frame == null ? void 0 : frame.kind) === "case" && !frame.stmt;
      clause(base);
      write(l);
      if (pair) {
        i = lex.indexOf(next);
        write(next);
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
    if (kw === "ELSIF" && ((_b = top()) == null ? void 0 : _b.kind) === "if") {
      clause(top().base);
      write(l);
      continue;
    }
    if (kw === "CASE") {
      const stmt = wasStmtStart && !sql;
      let base;
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
    if (kw === "WHEN" && ((_c = top()) == null ? void 0 : _c.kind) === "case") {
      clause(top().base + 1);
      write(l);
      continue;
    }
    if (kw === "WHEN" && sqlActive() && sql.kind === "MERGE") {
      clause(sql.base);
      write(l);
      sql.clause = "WHEN";
      continue;
    }
    if (kw === "WHEN" && ((_d = top()) == null ? void 0 : _d.kind) === "begin" && top().exc && !sql) {
      clause(top().base + 1);
      write(l);
      continue;
    }
    if (kw === "THEN") {
      const t = top();
      if (t && !sqlActive() && !parens.length) {
        if (t.kind === "if" || t.kind === "case" && t.stmt || t.kind === "begin" && t.exc) {
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
      if ((t == null ? void 0 : t.kind) === "case") {
        clause(t.base + 1);
        write(l);
        if (t.stmt) {
          t.body = t.base + 2;
          startStatement();
          nl(t.body);
        }
        continue;
      }
      if ((t == null ? void 0 : t.kind) === "if" && !parens.length) {
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
    if (["PROCEDURE", "FUNCTION", "PACKAGE"].includes(kw) || kw === "TYPE" && isKw(peek(i), "BODY")) {
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
    if (wasStmtStart && DML_START.has(kw)) {
      if (sql && sql.clause === "") {
        sql.kind = kw;
        sql.clause = kw;
      } else {
        sql = { base: stmtIndent(), kind: kw, clause: kw };
      }
      write(l);
      continue;
    }
    if (kw === "SELECT" && !sqlActive()) {
      sql = { base: stmtIndent() + 1, kind: "SELECT", clause: "SELECT" };
      clause(sql.base);
      write(l);
      continue;
    }
    if (sqlActive() && l.type === "keyword") {
      const s = sql;
      const n1 = peek(i);
      const n2 = peek(i, 2);
      const prevUp = (_e = prev == null ? void 0 : prev.up) != null ? _e : "";
      let words2 = 0;
      let name = "";
      if (["SELECT", "FROM", "WHERE", "HAVING", "VALUES", "RETURNING", "INTERSECT", "MINUS", "EXCEPT", "OFFSET"].includes(kw)) {
        if (!(kw === "FROM" && s.clause === "DELETE" && prevUp === "DELETE")) name = kw;
      } else if (kw === "INTO" && !["INSERT", "MERGE", "COLLECT"].includes(prevUp)) {
        name = kw;
      } else if (["GROUP", "ORDER", "CONNECT"].includes(kw) && isKw(n1, "BY")) {
        name = kw;
        words2 = 1;
      } else if (kw === "START" && isKw(n1, "WITH")) {
        name = kw;
        words2 = 1;
      } else if (kw === "UNION") {
        name = kw;
        words2 = isKw(n1, "ALL") ? 1 : 0;
      } else if (kw === "JOIN") {
        name = "JOIN";
      } else if (["LEFT", "RIGHT", "FULL"].includes(kw) && (isKw(n1, "JOIN") || isKw(n1, "OUTER") && isKw(n2, "JOIN"))) {
        name = "JOIN";
        words2 = isKw(n1, "OUTER") ? 2 : 1;
      } else if (["INNER", "CROSS", "NATURAL"].includes(kw) && isKw(n1, "JOIN", "APPLY")) {
        name = "JOIN";
        words2 = 1;
      } else if (kw === "OUTER" && isKw(n1, "APPLY")) {
        name = "JOIN";
        words2 = 1;
      } else if (kw === "BULK" && isKw(n1, "COLLECT")) {
        name = "INTO";
        words2 = 1;
      } else if (kw === "FOR" && isKw(n1, "UPDATE")) {
        name = "FOR UPDATE";
        words2 = 1;
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
        for (let k = 0; k < words2; k++) {
          const nx = peek(i);
          i = lex.indexOf(nx);
          write(nx);
        }
        s.clause = name;
        continue;
      }
      if (kw === "BETWEEN") betweenPending = true;
      if ((kw === "AND" || kw === "OR") && ((_f = top()) == null ? void 0 : _f.kind) !== "case") {
        if (kw === "AND" && betweenPending) {
          betweenPending = false;
        } else if (["WHERE", "HAVING", "ON", "START", "CONNECT", "WHEN"].includes(s.clause)) {
          clause(s.base + 1);
        }
      }
    }
    if (l.text === "(") {
      const lineIndent = cur ? curIndent : nextIndent;
      const n1 = peek(i);
      if (isKw(n1, "SELECT", "WITH")) {
        write(l);
        parens.push({ kind: "subquery", base: lineIndent, savedSql: sql });
        sql = { base: lineIndent + 1, kind: n1.up, clause: "" };
        nl(lineIndent + 1);
        atStmtStart = true;
        continue;
      }
      const isCreateTable = !parens.length && stmtWords[0] === "CREATE" && stmtWords.includes("TABLE") && !sql;
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
      if ((p == null ? void 0 : p.kind) === "list") {
        nl(p.base + 1);
      } else if (sqlActive()) {
        const s = sql;
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
function toLexemes(src) {
  const out = [];
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
      nlBefore: (gap.match(/\n/g) || []).length
    });
    pos = t.to;
  }
  return out;
}

// src/main.ts
var DEFAULT_SETTINGS = {
  languages: "oracle, plsql, ora, oraclesql",
  overrideSql: false,
  keywordCase: "upper",
  indent: 2,
  formatButton: true
};
var OracleHighlightPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.languages = /* @__PURE__ */ new Set();
    this.editorExtensions = [];
  }
  async onload() {
    await this.loadSettings();
    this.computeLanguages();
    for (const lang of this.languages) {
      try {
        this.registerMarkdownCodeBlockProcessor(lang, (source, el, ctx) => this.render(source, el, ctx, lang));
      } catch (e) {
        console.warn(`[oracle-syntax-highlight] could not register "${lang}"`, e);
      }
    }
    this.editorExtensions.push(oracleEditorExtension(() => this.languages));
    this.registerEditorExtension(this.editorExtensions);
    this.addCommand({
      id: "format-block",
      name: "Format Oracle code (selection or block under cursor)",
      editorCallback: (editor) => this.formatAtCursor(editor)
    });
    this.addCommand({
      id: "format-all-blocks",
      name: "Format all Oracle code blocks in this note",
      editorCallback: (editor) => this.formatAll(editor)
    });
    this.addSettingTab(new OracleSettingTab(this.app, this));
  }
  computeLanguages() {
    const langs = this.settings.languages.split(/[,\s]+/).map((l) => l.trim().toLowerCase()).filter(Boolean);
    if (this.settings.overrideSql) langs.push("sql");
    this.languages = new Set(langs);
  }
  /** Re-creates the editor extension so open editors pick up new settings. */
  refreshEditors() {
    this.computeLanguages();
    this.editorExtensions.length = 0;
    this.editorExtensions.push(oracleEditorExtension(() => this.languages));
    this.app.workspace.updateOptions();
  }
  // ---------- formatting ----------
  formatOptions() {
    return {
      keywordCase: this.settings.keywordCase,
      indentSize: this.settings.indent || 2,
      useTabs: this.settings.indent === 0
    };
  }
  /** Formats code, keeping the indentation of a fence that sits e.g. inside a list. */
  format(code, indent = "") {
    const stripped = indent ? code.split("\n").map((l) => l.startsWith(indent) ? l.slice(indent.length) : l.trimStart()).join("\n") : code;
    const out = formatOracle(stripped, this.formatOptions());
    return indent ? out.split("\n").map((l) => l ? indent + l : l).join("\n") : out;
  }
  blocksIn(editor) {
    return findBlocks(import_state2.Text.of(editor.getValue().split("\n")), this.languages);
  }
  formatAtCursor(editor) {
    const selection = editor.getSelection();
    if (selection.trim()) {
      editor.replaceSelection(this.format(selection));
      return;
    }
    const cursor = editor.posToOffset(editor.getCursor());
    const block = this.blocksIn(editor).find((b) => cursor >= b.from && cursor <= b.to);
    if (!block) {
      new import_obsidian.Notice("Place the cursor inside an Oracle code block (or select some SQL).");
      return;
    }
    const text = editor.getValue().slice(block.from, block.to);
    const formatted = this.format(text, block.indent);
    if (formatted !== text) {
      editor.replaceRange(formatted, editor.offsetToPos(block.from), editor.offsetToPos(block.to));
    }
  }
  formatAll(editor) {
    const value = editor.getValue();
    const changes = this.blocksIn(editor).map((b) => ({ b, text: this.format(value.slice(b.from, b.to), b.indent) })).filter(({ b, text }) => text !== value.slice(b.from, b.to)).map(({ b, text }) => ({ from: editor.offsetToPos(b.from), to: editor.offsetToPos(b.to), text }));
    if (!changes.length) {
      new import_obsidian.Notice("Oracle code blocks are already formatted.");
      return;
    }
    editor.transaction({ changes });
    new import_obsidian.Notice(`Formatted ${changes.length} Oracle code block(s).`);
  }
  /** Reading view "Format" button: rewrites the block in the note file. */
  async formatInFile(el, ctx) {
    const info = ctx.getSectionInfo(el);
    const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
    if (!info || !(file instanceof import_obsidian.TFile)) {
      new import_obsidian.Notice("Could not locate this code block in the note.");
      return;
    }
    await this.app.vault.process(file, (data) => {
      var _a;
      const lines = data.split("\n");
      const fence = (_a = lines[info.lineStart]) != null ? _a : "";
      const indent = /^[ \t]*/.exec(fence)[0];
      const start = info.lineStart + 1;
      const end = info.lineEnd;
      if (end <= start) return data;
      const code = lines.slice(start, end).join("\n");
      lines.splice(start, end - start, ...this.format(code, indent).split("\n"));
      return lines.join("\n");
    });
  }
  // ---------- reading view ----------
  render(source, el, ctx, lang) {
    const pre = el.createEl("pre", { cls: `language-${lang}` });
    const code = pre.createEl("code", { cls: `language-${lang} is-loaded` });
    let pos = 0;
    for (const t of tokenize(source)) {
      if (t.from > pos) code.appendText(source.slice(pos, t.from));
      code.createSpan({ cls: `ora-${t.type}`, text: source.slice(t.from, t.to) });
      pos = t.to;
    }
    if (pos < source.length) code.appendText(source.slice(pos));
    const buttons = pre.createDiv({ cls: "ora-buttons" });
    if (this.settings.formatButton) {
      const fmt = buttons.createEl("button", { cls: "ora-format-button", text: "Format" });
      fmt.addEventListener("click", () => this.formatInFile(el, ctx));
    }
    const copy = buttons.createEl("button", { cls: "ora-copy-button", text: "Copy" });
    copy.addEventListener("click", async () => {
      await navigator.clipboard.writeText(source.replace(/\n$/, ""));
      copy.setText("Copied!");
      window.setTimeout(() => copy.setText("Copy"), 1500);
    });
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.refreshEditors();
  }
};
var OracleSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    const s = this.plugin.settings;
    const reloadHint = () => new import_obsidian.Notice("Oracle Syntax Highlight: reload the plugin (or Obsidian) to apply this in reading view.");
    new import_obsidian.Setting(containerEl).setName("Highlighting").setHeading();
    new import_obsidian.Setting(containerEl).setName("Code block languages").setDesc("Comma-separated languages treated as Oracle, e.g. ```plsql. Reading view needs a plugin reload after changes.").addText(
      (t) => t.setPlaceholder(DEFAULT_SETTINGS.languages).setValue(s.languages).onChange(async (v) => {
        s.languages = v;
        await this.plugin.saveSettings();
      })
    ).then((setting) => {
      var _a;
      return (_a = setting.controlEl.querySelector("input")) == null ? void 0 : _a.addEventListener("blur", reloadHint);
    });
    new import_obsidian.Setting(containerEl).setName("Highlight ```sql blocks too").setDesc("Use Oracle highlighting instead of Obsidian's generic SQL highlighting. Needs a plugin reload for reading view.").addToggle(
      (t) => t.setValue(s.overrideSql).onChange(async (v) => {
        s.overrideSql = v;
        await this.plugin.saveSettings();
        reloadHint();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Formatting").setHeading();
    new import_obsidian.Setting(containerEl).setName("Keyword case").setDesc("Case of keywords, types and built-in functions. Your own identifiers are never changed.").addDropdown(
      (d) => d.addOptions({ upper: "UPPER", lower: "lower", preserve: "Keep as written" }).setValue(s.keywordCase).onChange(async (v) => {
        s.keywordCase = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Indentation").addDropdown(
      (d) => d.addOptions({ "2": "2 spaces", "4": "4 spaces", "0": "Tab" }).setValue(String(s.indent)).onChange(async (v) => {
        s.indent = Number(v);
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Format button in reading view").setDesc("Shows a Format button next to Copy on Oracle code blocks.").addToggle(
      (t) => t.setValue(s.formatButton).onChange(async (v) => {
        s.formatButton = v;
        await this.plugin.saveSettings();
      })
    );
  }
};
