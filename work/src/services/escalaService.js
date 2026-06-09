const { withConnection, oracledb } = require('../db/oracle');
const { readData, writeData, nextId } = require('../db/mockStore');
const { getEnv } = require('../config/env');

async function listEscalas({ lojaId, mesRef }) {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_PROG
      .filter((escala) => Number(escala.LOJA) === Number(lojaId) && escala.MES_REF === mesRef)
      .map((escala) => {
        const funcionario = data.SGN_ESC_FUNC.find((item) => Number(item.ESCFUNC_ID) === Number(escala.ESCFUNC_ID));
        return {
          ...escala,
          NOME: funcionario?.NOME || null
        };
      })
      .sort((a, b) => a.CHAPA.localeCompare(b.CHAPA) || Number(b.REVISAO) - Number(a.REVISAO));
  }

  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          p.escprog_id,
          p.mes_ref,
          p.escfunc_id,
          p.loja,
          p.chapa,
          f.nome,
          p.revisao,
          p.oficializada
       from sgn_esc_prog p
       left join sgn_esc_func f on f.escfunc_id = p.escfunc_id
       where p.loja = :lojaId
         and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       order by p.chapa, p.revisao desc`,
      { lojaId, mesRef },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function getEscalaHeader(escprogId) {
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_PROG.find((escala) => Number(escala.ESCPROG_ID) === Number(escprogId)) || null;
  }

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
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    return data.SGN_ESC_PROG_DIA
      .filter((dia) => Number(dia.ESCPROG_ID) === Number(escprogId))
      .sort((a, b) => a.DT.localeCompare(b.DT));
  }

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
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    let revisao = 1;

    if (escalaOrigemId) {
      const existingHeaders = data.SGN_ESC_PROG.filter((escala) => {
        return Number(escala.APP_ESCALA_ID) === Number(escalaOrigemId)
          && Number(escala.ESCFUNC_ID) === Number(funcionario.escfuncId);
      });
      revisao = existingHeaders.reduce((max, escala) => Math.max(max, Number(escala.REVISAO || 1)), 0) + 1;
      const existingIds = new Set(existingHeaders.map((escala) => Number(escala.ESCPROG_ID)));
      data.SGN_ESC_PROG = data.SGN_ESC_PROG.filter((escala) => !existingIds.has(Number(escala.ESCPROG_ID)));
      data.SGN_ESC_PROG_DIA = data.SGN_ESC_PROG_DIA.filter((dia) => !existingIds.has(Number(dia.ESCPROG_ID)));
    }

    const escprogId = nextId(data.SGN_ESC_PROG, 'ESCPROG_ID');

    data.SGN_ESC_PROG.push({
      ESCPROG_ID: escprogId,
      APP_ESCALA_ID: escalaOrigemId || null,
      MES_REF: mesRef,
      ESCFUNC_ID: funcionario.escfuncId,
      LOJA: lojaId,
      CHAPA: funcionario.chapa,
      REVISAO: revisao,
      OFICIALIZADA: oficializada
    });

    let nextDiaId = nextId(data.SGN_ESC_PROG_DIA, 'ESCPROGDIA_ID');
    for (const dia of dias) {
      data.SGN_ESC_PROG_DIA.push({
        ESCPROGDIA_ID: nextDiaId,
        ESCPROG_ID: escprogId,
        DT: dia.data,
        HR_ENT1: dia.hrEnt1 || null,
        HR_SAI1: dia.hrSai1 || null,
        HR_ENT2: dia.hrEnt2 || null,
        HR_SAI2: dia.hrSai2 || null,
        PROGRAMACAO: dia.programacao || null
      });
      nextDiaId += 1;
    }

    await writeData(data);
    return { escprogId };
  }

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
      escfuncId: funcionario.escfuncId,
      mesRef
    },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const revisao = Number(revisionResult.rows[0]?.REVISAO || 1);
  const header = await connection.execute(
    `insert into sgn_esc_prog (
        escprog_id, mes_ref, escfunc_id, loja, chapa, revisao, oficializada
     ) values (
        sgn_esc_prog_seq.nextval, to_date(:mesRef, 'YYYY-MM-DD'), :escfuncId, :lojaId, :chapa, :revisao, :oficializada
     )
     returning escprog_id into :escprogId`,
    {
      mesRef,
      escfuncId: funcionario.escfuncId,
      lojaId,
      chapa: funcionario.chapa,
      revisao,
      oficializada,
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
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const saved = [];
    for (const funcionario of funcionarios) {
      saved.push(await saveEscala({
        lojaId,
        mesRef,
        escalaOrigemId,
        funcionario,
        dias: funcionario.dias,
        oficializada
      }));
    }
    return saved;
  }

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
  const env = getEnv();
  if (env.dbDriver === 'mock') {
    const data = await readData();
    const errors = [];

    for (const funcionario of funcionarios) {
      const ausencias = data.SGN_ESC_AUSENCIA.filter((ausencia) => {
        return Number(ausencia.ESCFUNC_ID) === Number(funcionario.escfuncId)
          || String(ausencia.CHAPA) === String(funcionario.chapa);
      });

      for (const dia of funcionario.dias || []) {
        const trabalha = String(dia.programacao || 'TRB').toUpperCase() !== 'F';
        if (!trabalha) continue;

        const conflito = ausencias.find((ausencia) => {
          const fimAusencia = ausencia.DT_FIM || ausencia.DT_INIC;
          return ausencia.DT_INIC <= dia.data && fimAusencia >= dia.data;
        });

        if (conflito) {
          errors.push(`Funcionario ${funcionario.chapa} possui ausencia em ${dia.data}: ${conflito.MOTIVO || 'ausencia'}.`);
        }
      }
    }

    return errors;
  }

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
