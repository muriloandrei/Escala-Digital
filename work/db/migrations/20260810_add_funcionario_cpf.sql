set define off

begin
  execute immediate 'alter table SGN_ESC_FUNCIONARIO add (CPF varchar2(20))';
exception when others then
  if sqlcode != -1430 then raise; end if;
end;
/

commit;
