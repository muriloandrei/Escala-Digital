set define off

declare
  v_total number;
begin
  select count(*) into v_total from sgn_esc_horario_padrao
   where descr = 'Postos 08:48 com 01:40 de intervalo';
  if v_total = 0 then
    insert into sgn_esc_horario_padrao
      (eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
       jornada_minutos, intervalo_minutos, status, dt_hr_incl)
    values (sgn_esc_horario_padrao_seq.nextval,
      'Postos 08:48 com 01:40 de intervalo', '07:00', '12:00', '13:40', '17:28',
      528, 100, 'A', sysdate);
  end if;

  select count(*) into v_total from sgn_esc_horario_padrao
   where descr = 'Postos 08:24 com 01:10 de intervalo';
  if v_total = 0 then
    insert into sgn_esc_horario_padrao
      (eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
       jornada_minutos, intervalo_minutos, status, dt_hr_incl)
    values (sgn_esc_horario_padrao_seq.nextval,
      'Postos 08:24 com 01:10 de intervalo', '07:00', '11:30', '12:40', '16:34',
      504, 70, 'A', sysdate);
  end if;

  select count(*) into v_total from sgn_esc_horario_padrao
   where descr = 'Postos 08:24 com 01:40 de intervalo';
  if v_total = 0 then
    insert into sgn_esc_horario_padrao
      (eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
       jornada_minutos, intervalo_minutos, status, dt_hr_incl)
    values (sgn_esc_horario_padrao_seq.nextval,
      'Postos 08:24 com 01:40 de intervalo', '07:00', '11:30', '13:10', '17:04',
      504, 100, 'A', sysdate);
  end if;
end;
/
