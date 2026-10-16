set define off

declare
  v_count number;
begin
  select count(*) into v_count
    from user_tab_columns
   where table_name = 'SGN_ESC_LOJA'
     and column_name = 'OFICIALIZACAO_HABILITADA';
  if v_count = 0 then
    execute immediate 'alter table sgn_esc_loja add (oficializacao_habilitada number(1) default 0 not null)';
  end if;
end;
/
