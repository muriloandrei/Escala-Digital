const { withConnection, oracledb } = require('../db/oracle');

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function formatDateValue(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return year + '-' + month + '-' + day;
  }
  return String(value || '').slice(0, 10);
}

async function getFuncionarioEscala(connection, escfuncId) {
  const result = await connection.execute(
    `select escfunc_id, loja, chapa, escsecao_id, escfuncao_id
     from sgn_esc_funcionario
     where escfunc_id = :escfuncId`,
    { escfuncId },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    ESCFUNC_ID: pick(row, 'ESCFUNC_ID', 'escfunc_id'),
    LOJA: pick(row, 'LOJA', 'loja'),
    CHAPA: pick(row, 'CHAPA', 'chapa'),
    ESCSECAO_ID: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
    ESCFUNCAO_ID: pick(row, 'ESCFUNCAO_ID', 'escfuncao_id')
  };
}

function normalizeHorario(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeDiaBind(escprogId, dia) {
  const programacao = String(dia.programacao || '').trim().toUpperCase() || 'TRB';
  const folga = programacao === 'F';
  const fallback = folga ? 'F' : '00:00';

  return {
    escprogId,
    dt: dia.data,
    hrEnt1: normalizeHorario(dia.hrEnt1, fallback),
    hrSai1: normalizeHorario(dia.hrSai1, fallback),
    hrEnt2: normalizeHorario(dia.hrEnt2, fallback),
    hrSai2: normalizeHorario(dia.hrSai2, fallback),
    programacao
  };
}

function getMesStatus(mesRef, revisao = 1) {
  const ref = new Date(`${formatDateValue(mesRef)}T00:00:00`);
  const hoje = new Date();
  const fimMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0, 23, 59, 59, 999);
  if (hoje > fimMes) return 'FINALIZADA';
  return Number(revisao) > 1 ? 'MODIFICADA' : 'ATIVA';
}

function isMesFinalizado(mesRef) {
  return getMesStatus(mesRef, 1) === 'FINALIZADA';
}

