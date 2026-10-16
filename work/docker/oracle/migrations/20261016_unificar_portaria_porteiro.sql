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
       and (exists (select 1 from sgn_esc_funcionario f where f.escsecao_id = s.escsecao_id)
         or exists (select 1 from sgn_esc_prog p where p.escsecao_id = s.escsecao_id
                       and p.mes_ref >= trunc(sysdate, 'MM') and p.ativa = 1 and p.oficializada = 0)
         or exists (select 1 from sgn_esc_fixo_escala x where x.escsecao_id = s.escsecao_id
                       and x.mes_ref >= trunc(sysdate, 'MM')))
  ) loop
    select count(*), min(frente.escsecao_id), min(sub.escsubsecao_id)
      into v_destinos, v_frente_id, v_porteiro_id
      from sgn_esc_secao frente
      join sgn_esc_subsecao sub on sub.escsecao_id = frente.escsecao_id
     where frente.codcoligada = origem.codcoligada and frente.codfilial = origem.codfilial
       and frente.status = 'A' and sub.status = 'A'
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and upper(trim(sub.descr)) = 'PORTEIRO';
    if v_destinos <> 1 then
      raise_application_error(-20001, 'Secao 02.012 ' || origem.escsecao_id ||
        ': esperado exatamente um destino Frente de Caixa > Porteiro; encontrados ' || v_destinos);
    end if;

    select count(*) into v_conflitos
      from (select f.escfunc_id from sgn_esc_funcionario f where f.escsecao_id = origem.escsecao_id
            union
            select p.escfunc_id from sgn_esc_prog p where p.escsecao_id = origem.escsecao_id
              and p.mes_ref >= trunc(sysdate, 'MM') and p.ativa = 1 and p.oficializada = 0
            union
            select x.escfunc_id from sgn_esc_fixo_escala x where x.escsecao_id = origem.escsecao_id
              and x.mes_ref >= trunc(sysdate, 'MM')) envolvidos
      left join sgn_esc_funcionario f on f.escfunc_id = envolvidos.escfunc_id
      left join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
     where nvl(upper(trim(fn.descr)), '?') <> 'PORTEIRO';
    if v_conflitos > 0 then
      raise_application_error(-20002, 'Secao 02.012 ' || origem.escsecao_id ||
        ': existem funcionarios de outra funcao; revise antes de mover.');
    end if;

    select count(*) into v_conflitos from sgn_esc_prog p
     where p.escsecao_id = origem.escsecao_id and p.mes_ref >= trunc(sysdate, 'MM')
       and p.ativa = 1 and p.oficializada = 0
       and exists (select 1 from sgn_esc_prog atual
                    where atual.escfunc_id = p.escfunc_id and atual.mes_ref = p.mes_ref
                      and atual.escsecao_id = v_frente_id and atual.ativa = 1);
    if v_conflitos > 0 then
      raise_application_error(-20003, 'Secao 02.012 ' || origem.escsecao_id ||
        ': ha programacoes ativas duplicadas na Frente de Caixa.');
    end if;

    select count(*) into v_conflitos from sgn_esc_transfer_sub t
     where t.escsecao_id = origem.escsecao_id and t.status in ('P', 'E');
    if v_conflitos > 0 then
      raise_application_error(-20004, 'Secao 02.012 ' || origem.escsecao_id ||
        ': transferencia de subseção pendente.');
    end if;
  end loop;

  for legado in (
    select sub.escsubsecao_id, frente.escsecao_id, frente.codcoligada, frente.codfilial
      from sgn_esc_subsecao sub
      join sgn_esc_secao frente on frente.escsecao_id = sub.escsecao_id
     where frente.codfilial <> 999
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and regexp_like(upper(trim(sub.descr)), 'PORTARIA')
  ) loop
    select count(*), min(escsubsecao_id) into v_destinos, v_porteiro_id
      from sgn_esc_subsecao
     where escsecao_id = legado.escsecao_id and status = 'A'
       and upper(trim(descr)) = 'PORTEIRO';
    if v_destinos <> 1 then
      raise_application_error(-20005, 'Frente de Caixa ' || legado.escsecao_id ||
        ': esperado exatamente uma subseção Porteiro ativa; encontradas ' || v_destinos);
    end if;

    select count(*) into v_conflitos
      from sgn_esc_funcionario f
      left join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
     where f.escsecao_id = legado.escsecao_id
       and f.escsubsecao_id = legado.escsubsecao_id
       and nvl(upper(trim(fn.descr)), '?') <> 'PORTEIRO';
    if v_conflitos > 0 then
      raise_application_error(-20006, 'Subsecao Portaria ' || legado.escsubsecao_id ||
        ': existem funcionarios de outra funcao; revise antes de mover.');
    end if;

    select count(*) into v_conflitos from sgn_esc_transfer_sub t
     where t.status in ('P', 'E')
       and (t.origem_id = legado.escsubsecao_id or t.destino_id = legado.escsubsecao_id);
    if v_conflitos > 0 then
      raise_application_error(-20007, 'Subsecao Portaria ' || legado.escsubsecao_id ||
        ': transferencia pendente.');
    end if;
  end loop;

  for origem in (
    select s.escsecao_id, s.codcoligada, s.codfilial
      from sgn_esc_secao s
     where regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$')
       and s.codfilial <> 999
  ) loop
    select count(*), min(frente.escsecao_id), min(sub.escsubsecao_id)
      into v_destinos, v_frente_id, v_porteiro_id
      from sgn_esc_secao frente
      join sgn_esc_subsecao sub on sub.escsecao_id = frente.escsecao_id
     where frente.codcoligada = origem.codcoligada and frente.codfilial = origem.codfilial
       and frente.status = 'A' and sub.status = 'A'
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and upper(trim(sub.descr)) = 'PORTEIRO';
    if v_destinos = 1 then
      update sgn_esc_prog p set p.escsecao_id = v_frente_id, p.escsecaoturno_id = null
       where p.escsecao_id = origem.escsecao_id and p.mes_ref >= trunc(sysdate, 'MM')
         and p.ativa = 1 and p.oficializada = 0;
      update sgn_esc_fixo_escala x set x.escsecao_id = v_frente_id
       where x.escsecao_id = origem.escsecao_id and x.mes_ref >= trunc(sysdate, 'MM');
      update sgn_esc_funcionario f set f.escsecao_id = v_frente_id, f.escsubsecao_id = v_porteiro_id
       where f.escsecao_id = origem.escsecao_id;
    end if;
  end loop;

  for legado in (
    select sub.escsubsecao_id, frente.escsecao_id
      from sgn_esc_subsecao sub
      join sgn_esc_secao frente on frente.escsecao_id = sub.escsecao_id
     where frente.codfilial <> 999
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and regexp_like(upper(trim(sub.descr)), 'PORTARIA')
  ) loop
    select min(escsubsecao_id) into v_porteiro_id
      from sgn_esc_subsecao
     where escsecao_id = legado.escsecao_id and status = 'A'
       and upper(trim(descr)) = 'PORTEIRO';
    update sgn_esc_funcionario f set f.escsubsecao_id = v_porteiro_id
     where f.escsecao_id = legado.escsecao_id
       and f.escsubsecao_id = legado.escsubsecao_id;
    update sgn_esc_subsecao set status = 'I'
     where escsubsecao_id = legado.escsubsecao_id;
  end loop;

  for frente in (
    select s.escsecao_id
      from sgn_esc_secao s
     where s.codfilial <> 999 and s.status = 'A'
       and regexp_like(trim(s.cod_secao), '(^|[.])02[.]002$')
       and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
       and exists (select 1 from sgn_esc_funcionario f
                    join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
                   where f.escsecao_id = s.escsecao_id
                     and upper(trim(fn.descr)) = 'PORTEIRO')
  ) loop
    select count(*), min(sub.escsubsecao_id) into v_destinos, v_porteiro_id
      from sgn_esc_subsecao sub
     where sub.escsecao_id = frente.escsecao_id and sub.status = 'A'
       and upper(trim(sub.descr)) = 'PORTEIRO';
    if v_destinos <> 1 then
      raise_application_error(-20008, 'Frente de Caixa ' || frente.escsecao_id ||
        ': esperado exatamente uma subseção Porteiro ativa; encontradas ' || v_destinos);
    end if;
    select count(*) into v_conflitos
      from sgn_esc_funcionario f
      join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
     where f.escsecao_id = frente.escsecao_id
       and upper(trim(fn.descr)) = 'PORTEIRO'
       and nvl(f.escsubsecao_id, -1) <> v_porteiro_id
       and exists (select 1 from sgn_esc_transfer_sub t
                    where t.escfunc_id = f.escfunc_id and t.status in ('P', 'E'));
    if v_conflitos > 0 then
      raise_application_error(-20009, 'Frente de Caixa ' || frente.escsecao_id ||
        ': porteiro com transferência pendente; revise antes de consolidar.');
    end if;
    update sgn_esc_funcionario f set f.escsubsecao_id = v_porteiro_id
     where f.escsecao_id = frente.escsecao_id
       and nvl(f.escsubsecao_id, -1) <> v_porteiro_id
       and exists (select 1 from sgn_esc_funcao fn
                    where fn.escfuncao_id = f.escfuncao_id
                      and upper(trim(fn.descr)) = 'PORTEIRO');
  end loop;
end;
/
