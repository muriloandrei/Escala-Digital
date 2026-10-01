set define off

declare
  v_exists number;
begin
  select count(*) into v_exists from user_constraints
   where table_name = 'SGN_ESC_TREINAMENTO' and constraint_name = 'SGN_ESC_TREINAMENTO_ETAPA_CK';
  if v_exists > 0 then
    execute immediate 'alter table sgn_esc_treinamento drop constraint sgn_esc_treinamento_etapa_ck';
  end if;
  execute immediate 'alter table sgn_esc_treinamento add constraint sgn_esc_treinamento_etapa_ck check (etapa between 0 and 12)';
end;
/
