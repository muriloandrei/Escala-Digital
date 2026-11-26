set define off

declare
  v_count number;
begin
  select count(*) into v_count
    from sgn_esc_horario_padrao
   where jornada_minutos = 504 and intervalo_minutos = 70 and status = 'A';
  if v_count = 0 then
    insert into sgn_esc_horario_padrao
      (eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2,
       jornada_minutos, intervalo_minutos, status, dt_hr_incl)
    values (sgn_esc_horario_padrao_seq.nextval, 'Jornada 08:24 com 01:10 de intervalo',
            '08:00', '12:00', '13:10', '17:34', 504, 70, 'A', sysdate);
  end if;

  update sgn_esc_horario_padrao
     set descr = 'Jornada 08:24 com 01:10 de intervalo'
   where jornada_minutos = 504 and intervalo_minutos = 70
     and descr = 'Postos 08:24 com 01:10 de intervalo';
  update sgn_esc_horario_padrao
     set descr = 'Jornada 08:24 com 01:40 de intervalo'
   where jornada_minutos = 504 and intervalo_minutos = 100
     and descr = 'Postos 08:24 com 01:40 de intervalo';

  merge into sgn_esc_horpad_loja dest
  using (
    select h.eschorpad_id, l.loja
      from sgn_esc_horario_padrao h
      cross join sgn_esc_loja l
     where h.status = 'A' and h.jornada_minutos = 504 and h.intervalo_minutos = 70
  ) src
     on (dest.eschorpad_id = src.eschorpad_id and dest.loja = src.loja)
  when not matched then insert (eschorpad_id, loja) values (src.eschorpad_id, src.loja);

  merge into sgn_esc_horpad_loja dest
  using (
    select distinct h.eschorpad_id, hl.loja
      from sgn_esc_horario_padrao h
      join sgn_esc_horario_padrao h48
        on h48.jornada_minutos = 528 and h48.intervalo_minutos = 100 and h48.status = 'A'
      join sgn_esc_horpad_loja hl on hl.eschorpad_id = h48.eschorpad_id
     where h.status = 'A' and h.jornada_minutos = 504 and h.intervalo_minutos = 100
  ) src
     on (dest.eschorpad_id = src.eschorpad_id and dest.loja = src.loja)
  when not matched then insert (eschorpad_id, loja) values (src.eschorpad_id, src.loja);
end;
/
