-- Limpa escalas ativas ja criadas para forcar uma nova liberacao/geracao.
-- Seguro para executar primeiro como previa. Altere EXECUTAR para S apenas quando for aplicar.
--
-- Parametros:
--   P_LOJA: vazio para todas as lojas, ou o numero da loja.
--   P_MES_REF: vazio para todos os meses, YYYY-MM ou YYYY-MM-DD para um mes especifico.
--   P_ESCOPO:
--     TODAS              = inativa todas as escalas ativas do escopo.
--     FRENTE_CAIXA       = inativa somente escalas de Frente de Caixa.
--     FORA_FRENTE_CAIXA  = inativa somente escalas fora de Frente de Caixa.
--   P_INCLUIR_OFICIALIZADAS:
--     S = tambem inativa escalas oficializadas.
--     N = mantem escalas oficializadas.
--   P_LIMPAR_FIXOS:
--     S = tambem inativa fixos de escala do mesmo escopo em SGN_ESC_FIXO_ESCALA.
--     N = mantem fixos cadastrados.

set serveroutput on size unlimited
set define on

define EXECUTAR = "N"
define P_LOJA = ""
define P_MES_REF = ""
define P_ESCOPO = "TODAS"
define P_INCLUIR_OFICIALIZADAS = "S"
define P_LIMPAR_FIXOS = "N"

declare
  v_executar varchar2(1) := upper(trim('&&EXECUTAR'));
  v_loja_txt varchar2(30) := trim('&&P_LOJA');
  v_mes_txt varchar2(30) := trim('&&P_MES_REF');
  v_escopo varchar2(30) := upper(trim('&&P_ESCOPO'));
  v_incluir_oficializadas varchar2(1) := upper(trim('&&P_INCLUIR_OFICIALIZADAS'));
  v_limpar_fixos varchar2(1) := upper(trim('&&P_LIMPAR_FIXOS'));
  v_loja number;
  v_mes_ref date;
  v_has_ativa number := 0;
  v_has_fixo_status number := 0;
  v_prog_count number := 0;
  v_dia_count number := 0;
  v_fixo_count number := 0;
  v_oficializadas number := 0;
  v_prog_updated number := 0;
  v_fixo_updated number := 0;
