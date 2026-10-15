const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');

function classificar(row) {
  if (Number(row.CODFILIAL) === 999) return 'PRESERVADA_LOJA_999';
  if (Number(row.FRENTES_CANONICAS) !== 1) return 'REVISAR_FRENTE';
  if (Number(row.PORTEIROS_CADASTRADOS) > 1
      || (Number(row.PORTEIROS_CADASTRADOS) > 0 && Number(row.PORTEIROS_ATIVOS) === 0)) {
    return 'REVISAR_SUBSECOES';
  }
  if (Number(row.PORTEIROS_ATIVOS) === 0) return 'CRIAR_SUBSECAO';
  return 'PRONTA';
}

async function diagnosticar(connection) {
  const result = await connection.execute(
    `select s.escsecao_id, s.codcoligada, s.codfilial, s.cod_secao, s.descr, s.status,
            (select count(*) from sgn_esc_funcionario f
              where f.escsecao_id = s.escsecao_id) funcionarios,
            (select count(*) from sgn_esc_prog p
              where p.escsecao_id = s.escsecao_id
                and p.mes_ref >= trunc(sysdate, 'MM')
                and p.ativa = 1 and p.oficializada = 0) programacoes_editaveis,
            (select count(*) from sgn_esc_fixo_escala x
              where x.escsecao_id = s.escsecao_id
                and x.mes_ref >= trunc(sysdate, 'MM')) fixos,
            (select count(*) from sgn_esc_secao frente
              where frente.codcoligada = s.codcoligada
                and frente.codfilial = s.codfilial and frente.status = 'A'
                and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
                and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')) frentes_canonicas,
            (select count(*) from sgn_esc_secao frente
              join sgn_esc_subsecao sub on sub.escsecao_id = frente.escsecao_id
              where frente.codcoligada = s.codcoligada
                and frente.codfilial = s.codfilial and frente.status = 'A'
                and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
                and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
                and upper(trim(sub.descr)) = 'PORTEIRO') porteiros_cadastrados,
            (select count(*) from sgn_esc_secao frente
              join sgn_esc_subsecao sub on sub.escsecao_id = frente.escsecao_id
              where frente.codcoligada = s.codcoligada
                and frente.codfilial = s.codfilial and frente.status = 'A'
                and regexp_like(upper(frente.descr), 'FRENTE.*CAIXA')
                and regexp_like(trim(frente.cod_secao), '(^|[.])02[.]002$')
                and upper(sub.descr) = 'PORTEIRO' and sub.status = 'A') porteiros_ativos
       from sgn_esc_secao s
      where regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$')
        and (exists (select 1 from sgn_esc_funcionario f
                     where f.escsecao_id = s.escsecao_id)
          or exists (select 1 from sgn_esc_prog p
                      where p.escsecao_id = s.escsecao_id
                        and p.mes_ref >= trunc(sysdate, 'MM')
                        and p.ativa = 1 and p.oficializada = 0)
          or exists (select 1 from sgn_esc_fixo_escala x
                      where x.escsecao_id = s.escsecao_id
                        and x.mes_ref >= trunc(sysdate, 'MM')))
      order by s.codfilial, s.escsecao_id`,
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const funcoes = await connection.execute(
    `select s.escsecao_id, s.codfilial, f.escfuncao_id,
            coalesce(fn.descr, '(funcao sem cadastro)') funcao,
            count(*) funcionarios
       from sgn_esc_secao s
       join sgn_esc_funcionario f on f.escsecao_id = s.escsecao_id
       left join sgn_esc_funcao fn on fn.escfuncao_id = f.escfuncao_id
      where regexp_like(trim(s.cod_secao), '(^|[.])02[.]012$')
      group by s.escsecao_id, s.codfilial, f.escfuncao_id, fn.descr
      order by s.codfilial, s.escsecao_id, funcionarios desc, funcao`,
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const funcoesPorSecao = new Map();
  for (const funcao of funcoes.rows || []) {
    const id = Number(funcao.ESCSECAO_ID);
    if (!funcoesPorSecao.has(id)) funcoesPorSecao.set(id, []);
    funcoesPorSecao.get(id).push({
      funcaoId: funcao.ESCFUNCAO_ID,
      funcao: funcao.FUNCAO,
      funcionarios: Number(funcao.FUNCIONARIOS)
    });
  }
  return (result.rows || []).map((row) => ({
    ...row,
    SITUACAO: classificar(row),
    FUNCOES: funcoesPorSecao.get(Number(row.ESCSECAO_ID)) || []
  }));
}

async function main() {
  if (process.argv.length !== 2) throw new Error('Este diagnostico nao aceita argumentos nem altera dados.');
  try {
    const rows = await withConnection(diagnosticar);
    const pendencias = rows.filter((row) => row.SITUACAO.startsWith('REVISAR_'));
    console.log(JSON.stringify({
      portarias: rows.length,
      prontas: rows.filter((row) => row.SITUACAO === 'PRONTA').length,
      subsecoesACriar: rows.filter((row) => row.SITUACAO === 'CRIAR_SUBSECAO').length,
      preservadasLoja999: rows.filter((row) => row.SITUACAO === 'PRESERVADA_LOJA_999').length,
      distribuicaoPorFuncao: rows.map((row) => ({
        secaoId: row.ESCSECAO_ID,
        filial: row.CODFILIAL,
        secao: row.DESCR,
        situacao: row.SITUACAO,
        funcoes: row.FUNCOES
      })),
      revisaoManual: pendencias
    }, null, 2));
    if (pendencias.length) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Diagnostico interrompido: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { classificar, diagnosticar };
