-- Execute no Oracle ESCALAINT. Somente leitura.
-- Cada linha corresponde a uma folga da revisao ativa mais recente e oficializada.
-- O status do envio e indicativo: a existencia/formato real deve ser conferida no RM.
-- Copie apenas os COMANDO_SQL_SERVER desejados para a area indicada no script de correcao.

with revisoes as (
  select p.escprog_id, p.loja, p.mes_ref, p.escfunc_id, p.escsecao_id,
         p.revisao, p.oficializada,
         row_number() over (
           partition by p.loja, p.mes_ref, p.escfunc_id
           order by p.revisao desc, p.escprog_id desc
         ) ordem
    from sgn_esc_prog p
   where nvl(p.ativa, 1) = 1
)
select p.loja,
       to_char(p.mes_ref, 'YYYY-MM') competencia,
       s.cod_secao,
       f.escfunc_id,
       f.chapa,
       f.nome,
       f.codcoligada,
       to_char(trunc(d.dt), 'YYYY-MM-DD') data_folga,
       d.programacao,
       p.escprog_id,
       p.revisao,
       e.envio_id,
       nvl(e.status, 'SEM_ENVIO_REGISTRADO') status_envio,
       'INSERT INTO #Alvos (CODCOLIGADA, CHAPA, DATA) VALUES (' ||
         to_char(f.codcoligada) || ', N''' || replace(f.chapa, '''', '''''') ||
         ''', CONVERT(date, ''' || to_char(trunc(d.dt), 'YYYY-MM-DD') || ''', 23));' comando_sql_server
  from revisoes p
  join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
  join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
  join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
  left join sgn_esc_rm_envio e
    on e.loja = p.loja and e.mes_ref = p.mes_ref
   and e.escsecao_id = p.escsecao_id
   and e.escfunc_id = p.escfunc_id and e.revisao = p.revisao
 where p.ordem = 1
   and p.oficializada = 1
   and upper(trim(d.programacao)) in ('F', 'FOLGA', 'FXF', 'FOLGA_FIXA')
 order by p.loja, p.mes_ref, f.chapa, d.dt;
