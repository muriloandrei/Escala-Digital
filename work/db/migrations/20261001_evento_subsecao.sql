declare
  v_total number;
begin
  select count(*) into v_total
    from user_tab_columns
   where table_name = 'SGN_ESC_EVENTO' and column_name = 'ESCSUBSECAO_ID';
  if v_total = 0 then
    execute immediate 'alter table sgn_esc_evento add (escsubsecao_id number(15))';
  end if;
end;
/
