const { withConnection, oracledb } = require('../db/oracle');
const { readData, writeData } = require('../db/mockStore');
const { getEnv } = require('../config/env');

async function listLojas() {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return [...data.SGN_ESC_LOJA].sort((a, b) => Number(a.LOJA) - Number(b.LOJA));
  }

  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select escloja_id, loja, qtde_brigadista_exigido, qtde_brigadista_exigido_dia
       from sgn_esc_loja
       order by loja`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function listFuncionariosByLoja(lojaId) {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_FUNC
      .filter((funcionario) => Number(funcionario.LOJA) === Number(lojaId))
      .sort((a, b) => a.NOME.localeCompare(b.NOME));
  }

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
      { lojaId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function listAusenciasByLojaMes(lojaId, inicio, fim) {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    const funcionariosDaLoja = new Set(
      data.SGN_ESC_FUNC
        .filter((funcionario) => Number(funcionario.LOJA) === Number(lojaId))
        .map((funcionario) => Number(funcionario.ESCFUNC_ID))
    );

    return data.SGN_ESC_AUSENCIA
      .filter((ausencia) => {
        const fimAusencia = ausencia.DT_FIM || ausencia.DT_INIC;
        return funcionariosDaLoja.has(Number(ausencia.ESCFUNC_ID))
          && ausencia.DT_INIC <= fim
          && fimAusencia >= inicio;
      })
      .sort((a, b) => a.DT_INIC.localeCompare(b.DT_INIC) || a.CHAPA.localeCompare(b.CHAPA));
  }

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
      { lojaId, inicio, fim },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function updateFuncionarioEscala({ lojaId, escfuncId, data }) {
  const allowedFields = ['BRIGADISTA', 'HR_ENT1', 'HR_SAI1', 'HR_ENT2', 'HR_SAI2'];
  const updates = Object.fromEntries(
    Object.entries(data || {}).filter(([field]) => allowedFields.includes(field))
  );

  if (Object.keys(updates).length === 0) {
    throw new Error('Nenhum campo permitido informado para atualizacao.');
  }

  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const mockData = await readData();
    const funcionario = mockData.SGN_ESC_FUNC.find((item) => {
      return Number(item.ESCFUNC_ID) === Number(escfuncId)
        && Number(item.LOJA) === Number(lojaId);
    });

    if (!funcionario) return null;

    Object.assign(funcionario, updates);
    await writeData(mockData);
    return funcionario;
  }

  return withConnection(async (connection) => {
    const assignments = Object.keys(updates).map((field) => `${field.toLowerCase()} = :${field}`).join(', ');
    const result = await connection.execute(
      `update sgn_esc_func
       set ${assignments}
       where escfunc_id = :escfuncId
         and loja = :lojaId`,
      { ...updates, escfuncId, lojaId },
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) return null;

    const funcionarios = await listFuncionariosByLoja(lojaId);
    return funcionarios.find((funcionario) => Number(funcionario.ESCFUNC_ID) === Number(escfuncId)) || null;
  });
}

module.exports = {
  listLojas,
  listFuncionariosByLoja,
  listAusenciasByLojaMes,
  updateFuncionarioEscala
};
