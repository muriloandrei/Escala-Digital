const { withConnection, oracledb } = require('../db/oracle');

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function normalizeLoja(row) {
  return {
    ESCLOJA_ID: pick(row, 'ESCLOJA_ID', 'escloja_id'),
    LOJA: pick(row, 'LOJA', 'loja'),
    QTDE_BRIGADISTA_EXIGIDO: pick(row, 'QTDE_BRIGADISTA_EXIGIDO', 'qtde_brigadista_exigido'),
    QTDE_BRIGADISTA_EXIGIDO_DIA: pick(row, 'QTDE_BRIGADISTA_EXIGIDO_DIA', 'qtde_brigadista_exigido_dia'),
    CODCOLIGADA: pick(row, 'CODCOLIGADA', 'codcoligada')
  };
}

function normalizeFuncionario(row) {
  return {
    ESCFUNC_ID: pick(row, 'ESCFUNC_ID', 'escfunc_id'),
    CODCOLIGADA: pick(row, 'CODCOLIGADA', 'codcoligada'),
    LOJA: pick(row, 'LOJA', 'loja'),
    CHAPA: pick(row, 'CHAPA', 'chapa'),
    NOME: pick(row, 'NOME', 'nome'),
    DT_ADMISS: pick(row, 'DT_ADMISS', 'dt_admiss'),
    BRIGADISTA: pick(row, 'BRIGADISTA', 'brigadista'),
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    SECAO_DESCR: pick(row, 'SECAO_DESCR', 'secao_descr'),
    ESCFUNCAO_ID: pick(row, 'ESCFUNCAO_ID', 'escfuncao_id'),
    FUNCAO_DESCR: pick(row, 'FUNCAO_DESCR', 'funcao_descr'),
    HR_ENT1: pick(row, 'HR_ENT1', 'hr_ent1'),
    HR_SAI1: pick(row, 'HR_SAI1', 'hr_sai1'),
    HR_ENT2: pick(row, 'HR_ENT2', 'hr_ent2'),
    HR_SAI2: pick(row, 'HR_SAI2', 'hr_sai2'),
    DT_HR_INCL: pick(row, 'DT_HR_INCL', 'dt_hr_incl')
  };
}

function normalizeSecao(row, turnos = []) {
  const codfilial = pick(row, 'CODFILIAL', 'codfilial');
  return {
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    CODFILIAL: codfilial,
    CODCOLIGADA: pick(row, 'CODCOLIGADA', 'codcoligada'),
    LOJA: pick(row, 'LOJA', 'loja') ?? codfilial,
    COD_SECAO: pick(row, 'COD_SECAO', 'cod_secao'),
    DESCR: pick(row, 'DESCR', 'descr'),
    DT_HR_INCL: pick(row, 'DT_HR_INCL', 'dt_hr_incl'),
    TURNOS: turnos
  };
}

function normalizeSecaoTurno(row) {
  return {
    ESCSECAOTURNO_ID: pick(row, 'ESCSECAOTURNO_ID', 'escsecaoturno_id'),
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    COD_SECAO: pick(row, 'COD_SECAO', 'cod_secao'),
    DESCR: pick(row, 'DESCR', 'descr'),
    LOJA: pick(row, 'LOJA', 'loja'),
    HR_ENT1: pick(row, 'HR_ENT1', 'hr_ent1'),
    HR_SAI1: pick(row, 'HR_SAI1', 'hr_sai1'),
    HR_ENT2: pick(row, 'HR_ENT2', 'hr_ent2'),
    HR_SAI2: pick(row, 'HR_SAI2', 'hr_sai2'),
    QTDE_COLABORADORES: pick(row, 'QTDE_COLABORADORES', 'qtde_colaboradores')
  };
}

function isMissingObjectError(error) {
  return error?.errorNum === 942 || error?.code === 'ORA-00942';
}

function isInvalidIdentifierError(error) {
  return error?.errorNum === 904 || error?.code === 'ORA-00904';
}

const tableColumnsCache = new Map();

