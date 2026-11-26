-- Consulta somente leitura. Ajuste mes_inicial, mes_final e loja (NULL = todas).
-- Usa a ultima revisao ativa de cada funcionario. Nao inclui funcionarios sem
-- cabecalho em SGN_ESC_PROG nem projeta ausencias; para pendencias detalhadas,
-- consulte tambem a tela Progresso da escala.
with parametros as (
  select date '2026-11-01' as mes_inicial,
         date '2027-01-01' as mes_final,
         cast(null as number) as loja
    from dual
), revisoes as (
  select p.escprog_id, p.loja, p.mes_ref, p.escfunc_id, p.escsecao_id,
         p.revisao, p.oficializada,
         row_number() over (
           partition by p.loja, p.mes_ref, p.escfunc_id
           order by p.revisao desc, p.escprog_id desc
         ) as rn
    from sgn_esc_prog p
    cross join parametros filtro
   where nvl(p.ativa, 1) = 1
     and p.mes_ref >= filtro.mes_inicial
     and p.mes_ref < add_months(filtro.mes_final, 1)
     and (filtro.loja is null or p.loja = filtro.loja)
), atuais as (
  select * from revisoes where rn = 1
)
select p.loja,
       to_char(p.mes_ref, 'YYYY-MM') as mes_escala,
       s.cod_secao as codigo_secao,
       s.descr as secao,
       count(distinct p.escfunc_id) as funcionarios,
       max(p.revisao) as maior_revisao,
       count(distinct case when p.oficializada = 1 then p.escfunc_id end) as funcionarios_oficializados,
       count(d.escprogdia_id) as dias_gravados,
       sum(case when p.oficializada = 1 then 1 else 0 end
           * case when d.escprogdia_id is not null then 1 else 0 end) as dias_oficializados,
       round(100 * sum(case when p.oficializada = 1 and d.escprogdia_id is not null then 1 else 0 end)
         / nullif(count(d.escprogdia_id), 0), 1) as percentual_dias_oficializados,
       sum(case when d.programacao = 'F' then 1 else 0 end) as folgas_normais,
       case
         when count(d.escprogdia_id) = 0 then 'SEM_DIAS'
         when min(nvl(p.oficializada, 0)) = 1
           and count(distinct case when d.escprogdia_id is not null then p.escfunc_id end)
             = count(distinct p.escfunc_id) then 'OFICIALIZADA'
         when max(nvl(p.oficializada, 0)) = 1 then 'PARCIAL'
         else 'NAO_OFICIALIZADA'
       end as status
  from atuais p
  left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
  left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
 group by p.loja, p.mes_ref, s.cod_secao, s.descr
 order by p.loja, p.mes_ref, s.cod_secao;
