-- Diagnostico somente de leitura para as 15 chapas da loja 64.
-- Execute conectado como ESCALAINT no SQL Developer (F5) ou SQLcl.
-- NOV/2026: 01/11 a 30/11. DEZ/2026: 01/12 a 03/01.

with
alvos (chapa, nome_informado) as (
  select '064.0075', 'ADEILTON DE SOUZA GALDINO' from dual union all
  select '064.0065', 'CARMEM TENORIO CAVALCANTE' from dual union all
  select '064.0072', 'DECIRIO DIAS NETO' from dual union all
  select '064.0068', 'DIEGO BARRETO CARAZZOLO' from dual union all
  select '064.0066', 'GABRIEL FERNANDES NUNES' from dual union all
  select '064.0078', 'JAQUELINE NERI CABRAL' from dual union all
  select '064.0067', 'JOSIANE SANTANA NASCIMENTO' from dual union all
  select '064.0073', 'LEONARDO HENRIQUE FERREIRA OLIVEIRA' from dual union all
  select '064.0079', 'LUIS CARLOS TORRES JUNIOR' from dual union all
  select '064.0070', 'MICHELLE MEDEIROS' from dual union all
  select '064.0033', 'PAULO DE TARSO FRE SANT ANNA' from dual union all
  select '064.0071', 'ROSANGELA APARECIDA FRANCISCO' from dual union all
  select '064.0077', 'SEBASTIANA DE LOURDES VIEIRA DUZZI' from dual union all
  select '064.0076', 'VAGNER SOARES DE OLIVEIRA' from dual union all
  select '064.0074', 'WESHELY CHRISTINY DE JESUS MIRANDA' from dual
),
periodos (mes_ref, inicio, fim) as (
  select date '2026-11-01', date '2026-11-01', date '2026-11-30' from dual union all
  select date '2026-12-01', date '2026-12-01', date '2027-01-03' from dual
),
programacoes as (
  select p.escfunc_id, p.mes_ref, p.escprog_id, p.escsecao_id,
         p.revisao, p.oficializada,
         (select count(*) from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id) dias,
         row_number() over (
           partition by p.escfunc_id, p.mes_ref
           order by p.revisao desc, p.escprog_id desc
         ) ordem
    from sgn_esc_prog p
   where p.loja = 64
     and p.mes_ref in (date '2026-11-01', date '2026-12-01')
     and nvl(p.ativa, 1) = 1
),
base as (
  select a.chapa, a.nome_informado, per.mes_ref, per.inicio, per.fim,
         f.escfunc_id, f.nome nome_cadastro, f.loja loja_cadastro,
         f.codcoligada coligada_cadastro, f.status status_funcionario,
         f.dt_demiss, f.escsecao_id secao_cadastro_id,
         s.cod_secao, s.descr secao, s.status status_secao,
         s.codfilial filial_secao, s.codcoligada coligada_secao,
         fu.descr funcao,
         l.codcoligada coligada_loja, nvl(l.todas_secoes_habilitadas, 0) todas_secoes_habilitadas,
         prog.escprog_id, prog.escsecao_id secao_programada_id,
         prog.revisao, prog.oficializada, prog.dias,
         (select count(*) from sgn_esc_ausencia aus
           where aus.escfunc_id = f.escfunc_id
             and aus.dt_inic <= per.fim
             and nvl(aus.dt_fim, date '2099-12-31') >= per.inicio) ausencias_periodo,
         (select count(*) from sgn_esc_pendencia_func pen
           where pen.escfunc_id = f.escfunc_id and pen.status = 'P'
             and pen.dt_inicio <= per.fim
             and nvl(pen.dt_fim, date '2099-12-31') >= per.inicio) pendencias_periodo,
         (select count(*) from sgn_esc_pendencia_func pen
           where pen.escfunc_id = f.escfunc_id and pen.status = 'P'
             and pen.dt_inicio <= per.inicio
             and nvl(pen.dt_fim, date '2099-12-31') >= per.fim) suspensao_integral,
         (select count(*) from sgn_esc_ausencia aus
           where aus.escfunc_id = f.escfunc_id
             and aus.dt_inic <= per.inicio
             and nvl(aus.dt_fim, date '2099-12-31') >= per.fim
             and (upper(aus.motivo) like '%AFAST%' or upper(aus.motivo) = 'AFA')) afastamento_integral
    from alvos a
    cross join periodos per
    left join sgn_esc_funcionario f on f.chapa = a.chapa
    left join sgn_esc_secao s on s.escsecao_id = f.escsecao_id
    left join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id
    left join sgn_esc_loja l on l.loja = 64
    left join programacoes prog on prog.escfunc_id = f.escfunc_id
      and prog.mes_ref = per.mes_ref and prog.ordem = 1
),
avaliacao as (
  select b.*,
         case
           when b.escfunc_id is null then 'SEM_CADASTRO_ESCALA'
           when b.loja_cadastro <> 64 then 'LOJA_CADASTRO_DIVERGENTE'
           when b.coligada_loja is not null and b.coligada_cadastro <> b.coligada_loja then 'COLIGADA_DIVERGENTE'
           when b.cod_secao is null then 'SECAO_NAO_ENCONTRADA'
           when b.filial_secao <> 64 or b.coligada_secao <> b.coligada_cadastro then 'SECAO_FILIAL_COLIGADA_DIVERGENTE'
           when b.dt_demiss is not null then 'DESLIGADO'
           when upper(trim(nvl(b.status_funcionario, 'A'))) not in ('A', 'F', 'P', 'Z') then 'STATUS_NAO_PERMITIDO'
           when regexp_like(trim(nvl(b.cod_secao, ' ')), '(^|[.])01[.]001$') then 'GERENCIA_FORA_DA_ESCALA'
           when nvl(b.status_secao, 'A') <> 'A' and not (
             b.todas_secoes_habilitadas = 1
             and not regexp_like(trim(nvl(b.cod_secao, ' ')), '(^|[.])02[.]012$')
           ) then 'SECAO_INATIVA'
           when b.todas_secoes_habilitadas <> 1
             and not regexp_like(upper(b.secao), 'FRENTE.*CAIXA|SERVI.*CLIENT|TRANSP|PORTARIA')
             and not regexp_like(trim(nvl(b.cod_secao, ' ')), '(^|[.])02[.]012$')
             then 'SECAO_FORA_DO_ESCOPO_DA_LOJA'
           when b.afastamento_integral > 0 then 'AFASTAMENTO_INTEGRAL'
           when b.suspensao_integral > 0 and b.ausencias_periodo = 0 then 'SUSPENSAO_INTEGRAL'
           when b.fim < trunc(sysdate) then 'PERIODO_ENCERRADO'
           when b.escprog_id is null then 'APTO_SEM_PROGRAMACAO_ATIVA'
           when b.secao_programada_id <> b.secao_cadastro_id then 'PROGRAMACAO_EM_OUTRA_SECAO'
           when b.dias = 0 then 'PROGRAMACAO_SEM_DIAS'
           else 'PROGRAMACAO_EXISTE_VERIFICAR_ACESSO'
         end diagnostico
    from base b
)
select to_char(mes_ref, 'YYYY-MM') competencia,
       to_char(inicio, 'DD/MM/YYYY') inicio,
       to_char(fim, 'DD/MM/YYYY') fim,
       chapa, nome_informado, nome_cadastro, escfunc_id, loja_cadastro,
       status_funcionario, to_char(dt_demiss, 'DD/MM/YYYY') demissao,
       coligada_cadastro, coligada_loja,
       secao_cadastro_id, cod_secao, secao, status_secao,
       filial_secao, coligada_secao, funcao,
       todas_secoes_habilitadas,
       escprog_id, secao_programada_id, revisao, oficializada, dias,
       ausencias_periodo, pendencias_periodo, afastamento_integral, suspensao_integral,
       diagnostico
  from avaliacao
 order by chapa, mes_ref;