begin
  if v_loja_txt is not null then
    v_loja := to_number(v_loja_txt);
  end if;

  if v_mes_txt is not null then
    if length(v_mes_txt) = 7 then
      v_mes_ref := to_date(v_mes_txt || '-01', 'YYYY-MM-DD');
    else
      v_mes_ref := trunc(to_date(v_mes_txt, 'YYYY-MM-DD'), 'MM');
    end if;
  end if;

  if v_executar not in ('S', 'N') then
    raise_application_error(-20001, 'EXECUTAR deve ser S ou N.');
  end if;

  if v_escopo not in ('TODAS', 'FRENTE_CAIXA', 'FORA_FRENTE_CAIXA') then
    raise_application_error(-20002, 'P_ESCOPO deve ser TODAS, FRENTE_CAIXA ou FORA_FRENTE_CAIXA.');
  end if;

  if v_incluir_oficializadas not in ('S', 'N') then
    raise_application_error(-20003, 'P_INCLUIR_OFICIALIZADAS deve ser S ou N.');
  end if;

  if v_limpar_fixos not in ('S', 'N') then
    raise_application_error(-20004, 'P_LIMPAR_FIXOS deve ser S ou N.');
  end if;

  select count(*)
    into v_has_ativa
    from user_tab_columns
   where table_name = 'SGN_ESC_PROG'
     and column_name = 'ATIVA';

  if v_has_ativa = 0 then
    raise_application_error(-20005, 'Coluna SGN_ESC_PROG.ATIVA nao encontrada. Rode a migration 20260630_add_prog_ativa.sql.');
  end if;

  select count(*)
    into v_prog_count
    from sgn_esc_prog p
   where nvl(p.ativa, 1) = 1
     and (v_loja is null or p.loja = v_loja)
     and (v_mes_ref is null or trunc(p.mes_ref, 'MM') = v_mes_ref)
     and (v_incluir_oficializadas = 'S' or nvl(p.oficializada, 0) = 0)
     and (
       v_escopo = 'TODAS'
       or (
         v_escopo = 'FRENTE_CAIXA'
         and exists (
           select 1
             from sgn_esc_secao s
            where s.escsecao_id = p.escsecao_id
              and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
         )
       )
       or (
         v_escopo = 'FORA_FRENTE_CAIXA'
         and not exists (
           select 1
             from sgn_esc_secao s
            where s.escsecao_id = p.escsecao_id
              and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
         )
       )
     );

  select count(*)
    into v_oficializadas
    from sgn_esc_prog p
   where nvl(p.ativa, 1) = 1
     and nvl(p.oficializada, 0) = 1
     and (v_loja is null or p.loja = v_loja)
     and (v_mes_ref is null or trunc(p.mes_ref, 'MM') = v_mes_ref)
     and (
       v_escopo = 'TODAS'
       or (
         v_escopo = 'FRENTE_CAIXA'
         and exists (
           select 1
             from sgn_esc_secao s
            where s.escsecao_id = p.escsecao_id
              and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
         )
       )
       or (
         v_escopo = 'FORA_FRENTE_CAIXA'
         and not exists (
           select 1
             from sgn_esc_secao s
            where s.escsecao_id = p.escsecao_id
              and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
         )
       )
     );

  select count(*)
    into v_dia_count
    from sgn_esc_prog_dia d
   where exists (
     select 1
       from sgn_esc_prog p
      where p.escprog_id = d.escprog_id
        and nvl(p.ativa, 1) = 1
        and (v_loja is null or p.loja = v_loja)
        and (v_mes_ref is null or trunc(p.mes_ref, 'MM') = v_mes_ref)
        and (v_incluir_oficializadas = 'S' or nvl(p.oficializada, 0) = 0)
        and (
          v_escopo = 'TODAS'
          or (
            v_escopo = 'FRENTE_CAIXA'
            and exists (
              select 1
                from sgn_esc_secao s
               where s.escsecao_id = p.escsecao_id
                 and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
            )
          )
          or (
            v_escopo = 'FORA_FRENTE_CAIXA'
            and not exists (
              select 1
                from sgn_esc_secao s
               where s.escsecao_id = p.escsecao_id
                 and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
            )
          )
        )
   );

  if v_limpar_fixos = 'S' then
    select count(*)
      into v_has_fixo_status
      from user_tab_columns
     where table_name = 'SGN_ESC_FIXO_ESCALA'
       and column_name = 'STATUS';

    if v_has_fixo_status = 0 then
      raise_application_error(-20006, 'Coluna SGN_ESC_FIXO_ESCALA.STATUS nao encontrada.');
    end if;

    select count(*)
      into v_fixo_count
      from sgn_esc_fixo_escala f
     where nvl(f.status, 'A') = 'A'
       and (v_loja is null or f.loja = v_loja)
       and (v_mes_ref is null or trunc(f.mes_ref, 'MM') = v_mes_ref)
       and (
         v_escopo = 'TODAS'
         or (
           v_escopo = 'FRENTE_CAIXA'
           and exists (
             select 1
               from sgn_esc_secao s
              where s.escsecao_id = f.escsecao_id
                and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
           )
         )
         or (
           v_escopo = 'FORA_FRENTE_CAIXA'
           and not exists (
             select 1
               from sgn_esc_secao s
              where s.escsecao_id = f.escsecao_id
                and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
           )
         )
       );
  end if;

  dbms_output.put_line('Modo: ' || case when v_executar = 'S' then 'APLICAR' else 'PREVIA' end);
  dbms_output.put_line('Loja: ' || nvl(to_char(v_loja), 'TODAS'));
  dbms_output.put_line('Mes: ' || nvl(to_char(v_mes_ref, 'YYYY-MM'), 'TODOS'));
  dbms_output.put_line('Escopo: ' || v_escopo);
  dbms_output.put_line('Inclui oficializadas: ' || v_incluir_oficializadas);
  dbms_output.put_line('Limpar fixos: ' || v_limpar_fixos);
  dbms_output.put_line('Cabecalhos ativos encontrados: ' || v_prog_count);
  dbms_output.put_line('Dias vinculados encontrados: ' || v_dia_count);
  dbms_output.put_line('Cabecalhos oficializados no escopo: ' || v_oficializadas);
  dbms_output.put_line('Fixos ativos encontrados: ' || v_fixo_count);

  for r in (
    select p.loja,
           to_char(trunc(p.mes_ref, 'MM'), 'YYYY-MM') mes_ref,
           nvl(s.cod_secao, '-') cod_secao,
           nvl(s.descr, 'SEM SECAO') secao,
           count(*) registros,
           count(distinct p.escfunc_id) funcionarios,
           sum(case when nvl(p.oficializada, 0) = 1 then 1 else 0 end) oficializadas
      from sgn_esc_prog p
      left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
     where nvl(p.ativa, 1) = 1
       and (v_loja is null or p.loja = v_loja)
       and (v_mes_ref is null or trunc(p.mes_ref, 'MM') = v_mes_ref)
       and (v_incluir_oficializadas = 'S' or nvl(p.oficializada, 0) = 0)
       and (
         v_escopo = 'TODAS'
         or (v_escopo = 'FRENTE_CAIXA' and regexp_like(upper(nvl(s.descr, '')), 'FRENTE.*CAIXA'))
         or (v_escopo = 'FORA_FRENTE_CAIXA' and not regexp_like(upper(nvl(s.descr, '')), 'FRENTE.*CAIXA'))
       )
     group by p.loja, trunc(p.mes_ref, 'MM'), nvl(s.cod_secao, '-'), nvl(s.descr, 'SEM SECAO')
     order by p.loja, trunc(p.mes_ref, 'MM'), nvl(s.descr, 'SEM SECAO')
  ) loop
    dbms_output.put_line(
      ' - Loja ' || r.loja || ' | ' || r.mes_ref || ' | ' ||
      r.cod_secao || ' - ' || r.secao ||
      ': ' || r.funcionarios || ' funcionario(s), ' ||
      r.registros || ' registro(s), ' ||
      r.oficializadas || ' oficializada(s)'
    );
  end loop;

  if v_executar <> 'S' then
    dbms_output.put_line('Nenhuma alteracao aplicada. Para executar, altere EXECUTAR para S.');
    rollback;
    return;
  end if;

  update sgn_esc_prog p
     set p.ativa = 0
   where nvl(p.ativa, 1) = 1
     and (v_loja is null or p.loja = v_loja)
     and (v_mes_ref is null or trunc(p.mes_ref, 'MM') = v_mes_ref)
     and (v_incluir_oficializadas = 'S' or nvl(p.oficializada, 0) = 0)
     and (
       v_escopo = 'TODAS'
       or (
         v_escopo = 'FRENTE_CAIXA'
         and exists (
           select 1
             from sgn_esc_secao s
            where s.escsecao_id = p.escsecao_id
              and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
         )
       )
       or (
         v_escopo = 'FORA_FRENTE_CAIXA'
         and not exists (
           select 1
             from sgn_esc_secao s
            where s.escsecao_id = p.escsecao_id
              and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
         )
       )
     );

  v_prog_updated := sql%rowcount;

  if v_limpar_fixos = 'S' then
    update sgn_esc_fixo_escala f
       set f.status = 'I'
     where nvl(f.status, 'A') = 'A'
       and (v_loja is null or f.loja = v_loja)
       and (v_mes_ref is null or trunc(f.mes_ref, 'MM') = v_mes_ref)
       and (
         v_escopo = 'TODAS'
         or (
           v_escopo = 'FRENTE_CAIXA'
           and exists (
             select 1
               from sgn_esc_secao s
              where s.escsecao_id = f.escsecao_id
                and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
           )
         )
         or (
           v_escopo = 'FORA_FRENTE_CAIXA'
           and not exists (
             select 1
               from sgn_esc_secao s
              where s.escsecao_id = f.escsecao_id
                and regexp_like(upper(s.descr), 'FRENTE.*CAIXA')
           )
         )
       );

    v_fixo_updated := sql%rowcount;
  end if;

  commit;
  dbms_output.put_line('Escalas inativadas: ' || v_prog_updated);
  dbms_output.put_line('Fixos inativados: ' || v_fixo_updated);
end;
/
