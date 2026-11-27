-- Executar no schema ESCALAINT, apos 20261126_jornada_8h24_todas_lojas.sql.
-- Previa por padrao. Para aplicar, alterar v_aplicar para 1 e executar novamente.
-- Nao muda folgas, revisoes ou flags de oficializacao; o RM nao recebe horarios.
set serveroutput on size unlimited
set define off

declare
  v_aplicar constant number := 0;
  v_inicio constant date := date '2026-12-01';
  v_primeiro_dia constant date := date '2026-11-30';
  v_ultimo_dia constant date := date '2027-01-03';
  v_dias number := 0;
  v_fixos number := 0;
  v_bases number := 0;
  v_cabecalhos number := 0;
  type t_totais is table of number index by varchar2(30);
  v_dias_por_loja_mes t_totais;
  v_chave varchar2(30);
  v_saida_824 varchar2(5);
  v_retorno_824 varchar2(5);

  function minutos(p_hora varchar2) return number is
    v_hora number;
    v_minuto number;
  begin
    if not regexp_like(p_hora, '^[0-9]{2}:[0-9]{2}$') then return null; end if;
    v_hora := to_number(substr(p_hora, 1, 2));
    v_minuto := to_number(substr(p_hora, 4, 2));
    if v_hora > 23 or v_minuto > 59 then return null; end if;
    return v_hora * 60 + v_minuto;
  end;

  function eh_8h48(p_ent1 varchar2, p_sai1 varchar2,
                   p_ent2 varchar2, p_sai2 varchar2) return boolean is
    v_ent1 number := minutos(p_ent1);
    v_sai1 number := minutos(p_sai1);
    v_ent2 number := minutos(p_ent2);
    v_sai2 number := minutos(p_sai2);
  begin
    return v_ent1 is not null and v_sai1 is not null
      and v_ent2 is not null and v_sai2 is not null
      and mod(v_sai1 - v_ent1 + 1440, 1440) > 0
      and mod(v_sai2 - v_ent2 + 1440, 1440) > 0
      and mod(v_sai1 - v_ent1 + 1440, 1440)
        + mod(v_sai2 - v_ent2 + 1440, 1440) = 528;
  end;

  function formatar_hora(p_minutos number) return varchar2 is
    v_minutos number := mod(p_minutos + 1440, 1440);
  begin
    return lpad(trunc(v_minutos / 60), 2, '0') || ':'
      || lpad(mod(v_minutos, 60), 2, '0');
  end;

  function novo_retorno(p_sai1 varchar2) return varchar2 is
  begin
    return formatar_hora(minutos(p_sai1) + 70);
  end;

  function nova_saida(p_sai1 varchar2, p_ent2 varchar2, p_sai2 varchar2) return varchar2 is
  begin
    return formatar_hora(minutos(p_sai1) + 70
      + mod(minutos(p_sai2) - minutos(p_ent2) + 1440, 1440) - 24);
  end;
