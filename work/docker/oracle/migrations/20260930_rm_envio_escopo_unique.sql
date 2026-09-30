set define off

declare
  v_exists number;
begin
  select count(*) into v_exists from user_constraints
   where table_name = 'SGN_ESC_RM_ENVIO' and constraint_name = 'SGN_ESC_RM_ENVIO_ESCOPO_UK';
  if v_exists = 0 then
    execute immediate 'alter table sgn_esc_rm_envio add constraint sgn_esc_rm_envio_escopo_uk unique (loja, mes_ref, escsecao_id, escfunc_id, revisao)';
  end if;
  select count(*) into v_exists from user_constraints
   where table_name = 'SGN_ESC_RM_ENVIO' and constraint_name = 'SGN_ESC_RM_ENVIO_UK';
  if v_exists > 0 then
    execute immediate 'alter table sgn_esc_rm_envio drop constraint sgn_esc_rm_envio_uk';
  end if;
end;
/