async function getLatestRevision(connection, { lojaId, mesRef }) {
  const result = await connection.execute(
    `select nvl(max(revisao), 0) as revisao
     from sgn_esc_prog
     where loja = :lojaId
       and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')`,
    { lojaId, mesRef },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  return Number(pick(result.rows[0], 'REVISAO', 'revisao') || 0);
}

async function listEscalas({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
    if (!latestRevision) return [];

    const result = await connection.execute(
      `select
          p.escprog_id,
          p.mes_ref,
          p.revisao,
          p.oficializada,
          case
            when last_day(p.mes_ref) < trunc(sysdate) then 'FINALIZADA'
            when p.revisao > 1 then 'MODIFICADA'
            else 'ATIVA'
          end as status,
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
         and p.revisao = :latestRevision
       order by f.chapa`,
      { lojaId, mesRef, latestRevision },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function listEscalasResumo({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const binds = {};
    const filters = [];
    if (lojaId) {
      binds.lojaId = lojaId;
      filters.push('loja = :lojaId');
    }
    if (mesRef) {
      binds.mesRef = mesRef;
      filters.push(`mes_ref = to_date(:mesRef, 'YYYY-MM-DD')`);
    }

    const whereSql = filters.length ? `where ${filters.join(' and ')}` : '';
    const result = await connection.execute(
      `select
          mes_ref,
          loja,
          min(dt_hr_incl) as data_inicio,
          max(dt_hr_incl) as modificada_em,
          max(revisao) as revisao,
          count(distinct escsecao_id) as secoes,
          count(distinct escfunc_id) as funcionarios,
          case
            when last_day(mes_ref) < trunc(sysdate) then 'FINALIZADA'
            when max(revisao) > 1 then 'MODIFICADA'
            else 'ATIVA'
          end as status
       from sgn_esc_prog
       ${whereSql}
       group by mes_ref, loja
       order by mes_ref desc, loja`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function getEscalaMensal({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
    if (!latestRevision) return { revisao: 0, status: null, dias: [] };

    const result = await connection.execute(
      `select
          p.escprog_id,
          p.mes_ref,
          p.revisao,
          p.oficializada,
          p.loja,
          p.chapa,
          p.escfunc_id,
          p.escsecao_id,
          p.escfuncao_id,
          f.nome,
          s.cod_secao,
          s.descr as secao_descr,
          fn.descr as funcao_descr,
          d.escprogdia_id,
          d.dt,
          d.hr_ent1,
          d.hr_sai1,
          d.hr_ent2,
          d.hr_sai2,
          d.programacao,
          case
            when last_day(p.mes_ref) < trunc(sysdate) then 'FINALIZADA'
            when p.revisao > 1 then 'MODIFICADA'
            else 'ATIVA'
          end as status
       from sgn_esc_prog p
       left join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
       left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
       left join sgn_esc_funcao fn on fn.escfuncao_id = p.escfuncao_id
       left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
       where p.loja = :lojaId
         and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
         and p.revisao = :latestRevision
       order by s.descr, f.nome, p.chapa, d.dt`,
      { lojaId, mesRef, latestRevision },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      revisao: latestRevision,
      status: result.rows[0] ? pick(result.rows[0], 'STATUS', 'status') : null,
      dias: result.rows
    };
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

async function updateEscalaDia({ escprogId, escprogdiaId, data }) {
  return withConnection(async (connection) => {
    try {
      const headerResult = await connection.execute(
        `select escprog_id, mes_ref, loja, revisao
         from sgn_esc_prog
         where escprog_id = :escprogId`,
        { escprogId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const header = headerResult.rows[0];
      if (!header) return null;

      const mesRef = pick(header, 'MES_REF', 'mes_ref');
      const mesRefKey = formatDateValue(mesRef);
      const loja = Number(pick(header, 'LOJA', 'loja'));
      const revisaoAtual = Number(pick(header, 'REVISAO', 'revisao'));
      if (isMesFinalizado(mesRef)) {
        const error = new Error('Escala finalizada nao pode ser editada.');
        error.statusCode = 422;
        throw error;
      }

      const latestRevision = await getLatestRevision(connection, { lojaId: loja, mesRef: mesRefKey });
      if (revisaoAtual !== latestRevision) {
        const error = new Error('Apenas a revisao mais recente pode ser editada.');
        error.statusCode = 409;
        throw error;
      }

      const targetDayResult = await connection.execute(
        `select dt
         from sgn_esc_prog_dia
         where escprogdia_id = :escprogdiaId
           and escprog_id = :escprogId`,
        { escprogId, escprogdiaId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const targetDay = targetDayResult.rows[0];
      if (!targetDay) return null;
      const targetDate = pick(targetDay, 'DT', 'dt');
      const nextRevision = latestRevision + 1;

      const headersToCopy = await connection.execute(
        `select escprog_id, mes_ref, escfunc_id, escsecao_id, escfuncao_id, loja, chapa, oficializada
         from sgn_esc_prog
         where loja = :loja
           and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
           and revisao = :latestRevision
         order by escprog_id`,
        { loja, mesRef: mesRefKey, latestRevision },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      let newTargetEscprogId = null;
      for (const row of headersToCopy.rows) {
        const oldEscprogId = Number(pick(row, 'ESCPROG_ID', 'escprog_id'));
        const headerInsert = await connection.execute(
          `insert into sgn_esc_prog (
              escprog_id, mes_ref, escfunc_id, escsecao_id, escfuncao_id, loja, chapa, revisao, oficializada, dt_hr_incl
           ) values (
              sgn_esc_prog_seq.nextval, :mesRef, :escfuncId, :escsecaoId, :escfuncaoId, :loja, :chapa, :revisao, :oficializada, sysdate
           )
           returning escprog_id into :escprogId`,
          {
            mesRef: pick(row, 'MES_REF', 'mes_ref'),
            escfuncId: pick(row, 'ESCFUNC_ID', 'escfunc_id'),
            escsecaoId: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
            escfuncaoId: pick(row, 'ESCFUNCAO_ID', 'escfuncao_id'),
            loja: pick(row, 'LOJA', 'loja'),
            chapa: pick(row, 'CHAPA', 'chapa'),
            revisao: nextRevision,
            oficializada: pick(row, 'OFICIALIZADA', 'oficializada'),
            escprogId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
          },
          { autoCommit: false }
        );

        const newEscprogId = headerInsert.outBinds.escprogId[0];
        if (oldEscprogId === Number(escprogId)) {
          newTargetEscprogId = newEscprogId;
          await connection.execute(
            `insert into sgn_esc_prog_dia (
                escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
             )
             select sgn_esc_prog_dia_seq.nextval,
                    :newEscprogId,
                    dt,
                    case when escprogdia_id = :escprogdiaId then :hrEnt1 else hr_ent1 end,
                    case when escprogdia_id = :escprogdiaId then :hrSai1 else hr_sai1 end,
                    case when escprogdia_id = :escprogdiaId then :hrEnt2 else hr_ent2 end,
                    case when escprogdia_id = :escprogdiaId then :hrSai2 else hr_sai2 end,
                    case when escprogdia_id = :escprogdiaId then :programacao else programacao end
             from sgn_esc_prog_dia
             where escprog_id = :oldEscprogId`,
            {
              newEscprogId, oldEscprogId, escprogdiaId,
              hrEnt1: data.HR_ENT1,
              hrSai1: data.HR_SAI1,
              hrEnt2: data.HR_ENT2,
              hrSai2: data.HR_SAI2,
              programacao: data.PROGRAMACAO
            },
            { autoCommit: false }
          );
        } else {
          await connection.execute(
            `insert into sgn_esc_prog_dia (
                escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
             )
             select sgn_esc_prog_dia_seq.nextval, :newEscprogId, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
             from sgn_esc_prog_dia
             where escprog_id = :oldEscprogId`,
            { newEscprogId, oldEscprogId },
            { autoCommit: false }
          );
        }
      }

      if (!newTargetEscprogId) return null;
      await connection.commit();

      const updated = await connection.execute(
        `select escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
         from sgn_esc_prog_dia
         where escprog_id = :newTargetEscprogId
           and dt = :targetDate`,
        { newTargetEscprogId, targetDate },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const updatedRow = updated.rows[0] || null;
      if (updatedRow) {
        updatedRow.NEW_ESCPROG_ID = newTargetEscprogId;
        updatedRow.REVISAO = nextRevision;
      }
      return updatedRow;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}
async function saveEscala({ lojaId, mesRef, funcionario, dias, oficializada = 0 }) {
  const saved = await saveEscalasBatch({ lojaId, mesRef, funcionarios: [{ ...funcionario, dias }], oficializada });
  return saved[0] || null;
}

async function insertEscalaOracle(connection, { lojaId, mesRef, funcionario, dias, oficializada = 0, revisao }) {
  const escfuncId = funcionario.escfuncId || funcionario.ESCFUNC_ID;
  const funcionarioDb = await getFuncionarioEscala(connection, escfuncId);
  if (!funcionarioDb) {
    const error = new Error(`Funcionario ${escfuncId} nao encontrado em SGN_ESC_FUNCIONARIO.`);
    error.statusCode = 422;
    throw error;
  }

  const escsecaoId = funcionario.escsecaoId || funcionario.ESCSECAO_ID || funcionarioDb.ESCSECAO_ID;
  const escfuncaoId = funcionario.escfuncaoId || funcionario.ESCFUNCAO_ID || funcionarioDb.ESCFUNCAO_ID;
  const lojaFuncionario = Number(funcionarioDb.LOJA) || Number(lojaId);
  const chapa = funcionario.chapa || funcionario.CHAPA || funcionarioDb.CHAPA;

  const header = await connection.execute(
    `insert into sgn_esc_prog (
        escprog_id, mes_ref, escfunc_id, escsecao_id, escfuncao_id, loja, chapa, revisao, oficializada, dt_hr_incl
     ) values (
        sgn_esc_prog_seq.nextval, to_date(:mesRef, 'YYYY-MM-DD'), :escfuncId, :escsecaoId, :escfuncaoId, :lojaId, :chapa, :revisao, :oficializada, sysdate
     )
     returning escprog_id into :escprogId`,
    {
      mesRef,
      escfuncId,
      escsecaoId,
      escfuncaoId,
      lojaId: lojaFuncionario,
      chapa,
      revisao,
      oficializada,
      escprogId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
    },
    { autoCommit: false }
  );

  const escprogId = header.outBinds.escprogId[0];
  const binds = (dias || []).map((dia) => normalizeDiaBind(escprogId, dia));

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

  return { escprogId, revisao, escsecaoId };
}

async function copyPreviousRevision(connection, { lojaId, mesRef, latestRevision, nextRevision, secoesAlteradas, oficializada }) {
  if (!latestRevision || secoesAlteradas.length === 0) return;

  const binds = {
    lojaId,
    mesRef,
    latestRevision,
    ...Object.fromEntries(secoesAlteradas.map((secaoId, index) => [`secao${index}`, secaoId]))
  };
  const secaoPlaceholders = secoesAlteradas.map((_, index) => `:secao${index}`).join(', ');
  const copyHeaders = await connection.execute(
    `select escprog_id, mes_ref, escfunc_id, escsecao_id, escfuncao_id, loja, chapa, oficializada
     from sgn_esc_prog
     where loja = :lojaId
       and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       and revisao = :latestRevision
       and escsecao_id not in (${secaoPlaceholders})
     order by escprog_id`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  for (const row of copyHeaders.rows) {
    const oldEscprogId = pick(row, 'ESCPROG_ID', 'escprog_id');
    const header = await connection.execute(
      `insert into sgn_esc_prog (
          escprog_id, mes_ref, escfunc_id, escsecao_id, escfuncao_id, loja, chapa, revisao, oficializada, dt_hr_incl
       ) values (
          sgn_esc_prog_seq.nextval, :mesRef, :escfuncId, :escsecaoId, :escfuncaoId, :loja, :chapa, :revisao, :oficializada, sysdate
       )
       returning escprog_id into :escprogId`,
      {
        mesRef: pick(row, 'MES_REF', 'mes_ref'),
        escfuncId: pick(row, 'ESCFUNC_ID', 'escfunc_id'),
        escsecaoId: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
        escfuncaoId: pick(row, 'ESCFUNCAO_ID', 'escfuncao_id'),
        loja: pick(row, 'LOJA', 'loja'),
        chapa: pick(row, 'CHAPA', 'chapa'),
        revisao: nextRevision,
        oficializada: pick(row, 'OFICIALIZADA', 'oficializada') || oficializada,
        escprogId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );

    const newEscprogId = header.outBinds.escprogId[0];
    await connection.execute(
      `insert into sgn_esc_prog_dia (
          escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
       )
       select sgn_esc_prog_dia_seq.nextval, :newEscprogId, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
       from sgn_esc_prog_dia
       where escprog_id = :oldEscprogId`,
      { newEscprogId, oldEscprogId },
      { autoCommit: false }
    );
  }
}

async function saveEscalasBatch({ lojaId, mesRef, funcionarios, oficializada = 0 }) {
  return withConnection(async (connection) => {
    try {
      if (isMesFinalizado(mesRef)) {
        const error = new Error('Escala finalizada nao pode ser editada.');
        error.statusCode = 422;
        throw error;
      }

      const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
      const nextRevision = latestRevision + 1;
      const secoesAlteradas = [...new Set((funcionarios || [])
        .map((funcionario) => Number(funcionario.escsecaoId || funcionario.ESCSECAO_ID || 0))
        .filter(Boolean))];

      await copyPreviousRevision(connection, {
        lojaId,
        mesRef,
        latestRevision,
        nextRevision,
        secoesAlteradas,
        oficializada
      });

      const saved = [];
      for (const funcionario of funcionarios) {
        saved.push(await insertEscalaOracle(connection, {
          lojaId,
          mesRef,
          funcionario,
          dias: funcionario.dias || [],
          oficializada,
          revisao: nextRevision
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

async function validateAusencias({ funcionarios }) {
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
          { escfuncId: funcionario.escfuncId || funcionario.ESCFUNC_ID, data: dia.data },
          { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows[0]) {
          errors.push(`Funcionario ${funcionario.chapa || funcionario.CHAPA} possui ausencia em ${dia.data}: ${result.rows[0].MOTIVO || 'ausencia'}.`);
        }
      }
    }

    return errors;
  });
}

module.exports = {
  listEscalas,
  listEscalasResumo,
  getEscalaMensal,
  getEscalaHeader,
  getEscalaDias,
  updateEscalaDia,
  saveEscala,
  saveEscalasBatch,
  validateAusencias
};
