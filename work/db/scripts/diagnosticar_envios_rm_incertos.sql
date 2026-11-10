-- Consulta somente leitura. Altere a loja; use NULL para todas as lojas.
define loja = 35

select e.envio_id, e.loja, to_char(e.mes_ref, 'YYYY-MM-DD') mes_ref,
       s.cod_secao, e.escsecao_id, f.chapa, f.nome, e.escfunc_id,
       e.revisao revisao_envio, p.revisao revisao_atual,
       nvl(p.oficializada, 0) oficializada_atual,
       e.status, e.tentativas, e.erro, e.dt_hr_alter,
       case
         when p.revisao is null then 'SEM_ESCALA_ATIVA'
         when p.revisao <> e.revisao then 'REVISAO_SUPERADA'
         when p.escsecao_id <> e.escsecao_id then 'SECAO_ALTERADA'
         when nvl(p.oficializada, 0) <> 1 then 'NAO_OFICIALIZADA'
         else 'APTO_RECONCILIACAO'
       end diagnostico
  from sgn_esc_rm_envio e
  join sgn_esc_funcionario f on f.escfunc_id = e.escfunc_id
  left join sgn_esc_secao s on s.escsecao_id = e.escsecao_id
  left join sgn_esc_prog p
    on p.escprog_id = (
      select max(p2.escprog_id) keep (dense_rank last order by p2.revisao)
        from sgn_esc_prog p2
       where p2.loja = e.loja and p2.mes_ref = e.mes_ref
         and p2.escfunc_id = e.escfunc_id and nvl(p2.ativa, 1) = 1
    )
 where (&loja is null or e.loja = &loja)
   and e.status in ('INCERTO', 'FALHA')
 order by e.loja, e.mes_ref, f.chapa, e.revisao desc;
