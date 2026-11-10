-- Somente leitura. Ajuste os quatro valores abaixo para a competencia desejada.
-- Novembro/2026: 01/11 a 30/11. Dezembro/2026: 01/12 a 03/01.
define LOJA = 999
define MES_REF = '2026-11-01'
define INICIO = '2026-11-01'
define FIM = '2026-11-30'

select l.loja, l.oficializacao_habilitada, l.todas_secoes_habilitadas,
       s.escsecao_id, s.cod_secao, s.descr, s.status secao_status,
       count(distinct f.escfunc_id) funcionarios_cadastrados
  from sgn_esc_loja l
  join sgn_esc_secao s on s.codfilial = l.loja
  left join sgn_esc_funcionario f on f.loja = l.loja and f.escsecao_id = s.escsecao_id
 where l.loja = &LOJA
 group by l.loja, l.oficializacao_habilitada, l.todas_secoes_habilitadas,
          s.escsecao_id, s.cod_secao, s.descr, s.status
 order by s.cod_secao;

with parametros as (
  select &LOJA loja, to_date('&MES_REF', 'YYYY-MM-DD') mes_ref,
         to_date('&INICIO', 'YYYY-MM-DD') inicio,
         to_date('&FIM', 'YYYY-MM-DD') fim from dual
),
datas as (
  select p.inicio + level - 1 dia from parametros p
  connect by level <= (select fim - inicio + 1 from parametros)
),
programacoes as (
  select p.escprog_id, p.escfunc_id, p.escsecao_id, p.revisao, p.oficializada,
         row_number() over (partition by p.escfunc_id, p.escsecao_id
           order by p.revisao desc, p.escprog_id desc) ordem
    from sgn_esc_prog p join parametros par on par.loja = p.loja and par.mes_ref = p.mes_ref
   where nvl(p.ativa, 1) = 1
),
base as (
  select s.cod_secao, s.descr secao, f.escfunc_id, f.chapa, f.nome,
         f.status status_funcionario, f.dt_demiss,
         prog.escprog_id, prog.revisao, prog.oficializada,
         d.dia, pd.escprogdia_id, pd.programacao,
         case when exists (
           select 1 from sgn_esc_ausencia a where a.escfunc_id = f.escfunc_id
             and d.dia between trunc(a.dt_inic) and trunc(nvl(a.dt_fim, a.dt_inic))
         ) then 1 else 0 end ausencia,
         case when exists (
           select 1 from sgn_esc_pendencia_func pen
            where pen.escfunc_id = f.escfunc_id and pen.status = 'P'
              and d.dia between trunc(pen.dt_inicio) and trunc(nvl(pen.dt_fim, date '2099-12-31'))
         ) then 1 else 0 end suspensao
    from parametros par
    join sgn_esc_secao s on s.codfilial = par.loja and s.status = 'A'
    join sgn_esc_funcionario f on f.loja = par.loja and f.escsecao_id = s.escsecao_id
    cross join datas d
    left join programacoes prog on prog.escfunc_id = f.escfunc_id
      and prog.escsecao_id = s.escsecao_id and prog.ordem = 1
    left join sgn_esc_prog_dia pd on pd.escprog_id = prog.escprog_id and trunc(pd.dt) = d.dia
   where (f.dt_demiss is null or d.dia <= trunc(f.dt_demiss))
     and not (par.mes_ref = date '2026-11-01' and d.dia = date '2026-11-01')
)
select cod_secao, secao, escfunc_id, chapa, nome, status_funcionario,
       to_char(dt_demiss, 'DD/MM/YYYY') demissao, escprog_id, revisao, oficializada,
       count(distinct dia) dias_esperados,
       count(distinct case when escprogdia_id is not null then dia end) dias_gravados,
       count(distinct case when escprogdia_id is null and ausencia = 1 then dia end) dias_cobertos_ausencia,
       count(distinct case when escprogdia_id is null and ausencia = 0 and suspensao = 0
         and dia >= trunc(sysdate) then dia end) dias_futuros_sem_gravacao,
       listagg(case when escprogdia_id is null and ausencia = 0 and suspensao = 0
         and dia >= trunc(sysdate)
         then to_char(dia, 'DD/MM') end, ', ') within group (order by dia) datas_faltantes
  from base
 group by cod_secao, secao, escfunc_id, chapa, nome, status_funcionario,
          dt_demiss, escprog_id, revisao, oficializada
 order by cod_secao, chapa;

-- Este SELECT mostra lacunas e estado das revisoes. Criticas de jornada/folga
-- sao calculadas pela API; consulte a tela de criticas para o bloqueio restante.
