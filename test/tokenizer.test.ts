import { tokenize, TokenType } from "../src/tokenizer";

let failed = 0;
function expectTokens(src: string, expected: [string, TokenType][]) {
  const got = tokenize(src).map((t) => [src.slice(t.from, t.to), t.type] as [string, TokenType]);
  for (const [text, type] of expected) {
    if (!got.some(([t, ty]) => t === text && ty === type)) {
      failed++;
      console.error(`FAIL: expected "${text}" as ${type} in:\n${src}\n got: ${JSON.stringify(got)}\n`);
    }
  }
}
function expectNot(src: string, text: string, type: TokenType) {
  if (tokenize(src).some((t) => src.slice(t.from, t.to) === text && t.type === type)) {
    failed++;
    console.error(`FAIL: "${text}" should NOT be ${type} in:\n${src}\n`);
  }
}

expectTokens("SELECT e.ename, NVL(e.comm, 0) FROM emp e WHERE ROWNUM <= 10;", [
  ["SELECT", "keyword"], ["NVL", "function"], ["0", "number"], ["FROM", "keyword"], ["ROWNUM", "constant"], ["<=", "operator"],
]);
expectTokens("v_name employees.last_name%TYPE := 'O''Brien';", [
  ["%TYPE", "attribute"], [":=", "operator"], ["'O''Brien'", "string"],
]);
expectTokens("x := q'[It's here]' || q'{a}' || nq'!b!';", [
  ["q'[It's here]'", "string"], ["q'{a}'", "string"], ["nq'!b!'", "string"], ["||", "operator"],
]);
expectTokens("SELECT /*+ INDEX(e emp_idx) */ * FROM emp; -- done\n/* multi\nline */", [
  ["/*+ INDEX(e emp_idx) */", "hint"], ["-- done", "comment"], ["/* multi\nline */", "comment"],
]);
expectTokens("BEGIN\n  DBMS_OUTPUT.PUT_LINE('hi');\nEXCEPTION\n  WHEN NO_DATA_FOUND THEN NULL;\nEND;\n/", [
  ["DBMS_OUTPUT", "package"], ["PUT_LINE", "function"], ["NO_DATA_FOUND", "exception"], ["NULL", "constant"], ["/", "sqlplus"],
]);
expectTokens("SET SERVEROUTPUT ON\nPROMPT Loading data...\nREM old comment\n@@install.sql\nEXEC my_proc(:id, &&schema.);", [
  ["SET", "sqlplus"], ["PROMPT", "sqlplus"], ["Loading data...", "string"], ["REM", "sqlplus"], [" old comment", "comment"],
  ["@@install.sql", "sqlplus"], ["EXEC", "sqlplus"], [":id", "variable"], ["&&schema.", "variable"],
]);
expectNot("UPDATE emp\nSET sal = sal * 1.1\nWHERE id = 1;", "SET", "sqlplus");
expectTokens("UPDATE emp\nSET sal = sal * 1.1\nWHERE id = 1;", [["SET", "keyword"], ["1.1", "number"]]);
expectNot("SELECT * FROM t\nCONNECT BY PRIOR id = parent_id", "CONNECT", "sqlplus");
expectNot("BEGIN\nEXECUTE IMMEDIATE 'x';\nEND;", "EXECUTE", "sqlplus");
expectTokens("<<outer>>\nFOR i IN 1..10 LOOP NULL; END LOOP;", [["<<outer>>", "label"], ["1", "number"], ["..", "operator"], ["10", "number"]]);
expectTokens("CREATE OR REPLACE TRIGGER t BEFORE INSERT ON x FOR EACH ROW BEGIN :NEW.id := seq.NEXTVAL; END;", [
  [":NEW", "variable"], ["NEXTVAL", "constant"], ["TRIGGER", "keyword"],
]);
expectTokens('SELECT "Mixed Case" FROM dual WHERE d > SYSDATE - 1 AND n = 1.5e3', [
  ['"Mixed Case"', "quoted-ident"], ["SYSDATE", "constant"], ["1.5e3", "number"],
]);
expectTokens("v_id NUMBER(10); v_txt VARCHAR2(100 CHAR); c SYS_REFCURSOR;", [
  ["NUMBER", "type"], ["VARCHAR2", "type"], ["SYS_REFCURSOR", "type"],
]);
expectNot("x := rec.level;", "level", "keyword");
expectTokens("SELECT my_func(1) FROM dual", [["my_func", "function"]]);
expectTokens("SELECT COUNT(*) FROM t", [["COUNT", "function"]]);

if (failed) { console.error(`${failed} check(s) failed`); process.exit(1); }
console.log("All tokenizer checks passed");
