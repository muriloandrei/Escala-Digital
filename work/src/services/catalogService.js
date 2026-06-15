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
       from sgn_esc_func f
       where f.loja = :lojaId
       order by f.nome`,
      { lojaId: lojaCodigo },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map(normalizeFuncionario);
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
       join sgn_esc_func f on f.escfunc_id = a.escfunc_id
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
      `update sgn_esc_func
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
  listAusenciasByLojaMes,
  updateFuncionarioEscala,
  resolveLojaCodigo
};
