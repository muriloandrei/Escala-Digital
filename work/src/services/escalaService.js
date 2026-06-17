const { withConnection, oracledb } = require('../db/oracle');

async function listEscalas({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          p.escprog_id,
          p.mes_ref,
          p.revisao,
          p.oficializada,
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
       from sgn_esc_prog p
       left join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
       where p.loja = :lojaId
         and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       order by f.chapa, p.revisao desc`,
      { lojaId, mesRef },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function getEscalaHeader(escprogId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select escprog_id, mes_ref, escfunc_id, loja, chapa, revisao, oficializada
       from sgn_esc_prog
       where escprog_id = :escprogId`,
      { escprogId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows[0] || null;
  });
}

async function getEscalaDias(escprogId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
       from sgn_esc_prog_dia
       where escprog_id = :escprogId
       order by dt`,
      { escprogId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function saveEscala({ lojaId, mesRef, escalaOrigemId, funcionario, dias, oficializada = 0 }) {
  return withConnection(async (connection) => {
    const result = await insertEscalaOracle(connection, {
      lojaId,
      mesRef,
      funcionario,
      dias,
      oficializada
    });
    await connection.commit();
    return result;
  });
}

async function insertEscalaOracle(connection, { lojaId, mesRef, funcionario, dias, oficializada = 0 }) {
  const revisionResult = await connection.execute(
    `select nvl(max(revisao), 0) + 1 as revisao
     from sgn_esc_prog
     where loja = :lojaId
       and escfunc_id = :escfuncId
       and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')`,
    {
      lojaId,
      escfuncId: funcionario.escfuncId || funcionario.ESCFUNC_ID,
      mesRef
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const revisao = Number(revisionResult.rows[0]?.REVISAO || 1);
  const header = await connection.execute(
    `insert into sgn_esc_prog (
        escprog_id, mes_ref, escfunc_id, loja, chapa, revisao, oficializada, escsecao_id
     ) values (
        sgn_esc_prog_seq.nextval, to_date(:mesRef, 'YYYY-MM-DD'), :escfuncId, :lojaId, :chapa, :revisao, :oficializada, :escsecaoId
     )
     returning escprog_id into :escprogId`,
    {
      mesRef,
      escfuncId: funcionario.escfuncId || funcionario.ESCFUNC_ID,
      lojaId,
      chapa: funcionario.chapa || funcionario.CHAPA,
      revisao,
      oficializada,
      escsecaoId: funcionario.escsecaoId || funcionario.ESCSECAO_ID,
      escprogId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    },
    { autoCommit: false }
  );

  const escprogId = header.outBinds.escprogId[0];
  const binds = dias.map((dia) => ({
    escprogId,
    dt: dia.data,
    hrEnt1: dia.hrEnt1 || null,
    hrSai1: dia.hrSai1 || null,
    hrEnt2: dia.hrEnt2 || null,
    hrSai2: dia.hrSai2 || null,
    programacao: dia.programacao || null
  }));

  if (binds.length > 0) {
    await connection.executeMany(
      `insert into sgn_esc_prog_dia (
          escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
       ) values (
          sgn_esc_prog_dia_seq.nextval, :escprogId, to_date(:dt, 'YYYY-MM-DD'), :hrEnt1, :hrSai1, :hrEnt2, :hrSai2, :programacao
       )`,
      binds,
      { autoCommit: false }
    );
  }

  return { escprogId, revisao };
}

async function saveEscalasBatch({ lojaId, mesRef, escalaOrigemId, funcionarios, oficializada = 0 }) {
  return withConnection(async (connection) => {
    try {
      const saved = [];
      for (const funcionario of funcionarios) {
        saved.push(await insertEscalaOracle(connection, {
          lojaId,
          mesRef,
          funcionario,
          dias: funcionario.dias || [],
          oficializada
        }));
      }

      await connection.commit();
      return saved;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function validateAusencias({ lojaId, funcionarios }) {
  return withConnection(async (connection) => {
    const errors = [];

    for (const funcionario of funcionarios) {
      for (const dia of funcionario.dias || []) {
        const trabalha = String(dia.programacao || 'TRB').toUpperCase() !== 'F';
        if (!trabalha) continue;

        const result = await connection.execute(
          `select motivo
           from sgn_esc_ausencia
           where escfunc_id = :escfuncId
             and dt_inic <= to_date(:data, 'YYYY-MM-DD')
             and nvl(dt_fim, dt_inic) >= to_date(:data, 'YYYY-MM-DD')
             and rownum = 1`,
          { escfuncId: funcionario.escfuncId, data: dia.data },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows[0]) {
          errors.push(`Funcionario ${funcionario.chapa} possui ausencia em ${dia.data}: ${result.rows[0].MOTIVO || 'ausencia'}.`);
        }
      }
    }

    return errors;
  });
}

module.exports = {
  listEscalas,
  getEscalaHeader,
  getEscalaDias,
  saveEscala,
  saveEscalasBatch,
  validateAusencias
};
