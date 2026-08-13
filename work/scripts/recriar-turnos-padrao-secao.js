const { closeOraclePool, oracledb, withConnection } = require('../src/db/oracle');

const TURNO_PADRAO = {
  HR_ENT1: '08:00',
  HR_SAI1: '12:00',
  HR_ENT2: '13:10',
  HR_SAI2: '17:58'
};

function parseArgs(argv) {
  const args = {
    execute: false,
    loja: null
  };

  argv.forEach((arg) => {
    if (arg === '--execute') args.execute = true;
    if (arg.startsWith('--loja=')) {
      const loja = Number(arg.split('=')[1]);
      if (Number.isFinite(loja) && loja > 0) args.loja = loja;
    }
  });

  return args;
}

async function getColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name
       from user_tab_columns
      where table_name = :tableName`,
    { tableName: tableName.toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => String(row.COLUMN_NAME || row.column_name).toUpperCase()));
}

async function getSecaoLojaColumn(connection) {
  const columns = await getColumns(connection, 'SGN_ESC_SECAO');
  if (columns.has('CODFILIAL')) return 'CODFILIAL';
  if (columns.has('LOJA')) return 'LOJA';
  throw new Error('A tabela SGN_ESC_SECAO precisa ter CODFILIAL ou LOJA para filtrar por loja.');
}

async function assertSchema(connection) {
  const turnoColumns = await getColumns(connection, 'SGN_ESC_SECAO_TURNO');
  const required = [
    'ESCSECAOTURNO_ID',
    'ESCSECAO_ID',
    'HR_ENT1',
    'HR_SAI1',
    'HR_ENT2',
    'HR_SAI2',
    'QTDE_COLABORADORES',
    'DT_HR_INCL'
  ];
  const missing = required.filter((column) => !turnoColumns.has(column));
  if (missing.length) {
    throw new Error(`Colunas ausentes em SGN_ESC_SECAO_TURNO: ${missing.join(', ')}`);
  }
}

async function listarTurnosPadrao(connection, loja) {
  const lojaColumn = await getSecaoLojaColumn(connection);
  const whereSql = loja ? `where s.${lojaColumn.toLowerCase()} = :loja` : '';
  const binds = loja ? { loja } : {};

  const result = await connection.execute(
    `select
        s.escsecao_id,
        s.cod_secao,
        s.descr,
        s.${lojaColumn.toLowerCase()} as loja,
        count(f.escfunc_id) as qtde_colaboradores
       from sgn_esc_secao s
       left join sgn_esc_funcionario f
         on f.escsecao_id = s.escsecao_id
        and f.loja = s.${lojaColumn.toLowerCase()}
        and (f.dt_demiss is null or f.dt_demiss >= trunc(sysdate))
       ${whereSql}
       group by s.escsecao_id, s.cod_secao, s.descr, s.${lojaColumn.toLowerCase()}
       order by s.${lojaColumn.toLowerCase()}, s.descr`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows.map((row) => ({
    escsecaoId: Number(row.ESCSECAO_ID),
    codSecao: row.COD_SECAO,
    descr: row.DESCR,
    loja: Number(row.LOJA),
    qtdeColaboradores: Number(row.QTDE_COLABORADORES || 0)
  }));
}

async function deletarTurnosExistentes(connection, loja) {
  const lojaColumn = await getSecaoLojaColumn(connection);
  const binds = loja ? { loja } : {};
  const whereSql = loja ? `and s.${lojaColumn.toLowerCase()} = :loja` : '';

  const result = await connection.execute(
    `delete from sgn_esc_secao_turno t
      where exists (
        select 1
          from sgn_esc_secao s
         where s.escsecao_id = t.escsecao_id
           ${whereSql}
      )`,
    binds,
    { autoCommit: false }
  );

  return result.rowsAffected || 0;
}

async function inserirTurnosPadrao(connection, turnos) {
  if (!turnos.length) return 0;

  const binds = turnos.map((turno) => ({
    escsecaoId: turno.escsecaoId,
    hrEnt1: TURNO_PADRAO.HR_ENT1,
    hrSai1: TURNO_PADRAO.HR_SAI1,
    hrEnt2: TURNO_PADRAO.HR_ENT2,
    hrSai2: TURNO_PADRAO.HR_SAI2,
    qtdeColaboradores: turno.qtdeColaboradores
  }));

  const result = await connection.executeMany(
    `insert into sgn_esc_secao_turno (
       escsecaoturno_id,
       escsecao_id,
       hr_ent1,
       hr_sai1,
       hr_ent2,
       hr_sai2,
       qtde_colaboradores,
       dt_hr_incl
     ) values (
       sgn_esc_secao_turno_seq.nextval,
       :escsecaoId,
       :hrEnt1,
       :hrSai1,
       :hrEnt2,
       :hrSai2,
       :qtdeColaboradores,
       sysdate
     )`,
    binds,
    { autoCommit: false }
  );

  return result.rowsAffected || 0;
}

function imprimirResumo(turnos, execute, loja) {
  const totalFuncionarios = turnos.reduce((total, turno) => total + turno.qtdeColaboradores, 0);
  const escopo = loja ? `loja ${loja}` : 'todas as lojas';

  console.log(`Escopo: ${escopo}`);
  console.log(`Modo: ${execute ? 'EXECUCAO' : 'SIMULACAO'}`);
  console.log(`Turno padrao: ${TURNO_PADRAO.HR_ENT1} - ${TURNO_PADRAO.HR_SAI1} / ${TURNO_PADRAO.HR_ENT2} - ${TURNO_PADRAO.HR_SAI2}`);
  console.log(`Secoes encontradas: ${turnos.length}`);
  console.log(`Funcionarios previstos: ${totalFuncionarios}`);

  turnos.slice(0, 20).forEach((turno) => {
    console.log(`- Loja ${turno.loja} | ${turno.codSecao} - ${turno.descr}: ${turno.qtdeColaboradores} funcionario(s)`);
  });

  if (turnos.length > 20) {
    console.log(`... ${turnos.length - 20} secao(oes) omitida(s) no resumo.`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await withConnection(async (connection) => {
    await assertSchema(connection);
    const turnos = await listarTurnosPadrao(connection, args.loja);
    imprimirResumo(turnos, args.execute, args.loja);

    if (!args.execute) {
      console.log('');
      console.log('Nenhuma alteracao foi aplicada. Use --execute para apagar os turnos atuais e recriar os turnos padrao.');
      return;
    }

    try {
      const deletados = await deletarTurnosExistentes(connection, args.loja);
      const inseridos = await inserirTurnosPadrao(connection, turnos);
      await connection.commit();
      console.log('');
      console.log(`Turnos removidos: ${deletados}`);
      console.log(`Turnos criados: ${inseridos}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeOraclePool();
  });
