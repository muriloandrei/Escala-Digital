set define off

declare
  v_count number;
begin
  select count(*) into v_count from user_tab_columns
   where table_name = 'SGN_ESC_HORARIO_PADRAO'
     and column_name = 'LIBERAR_HORARIO_APRENDIZ';
  if v_count = 0 then
    execute immediate 'alter table sgn_esc_horario_padrao add (liberar_horario_aprendiz number(1) default 0 not null)';
  end if;
  execute immediate 'alter table sgn_esc_horario_padrao modify (hr_ent1 null, hr_sai1 null, hr_ent2 null, hr_sai2 null)';

  merge into sgn_esc_horario_padrao h
  using (
    select 'Jornada 07:20 com 01:10 de intervalo' descr, 440 jornada, 70 intervalo,
           '08:00' ent1, '12:00' sai1, '13:10' ent2, '16:30' sai2 from dual
    union all select 'Jornada 04:00 sem intervalo', 240, 0, '08:00', '12:00', null, null from dual
    union all select 'Jornada 03:00 sem intervalo', 180, 0, '08:00', '11:00', null, null from dual
    union all select 'Jornada 06:15 com 00:15 de intervalo', 375, 15, '08:00', '11:00', '11:15', '14:30' from dual
    union all select 'Jornada 05:15 sem intervalo', 315, 0, '08:00', '13:15', null, null from dual
  ) src
  on (h.jornada_minutos = src.jornada and h.intervalo_minutos = src.intervalo)
  when not matched then insert
    (eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
     jornada_minutos, intervalo_minutos, liberar_horario_aprendiz, status, dt_hr_incl)
    values (sgn_esc_horario_padrao_seq.nextval, src.descr, src.ent1, src.sai1,
            src.ent2, src.sai2, src.jornada, src.intervalo, 1, 'A', sysdate);

  update sgn_esc_horario_padrao
     set liberar_horario_aprendiz = 1
   where (jornada_minutos, intervalo_minutos) in
     ((440, 70), (240, 0), (180, 0), (375, 15), (315, 0));

  insert into sgn_esc_horpad_loja (eschorpad_id, loja)
  select h.eschorpad_id, l.loja
    from sgn_esc_horario_padrao h cross join sgn_esc_loja l
   where (h.jornada_minutos, h.intervalo_minutos) in
     ((440, 70), (240, 0), (180, 0), (375, 15), (315, 0))
     and not exists (select 1 from sgn_esc_horpad_loja a
                      where a.eschorpad_id = h.eschorpad_id and a.loja = l.loja);
  commit;
end;
/
