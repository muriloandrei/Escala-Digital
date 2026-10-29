whenever oserror exit failure
whenever sqlerror exit failure rollback
set define off
set serveroutput on

declare
  v_owner varchar2(128);
  v_spec number;
begin
  select username into v_owner from user_users;
  if upper(v_owner) = 'ESCALAINT' then
    raise_application_error(-20001, 'Conecte-se ao dono da PK_VT, nao ao schema ESCALAINT.');
  end if;
  select count(*) into v_spec from user_objects
   where object_name = 'PK_VT' and object_type = 'PACKAGE';
  if v_spec <> 1 then
    raise_application_error(-20002, 'PK_VT specification nao encontrada neste schema.');
  end if;
end;
/

@@PK_VT.body.sql
/

select line, position, text from user_errors
 where name = 'PK_VT' and type = 'PACKAGE BODY'
 order by sequence;

declare
  v_status varchar2(7);
  v_errors number;
begin
  select status into v_status from user_objects
   where object_name = 'PK_VT' and object_type = 'PACKAGE BODY';
  select count(*) into v_errors from user_errors
   where name = 'PK_VT' and type = 'PACKAGE BODY';
  dbms_output.put_line('PK_VT BODY: ' || v_status || '; erros: ' || v_errors);
  if v_status <> 'VALID' or v_errors <> 0 then
    raise_application_error(-20003, 'PK_VT invalida; consulte USER_ERRORS antes de prosseguir.');
  end if;
end;
/

exit success
