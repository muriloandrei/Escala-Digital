set define off

declare
  v_destinos number;
  v_frente_id number;
  v_porteiro_id number;
  v_conflitos number;
begin
  for origem in (
    select s.escsecao_id, s.codcoligada, s.codfilial
      from sgn_esc_secao s
     where regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$')
       and s.codfilial <> 999
       and (exists (select 1 from sgn_esc_funcionario f
                    where f.escsecao_id = s.escsecao_id)
         or exists (select 1 from sgn_esc_prog p
                     where p.escsecao_id = s.escsecao_id
                       and p.mes_ref >= trunc(sysdate, 'MM')
                       and p.ativa = 1 and p.oficializada = 0)
         or exists (select 1 from sgn_esc_fixo_escala x
                     where x.escsecao_id = s.escsecao_id
                       and x.mes_ref >= trunc(sysdate, 'MM')))
  ) loop
    select count(*), min(frente.escsecao_id), min(sub.escsubsecao_id)
      into v_destinos, v_frente_id, v_porteiro_id
      from sgn_esc_secao frente
      join sgn_esc_subsecao sub on sub.escsecao_id = frente.escsecao_id
     where frente.codcoligada = origem.codcoligada
       and frente.codfilial = origem.codfilial
       and frente.status = 'A' and sub.status = 'A'
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
       and upper(sub.descr) = 'PORTEIRO';
    if v_destinos <> 1 then
      raise_application_error(-20001, 'Portaria ' || origem.escsecao_id ||
        ': esperado uma Frente de Caixa com subseção Porteiro ativa; encontrados ' || v_destinos);
    end if;

    select count(*) into v_conflitos
      from sgn_esc_prog p
     where p.escsecao_id = origem.escsecao_id
       and p.mes_ref >= trunc(sysdate, 'MM')
       and p.ativa = 1 and p.oficializada = 0
       and exists (select 1 from sgn_esc_prog atual
                    where atual.escfunc_id = p.escfunc_id
                      and atual.mes_ref = p.mes_ref
                      and atual.escsecao_id = v_frente_id
                      and atual.ativa = 1);
    if v_conflitos > 0 then
      raise_application_error(-20002, 'Portaria ' || origem.escsecao_id ||
        ': funcionario com programacoes ativas simultaneas na Frente de Caixa. Revisao manual necessaria.');
    end if;

    select count(*) into v_conflitos
      from sgn_esc_transfer_sub t
     where t.escsecao_id = origem.escsecao_id and t.status in ('P', 'E');
    if v_conflitos > 0 then
      raise_application_error(-20003, 'Portaria ' || origem.escsecao_id ||
        ': transferencia de subseção pendente. Conclua ou cancele antes da migração.');
    end if;
  end loop;

  for origem in (
    select s.escsecao_id, s.codcoligada, s.codfilial
      from sgn_esc_secao s
     where regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$')
       and s.codfilial <> 999
       and (exists (select 1 from sgn_esc_funcionario f
                    where f.escsecao_id = s.escsecao_id)
         or exists (select 1 from sgn_esc_prog p
                     where p.escsecao_id = s.escsecao_id
                       and p.mes_ref >= trunc(sysdate, 'MM')
                       and p.ativa = 1 and p.oficializada = 0)
         or exists (select 1 from sgn_esc_fixo_escala x
                     where x.escsecao_id = s.escsecao_id
                       and x.mes_ref >= trunc(sysdate, 'MM')))
  ) loop
    select frente.escsecao_id, sub.escsubsecao_id
      into v_frente_id, v_porteiro_id
      from sgn_esc_secao frente
      join sgn_esc_subsecao sub on sub.escsecao_id = frente.escsecao_id
     where frente.codcoligada = origem.codcoligada
       and frente.codfilial = origem.codfilial
       and frente.status = 'A' and sub.status = 'A'
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
       and upper(sub.descr) = 'PORTEIRO';

    update sgn_esc_prog p set p.escsecao_id = v_frente_id,
           p.escsecaoturno_id = null
     where p.escsecao_id = origem.escsecao_id
       and p.mes_ref >= trunc(sysdate, 'MM')
       and p.ativa = 1 and p.oficializada = 0;

    update sgn_esc_fixo_escala x set x.escsecao_id = v_frente_id
     where x.escsecao_id = origem.escsecao_id
       and x.mes_ref >= trunc(sysdate, 'MM');

    update sgn_esc_funcionario f set f.escsecao_id = v_frente_id,
           f.escsubsecao_id = v_porteiro_id
     where f.escsecao_id = origem.escsecao_id;
  end loop;
end;
/