begin
  if v_aplicar not in (0, 1) then
    raise_application_error(-20001, 'v_aplicar deve ser 0 ou 1.');
  end if;
  dbms_output.put_line(case when v_aplicar = 1 then 'APLICACAO' else 'PREVIA' end
    || ': converter 08:48 para 08:24, intervalo 01:10, na escala 2026-12 (30/11 a 03/01).');

  -- Cria a base de dezembro mesmo para quem ainda nao tem escala gerada.
  for r in (
    select f.escfunc_id, f.loja, f.chapa,
           case when b.mes_ref is not null then b.hr_ent1 else f.hr_ent1 end as hr_ent1,
           case when b.mes_ref is not null then b.hr_sai1 else f.hr_sai1 end as hr_sai1,
           case when b.mes_ref is not null then b.hr_ent2 else f.hr_ent2 end as hr_ent2,
           case when b.mes_ref is not null then b.hr_sai2 else f.hr_sai2 end as hr_sai2
      from sgn_esc_funcionario f
      left join sgn_esc_horario_base_mes b
        on b.escfunc_id = f.escfunc_id
       and b.mes_ref = (select max(b2.mes_ref)
                          from sgn_esc_horario_base_mes b2
                         where b2.escfunc_id = f.escfunc_id and b2.mes_ref <= v_inicio)
     where f.dt_demiss is null or f.dt_demiss >= v_inicio
  ) loop
    if eh_8h48(r.hr_ent1, r.hr_sai1, r.hr_ent2, r.hr_sai2) then
      v_retorno_824 := novo_retorno(r.hr_sai1);
      v_saida_824 := nova_saida(r.hr_sai1, r.hr_ent2, r.hr_sai2);
      v_bases := v_bases + 1;
      if v_bases <= 10 then
        dbms_output.put_line('BASE loja=' || r.loja || ' chapa=' || r.chapa
          || ' retorno=' || r.hr_ent2 || '->' || v_retorno_824
          || ' saida=' || r.hr_sai2 || '->' || v_saida_824);
      end if;
      if v_aplicar = 1 then
        merge into sgn_esc_horario_base_mes dest
        using (select r.escfunc_id as escfunc_id, r.loja as loja, v_inicio as mes_ref from dual) src
           on (dest.escfunc_id = src.escfunc_id and dest.mes_ref = src.mes_ref)
        when matched then update set dest.hr_ent1 = r.hr_ent1, dest.hr_sai1 = r.hr_sai1,
          dest.hr_ent2 = v_retorno_824, dest.hr_sai2 = v_saida_824, dest.dt_hr_alter = sysdate
        when not matched then insert
          (escfunc_id, loja, mes_ref, hr_ent1, hr_sai1, hr_ent2, hr_sai2)
          values (src.escfunc_id, src.loja, src.mes_ref, r.hr_ent1, r.hr_sai1,
                  v_retorno_824, v_saida_824);
      end if;
    end if;
  end loop;

  for r in (select escfixo_id, hr_ent1, hr_sai1, hr_ent2, hr_sai2
              from sgn_esc_fixo_escala
             where mes_ref = v_inicio and dt between v_primeiro_dia and v_ultimo_dia
               and status = 'A' and programacao = 'TRB') loop
    if eh_8h48(r.hr_ent1, r.hr_sai1, r.hr_ent2, r.hr_sai2) then
      v_retorno_824 := novo_retorno(r.hr_sai1);
      v_saida_824 := nova_saida(r.hr_sai1, r.hr_ent2, r.hr_sai2);
      v_fixos := v_fixos + 1;
      if v_aplicar = 1 then
        update sgn_esc_fixo_escala
           set hr_ent2 = v_retorno_824, hr_sai2 = v_saida_824,
               jornada_minutos = 504, intervalo_minutos = 70
         where escfixo_id = r.escfixo_id and hr_sai2 = r.hr_sai2;
        if sql%rowcount <> 1 then raise_application_error(-20003, 'Fixo alterado durante a conversao.'); end if;
      end if;
    end if;
  end loop;

  -- Somente o cabecalho ativo mais recente de cada funcionario/mes.
  for r in (
    select d.escprogdia_id, p.loja, p.chapa, p.mes_ref, d.dt,
           d.hr_ent1, d.hr_sai1, d.hr_ent2, d.hr_sai2
      from (select px.*, row_number() over (
              partition by px.loja, px.mes_ref, px.escfunc_id
              order by px.revisao desc, px.escprog_id desc) as rn
              from sgn_esc_prog px
             where px.mes_ref = v_inicio and nvl(px.ativa, 1) = 1) p
      join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
     where p.rn = 1 and d.dt between v_primeiro_dia and v_ultimo_dia
       and d.programacao = 'TRB'
  ) loop
    if eh_8h48(r.hr_ent1, r.hr_sai1, r.hr_ent2, r.hr_sai2) then
      v_retorno_824 := novo_retorno(r.hr_sai1);
      v_saida_824 := nova_saida(r.hr_sai1, r.hr_ent2, r.hr_sai2);
      v_dias := v_dias + 1;
      v_chave := lpad(r.loja, 4, '0') || '|' || to_char(r.mes_ref, 'YYYY-MM');
      if not v_dias_por_loja_mes.exists(v_chave) then v_dias_por_loja_mes(v_chave) := 0; end if;
      v_dias_por_loja_mes(v_chave) := v_dias_por_loja_mes(v_chave) + 1;
      if v_dias <= 10 then
        dbms_output.put_line('DIA loja=' || r.loja || ' chapa=' || r.chapa
          || ' mes=' || to_char(r.mes_ref, 'YYYY-MM') || ' data=' || to_char(r.dt, 'YYYY-MM-DD')
          || ' retorno=' || r.hr_ent2 || '->' || v_retorno_824
          || ' saida=' || r.hr_sai2 || '->' || v_saida_824);
      end if;
      if v_aplicar = 1 then
        update sgn_esc_prog_dia
           set hr_ent2 = v_retorno_824, hr_sai2 = v_saida_824,
               jornada_minutos = 504, intervalo_minutos = 70
         where escprogdia_id = r.escprogdia_id and hr_sai2 = r.hr_sai2;
        if sql%rowcount <> 1 then raise_application_error(-20004, 'Dia alterado durante a conversao.'); end if;
      end if;
    end if;
  end loop;

  for r in (
    select p.escprog_id, p.hr_oficial_ent1, p.hr_oficial_sai1,
           p.hr_oficial_ent2, p.hr_oficial_sai2
      from (select px.*, row_number() over (
              partition by px.loja, px.mes_ref, px.escfunc_id
              order by px.revisao desc, px.escprog_id desc) as rn
              from sgn_esc_prog px
             where px.mes_ref = v_inicio and nvl(px.ativa, 1) = 1) p
     where p.rn = 1
  ) loop
    if eh_8h48(r.hr_oficial_ent1, r.hr_oficial_sai1,
                r.hr_oficial_ent2, r.hr_oficial_sai2) then
      v_retorno_824 := novo_retorno(r.hr_oficial_sai1);
      v_saida_824 := nova_saida(r.hr_oficial_sai1, r.hr_oficial_ent2, r.hr_oficial_sai2);
      v_cabecalhos := v_cabecalhos + 1;
      if v_aplicar = 1 then
        update sgn_esc_prog
           set hr_oficial_ent2 = v_retorno_824, hr_oficial_sai2 = v_saida_824
         where escprog_id = r.escprog_id and hr_oficial_sai2 = r.hr_oficial_sai2;
        if sql%rowcount <> 1 then raise_application_error(-20005, 'Cabecalho alterado durante a conversao.'); end if;
      end if;
    end if;
  end loop;

  dbms_output.put_line('TOTAL bases_dezembro=' || v_bases
    || ' fixos=' || v_fixos || ' dias=' || v_dias || ' cabecalhos=' || v_cabecalhos);
  v_chave := v_dias_por_loja_mes.first;
  while v_chave is not null loop
    dbms_output.put_line('DIA_POR_LOJA_MES ' || v_chave || ' total=' || v_dias_por_loja_mes(v_chave));
    v_chave := v_dias_por_loja_mes.next(v_chave);
  end loop;
  if v_aplicar = 1 then commit; else rollback; end if;
exception
  when others then
    rollback;
    raise;
end;
/