async function getTableColumns(connection, tableName) {
  const normalizedTable = String(tableName).toUpperCase();
  if (tableColumnsCache.has(normalizedTable)) return tableColumnsCache.get(normalizedTable);

  const result = await connection.execute(
    `select column_name
     from user_tab_columns
     where table_name = :tableName`,
    { tableName: normalizedTable },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const columns = new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
  tableColumnsCache.set(normalizedTable, columns);
  return columns;
}

async function secaoHasLojaColumn(connection) {
  const columns = await getTableColumns(connection, 'SGN_ESC_SECAO');
  return columns.has('LOJA');
}

async function getSecaoLojaColumn(connection) {
  const columns = await getTableColumns(connection, 'SGN_ESC_SECAO');
  if (columns.has('CODFILIAL')) return 'CODFILIAL';
  if (columns.has('LOJA')) return 'LOJA';
  return null;
}

async function secaoTurnoSupportsSchedule(connection) {
  const columns = await getTableColumns(connection, 'SGN_ESC_SECAO_TURNO');
  return [
    'ESCSECAO_ID',
    'HR_ENT1',
    'HR_SAI1',
    'HR_ENT2',
    'HR_SAI2',
    'QTDE_COLABORADORES'
  ].every((column) => columns.has(column));
}

async function buildSecaoSelectList(connection, lojaCodigo) {
  const columns = await getTableColumns(connection, 'SGN_ESC_SECAO');
  const lojaColumn = await getSecaoLojaColumn(connection);
  return [
    'escsecao_id',
    lojaColumn ? `${lojaColumn.toLowerCase()} as loja` : `${Number(lojaCodigo)} as loja`,
    columns.has('CODFILIAL') ? 'codfilial' : `${Number(lojaCodigo)} as codfilial`,
    columns.has('CODCOLIGADA') ? 'codcoligada' : 'cast(null as number) as codcoligada',
    'cod_secao',
    'descr',
    columns.has('DT_HR_INCL') ? 'dt_hr_incl' : 'cast(null as date) as dt_hr_incl'
  ].join(', ');
}

async function getLojaCodcoligada(connection, lojaCodigo) {
  const lojaColumns = await getTableColumns(connection, 'SGN_ESC_LOJA');
  if (!lojaColumns.has('CODCOLIGADA')) return null;

  const lojaResult = await connection.execute(
    `select codcoligada
     from sgn_esc_loja
     where loja = :lojaId`,
    { lojaId: lojaCodigo },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const codcoligada = pick(lojaResult.rows[0], 'CODCOLIGADA', 'codcoligada');
  return codcoligada === null || codcoligada === undefined ? null : Number(codcoligada);
}

async function resolveCodcoligada(connection, lojaCodigo) {
  const lojaCodcoligada = await getLojaCodcoligada(connection, lojaCodigo);
  if (lojaCodcoligada !== null) return lojaCodcoligada;

  const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
  if (secaoColumns.has('CODCOLIGADA')) {
    const lojaColumn = await getSecaoLojaColumn(connection);
    const whereSql = lojaColumn ? `where ${lojaColumn.toLowerCase()} = :lojaId` : '';
    const result = await connection.execute(
      `select max(codcoligada) as codcoligada
       from sgn_esc_secao
       ${whereSql}`,
      lojaColumn ? { lojaId: lojaCodigo } : {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const codcoligada = pick(result.rows[0], 'CODCOLIGADA', 'codcoligada');
    if (codcoligada !== null && codcoligada !== undefined) return Number(codcoligada);
  }

  const funcionarioResult = await connection.execute(
    `select max(codcoligada) as codcoligada
     from sgn_esc_funcionario
     where loja = :lojaId`,
    { lojaId: lojaCodigo },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const funcionarioCodcoligada = pick(funcionarioResult.rows[0], 'CODCOLIGADA', 'codcoligada');
  if (funcionarioCodcoligada !== null && funcionarioCodcoligada !== undefined) {
    return Number(funcionarioCodcoligada);
  }

  return Number(process.env.ORACLE_CODCOLIGADA || process.env.DEFAULT_CODCOLIGADA || 1);
}

async function listLojas() {
  return withConnection(async (connection) => {
    const columns = await getTableColumns(connection, 'SGN_ESC_LOJA');
    const codcoligadaSelect = columns.has('CODCOLIGADA') ? 'codcoligada' : 'cast(null as number) as codcoligada';
    const result = await connection.execute(
      `select escloja_id, loja, qtde_brigadista_exigido, qtde_brigadista_exigido_dia, ${codcoligadaSelect}
       from sgn_esc_loja
       order by loja`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(normalizeLoja);
  });
}

async function resolveLojaCodigo(lojaId) {
  const lojas = await listLojas();
  const loja = lojas.find((item) => Number(item.LOJA) === Number(lojaId))
    || lojas.find((item) => Number(item.ESCLOJA_ID) === Number(lojaId));
  return loja ? Number(loja.LOJA) : Number(lojaId);
}

async function listFuncionariosByLoja(lojaId) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secaoLojaColumn = await getSecaoLojaColumn(connection);
    const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
    const funcaoColumns = await getTableColumns(connection, 'SGN_ESC_FUNCAO');
    const lojaCodcoligada = await getLojaCodcoligada(connection, lojaCodigo);
    const secaoJoinLoja = secaoLojaColumn ? `and s.${secaoLojaColumn.toLowerCase()} = f.loja` : '';
    const secaoJoinColigada = secaoColumns.has('CODCOLIGADA') ? 'and s.codcoligada = f.codcoligada' : '';
    const funcaoJoinColigada = funcaoColumns.has('CODCOLIGADA') ? 'and fu.codcoligada = f.codcoligada' : '';
    const funcionarioColigadaWhere = lojaCodcoligada !== null ? 'and f.codcoligada = :codcoligada' : '';
    const binds = { lojaId: lojaCodigo };
    if (lojaCodcoligada !== null) binds.codcoligada = lojaCodcoligada;
    const result = await connection.execute(
      `select
          f.escfunc_id,
          f.codcoligada,
          f.loja,
          f.chapa,
          f.nome,
          f.dt_admiss,
          f.brigadista,
          f.escsecao_id,
          s.descr as secao_descr,
          f.escfuncao_id,
          fu.descr as funcao_descr,
          f.hr_ent1,
          f.hr_sai1,
          f.hr_ent2,
          f.hr_sai2,
          f.dt_hr_incl
       from sgn_esc_funcionario f
       left join sgn_esc_secao s on s.escsecao_id = f.escsecao_id ${secaoJoinLoja} ${secaoJoinColigada}
       left join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
       where f.loja = :lojaId
         ${funcionarioColigadaWhere}
       order by f.nome`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(normalizeFuncionario);
  });
}

async function listSecoesByLoja(lojaId) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const lojaColumn = await getSecaoLojaColumn(connection);
    const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
    const lojaCodcoligada = await getLojaCodcoligada(connection, lojaCodigo);
    const secaoSelectList = await buildSecaoSelectList(connection, lojaCodigo);
    const conditions = [];
    const binds = {};

    if (lojaColumn) {
      conditions.push(`${lojaColumn.toLowerCase()} = :lojaId`);
      binds.lojaId = lojaCodigo;
    }
    if (secaoColumns.has('CODCOLIGADA') && lojaCodcoligada !== null) {
      conditions.push('codcoligada = :codcoligada');
      binds.codcoligada = lojaCodcoligada;
    }

    const whereSql = conditions.length ? `where ${conditions.join(' and ')}` : '';
    const secoesResult = await connection.execute(
      `select ${secaoSelectList}
       from sgn_esc_secao
       ${whereSql}
       order by descr`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return secoesResult.rows.map((row) => normalizeSecao(row, []));
  });
}

async function listTurnosByLoja(lojaId) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const canUseTurnos = await secaoTurnoSupportsSchedule(connection);
    if (!canUseTurnos) return [];

    const lojaColumn = await getSecaoLojaColumn(connection);
    const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
    const lojaCodcoligada = await getLojaCodcoligada(connection, lojaCodigo);
    const turnosColumns = await getTableColumns(connection, 'SGN_ESC_SECAO_TURNO');
    const turnoIdSelect = turnosColumns.has('ESCSECAOTURNO_ID')
      ? 't.escsecaoturno_id'
      : 'cast(null as number) as escsecaoturno_id';
    const conditions = [];
    const binds = { lojaId: lojaCodigo };

    if (lojaColumn) conditions.push(`s.${lojaColumn.toLowerCase()} = :lojaId`);
    if (secaoColumns.has('CODCOLIGADA') && lojaCodcoligada !== null) {
      conditions.push('s.codcoligada = :codcoligada');
      binds.codcoligada = lojaCodcoligada;
    }

    const whereSql = conditions.length ? `where ${conditions.join(' and ')}` : '';
    const result = await connection.execute(
      `select
          ${turnoIdSelect},
          t.escsecao_id,
          s.cod_secao,
          s.descr,
          ${lojaColumn ? `s.${lojaColumn.toLowerCase()}` : ':lojaId'} as loja,
          t.hr_ent1,
          t.hr_sai1,
          t.hr_ent2,
          t.hr_sai2,
          t.qtde_colaboradores
       from sgn_esc_secao_turno t
       join sgn_esc_secao s on s.escsecao_id = t.escsecao_id
       ${whereSql}
       order by s.descr, t.hr_ent1, t.hr_sai1`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(normalizeSecaoTurno);
  });
}

