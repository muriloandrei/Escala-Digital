set define off

begin
  merge into sgn_esc_horario_padrao h
  using (select 300 jornada, 15 intervalo from dual) src
     on (h.jornada_minutos = src.jornada and h.intervalo_minutos = src.intervalo)
  when matched then update set h.status = 'A', h.liberar_horario_aprendiz = 1
  when not matched then insert
    (eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
     jornada_minutos, intervalo_minutos, liberar_horario_aprendiz, status, dt_hr_incl)
    values (sgn_esc_horario_padrao_seq.nextval, 'Jornada 05:00 com 00:15 de intervalo',
            '08:00', '13:15', null, null, 300, 15, 1, 'A', sysdate);

  update sgn_esc_horario_padrao
     set liberar_horario_aprendiz = 0
   where jornada_minutos = 315 and intervalo_minutos = 0;

  insert into sgn_esc_horpad_loja (eschorpad_id, loja)
  select h.eschorpad_id, l.loja
    from sgn_esc_horario_padrao h cross join sgn_esc_loja l
   where h.jornada_minutos = 300 and h.intervalo_minutos = 15
     and not exists (select 1 from sgn_esc_horpad_loja a
                      where a.eschorpad_id = h.eschorpad_id and a.loja = l.loja);
  commit;
end;
/
