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
    QTDE_BRIGADISTA_EXIGIDO_DIA: pick(row, 'QTDE_BRIGADISTA_EXIGIDO_DIA', 'qtde_brigadista_exigido_dia')
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
    ESCFUNCAO_ID: pick(row, 'ESCFUNCAO_ID', 'escfuncao_id'),
    HR_ENT1: pick(row, 'HR_ENT1', 'hr_ent1'),
    HR_SAI1: pick(row, 'HR_SAI1', 'hr_sai1'),
    HR_ENT2: pick(row, 'HR_ENT2', 'hr_ent2'),
    HR_SAI2: pick(row, 'HR_SAI2', 'hr_sai2'),
    DT_HR_INCL: pick(row, 'DT_HR_INCL', 'dt_hr_incl')
  };
}

function normalizeSecao(row, turnos = []) {
  return {
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    LOJA: pick(row, 'LOJA', 'loja'),
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

async function listLojas() {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select escloja_id, loja, qtde_brigadista_exigido, qtde_brigadista_exigido_dia
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
          f.escfuncao_id,
          f.hr_ent1,
          f.hr_sai1,
          f.hr_ent2,
          f.hr_sai2,
          f.dt_hr_incl
       from sgn_esc_funcionario f
       where f.loja = :lojaId
       order by f.nome`,
      { lojaId: lojaCodigo },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(normalizeFuncionario);
  });
}

async function listSecoesByLoja(lojaId) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secoesResult = await connection.execute(
      `select escsecao_id, loja, cod_secao, descr, dt_hr_incl
       from sgn_esc_secao
       where loja = :lojaId
       order by descr`,
      { lojaId: lojaCodigo },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    let turnos = [];
    try {
      const turnosResult = await connection.execute(
        `select escsecaoturno_id, escsecao_id, hr_ent1, hr_sai1, hr_ent2, hr_sai2, qtde_colaboradores
         from sgn_esc_secao_turno
         where escsecao_id in (
           select escsecao_id
           from sgn_esc_secao
           where loja = :lojaId
         )
         order by escsecao_id, hr_ent1`,
        { lojaId: lojaCodigo },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      turnos = turnosResult.rows.map(normalizeSecaoTurno);
    } catch (error) {
      if (!isMissingObjectError(error)) throw error;
    }

    const turnosBySecao = new Map();
    turnos.forEach((turno) => {
      const key = Number(turno.ESCSECAO_ID);
      if (!turnosBySecao.has(key)) turnosBySecao.set(key, []);
      turnosBySecao.get(key).push(turno);
    });

    return secoesResult.rows.map((row) => {
      const escsecaoId = Number(pick(row, 'ESCSECAO_ID', 'escsecao_id'));
      return normalizeSecao(row, turnosBySecao.get(escsecaoId) || []);
    });
  });
}

async function findSecaoById(connection, { lojaId, escsecaoId }) {
  const result = await connection.execute(
    `select escsecao_id, loja, cod_secao, descr, dt_hr_incl
     from sgn_esc_secao
     where escsecao_id = :escsecaoId
       and loja = :lojaId`,
    { lojaId, escsecaoId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return result.rows[0] || null;
}

async function createSecao({ lojaId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `insert into sgn_esc_secao (
          escsecao_id, loja, cod_secao, descr, dt_hr_incl
       ) values (
          sgn_esc_secao_seq.nextval, :lojaId, :codSecao, :descr, sysdate
       )
       returning escsecao_id into :escsecaoId`,
      {
        lojaId: lojaCodigo,
        codSecao: data.COD_SECAO,
        descr: data.DESCR,
        escsecaoId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );

    const escsecaoId = result.outBinds.escsecaoId[0];
    await upsertSecaoTurnoInConnection(connection, {
      escsecaoId,
      data
    });
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

    await connection.execute(
      `update sgn_esc_secao
       set cod_secao = :codSecao,
           descr = :descr
       where escsecao_id = :escsecaoId
         and loja = :lojaId`,
      {
        lojaId: lojaCodigo,
        escsecaoId,
        codSecao: data.COD_SECAO,
        descr: data.DESCR
      },
      { autoCommit: false }
    );

    await upsertSecaoTurnoInConnection(connection, { escsecaoId, data });
    await connection.commit();

    const secoes = await listSecoesByLoja(lojaCodigo);
    return secoes.find((item) => Number(item.ESCSECAO_ID) === Number(escsecaoId)) || null;
  });
}

async function upsertSecaoTurnoInConnection(connection, { escsecaoId, data }) {
  await connection.execute(
    `merge into sgn_esc_secao_turno t
     using (select :escsecaoId as escsecao_id from dual) src
     on (t.escsecao_id = src.escsecao_id)
     when matched then update set
       t.hr_ent1 = :hrEnt1,
       t.hr_sai1 = :hrSai1,
       t.hr_ent2 = :hrEnt2,
       t.hr_sai2 = :hrSai2,
       t.qtde_colaboradores = :qtdeColaboradores
     when not matched then insert (
       escsecaoturno_id, escsecao_id, hr_ent1, hr_sai1, hr_ent2, hr_sai2, qtde_colaboradores
     ) values (
       sgn_esc_secao_turno_seq.nextval, :escsecaoId, :hrEnt1, :hrSai1, :hrEnt2, :hrSai2, :qtdeColaboradores
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

async function upsertSecaoTurno({ lojaId, escsecaoId, data }) {
  const lojaCodigo = await resolveLojaCodigo(lojaId);
  return withConnection(async (connection) => {
    const secao = await findSecaoById(connection, { lojaId: lojaCodigo, escsecaoId });
    if (!secao) return null;

    await upsertSecaoTurnoInConnection(connection, { escsecaoId, data });
    await connection.commit();
    const secoes = await listSecoesByLoja(lojaCodigo);
    return secoes.find((secao) => Number(secao.ESCSECAO_ID) === Number(escsecaoId)) || null;
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
  createSecao,
  updateSecao,
  listAusenciasByLojaMes,
  updateFuncionarioEscala,
  upsertSecaoTurno,
  resolveLojaCodigo
};
