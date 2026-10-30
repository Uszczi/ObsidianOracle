# Test podświetlania — nieformatowany kod Oracle

## 1. SQL*Plus + DDL

```plsql
REM skrypt instalacyjny -- brak formatowania
set serveroutput on size unlimited
SET DEFINE ON
prompt Tworzenie tabel...
whenever sqlerror exit sql.sqlcode rollback
@@install_common.sql
connect hr/hr@//localhost:1521/XEPDB1
column last_name format a30 heading 'Nazwisko'
create table   EMP_AUDIT(audit_id number generated always as identity primary key,emp_id number(6) not null,old_salary NUMBER(8,2),new_salary number(8,2),changed_by varchar2(30 char) default user,changed_at timestamp with time zone default systimestamp,note clob,constraint fk_emp_audit foreign key(emp_id) references employees(employee_id) on delete cascade)tablespace users;
create index emp_audit_ix1 on emp_audit(emp_id,changed_at desc) compress 1;
comment on table emp_audit is q'[Audyt zmian pensji (it's "quoted")]';
```

## 2. Zapytanie z hintem, CTE, analityką i bindami

```oracle
with dept_stats as(select /*+ MATERIALIZE */ department_id,avg(salary) avg_sal,count(*) cnt from employees where hire_date>=add_months(trunc(sysdate,'YYYY'),-12*&years_back) group by department_id having count(*)>:min_cnt)
select e.employee_id,e.first_name||' '||e.last_name as full_name,d.department_name,nvl(e.commission_pct,0)*e.salary bonus,
rank() over(partition by e.department_id order by e.salary desc nulls last) rnk,listagg(j.job_title,', ') within group(order by j.job_title) over(partition by e.department_id) jobs,
case when e.salary>ds.avg_sal*1.5 then 'HIGH' when e.salary between ds.avg_sal and ds.avg_sal*1.5 then 'MID' else 'LOW' end as band,
to_char(e.hire_date,'DD.MM.YYYY HH24:MI') hired,decode(e.manager_id,null,'BOSS','EMP') role
from employees e join departments d on d.department_id=e.department_id left outer join jobs j using(job_id) join dept_stats ds on ds.department_id=e.department_id
where e.email like 'S%' escape '\' and regexp_like(e.phone_number,'^\d{3}\.\d{3}') and e.employee_id not in(select employee_id from job_history)
order by d.department_name,rnk fetch first 10 rows only;
```

## 3. Pakiet PL/SQL

```plsql
create or replace package body hr_salary_pkg as
g_max_raise constant number:=0.25;
e_raise_too_big exception;pragma exception_init(e_raise_too_big,-20001);
type t_emp_tab is table of employees%rowtype index by pls_integer;
procedure log_change(p_emp_id in employees.employee_id%type,p_old in number,p_new in number)is pragma autonomous_transaction;begin insert into emp_audit(emp_id,old_salary,new_salary)values(p_emp_id,p_old,p_new);commit;end log_change;
function raise_salary(p_emp_id in number,p_pct in number default 0.05)return number is
v_old employees.salary%type;v_new employees.salary%type;v_cnt pls_integer:=0;
begin
if p_pct>g_max_raise then raise_application_error(-20001,'Podwyżka > '||g_max_raise*100||'%');end if;
select salary into v_old from employees where employee_id=p_emp_id for update nowait;
v_new:=round(v_old*(1+p_pct),2);
update employees set salary=v_new where employee_id=p_emp_id returning salary into v_new;
log_change(p_emp_id,v_old,v_new);
dbms_output.put_line('Emp '||p_emp_id||': '||v_old||' -> '||v_new);
return v_new;
exception when no_data_found then dbms_output.put_line('Brak pracownika '||p_emp_id);return null;
when e_raise_too_big then raise;when others then dbms_output.put_line(sqlerrm||' '||dbms_utility.format_error_backtrace);rollback;raise;
end raise_salary;
procedure bulk_raise(p_dept_id number)is l_emps t_emp_tab;cursor c_emp is select * from employees where department_id=p_dept_id;
begin open c_emp;loop fetch c_emp bulk collect into l_emps limit 100;exit when l_emps.count=0;
forall i in 1..l_emps.count save exceptions update employees set salary=salary*1.03 where employee_id=l_emps(i).employee_id;
end loop;close c_emp;
<<outer_loop>>for r in(select level lvl from dual connect by level<=3)loop continue outer_loop when mod(r.lvl,2)=0;null;end loop outer_loop;
exception when others then if sqlcode=-24381 then for j in 1..sql%bulk_exceptions.count loop dbms_output.put_line(sql%bulk_exceptions(j).error_index);end loop;end if;
end bulk_raise;
end hr_salary_pkg;
/
show errors
```

## 4. Blok anonimowy, dynamiczny SQL, pakiety systemowe

```plsql
declare l_sql varchar2(4000);l_cnt number;l_json json_object_t;l_clob clob;l_http utl_http.req;l_ts timestamp:=systimestamp;
begin
l_sql:='select count(*) from '||dbms_assert.sql_object_name(:tab_name)||q'{ where status = 'A'}';execute immediate l_sql into l_cnt;
l_json:=json_object_t();l_json.put('count',l_cnt);l_json.put('ts',to_char(l_ts,'YYYY-MM-DD"T"HH24:MI:SS'));
dbms_lob.createtemporary(l_clob,true);l_clob:=l_json.to_clob;
apex_debug.message('JSON: %s',l_clob);dbms_scheduler.create_job(job_name=>'NIGHTLY_RAISE',job_type=>'PLSQL_BLOCK',job_action=>'begin hr_salary_pkg.bulk_raise(50); end;',repeat_interval=>'FREQ=DAILY;BYHOUR=2',enabled=>true);
merge into emp_audit t using(select employee_id,salary from employees where department_id=&&dept_id)s on(t.emp_id=s.employee_id)when matched then update set t.new_salary=s.salary when not matched then insert(emp_id,new_salary)values(s.employee_id,s.salary);
dbms_output.put_line(sql%rowcount||' wierszy, czas: '||extract(second from systimestamp-l_ts)||'s');
end;
/
exec hr_salary_pkg.bulk_raise(p_dept_id=>60)
EXECUTE dbms_stats.gather_table_stats(user,'EMP_AUDIT');
```

## 5. Zwykły blok `sql` (podświetlany tylko z włączonym „overrideSql”)

```sql
select sysdate,user,sys_context('USERENV','DB_NAME') from dual;
```
