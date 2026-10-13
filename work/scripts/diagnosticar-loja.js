const { initOraclePool, closeOraclePool, withConnection, oracledb } = require('../src/db/oracle');

function parseLoja(argv) {
  if (argv.length !== 1 || !/^--loja=[1-9]\d*$/.test(argv[0])) {
    throw new Error('Use --loja=NUMERO. Este comando apenas consulta o Oracle.');
  }
  const loja = Number(argv[0].slice('--loja='.length));
  if (!Number.isSafeInteger(loja)) throw new Error('Numero de loja invalido.');
  return loja;
}

async function getSecaoLojaColumn(connection) {
  const result = await connection.execute(
    `select column_name from user_tab_columns
      where table_name = 'SGN_ESC_SECAO' and column_name in ('CODFILIAL', 'LOJA')`,
    {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const columns = new Set(result.rows.map((row) => row.COLUMN_NAME));
  if (columns.has('CODFILIAL')) return 'codfilial';
  if (columns.has('LOJA')) return 'loja';
  throw new Error('SGN_ESC_SECAO sem CODFILIAL ou LOJA.');
}

async function diagnosticar(connection, loja) {
  const secaoLojaColumn = await getSecaoLojaColumn(connection);
  const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };
  const catalogo = await connection.execute(
    'select escloja_id, loja, codcoligada from sgn_esc_loja where loja = :loja',
    { loja }, options
  );
  const funcionarios = await connection.execute(
    `select codcoligada, count(*) as total,
            sum(case when dt_demiss is null or dt_demiss >= trunc(sysdate) then 1 else 0 end) as ativos
       from sgn_esc_funcionario where loja = :loja group by codcoligada order by codcoligada`,
    { loja }, options
  );
  const secoes = await connection.execute(
    `select codcoligada, status, count(*) as total
       from sgn_esc_secao where ${secaoLojaColumn} = :loja
      group by codcoligada, status order by codcoligada, status`,
    { loja }, options
  );
  const vinculados = await connection.execute(
    `select u.usuario_id, u.login, u.perfil, u.status
       from sgn_esc_usuario u
       join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
      where ul.loja = :loja order by u.login`,
    { loja }, options
  );
  const candidatos = await connection.execute(
    `select u.usuario_id, u.login, u.perfil, u.status
       from sgn_esc_usuario u
      where regexp_like(upper(u.login), :padrao)
        and not exists (select 1 from sgn_esc_usuario_loja ul
                         where ul.usuario_id = u.usuario_id and ul.loja = :loja)
      order by u.login fetch first 50 rows only`,
    { loja, padrao: `(^|[^0-9])0*${loja}([^0-9]|$)` }, options
  );
  return {
    loja,
    catalogo: catalogo.rows[0] || null,
    funcionarios: funcionarios.rows,
    secoes: secoes.rows,
    usuariosVinculados: vinculados.rows,
    possiveisUsuariosSemVinculo: candidatos.rows
  };
}

async function main() {
  const loja = parseLoja(process.argv.slice(2));
  await initOraclePool();
  try {
    const result = await withConnection((connection) => diagnosticar(connection, loja));
    console.log(JSON.stringify(result, null, 2));
    if (!result.catalogo) console.log('Loja ausente em SGN_ESC_LOJA: nao aparece nos filtros.');
    if (!result.funcionarios.length) console.log('Nenhum colaborador da loja na base da escala; verificar o job de carga do RM.');
    if (!result.usuariosVinculados.length) console.log('Nenhuma conta vinculada a loja; conferir SGN_ESC_USUARIO_LOJA.');
    console.log('Possiveis usuarios sem vinculo sao apenas candidatos; nenhuma permissao foi alterada.');
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

module.exports = { parseLoja, diagnosticar };
