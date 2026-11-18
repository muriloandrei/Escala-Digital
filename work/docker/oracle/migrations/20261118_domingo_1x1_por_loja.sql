set define off

declare
  v_count number;
begin
  select count(*) into v_count
    from user_tab_columns
   where table_name = 'SGN_ESC_LOJA'
     and column_name = 'DOMINGO_1X1_HABILITADO';
  if v_count = 0 then
    execute immediate 'alter table sgn_esc_loja add (domingo_1x1_habilitado number(1) default 1 not null)';
    execute immediate 'update sgn_esc_loja set domingo_1x1_habilitado = 0
      where loja between 400 and 499 or loja between 700 and 799';
  end if;
end;
/