async function findSecaoById(connection, { lojaId, escsecaoId }) {
  const lojaColumn = await getSecaoLojaColumn(connection);
  const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
  const lojaCodcoligada = await getLojaCodcoligada(connection, lojaId);
  const secaoSelectList = await buildSecaoSelectList(connection, lojaId);
  const conditions = ['escsecao_id = :escsecaoId'];
  const binds = { escsecaoId };

  if (lojaColumn) {
    conditions.push(`${lojaColumn.toLowerCase()} = :lojaId`);
    binds.lojaId = lojaId;
  }
  if (secaoColumns.has('CODCOLIGADA') && lojaCodcoligada !== null) {
    conditions.push('codcoligada = :codcoligada');
    binds.codcoligada = lojaCodcoligada;
  }

  const result = await connection.execute(
    `select ${secaoSelectList}
     from sgn_esc_secao
     where ${conditions.join(' and ')}`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows[0] || null;
}

async function createSecao({ lojaId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const lojaColumn = await getSecaoLojaColumn(connection);
    const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
    const insertColumns = ['escsecao_id'];
    const insertValues = ['sgn_esc_secao_seq.nextval'];
    if (lojaColumn) {
      insertColumns.push(lojaColumn.toLowerCase());
      insertValues.push(':lojaId');
    }
    if (secaoColumns.has('CODCOLIGADA')) {
      insertColumns.push('codcoligada');
      insertValues.push(':codcoligada');
    }
    insertColumns.push('cod_secao', 'descr');
    insertValues.push(':codSecao', ':descr');
    if (secaoColumns.has('DT_HR_INCL')) {
      insertColumns.push('dt_hr_incl');
      insertValues.push('sysdate');
    }

    const insertSql = `insert into sgn_esc_secao (
           ${insertColumns.join(', ')}
         ) values (
           ${insertValues.join(', ')}
         )
         returning escsecao_id into :escsecaoId`;

    const insertBinds = {
        codSecao: data.COD_SECAO,
        descr: data.DESCR,
        escsecaoId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    if (lojaColumn) insertBinds.lojaId = lojaCodigo;
    if (secaoColumns.has('CODCOLIGADA')) {
      insertBinds.codcoligada = await resolveCodcoligada(connection, lojaCodigo);
    }

    const result = await connection.execute(
      insertSql,
      insertBinds,
      { autoCommit: false }
    );

    const escsecaoId = result.outBinds.escsecaoId[0];
    await connection.commit();

    const secoes = await listSecoesByLoja(lojaCodigo);
    return secoes.find((secao) => Number(secao.ESCSECAO_ID) === Number(escsecaoId)) || null;
  });
}

async function updateSecao({ lojaId, escsecaoId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secao = await findSecaoById(connection, { lojaId: lojaCodigo, escsecaoId });
    if (!secao) return null;

    const lojaColumn = await getSecaoLojaColumn(connection);
    const updateSql = lojaColumn
      ? `update sgn_esc_secao
         set cod_secao = :codSecao,
             descr = :descr
         where escsecao_id = :escsecaoId
           and ${lojaColumn.toLowerCase()} = :lojaId`
      : `update sgn_esc_secao
         set cod_secao = :codSecao,
             descr = :descr
         where escsecao_id = :escsecaoId`;

    const updateBinds = {
        escsecaoId,
        codSecao: data.COD_SECAO,
        descr: data.DESCR
    };
    if (lojaColumn) updateBinds.lojaId = lojaCodigo;

    await connection.execute(
      updateSql,
      updateBinds,
      { autoCommit: false }
    );

    await connection.commit();

    const secoes = await listSecoesByLoja(lojaCodigo);
    return secoes.find((item) => Number(item.ESCSECAO_ID) === Number(escsecaoId)) || null;
  });
}

