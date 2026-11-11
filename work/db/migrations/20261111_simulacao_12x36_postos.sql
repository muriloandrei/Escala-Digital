set define off

declare
  v_total number;
begin
  select count(*) into v_total from user_tables where table_name = 'SGN_ESC_SIM_12X36';
  if v_total = 0 then
    execute immediate 'create table sgn_esc_sim_12x36 (
      loja number(10) not null,
      mes_ref date not null,
      escsecao_id number(15) not null,
      escfunc_id number(15) not null,
      dia date not null,
      dt_ancora date not null,
      programacao varchar2(3 char) not null,
      hr_ent1 varchar2(5 char),
      hr_sai1 varchar2(5 char),
      hr_ent2 varchar2(5 char),
      hr_sai2 varchar2(5 char),
      login varchar2(100 char) not null,
      dt_hr_alter date default sysdate not null,
      constraint sgn_esc_sim_12x36_pk primary key (loja, mes_ref, escfunc_id, dia),
      constraint sgn_esc_sim_12x36_prog_ck check (programacao in (''TRB'', ''F'')),
      constraint sgn_esc_sim_12x36_mes_ck check (mes_ref = trunc(mes_ref, ''MM''))
    )';
  end if;
  select count(*) into v_total from user_indexes where index_name = 'SGN_ESC_SIM_12X36_IX';
  if v_total = 0 then
    execute immediate 'create index sgn_esc_sim_12x36_ix on sgn_esc_sim_12x36 (loja, mes_ref, escsecao_id, escfunc_id)';
  end if;
end;
/
