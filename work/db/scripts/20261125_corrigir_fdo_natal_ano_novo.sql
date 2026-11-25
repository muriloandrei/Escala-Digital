set serveroutput on
set define off

declare
  v_aplicar constant number := 0; -- Altere para 1 somente depois de validar a previa.
  v_ent1 sgn_esc_prog_dia.hr_ent1%type;
  v_sai1 sgn_esc_prog_dia.hr_sai1%type;
  v_ent2 sgn_esc_prog_dia.hr_ent2%type;
  v_sai2 sgn_esc_prog_dia.hr_sai2%type;
  v_jornada sgn_esc_prog_dia.jornada_minutos%type;
  v_intervalo sgn_esc_prog_dia.intervalo_minutos%type;
  v_fixo number;
  v_alterados number := 0;
begin
  for r in (
    select p.escfunc_id, p.chapa, p.revisao, p.escprog_id,
           d.escprogdia_id, d.dt, d.programacao
      from sgn_esc_prog p
      join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
     where p.mes_ref = date '2026-12-01'
       and nvl(p.ativa, 1) = 1
       and d.dt in (date '2026-12-25', date '2027-01-01')
       and p.escprog_id = (
         select max(px.escprog_id) keep
                (dense_rank last order by px.revisao, px.escprog_id)
           from sgn_esc_prog px
          where px.escfunc_id = p.escfunc_id
            and px.mes_ref = p.mes_ref
            and nvl(px.ativa, 1) = 1)
     order by p.escfunc_id, d.dt
  ) loop
    if r.programacao = 'F' then
      dbms_output.put_line(r.chapa || ' ' || to_char(r.dt, 'YYYY-MM-DD') || ' PRESERVADA: folga normal');
    elsif r.programacao = 'TRB' then
      dbms_output.put_line(r.chapa || ' ' || to_char(r.dt, 'YYYY-MM-DD') || ' JA TRABALHA');
    elsif r.programacao = 'FDO' then
      select count(*) into v_fixo
        from sgn_esc_fixo_escala f
       where f.escfunc_id = r.escfunc_id
         and f.mes_ref = date '2026-12-01'
         and f.dt = r.dt
         and f.programacao = 'FDO'
         and nvl(f.status, 'A') = 'A';
      if v_fixo > 0 then
        dbms_output.put_line(r.chapa || ' ' || to_char(r.dt, 'YYYY-MM-DD')
                             || ' PENDENTE: FDO fixa ativa; revisar o fixo separadamente');
      else
      begin
        select hr_ent1, hr_sai1, hr_ent2, hr_sai2, jornada_minutos, intervalo_minutos
          into v_ent1, v_sai1, v_ent2, v_sai2, v_jornada, v_intervalo
          from (select w.hr_ent1, w.hr_sai1, w.hr_ent2, w.hr_sai2,
                       w.jornada_minutos, w.intervalo_minutos
                  from sgn_esc_prog_dia w
                 where w.escprog_id = r.escprog_id
                   and w.programacao = 'TRB'
                   and w.hr_ent1 is not null and w.hr_sai1 is not null
                 order by abs(w.dt - r.dt), w.dt desc)
         where rownum = 1;
        dbms_output.put_line(r.chapa || ' ' || to_char(r.dt, 'YYYY-MM-DD')
                             || ' FDO -> TRB ' || v_ent1 || '-' || v_sai1);
        if v_aplicar = 1 then
          update sgn_esc_prog_dia
             set programacao = 'TRB', hr_ent1 = v_ent1, hr_sai1 = v_sai1,
                 hr_ent2 = v_ent2, hr_sai2 = v_sai2,
                 jornada_minutos = v_jornada, intervalo_minutos = v_intervalo
           where escprogdia_id = r.escprogdia_id
             and escprog_id = r.escprog_id
             and programacao = 'FDO'
             and exists (select 1 from sgn_esc_prog p
                          where p.escprog_id = r.escprog_id
                            and nvl(p.ativa, 1) = 1
                            and p.escprog_id = (
                              select max(px.escprog_id) keep
                                     (dense_rank last order by px.revisao, px.escprog_id)
                                from sgn_esc_prog px
                               where px.escfunc_id = p.escfunc_id
                                 and px.mes_ref = p.mes_ref
                                 and nvl(px.ativa, 1) = 1));
          v_alterados := v_alterados + sql%rowcount;
        end if;
      exception when no_data_found then
        dbms_output.put_line(r.chapa || ' ' || to_char(r.dt, 'YYYY-MM-DD')
                             || ' PENDENTE: sem horario TRB na revisao');
      end;
      end if;
    else
      dbms_output.put_line(r.chapa || ' ' || to_char(r.dt, 'YYYY-MM-DD')
                           || ' PRESERVADA: ' || r.programacao);
    end if;
  end loop;
  if v_aplicar = 1 then commit; end if;
  dbms_output.put_line('Alterados: ' || v_alterados || '; aplicar=' || v_aplicar);
exception when others then
  rollback;
  raise;
end;
/