async function upsertSecaoTurnoInConnection(connection, { escsecaoTurnoId, escsecaoId, data }) {
  const canUseTurnos = await secaoTurnoSupportsSchedule(connection);
  if (!canUseTurnos) return;
  const turnosColumns = await getTableColumns(connection, 'SGN_ESC_SECAO_TURNO');
  const hasDtHrIncl = turnosColumns.has('DT_HR_INCL');
  const hasId = turnosColumns.has('ESCSECAOTURNO_ID');

  if (escsecaoTurnoId && hasId) {
    await connection.execute(
      `update sgn_esc_secao_turno
       set escsecao_id = :escsecaoId,
           hr_ent1 = :hrEnt1,
           hr_sai1 = :hrSai1,
           hr_ent2 = :hrEnt2,
           hr_sai2 = :hrSai2,
           qtde_colaboradores = :qtdeColaboradores
       where escsecaoturno_id = :escsecaoTurnoId`,
      {
        escsecaoTurnoId,
        escsecaoId,
        hrEnt1: data.HR_ENT1,
        hrSai1: data.HR_SAI1,
        hrEnt2: data.HR_ENT2,
        hrSai2: data.HR_SAI2,
        qtdeColaboradores: data.QTDE_COLABORADORES
      },
      { autoCommit: false }
    );
    return;
  }

  await connection.execute(
    `insert into sgn_esc_secao_turno (
       escsecaoturno_id, escsecao_id, hr_ent1, hr_sai1, hr_ent2, hr_sai2, qtde_colaboradores${hasDtHrIncl ? ', dt_hr_incl' : ''}
     ) values (
       sgn_esc_secao_turno_seq.nextval, :escsecaoId, :hrEnt1, :hrSai1, :hrEnt2, :hrSai2, :qtdeColaboradores${hasDtHrIncl ? ', sysdate' : ''}
     )`,
    {
      escsecaoId,
      hrEnt1: data.HR_ENT1,
      hrSai1: data.HR_SAI1,
      hrEnt2: data.HR_ENT2,
      hrSai2: data.HR_SAI2,
      qtdeColaboradores: data.QTDE_COLABORADORES
    },
    { autoCommit: false }
  );
}

