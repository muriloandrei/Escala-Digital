set define off

declare
  v_frentes number;
  v_frente_id number;
  v_porteiros number;
  v_porteiros_ativos number;
  v_nomes_divergentes number;
  v_outras_funcoes number;
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
    select count(*) into v_outras_funcoes
      from (select f.escfunc_id
              from sgn_esc_funcionario f
             where f.escsecao_id = origem.escsecao_id
            union
            select p.escfunc_id
              from sgn_esc_prog p
             where p.escsecao_id = origem.escsecao_id
               and p.mes_ref >= trunc(sysdate, 'MM')
               and p.ativa = 1 and p.oficializada = 0
            union
            select x.escfunc_id
              from sgn_esc_fixo_escala x
             where x.escsecao_id = origem.escsecao_id
               and x.mes_ref >= trunc(sysdate, 'MM')) envolvidos
      left join sgn_esc_funcionario f on f.escfunc_id = envolvidos.escfunc_id
      left join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
     where nvl(upper(trim(fn.descr)), '?') <> 'PORTEIRO';
    if v_outras_funcoes > 0 then
      raise_application_error(-20004, 'Portaria ' || origem.escsecao_id ||
        ': funcionarios ou programacoes de outra funcao; revise antes da migracao.');
    end if;

    select count(*), min(frente.escsecao_id)
      into v_frentes, v_frente_id
      from sgn_esc_secao frente
     where frente.codcoligada = origem.codcoligada
       and frente.codfilial = origem.codfilial
       and frente.status = 'A'
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$');
    if v_frentes <> 1 then
      raise_application_error(-20001, 'Portaria ' || origem.escsecao_id ||
        ': esperado uma Frente de Caixa ativa na coligada ' || origem.codcoligada ||
        ', filial ' || origem.codfilial || '; encontradas ' || v_frentes);
    end if;

    select count(*), count(case when sub.status = 'A' then 1 end),
           count(case when upper(sub.descr) <> 'PORTEIRO' then 1 end)
      into v_porteiros, v_porteiros_ativos, v_nomes_divergentes
      from sgn_esc_subsecao sub
     where sub.escsecao_id = v_frente_id and upper(trim(sub.descr)) = 'PORTEIRO';
    if v_porteiros > 1 or v_nomes_divergentes > 0
       or (v_porteiros = 1 and v_porteiros_ativos = 0) then
      raise_application_error(-20002, 'Frente de Caixa ' || v_frente_id ||
        ': subseção Porteiro duplicada, inativa ou com nome divergente; revise o cadastro.');
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
    select frente.escsecao_id into v_frente_id
      from sgn_esc_secao frente
     where frente.codcoligada = origem.codcoligada
       and frente.codfilial = origem.codfilial
       and frente.status = 'A'
       and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
       and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$');

    select count(*) into v_porteiros
      from sgn_esc_subsecao sub
     where sub.escsecao_id = v_frente_id and upper(sub.descr) = 'PORTEIRO';
    if v_porteiros = 0 then
      insert into sgn_esc_subsecao (escsubsecao_id, escsecao_id, descr, status, dt_hr_incl)
      values (sgn_esc_subsecao_seq.nextval, v_frente_id, 'Porteiro', 'A', sysdate);
    end if;
  end loop;
end;
/
