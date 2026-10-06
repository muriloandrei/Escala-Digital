set define off

declare
  v_exists number;
begin
  select count(*) into v_exists from user_tables
   where table_name = 'SGN_ESC_TREINAMENTO';
  if v_exists = 0 then
    raise_application_error(-20001, 'SGN_ESC_TREINAMENTO ausente; verifique o schema.');
  end if;

  select count(*) into v_exists from user_constraints
   where table_name = 'SGN_ESC_TREINAMENTO'
     and constraint_name = 'SGN_ESC_TREINAMENTO_ETAPA_CK';
  if v_exists = 0 then
    raise_application_error(-20002, 'Constraint de etapas ausente; verifique o schema.');
  end if;

  execute immediate 'alter table sgn_esc_treinamento drop constraint sgn_esc_treinamento_etapa_ck';
  execute immediate 'alter table sgn_esc_treinamento add constraint sgn_esc_treinamento_etapa_ck check (etapa between 0 and 16)';
end;
/
