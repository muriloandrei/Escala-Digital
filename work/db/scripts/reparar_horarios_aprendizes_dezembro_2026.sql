set serveroutput on

declare
  v_aplicar number := 0; -- Alterar para 1 apos conferir a previa.
  v_mes_ref varchar2(10) := '2026-12-01';
  v_loja number := null; -- Opcional: informar uma loja para testar primeiro.
  v_total number := 0;
  v_incompletos number := 0;
  v_atualizados number := 0;
begin
  if v_aplicar not in (0, 1) then
    raise_application_error(-20001, 'v_aplicar deve ser 0 ou 1');
  end if;

  for rec in (
    with ultima as (
      select p.escprog_id, p.loja, p.escfunc_id, p.revisao, p.oficializada,
             row_number() over (
               partition by p.loja, p.mes_ref, p.escfunc_id
               order by p.revisao desc, p.escprog_id desc
             ) rn
        from sgn_esc_prog p
       where p.mes_ref = to_date(v_mes_ref, 'YYYY-MM-DD')
         and nvl(p.ativa, 1) = 1
         and (v_loja is null or p.loja = v_loja)
    )
    select d.escprogdia_id, u.loja, u.revisao, f.chapa, d.dt,
           d.hr_ent1, d.hr_sai1,
           case when d.hr_sai1 is null then 'COMPLETAR_SAIDA'
                else 'PADRONIZAR_PERFIL' end acao,
           to_char(to_date('2000-01-01 ' || d.hr_ent1, 'YYYY-MM-DD HH24:MI')
                   + 315 / 1440, 'HH24:MI') saida_padrao
      from ultima u
      join sgn_esc_prog_dia d on d.escprog_id = u.escprog_id
      join sgn_esc_funcionario f on f.escfunc_id = u.escfunc_id
      join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
     where u.rn = 1 and nvl(u.oficializada, 0) = 0
       and regexp_like(upper(fn.descr), 'APRENDIZ')
       and d.programacao = 'TRB'
       and d.dt >= to_date('2026-11-30', 'YYYY-MM-DD')
       and d.dt < to_date('2027-01-04', 'YYYY-MM-DD')
       and d.hr_ent2 is null and d.hr_sai2 is null
       and regexp_like(d.hr_ent1, '^([01][0-9]|2[0-3]):[0-5][0-9]$')
       and (d.hr_sai1 is null
         or (d.hr_sai1 = to_char(to_date('2000-01-01 ' || d.hr_ent1, 'YYYY-MM-DD HH24:MI')
                                + 315 / 1440, 'HH24:MI')
             and (nvl(d.jornada_minutos, 0) <> 300 or nvl(d.intervalo_minutos, 0) <> 15)))
     order by u.loja, f.chapa, d.dt
  ) loop
    v_total := v_total + 1;
    if rec.acao = 'COMPLETAR_SAIDA' then v_incompletos := v_incompletos + 1; end if;
    if v_total <= 100 then
      dbms_output.put_line('loja=' || rec.loja || ' chapa=' || rec.chapa ||
        ' revisao=' || rec.revisao || ' dia=' || to_char(rec.dt, 'DD/MM/YYYY') ||
        ' acao=' || rec.acao || ' ' || rec.hr_ent1 || '-' || nvl(rec.hr_sai1, '-') ||
        ' -> ' || rec.hr_ent1 || '-' || rec.saida_padrao);
    end if;
    if v_aplicar = 1 then
      update sgn_esc_prog_dia
         set hr_sai1 = rec.saida_padrao,
             jornada_minutos = 300,
             intervalo_minutos = 15
       where escprogdia_id = rec.escprogdia_id
         and hr_ent1 = rec.hr_ent1
         and (hr_sai1 = rec.hr_sai1 or (hr_sai1 is null and rec.hr_sai1 is null));
      v_atualizados := v_atualizados + sql%rowcount;
    end if;
  end loop;

  dbms_output.put_line('Candidatos=' || v_total || ', sem saida=' || v_incompletos ||
    ', atualizados=' || v_atualizados || ', modo=' || case v_aplicar when 1 then 'APLICACAO' else 'PREVIA' end);
  if v_aplicar = 1 then commit; end if;
exception
  when others then
    if v_aplicar = 1 then rollback; end if;
    raise;
end;
/
