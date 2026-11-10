set define off

declare
  v_total number;
begin
  select count(*) into v_total from user_tables where table_name = 'SGN_ESC_REGIME_FUNC';
  if v_total = 0 then
    execute immediate 'create table sgn_esc_regime_func (
      regime_id number(15) not null,
      escfunc_id number(15) not null,
      loja number(10) not null,
      mes_inicio date not null,
      regime varchar2(5 char) not null,
      dt_ancora date,
      hr_ent1 varchar2(5 char),
      hr_sai1 varchar2(5 char),
      hr_ent2 varchar2(5 char),
      hr_sai2 varchar2(5 char),
      login varchar2(100 char) not null,
      dt_hr_incl date default sysdate not null,
      constraint sgn_esc_regime_func_pk primary key (regime_id),
      constraint sgn_esc_regime_func_tipo_ck check (regime in (''5X2'', ''12X36'')),
      constraint sgn_esc_regime_func_mes_ck check (mes_inicio = trunc(mes_inicio, ''MM'')),
      constraint sgn_esc_regime_func_ancora_ck check (
        (regime = ''5X2'' and dt_ancora is null) or
        (regime = ''12X36'' and dt_ancora is not null and
          hr_ent1 is not null and hr_sai1 is not null and
          hr_ent2 is not null and hr_sai2 is not null))
    )';
  end if;
  select count(*) into v_total from user_sequences where sequence_name = 'SGN_ESC_REGIME_FUNC_SEQ';
  if v_total = 0 then
    execute immediate 'create sequence sgn_esc_regime_func_seq start with 1 increment by 1 nocache';
  end if;
  select count(*) into v_total from user_indexes where index_name = 'SGN_ESC_REGIME_FUNC_IX';
  if v_total = 0 then
    execute immediate 'create index sgn_esc_regime_func_ix on sgn_esc_regime_func (loja, escfunc_id, mes_inicio, regime_id)';
  end if;
end;
/
