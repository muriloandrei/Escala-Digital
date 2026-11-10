set define off

declare
  v_total number;
begin
  select count(*) into v_total from user_tables where table_name = 'SGN_ESC_RH_VISTO';
  if v_total = 0 then
    execute immediate 'create table sgn_esc_rh_visto (
      evento_id number(15) not null,
      dia date not null,
      status varchar2(12) not null,
      revisor_id number(15) not null,
      revisor_login varchar2(100 char) not null,
      motivo varchar2(80 char),
      observacao varchar2(500 char),
      dt_hr_visto date default sysdate not null,
      constraint sgn_esc_rh_visto_pk primary key (evento_id, dia),
      constraint sgn_esc_rh_visto_evento_fk foreign key (evento_id) references sgn_esc_evento (evento_id),
      constraint sgn_esc_rh_visto_status_ck check (status in (''CONFERIDO'', ''CONTESTADO''))
    )';
  end if;
end;
/
