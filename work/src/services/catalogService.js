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
    CPF: pick(row, 'CPF', 'cpf', 'CPF_FUNCIONARIO', 'cpf_funcionario'),
    DT_ADMISS: pick(row, 'DT_ADMISS', 'dt_admiss'),
    BRIGADISTA: pick(row, 'BRIGADISTA', 'brigadista'),
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    SECAO_DESCR: pick(row, 'SECAO_DESCR', 'secao_descr'),
    ESCSUBSECAO_ID: pick(row, 'ESCSUBSECAO_ID', 'escsubsecao_id'),
    SUBSECAO_DESCR: pick(row, 'SUBSECAO_DESCR', 'subsecao_descr'),
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
    TURNOS: turnos,
    SUBSECOES: []
  };
}

function normalizeSubsecao(row) {
  return {
    ESCSUBSECAO_ID: pick(row, 'ESCSUBSECAO_ID', 'escsubsecao_id'),
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    DESCR: pick(row, 'DESCR', 'descr'),
    STATUS: pick(row, 'STATUS', 'status') || 'A',
    DT_HR_INCL: pick(row, 'DT_HR_INCL', 'dt_hr_incl')
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

function normalizeTipoDescanso(row) {
  return {
    ESCTIPODESC_ID: pick(row, 'ESCTIPODESC_ID', 'esctipodesc_id'),
    DESCR: pick(row, 'DESCR', 'descr'),
    SIGLA: pick(row, 'SIGLA', 'sigla'),
    CLASSIFICACAO: pick(row, 'CLASSIFICACAO', 'classificacao') || 'OUTROS',
    STATUS: pick(row, 'STATUS', 'status'),
    DT_HR_INCL: pick(row, 'DT_HR_INCL', 'dt_hr_incl')
  };
}

function normalizeHorarioPadrao(row) {
  return {
    ESCHORPAD_ID: pick(row, 'ESCHORPAD_ID', 'eschorpad_id'),
    DESCR: pick(row, 'DESCR', 'descr'),
    HR_ENT1: pick(row, 'HR_ENT1', 'hr_ent1'),
    HR_SAI1: pick(row, 'HR_SAI1', 'hr_sai1'),
    HR_ENT2: pick(row, 'HR_ENT2', 'hr_ent2'),
    HR_SAI2: pick(row, 'HR_SAI2', 'hr_sai2'),
    JORNADA_MINUTOS: pick(row, 'JORNADA_MINUTOS', 'jornada_minutos'),
    INTERVALO_MINUTOS: pick(row, 'INTERVALO_MINUTOS', 'intervalo_minutos'),
    STATUS: pick(row, 'STATUS', 'status'),
    DT_HR_INCL: pick(row, 'DT_HR_INCL', 'dt_hr_incl')
  };
}

function isMissingObjectError(error) {
  return error?.errorNum === 942 || error?.code === 'ORA-00942';
}

function isInvalidIdentifierError(error) {
  return error?.errorNum === 904 || error?.code === 'ORA-00904';
}

function normalizarTextoComparacao(texto = '') {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function isSecaoFrenteCaixa(secao = {}) {
  return normalizarTextoComparacao(secao.DESCR || secao.SECAO_DESCR || secao.descr).includes('frente de caixa');
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

function addSecoesPermitidasFilter(conditions, binds, fieldSql, secoesPermitidas) {
  if (!Array.isArray(secoesPermitidas)) return;
  const normalized = [...new Set(secoesPermitidas.map(Number).filter(Boolean))];
  if (normalized.length === 0) {
    conditions.push('1 = 0');
    return;
  }
  const placeholders = normalized.map((secaoId, index) => {
    const key = `secaoPermitida${index}`;
    binds[key] = secaoId;
    return `:${key}`;
  });
  conditions.push(`${fieldSql} in (${placeholders.join(', ')})`);
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

async function getLatestRevision(connection, { lojaId, mesRef }) {
  const progColumns = await getTableColumns(connection, 'SGN_ESC_PROG');
  const ativaSql = progColumns.has('ATIVA') ? 'and nvl(ativa, 1) = 1' : '';
  const result = await connection.execute(
    `select max(revisao) as revisao
     from sgn_esc_prog
     where loja = :lojaId
       and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       ${ativaSql}`,
    { lojaId, mesRef },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const value = pick(result.rows[0], 'REVISAO', 'revisao');
  return value === null || value === undefined ? null : Number(value);
}

async function listFuncionariosByLoja(lojaId, options = {}) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secaoLojaColumn = await getSecaoLojaColumn(connection);
    const funcionarioColumns = await getTableColumns(connection, 'SGN_ESC_FUNCIONARIO');
    const secaoColumns = await getTableColumns(connection, 'SGN_ESC_SECAO');
    const funcaoColumns = await getTableColumns(connection, 'SGN_ESC_FUNCAO');
    const subsecaoColumns = await getTableColumns(connection, 'SGN_ESC_SUBSECAO');
    const lojaCodcoligada = await getLojaCodcoligada(connection, lojaCodigo);
    const secaoJoinLoja = secaoLojaColumn ? `and s.${secaoLojaColumn.toLowerCase()} = f.loja` : '';
    const secaoJoinColigada = secaoColumns.has('CODCOLIGADA') ? 'and s.codcoligada = f.codcoligada' : '';
    const funcaoJoinColigada = funcaoColumns.has('CODCOLIGADA') ? 'and fu.codcoligada = f.codcoligada' : '';
    const funcionarioColigadaWhere = lojaCodcoligada !== null ? 'and f.codcoligada = :codcoligada' : '';
    const progColumns = options.mesRef ? await getTableColumns(connection, 'SGN_ESC_PROG') : new Set();
    const escalaAtivaSql = progColumns.has('ATIVA') ? 'and nvl(p.ativa, 1) = 1' : '';
    const escalaAtivaInnerSql = progColumns.has('ATIVA') ? 'and nvl(px.ativa, 1) = 1' : '';
    const cpfSelect = funcionarioColumns.has('CPF')
      ? 'f.cpf'
      : funcionarioColumns.has('CPF_FUNCIONARIO')
        ? 'f.cpf_funcionario as cpf'
        : 'cast(null as varchar2(20)) as cpf';
    const hasFuncionarioSubsecao = funcionarioColumns.has('ESCSUBSECAO_ID');
    const hasSubsecaoTable = subsecaoColumns.has('ESCSUBSECAO_ID') && subsecaoColumns.has('ESCSECAO_ID');
    const subsecaoSelect = hasFuncionarioSubsecao ? 'f.escsubsecao_id' : 'cast(null as number) as escsubsecao_id';
    const subsecaoDescrSelect = hasFuncionarioSubsecao && hasSubsecaoTable ? 'sub.descr as subsecao_descr' : 'cast(null as varchar2(100)) as subsecao_descr';
    const subsecaoJoinSql = hasFuncionarioSubsecao && hasSubsecaoTable
      ? 'left join sgn_esc_subsecao sub on sub.escsubsecao_id = f.escsubsecao_id and sub.escsecao_id = f.escsecao_id'
      : '';
    const binds = { lojaId: lojaCodigo };
    const funcionarioFilters = [];
    if (lojaCodcoligada !== null) binds.codcoligada = lojaCodcoligada;
    addSecoesPermitidasFilter(funcionarioFilters, binds, 'f.escsecao_id', options.secoesPermitidas);
    const funcionarioSecaoWhere = funcionarioFilters.length ? `and ${funcionarioFilters.join(' and ')}` : '';
    const baseSql = `select
          f.escfunc_id,
          f.codcoligada,
          f.loja,
          f.chapa,
          f.nome,
          ${cpfSelect},
          f.dt_admiss,
          f.brigadista,
          f.escsecao_id,
          s.descr as secao_descr,
          ${subsecaoSelect},
          ${subsecaoDescrSelect},
          f.escfuncao_id,
          fu.descr as funcao_descr,
          ${options.mesRef ? 'coalesce(e.hr_ent1, f.hr_ent1)' : 'f.hr_ent1'} as hr_ent1,
          ${options.mesRef ? 'coalesce(e.hr_sai1, f.hr_sai1)' : 'f.hr_sai1'} as hr_sai1,
          ${options.mesRef ? 'coalesce(e.hr_ent2, f.hr_ent2)' : 'f.hr_ent2'} as hr_ent2,
          ${options.mesRef ? 'coalesce(e.hr_sai2, f.hr_sai2)' : 'f.hr_sai2'} as hr_sai2,
          ${options.mesRef ? 'e.programacao as escala_programacao, e.revisao as escala_revisao, e.oficializada as escala_oficializada' : "cast(null as varchar2(3)) as escala_programacao, cast(null as number) as escala_revisao, cast(null as number) as escala_oficializada"},
          f.dt_hr_incl
       from sgn_esc_funcionario f
       left join sgn_esc_secao s on s.escsecao_id = f.escsecao_id ${secaoJoinLoja} ${secaoJoinColigada}
       left join sgn_esc_funcao fu on fu.escfuncao_id = f.escfuncao_id ${funcaoJoinColigada}
       ${subsecaoJoinSql}
       ${options.mesRef ? `left join (
          select p.escfunc_id,
                 p.revisao,
                 p.oficializada,
                 max(d.hr_ent1) keep (dense_rank first order by case when nvl(d.programacao, 'TRB') = 'TRB' then 0 else 1 end, d.dt) as hr_ent1,
                 max(d.hr_sai1) keep (dense_rank first order by case when nvl(d.programacao, 'TRB') = 'TRB' then 0 else 1 end, d.dt) as hr_sai1,
                 max(d.hr_ent2) keep (dense_rank first order by case when nvl(d.programacao, 'TRB') = 'TRB' then 0 else 1 end, d.dt) as hr_ent2,
                 max(d.hr_sai2) keep (dense_rank first order by case when nvl(d.programacao, 'TRB') = 'TRB' then 0 else 1 end, d.dt) as hr_sai2,
                 max(d.programacao) keep (dense_rank first order by case when nvl(d.programacao, 'TRB') = 'TRB' then 0 else 1 end, d.dt) as programacao
          from sgn_esc_prog p
          join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
          where p.loja = :lojaId
            and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
            ${escalaAtivaSql}
            and p.revisao = (
              select max(px.revisao)
              from sgn_esc_prog px
              where px.loja = p.loja
                and px.mes_ref = p.mes_ref
                and px.escfunc_id = p.escfunc_id
                ${escalaAtivaInnerSql}
            )
          group by p.escfunc_id, p.revisao, p.oficializada
       ) e on e.escfunc_id = f.escfunc_id` : ''}
       where f.loja = :lojaId
         ${funcionarioColigadaWhere}
         ${funcionarioSecaoWhere}
       order by f.nome`;

    if (options.mesRef) {
      binds.mesRef = options.mesRef;
    }

    const result = await connection.execute(
      baseSql,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((row) => ({
      ...normalizeFuncionario(row),
      ESCALA_PROGRAMACAO: pick(row, 'ESCALA_PROGRAMACAO', 'escala_programacao'),
      ESCALA_REVISAO: pick(row, 'ESCALA_REVISAO', 'escala_revisao'),
      ESCALA_OFICIALIZADA: pick(row, 'ESCALA_OFICIALIZADA', 'escala_oficializada')
    }));
  });
}

async function listFuncionariosByLojas(lojas, options = {}) {
  const result = [];
  for (const loja of [...new Set((lojas || []).map(Number).filter(Boolean))]) {
    const funcionarios = await listFuncionariosByLoja(loja, options);
    result.push(...funcionarios);
  }
  return result;
}

async function listSecoesByLoja(lojaId, options = {}) {
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
    addSecoesPermitidasFilter(conditions, binds, 'escsecao_id', options.secoesPermitidas);

    const whereSql = conditions.length ? `where ${conditions.join(' and ')}` : '';
    const secoesResult = await connection.execute(
      `select ${secaoSelectList}
       from sgn_esc_secao
       ${whereSql}
       order by descr`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const secoes = secoesResult.rows.map((row) => normalizeSecao(row, []));
    const subsecoesMap = await listSubsecoesBySecaoIdsInConnection(connection, secoes.map((secao) => secao.ESCSECAO_ID));
    return secoes.map((secao) => ({
      ...secao,
      SUBSECOES: subsecoesMap.get(String(secao.ESCSECAO_ID)) || []
    }));
  });
}

async function listSecoesByLojas(lojas, options = {}) {
  const result = [];
  const seen = new Set();
  for (const loja of [...new Set((lojas || []).map(Number).filter(Boolean))]) {
    const secoes = await listSecoesByLoja(loja, options);
    secoes.forEach((secao) => {
      const key = `${secao.ESCSECAO_ID}|${secao.CODFILIAL || secao.LOJA || loja}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ ...secao, CODFILIAL: secao.CODFILIAL || loja, LOJA: secao.LOJA || loja });
    });
  }
  return result;
}

async function listTurnosByLoja(lojaId, options = {}) {
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
    addSecoesPermitidasFilter(conditions, binds, 's.escsecao_id', options.secoesPermitidas);

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

async function listTurnosByLojas(lojas, options = {}) {
  const result = [];
  const seen = new Set();
  for (const loja of [...new Set((lojas || []).map(Number).filter(Boolean))]) {
    const turnos = await listTurnosByLoja(loja, options);
    turnos.forEach((turno) => {
      const key = `${turno.ESCSECAOTURNO_ID || `${turno.ESCSECAO_ID}|${turno.HR_ENT1}|${turno.HR_SAI1}|${turno.HR_ENT2}|${turno.HR_SAI2}`}|${turno.LOJA || loja}`;
      if (seen.has(key)) return;
      seen.add(key);
      result.push({ ...turno, LOJA: turno.LOJA || loja });
    });
  }
  return result;
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

async function listSubsecoesBySecaoIdsInConnection(connection, escsecaoIds = [], { includeInactive = false } = {}) {
  const ids = [...new Set((escsecaoIds || []).map(Number).filter(Boolean))];
  if (!ids.length) return new Map();
  const columns = await getTableColumns(connection, 'SGN_ESC_SUBSECAO');
  if (!columns.has('ESCSUBSECAO_ID') || !columns.has('ESCSECAO_ID')) return new Map();

  const binds = {};
  const placeholders = ids.map((id, index) => {
    const key = `subsecaoSecao${index}`;
    binds[key] = id;
    return `:${key}`;
  });
  const statusSql = includeInactive || !columns.has('STATUS') ? '' : "and nvl(status, 'A') = 'A'";
  const statusSelect = columns.has('STATUS') ? 'status' : "'A' as status";
  const dtHrInclSelect = columns.has('DT_HR_INCL') ? 'dt_hr_incl' : 'cast(null as date) as dt_hr_incl';
  const result = await connection.execute(
    `select escsubsecao_id, escsecao_id, descr, ${statusSelect}, ${dtHrInclSelect}
     from sgn_esc_subsecao
     where escsecao_id in (${placeholders.join(', ')})
       ${statusSql}
     order by escsecao_id, descr`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const map = new Map();
  result.rows.map(normalizeSubsecao).forEach((subsecao) => {
    const key = String(subsecao.ESCSECAO_ID);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(subsecao);
  });
  return map;
}

async function listSubsecoesBySecao({ lojaId, escsecaoId, includeInactive = false }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secao = await findSecaoById(connection, { lojaId: lojaCodigo, escsecaoId });
    if (!secao) return null;
    const subsecoesMap = await listSubsecoesBySecaoIdsInConnection(connection, [escsecaoId], { includeInactive });
    return subsecoesMap.get(String(escsecaoId)) || [];
  });
}

async function assertSubsecaoFrenteCaixa(connection, lojaCodigo, escsecaoId) {
  const secao = await findSecaoById(connection, { lojaId: lojaCodigo, escsecaoId });
  if (!secao) return null;
  if (!isSecaoFrenteCaixa(normalizeSecao(secao))) {
    const error = new Error('Subsecoes estao liberadas apenas para Frente de Caixa.');
    error.statusCode = 422;
    throw error;
  }
  return secao;
}

async function createSubsecao({ lojaId, escsecaoId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const columns = await getTableColumns(connection, 'SGN_ESC_SUBSECAO');
    if (!columns.has('ESCSUBSECAO_ID') || !columns.has('ESCSECAO_ID')) {
      const error = new Error('Tabela SGN_ESC_SUBSECAO nao encontrada. Rode a migracao de subsecoes.');
      error.statusCode = 500;
      throw error;
    }
    const secao = await assertSubsecaoFrenteCaixa(connection, lojaCodigo, escsecaoId);
    if (!secao) return null;

    const result = await connection.execute(
      `insert into sgn_esc_subsecao (
         escsubsecao_id, escsecao_id, descr, status, dt_hr_incl
       ) values (
         sgn_esc_subsecao_seq.nextval, :escsecaoId, :descr, 'A', sysdate
       )
       returning escsubsecao_id into :id`,
      {
        escsecaoId,
        descr: data.DESCR,
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );
    await connection.commit();
    const subsecoesMap = await listSubsecoesBySecaoIdsInConnection(connection, [escsecaoId], { includeInactive: true });
    return (subsecoesMap.get(String(escsecaoId)) || []).find((item) => Number(item.ESCSUBSECAO_ID) === Number(result.outBinds.id[0])) || null;
  });
}

async function updateSubsecao({ lojaId, escsecaoId, escsubsecaoId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    await assertSubsecaoFrenteCaixa(connection, lojaCodigo, escsecaoId);
    const fields = [];
    const binds = { escsecaoId, escsubsecaoId };
    if (data.DESCR !== undefined) {
      fields.push('descr = :descr');
      binds.descr = data.DESCR;
    }
    if (data.STATUS !== undefined) {
      fields.push('status = :status');
      binds.status = data.STATUS;
    }
    if (!fields.length) return null;

    const result = await connection.execute(
      `update sgn_esc_subsecao
       set ${fields.join(', ')}
       where escsubsecao_id = :escsubsecaoId
         and escsecao_id = :escsecaoId`,
      binds,
      { autoCommit: true }
    );
    if (!result.rowsAffected) return null;
    const subsecoesMap = await listSubsecoesBySecaoIdsInConnection(connection, [escsecaoId], { includeInactive: true });
    return (subsecoesMap.get(String(escsecaoId)) || []).find((item) => Number(item.ESCSUBSECAO_ID) === Number(escsubsecaoId)) || null;
  });
}

async function deleteSubsecao({ lojaId, escsecaoId, escsubsecaoId }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    await assertSubsecaoFrenteCaixa(connection, lojaCodigo, escsecaoId);
    const subsecoesMap = await listSubsecoesBySecaoIdsInConnection(connection, [escsecaoId], { includeInactive: true });
    const subsecao = (subsecoesMap.get(String(escsecaoId)) || []).find((item) => Number(item.ESCSUBSECAO_ID) === Number(escsubsecaoId));
    if (!subsecao) return null;

    const funcionarioColumns = await getTableColumns(connection, 'SGN_ESC_FUNCIONARIO');
    if (funcionarioColumns.has('ESCSUBSECAO_ID')) {
      await connection.execute(
        `update sgn_esc_funcionario
         set escsubsecao_id = null
         where loja = :lojaId
           and escsecao_id = :escsecaoId
           and escsubsecao_id = :escsubsecaoId`,
        { lojaId: lojaCodigo, escsecaoId, escsubsecaoId },
        { autoCommit: false }
      );
    }

    const result = await connection.execute(
      `delete from sgn_esc_subsecao
       where escsubsecao_id = :escsubsecaoId
         and escsecao_id = :escsecaoId`,
      { escsubsecaoId, escsecaoId },
      { autoCommit: false }
    );
    if (!result.rowsAffected) {
      await connection.rollback();
      return null;
    }
    await connection.commit();
    return subsecao;
  });
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

async function listTiposDescanso({ includeInactive = false } = {}) {
  return withConnection(async (connection) => {
    try {
      const columns = await getTableColumns(connection, 'SGN_ESC_TIPO_DESCANSO');
      const classificacaoSelect = columns.has('CLASSIFICACAO') ? 'classificacao' : "'OUTROS' as classificacao";
      const whereSql = includeInactive ? "" : "where status = 'A'";
      const result = await connection.execute(
        `select esctipodesc_id, descr, sigla, ${classificacaoSelect}, status, dt_hr_incl
         from sgn_esc_tipo_descanso
         ${whereSql}
         order by descr`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows.map(normalizeTipoDescanso);
    } catch (error) {
      if (isMissingObjectError(error)) return [];
      throw error;
    }
  });
}

async function listHorariosPadrao({ includeInactive = false } = {}) {
  return withConnection(async (connection) => {
    try {
      const whereSql = includeInactive ? '' : "where status = 'A'";
      const result = await connection.execute(
        `select eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2, jornada_minutos, intervalo_minutos, status, dt_hr_incl
         from sgn_esc_horario_padrao
         ${whereSql}
         order by status, descr`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows.map(normalizeHorarioPadrao);
    } catch (error) {
      if (isMissingObjectError(error)) return [];
      throw error;
    }
  });
}

async function createHorarioPadrao(data) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `insert into sgn_esc_horario_padrao (
         eschorpad_id, descr, hr_ent1, hr_sai1, hr_ent2, hr_sai2, jornada_minutos, intervalo_minutos, status, dt_hr_incl
       ) values (
         sgn_esc_horario_padrao_seq.nextval, :descr, :hrEnt1, :hrSai1, :hrEnt2, :hrSai2, :jornadaMinutos, :intervaloMinutos, :status, sysdate
       )
       returning eschorpad_id into :id`,
      {
        descr: data.DESCR,
        hrEnt1: data.HR_ENT1,
        hrSai1: data.HR_SAI1,
        hrEnt2: data.HR_ENT2,
        hrSai2: data.HR_SAI2,
        jornadaMinutos: data.JORNADA_MINUTOS || 528,
        intervaloMinutos: data.INTERVALO_MINUTOS || 70,
        status: data.STATUS || 'A',
        id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );
    return { ESCHORPAD_ID: result.outBinds.id[0], ...data, STATUS: data.STATUS || 'A' };
  });
}

async function updateHorarioPadrao(id, data) {
  return withConnection(async (connection) => {
    const allowed = ['DESCR', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2', 'JORNADA_MINUTOS', 'INTERVALO_MINUTOS', 'STATUS'];
    const updates = Object.fromEntries(Object.entries(data || {}).filter(([field]) => allowed.includes(field)));
    if (!Object.keys(updates).length) return null;
    const assignments = Object.keys(updates).map((field) => `${field.toLowerCase()} = :${field}`).join(', ');
    const result = await connection.execute(
      `update sgn_esc_horario_padrao set ${assignments} where eschorpad_id = :id`,
      { ...updates, id },
      { autoCommit: true }
    );
    if (!result.rowsAffected) return null;
    const horarios = await listHorariosPadrao({ includeInactive: true });
    return horarios.find((horario) => Number(horario.ESCHORPAD_ID) === Number(id)) || null;
  });
}

async function createTipoDescanso(data) {
  return withConnection(async (connection) => {
    const columns = await getTableColumns(connection, 'SGN_ESC_TIPO_DESCANSO');
    const insertColumns = ['esctipodesc_id', 'descr', 'sigla', 'status', 'dt_hr_incl'];
    const insertValues = ['sgn_esc_tipo_descanso_seq.nextval', ':descr', ':sigla', ':status', 'sysdate'];
    const binds = {
      descr: data.DESCR,
      sigla: String(data.SIGLA || '').toUpperCase(),
      status: data.STATUS || 'A',
      id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    };
    if (columns.has('CLASSIFICACAO')) {
      insertColumns.splice(3, 0, 'classificacao');
      insertValues.splice(3, 0, ':classificacao');
      binds.classificacao = data.CLASSIFICACAO || 'OUTROS';
    }
    const result = await connection.execute(
      `insert into sgn_esc_tipo_descanso (${insertColumns.join(', ')})
       values (${insertValues.join(', ')})
       returning esctipodesc_id into :id`,
      binds,
      { autoCommit: true }
    );
    return { ESCTIPODESC_ID: result.outBinds.id[0], DESCR: data.DESCR, SIGLA: String(data.SIGLA || '').toUpperCase(), CLASSIFICACAO: data.CLASSIFICACAO || 'OUTROS', STATUS: data.STATUS || 'A' };
  });
}

async function updateTipoDescanso(id, data) {
  return withConnection(async (connection) => {
    const fields = [];
    const binds = { id };
    if (data.DESCR !== undefined) { fields.push("descr = :descr"); binds.descr = data.DESCR; }
    const columns = await getTableColumns(connection, 'SGN_ESC_TIPO_DESCANSO');
    if (data.SIGLA !== undefined) { fields.push("sigla = :sigla"); binds.sigla = String(data.SIGLA || "").toUpperCase(); }
    if (data.CLASSIFICACAO !== undefined && columns.has('CLASSIFICACAO')) { fields.push("classificacao = :classificacao"); binds.classificacao = data.CLASSIFICACAO || 'OUTROS'; }
    if (data.STATUS !== undefined) { fields.push("status = :status"); binds.status = data.STATUS; }
    if (!fields.length) return null;

    const result = await connection.execute(
      `update sgn_esc_tipo_descanso set ${fields.join(", ")} where esctipodesc_id = :id`,
      binds,
      { autoCommit: true }
    );
    if (!result.rowsAffected) return null;
    const tipos = await listTiposDescanso({ includeInactive: true });
    return tipos.find((tipo) => Number(tipo.ESCTIPODESC_ID) === Number(id)) || null;
  });
}

async function updateFuncionarioEscala({ lojaId, escfuncId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  const allowedFields = ['BRIGADISTA', 'ESCSECAO_ID', 'ESCSUBSECAO_ID', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'];
  const updates = Object.fromEntries(
    Object.entries(data || {}).filter(([field]) => allowedFields.includes(field))
  );

  if (Object.keys(updates).length === 0) {
    throw new Error('Nenhum campo permitido informado para atualizacao.');
  }

  return withConnection(async (connection) => {
    const funcionarioColumns = await getTableColumns(connection, 'SGN_ESC_FUNCIONARIO');
    let secaoAtualId = null;
    if (updates.ESCSUBSECAO_ID !== undefined) {
      if (!funcionarioColumns.has('ESCSUBSECAO_ID')) {
        const error = new Error('Vinculo de funcionario com subsecao nao encontrado. Rode a migracao de subsecoes de funcionarios.');
        error.statusCode = 422;
        throw error;
      }

      const funcionarioResult = await connection.execute(
        `select escsecao_id
         from sgn_esc_funcionario
         where escfunc_id = :escfuncId
           and loja = :lojaId`,
        { escfuncId, lojaId: lojaCodigo },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      secaoAtualId = pick(funcionarioResult.rows[0], 'ESCSECAO_ID', 'escsecao_id');
      if (!secaoAtualId) return null;
    }

    if (updates.ESCSECAO_ID !== undefined) {
      const secao = await findSecaoById(connection, { lojaId: lojaCodigo, escsecaoId: Number(updates.ESCSECAO_ID) });
      if (!secao) {
        const error = new Error('Secao informada nao encontrada para a loja.');
        error.statusCode = 422;
        throw error;
      }
      updates.ESCSECAO_ID = Number(updates.ESCSECAO_ID);
      if (funcionarioColumns.has('ESCSUBSECAO_ID') && updates.ESCSUBSECAO_ID === undefined) {
        updates.ESCSUBSECAO_ID = null;
      }
    }

    if (updates.ESCSUBSECAO_ID !== undefined && updates.ESCSUBSECAO_ID !== null) {
      const secaoDestinoId = Number(updates.ESCSECAO_ID || secaoAtualId);
      const subsecoesMap = await listSubsecoesBySecaoIdsInConnection(connection, [secaoDestinoId], { includeInactive: true });
      const subsecao = (subsecoesMap.get(String(secaoDestinoId)) || []).find((item) => Number(item.ESCSUBSECAO_ID) === Number(updates.ESCSUBSECAO_ID));
      if (!subsecao) {
        const error = new Error('Subsecao informada nao encontrada para a secao do funcionario.');
        error.statusCode = 422;
        throw error;
      }
      updates.ESCSUBSECAO_ID = Number(updates.ESCSUBSECAO_ID);
    }
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
  listFuncionariosByLojas,
  listSecoesByLoja,
  listSecoesByLojas,
  listTurnosByLoja,
  listTurnosByLojas,
  createSecao,
  updateSecao,
  listSubsecoesBySecao,
  createSubsecao,
  updateSubsecao,
  deleteSubsecao,
  listAusenciasByLojaMes,
  listTiposDescanso,
  listHorariosPadrao,
  createTipoDescanso,
  createHorarioPadrao,
  updateTipoDescanso,
  updateHorarioPadrao,
  updateFuncionarioEscala,
  saveSecaoTurno,
  resolveLojaCodigo
};
