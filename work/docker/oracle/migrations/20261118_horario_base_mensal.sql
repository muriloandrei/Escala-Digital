set define off

declare
  v_count number;
begin
  select count(*) into v_count
    from user_tables
   where table_name = 'SGN_ESC_HORARIO_BASE_MES';
  if v_count = 0 then
    execute immediate '
      create table sgn_esc_horario_base_mes (
        escfunc_id number not null,
        loja number not null,
        mes_ref date not null,
        hr_ent1 varchar2(5),
        hr_sai1 varchar2(5),
        hr_ent2 varchar2(5),
        hr_sai2 varchar2(5),
        dt_hr_alter date default sysdate not null,
        constraint sgn_esc_horario_base_mes_pk primary key (escfunc_id, mes_ref)
      )';
  end if;
end;
/
