declare
  v_count number;
begin
  select count(*) into v_count from user_tables where table_name = 'SGN_ESC_AUDITORIA';
  if v_count = 0 then
    raise_application_error(-20001, 'SGN_ESC_AUDITORIA ausente; verifique o schema antes da migration.');
  end if;

  select count(*) into v_count from user_tab_columns
   where table_name = 'SGN_ESC_AUDITORIA' and column_name = 'MES_REF';
  if v_count = 0 then
    execute immediate 'alter table sgn_esc_auditoria add (mes_ref date)';
  end if;

  select count(*) into v_count from user_tab_columns
   where table_name = 'SGN_ESC_AUDITORIA' and column_name = 'REVISAO';
  if v_count = 0 then
    execute immediate 'alter table sgn_esc_auditoria add (revisao number(5))';
  end if;
end;
/