async function saveSecaoTurno({ lojaId, escsecaoTurnoId, escsecaoId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secao = await findSecaoById(connection, { lojaId: lojaCodigo, escsecaoId });
    if (!secao) return null;

    await upsertSecaoTurnoInConnection(connection, { escsecaoTurnoId, escsecaoId, data });
    await connection.commit();
    const turnos = await listTurnosByLoja(lojaCodigo);
    if (escsecaoTurnoId) {
      return turnos.find((turno) => Number(turno.ESCSECAOTURNO_ID) === Number(escsecaoTurnoId)) || null;
    }
    return turnos.findLast
      ? turnos.findLast((turno) => Number(turno.ESCSECAO_ID) === Number(escsecaoId)) || null
      : turnos.reverse().find((turno) => Number(turno.ESCSECAO_ID) === Number(escsecaoId)) || null;
  });
}

async function listAusenciasByLojaMes(lojaId, inicio, fim) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          a.escausen_id,
          a.escfunc_id,
          a.chapa,
          a.dt_inic,
          a.dt_fim,
          a.motivo,
          a.dt_hr_incl
       from sgn_esc_ausencia a
       join sgn_esc_funcionario f on f.escfunc_id = a.escfunc_id
       where f.loja = :lojaId
         and a.dt_inic <= to_date(:fim, 'YYYY-MM-DD')
         and nvl(a.dt_fim, a.dt_inic) >= to_date(:inicio, 'YYYY-MM-DD')
       order by a.dt_inic, a.chapa`,
      { lojaId: lojaCodigo, inicio, fim },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function updateFuncionarioEscala({ lojaId, escfuncId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  const allowedFields = ['BRIGADISTA', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'];
  const updates = Object.fromEntries(
    Object.entries(data || {}).filter(([field]) => allowedFields.includes(field))
  );

  if (Object.keys(updates).length === 0) {
    throw new Error('Nenhum campo permitido informado para atualizacao.');
  }

  return withConnection(async (connection) => {
    const assignments = Object.keys(updates).map((field) => `${field.toLowerCase()} = :${field}`).join(', ');
    const result = await connection.execute(
      `update sgn_esc_funcionario
       set ${assignments}
       where escfunc_id = :escfuncId
         and loja = :lojaId`,
      { ...updates, escfuncId, lojaId: lojaCodigo },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return null;

    const funcionarios = await listFuncionariosByLoja(lojaCodigo);
    return funcionarios.find((funcionario) => Number(funcionario.ESCFUNC_ID) === Number(escfuncId)) || null;
  });
}

module.exports = {
  listLojas,
  listFuncionariosByLoja,
  listSecoesByLoja,
  listTurnosByLoja,
  createSecao,
  updateSecao,
  listAusenciasByLojaMes,
  updateFuncionarioEscala,
  saveSecaoTurno,
  resolveLojaCodigo
};
