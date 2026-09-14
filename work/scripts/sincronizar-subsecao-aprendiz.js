const dotenv = require('dotenv');
const { closeOraclePool, oracledb, withConnection } = require('../src/db/oracle');

dotenv.config();

function parseArgs(argv) {
  const args = { apply: false, loja: null };
  argv.forEach((arg) => {
    if (arg === '--apply') args.apply = true;
    else if (arg === '--dry-run') args.apply = false;
    else if (arg.startsWith('--loja=')) {
      const loja = Number(arg.slice('--loja='.length));
      if (!Number.isFinite(loja) || loja <= 0) throw new Error('--loja deve ser um numero positivo.');
      args.loja = loja;
    }
  });
  return args;
}

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

async function getColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName`,
    { tableName: tableName.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => String(pick(row, 'COLUMN_NAME', 'column_name')).toUpperCase()));
}

async function assertSchema(connection) {
  const funcionario = await getColumns(connection, 'SGN_ESC_FUNCIONARIO');
  const subsecao = await getColumns(connection, 'SGN_ESC_SUBSECAO');
  if (!funcionario.has('ESCSUBSECAO_ID')) throw new Error('Coluna SGN_ESC_FUNCIONARIO.ESCSUBSECAO_ID nao encontrada.');
  if (!subsecao.has('ESCSUBSECAO_ID') || !subsecao.has('ESCSECAO_ID')) throw new Error('Tabela SGN_ESC_SUBSECAO nao encontrada ou incompleta.');
}

async function listarAprendizes(connection, args) {
  const funcionarioColumns = await getColumns(connection, 'SGN_ESC_FUNCIONARIO');
  const funcaoColumns = await getColumns(connection, 'SGN_ESC_FUNCAO');
  const secaoColumns = await getColumns(connection, 'SGN_ESC_SECAO');
  const funcaoJoinColigada = funcionarioColumns.has('CODCOLIGADA') && funcaoColumns.has('CODCOLIGADA') ? 'and fu.codcoligada = f.codcoligada' : '';
  const secaoJoinColigada = funcionarioColumns.has('CODCOLIGADA') && secaoColumns.has('CODCOLIGADA') ? 'and s.codcoligada = f.codcoligada' : '';
  const binds = {};
  const lojaSql = args.loja ? 'and f.loja = :loja' : '';
  if (args.loja) binds.loja = args.loja;
  const result = await connection.execute(
    `select f.loja,
            f.escsecao_id,
            s.cod_secao,
            s.descr as secao,
            count(*) as aprendizes
       from sgn_esc_funcionario f
       join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
       left join sgn_esc_secao s on s.escsecao_id = f.escsecao_id ${secaoJoinColigada}
      where f.dt_demiss is null
        ${lojaSql}
        and regexp_like(upper(fu.descr), 'APRENDIZ')
      group by f.loja, f.escsecao_id, s.cod_secao, s.descr
      order by f.loja, s.descr`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows;
}

async function garantirSubsecaoAprendiz(connection, escsecaoId) {
  const existente = await connection.execute(
    `select escsubsecao_id
       from sgn_esc_subsecao
      where escsecao_id = :escsecaoId
        and upper(descr) = 'APRENDIZ'
        and nvl(status, 'A') = 'A'`,
    { escsecaoId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  if (existente.rows[0]) return Number(pick(existente.rows[0], 'ESCSUBSECAO_ID', 'escsubsecao_id'));

  const inserted = await connection.execute(
    `insert into sgn_esc_subsecao (escsubsecao_id, escsecao_id, descr, status, dt_hr_incl)
     values (sgn_esc_subsecao_seq.nextval, :escsecaoId, 'Aprendiz', 'A', sysdate)
     returning escsubsecao_id into :id`,
    { escsecaoId, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
    { autoCommit: false }
  );
  return Number(inserted.outBinds.id[0]);
}

async function aplicar(connection, args, grupos) {
  const funcionarioColumns = await getColumns(connection, 'SGN_ESC_FUNCIONARIO');
  const funcaoColumns = await getColumns(connection, 'SGN_ESC_FUNCAO');
  const funcaoJoinColigada = funcionarioColumns.has('CODCOLIGADA') && funcaoColumns.has('CODCOLIGADA') ? 'and fu.codcoligada = f.codcoligada' : '';
  let subsecoes = 0;
  let funcionarios = 0;
  for (const grupo of grupos) {
    const escsecaoId = Number(pick(grupo, 'ESCSECAO_ID', 'escsecao_id'));
    const loja = Number(pick(grupo, 'LOJA', 'loja'));
    if (!escsecaoId || !loja) continue;
    const escsubsecaoId = await garantirSubsecaoAprendiz(connection, escsecaoId);
    subsecoes += 1;
    const result = await connection.execute(
      `update sgn_esc_funcionario f
          set f.escsubsecao_id = :escsubsecaoId
        where f.loja = :loja
          and f.escsecao_id = :escsecaoId
          and f.dt_demiss is null
          and exists (
            select 1
              from sgn_esc_funcao fu
             where fu.escfuncao_id = f.escfuncao_id
               ${funcaoJoinColigada}
               and regexp_like(upper(fu.descr), 'APRENDIZ')
          )`,
      { escsubsecaoId, loja, escsecaoId },
      { autoCommit: false }
    );
    funcionarios += result.rowsAffected || 0;
  }
  await connection.commit();
  return { subsecoes, funcionarios };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    await withConnection(async (connection) => {
      await assertSchema(connection);
      const grupos = await listarAprendizes(connection, args);
      console.log(`Modo: ${args.apply ? 'APLICAR' : 'PREVIA'}`);
      console.log(`Loja: ${args.loja || 'TODAS'}`);
      if (!grupos.length) {
        console.log('Nenhum aprendiz ativo encontrado.');
        return;
      }
      console.table(grupos.map((row) => ({
        loja: pick(row, 'LOJA', 'loja'),
        secao: `${pick(row, 'COD_SECAO', 'cod_secao') || '-'} - ${pick(row, 'SECAO', 'secao') || 'SEM SECAO'}`,
        aprendizes: Number(pick(row, 'APRENDIZES', 'aprendizes') || 0)
      })));
      if (!args.apply) {
        console.log('Previa concluida. Reexecute com --apply para criar/vincular a subsecao Aprendiz.');
        return;
      }
      const resultado = await aplicar(connection, args, grupos);
      console.log(`Subsecoes Aprendiz verificadas/criadas: ${resultado.subsecoes}`);
      console.log(`Funcionarios vinculados: ${resultado.funcionarios}`);
    });
  } finally {
    await closeOraclePool();
  }
}

main().catch(async (error) => {
  console.error(error.message || error);
  await closeOraclePool().catch(() => {});
  process.exitCode = 1;
});
