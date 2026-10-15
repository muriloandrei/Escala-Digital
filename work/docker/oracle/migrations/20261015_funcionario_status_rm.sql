set define off

declare
  v_exists number;
begin
  select count(*) into v_exists
    from user_tab_columns
   where table_name = 'SGN_ESC_FUNCIONARIO' and column_name = 'STATUS';
  if v_exists = 0 then
    execute immediate q'[alter table sgn_esc_funcionario add (status varchar2(1) default 'A' not null)]';
  end if;
end;
/
