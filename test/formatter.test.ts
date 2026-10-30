import { formatOracle } from "../src/formatter";

let failed = 0;
function check(name: string, input: string, expected: string, opts = {}) {
  const got = formatOracle(input, opts);
  if (got !== expected) {
    failed++;
    console.error(`FAIL ${name}\n--- expected\n${expected}\n--- got\n${got}\n`);
  }
  const again = formatOracle(got, opts);
  if (again !== got) {
    failed++;
    console.error(`FAIL ${name} (not idempotent)\n--- first\n${got}\n--- second\n${again}\n`);
  }
}

check("select",
`select e.id, nvl(e.comm,0) comm from emp e join dept d on d.id=e.dept_id where e.sal between 1 and 2 and e.x in (select id from t) order by 1;`,
`SELECT e.id,
  NVL(e.comm, 0) comm
FROM emp e
JOIN dept d ON d.id = e.dept_id
WHERE e.sal BETWEEN 1 AND 2
  AND e.x IN (
    SELECT id
    FROM t
  )
ORDER BY 1;`);

check("anonymous block",
`set serveroutput on
declare v number; begin if v > 1 then x := -1; else null; end if; exception when others then raise; end;
/`,
`set serveroutput on
DECLARE
  v NUMBER;
BEGIN
  IF v > 1 THEN
    x := -1;
  ELSE
    NULL;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
/`);

check("package body",
`create or replace package body pkg as procedure p(a in number) is begin delete from t where id = a; end p; end pkg;
/`,
`CREATE OR REPLACE PACKAGE BODY pkg AS
  PROCEDURE p(a IN NUMBER) IS
  BEGIN
    DELETE FROM t
    WHERE id = a;
  END p;
END pkg;
/`);

check("create table",
`create table t (id number(10) primary key, name varchar2(100) not null);`,
`CREATE TABLE t (
  id NUMBER(10) PRIMARY KEY,
  name VARCHAR2(100) NOT NULL
);`);

check("lowercase + 4 spaces",
`BEGIN FOR i IN 1..10 LOOP NULL; END LOOP; END;`,
`begin
    for i in 1..10 loop
        null;
    end loop;
end;`, { keywordCase: "lower", indentSize: 4 });

check("comments and blank lines kept",
`-- header
select 1 from dual; -- trailing


/* block
   comment */
select 2 from dual;`,
`-- header
SELECT 1
FROM dual; -- trailing

/* block
   comment */
SELECT 2
FROM dual;`);

check("strings untouched",
`select q'[a  ,  b]', 'x  y', "Mixed  Name" from dual`,
`SELECT q'[a  ,  b]',
  'x  y',
  "Mixed  Name"
FROM dual`);

if (failed) { console.error(`${failed} formatter check(s) failed`); process.exit(1); }
console.log("All formatter checks passed");
