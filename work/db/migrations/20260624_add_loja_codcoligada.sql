declare
  column_count number;
begin
  select count(*) into column_count
  from user_tab_columns
  where table_name = 'SGN_ESC_LOJA'
    and column_name = 'CODCOLIGADA';

  if column_count = 0 then
    execute immediate 'alter table SGN_ESC_LOJA add CODCOLIGADA number(10) default 1 not null';
  end if;
end;
/

commit;
