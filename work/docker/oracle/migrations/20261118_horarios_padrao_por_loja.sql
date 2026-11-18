set define off

declare
  v_count number;
begin
  select count(*) into v_count from user_tables where table_name = 'SGN_ESC_HORPAD_LOJA';
  if v_count = 0 then
    execute immediate '
      create table sgn_esc_horpad_loja (
        eschorpad_id number not null,
        loja number not null,
        constraint sgn_esc_horpad_loja_pk primary key (eschorpad_id, loja)
      )';
    insert into sgn_esc_horpad_loja (eschorpad_id, loja)
    select h.eschorpad_id, l.loja
      from sgn_esc_horario_padrao h
      cross join sgn_esc_loja l
     where (h.jornada_minutos = 528 and h.intervalo_minutos = 70)
        or (h.jornada_minutos = 360 and h.intervalo_minutos = 70)
        or (h.jornada_minutos = 300 and h.intervalo_minutos = 15)
        or (l.loja between 700 and 799 and
            ((h.jornada_minutos = 528 and h.intervalo_minutos = 100)
             or (h.jornada_minutos = 504 and h.intervalo_minutos in (70, 100))))
        or (l.loja between 400 and 499 and h.jornada_minutos = 504
            and h.intervalo_minutos in (70, 100));
  end if;
end;
/
