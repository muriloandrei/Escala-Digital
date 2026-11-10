set define off

declare
  v_total number;
begin
  select count(*) into v_total from user_tab_columns
   where table_name = 'SGN_ESC_LOJA' and column_name = 'DOMINGO_6H_HABILITADO';
  if v_total = 0 then
    execute immediate 'alter table sgn_esc_loja add (domingo_6h_habilitado number(1) default 0 not null)';
    execute immediate 'alter table sgn_esc_loja add constraint sgn_esc_loja_dom6h_ck check (domingo_6h_habilitado in (0, 1))';
  end if;
  update sgn_esc_loja set domingo_6h_habilitado = 1 where loja in (18, 21);
  commit;
end;
/
