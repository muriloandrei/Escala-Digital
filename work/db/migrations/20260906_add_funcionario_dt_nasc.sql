declare
  v_count number;
begin
  select count(*)
    into v_count
    from user_tab_columns
   where table_name = 'SGN_ESC_FUNCIONARIO'
     and column_name = 'DT_NASC';

  if v_count = 0 then
    execute immediate 'alter table SGN_ESC_FUNCIONARIO add (DT_NASC date)';
  end if;
end;
/

commit;
