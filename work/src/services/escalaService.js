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

async function getTableColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name from user_tab_columns where table_name = :tableName`,
    { tableName },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
}

async function getAuditJoinSql(connection, programAlias = 'p') {
  const columns = await getTableColumns(connection, 'SGN_ESC_AUDITORIA');
  const referenceColumn = ['REFERENCIA_ID', 'ESCPROG_ID', 'ENTIDADE_ID'].find((column) => columns.has(column));
  if (!referenceColumn || !columns.has('DT_HR_INCL')) {
    return {
      selectSql: `'Sistema' as modificado_por,`,
      joinSql: ''
    };
  }

  const auditUserExpr = columns.has('NOME_USUARIO')
    ? 'a.nome_usuario'
    : columns.has('LOGIN')
      ? 'a.login'
      : columns.has('USUARIO')
        ? 'a.usuario'
        : columns.has('USUARIO_LOGIN')
          ? 'a.usuario_login'
          : 'cast(null as varchar2(100))';

  const auditUserSelect = columns.has('USUARIO_ID') ? 'a.usuario_id,' : 'cast(null as number) as usuario_id,';
  const entityFilter = columns.has('ENTIDADE') ? "where upper(a.entidade) = 'ESCALA'" : '';

  return {
    selectSql: `nvl(max(coalesce(au.modificador, u.nome, u.login)) keep (dense_rank last order by au.dt_hr_incl nulls first), 'Sistema') as modificado_por,`,
    joinSql: `
       left join (
         select
            a.${referenceColumn.toLowerCase()} as escprog_id,
            ${auditUserSelect}
            ${auditUserExpr} as modificador,
            a.dt_hr_incl,
            row_number() over (partition by a.${referenceColumn.toLowerCase()} order by a.dt_hr_incl desc) as rn
         from sgn_esc_auditoria a
         ${entityFilter}
       ) au on au.escprog_id = ${programAlias}.escprog_id and au.rn = 1
       left join sgn_esc_usuario u on u.usuario_id = au.usuario_id`
  };
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
  const descanso = programacao !== 'TRB';
  const fallback = descanso ? programacao : '00:00';

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
  const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  if (ref > inicioMesAtual) return 'AGENDADA';
  return Number(revisao) > 0 ? 'MODIFICADA' : 'ATIVA';
}

function isMesFinalizado(mesRef) {
  return getMesStatus(mesRef, 1) === 'FINALIZADA';
}

async function hasProgAtivaColumn(connection) {
  const columns = await getTableColumns(connection, 'SGN_ESC_PROG');
  return columns.has('ATIVA');
}

async function getAtivaSql(connection, alias = 'p') {
  return (await hasProgAtivaColumn(connection)) ? `nvl(${alias}.ativa, 1) = 1` : '1 = 1';
}

async function getLatestRevision(connection, { lojaId, mesRef, includeInactive = false }) {
  const ativaSql = includeInactive ? '1 = 1' : await getAtivaSql(connection, 'p');
  const result = await connection.execute(
    `select max(p.revisao) as revisao
     from sgn_esc_prog p
     where p.loja = :lojaId
       and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       and ${ativaSql}`,
    { lojaId, mesRef },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );

  const value = pick(result.rows[0], 'REVISAO', 'revisao');
  return value === null || value === undefined ? null : Number(value);
}

async function listEscalas({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
    if (latestRevision === null) return [];
    const ativaSql = await getAtivaSql(connection, 'p');

    const result = await connection.execute(
      `select
          p.escprog_id,
          p.mes_ref,
          p.revisao,
          p.oficializada,
          case
            when last_day(p.mes_ref) < trunc(sysdate) then 'FINALIZADA'
            when trunc(p.mes_ref, 'MM') > trunc(sysdate, 'MM') then 'AGENDADA'
            when p.revisao > 0 then 'MODIFICADA'
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
         and ${ativaSql}
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
      filters.push('p.loja = :lojaId');
    }
    if (mesRef) {
      binds.mesRef = mesRef;
      filters.push(`p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')`);
    }

    filters.push(await getAtivaSql(connection, 'p'));
    const whereSql = filters.length ? `where ${filters.join(' and ')}` : '';
    const auditJoin = await getAuditJoinSql(connection, 'p');
    const ativaSql = await getAtivaSql(connection, 'p');
    const result = await connection.execute(
      `select
          p.mes_ref,
          p.loja,
          min(p.dt_hr_incl) as data_inicio,
          max(p.dt_hr_incl) as modificada_em,
          max(p.revisao) as revisao,
          max(p.oficializada) as oficializada,
          count(distinct p.escsecao_id) as secoes,
          count(distinct p.escfunc_id) as funcionarios,
          ${auditJoin.selectSql}
          case
            when last_day(p.mes_ref) < trunc(sysdate) then 'FINALIZADA'
            when trunc(p.mes_ref, 'MM') > trunc(sysdate, 'MM') then 'AGENDADA'
            when max(p.revisao) > 0 then 'MODIFICADA'
            else 'ATIVA'
          end as status
       from sgn_esc_prog p
       ${auditJoin.joinSql}
       ${whereSql}
       group by p.mes_ref, p.loja
       order by p.mes_ref desc, p.loja`,
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}

async function listEscalaRevisoes({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const auditJoin = await getAuditJoinSql(connection, 'p');
    const ativaSql = await getAtivaSql(connection, 'p');
    const result = await connection.execute(
      `select
          p.revisao,
          min(p.dt_hr_incl) as criada_em,
          max(p.dt_hr_incl) as modificada_em,
          max(p.oficializada) as oficializada,
          count(distinct p.escsecao_id) as secoes,
          count(distinct p.escfunc_id) as funcionarios,
          ${auditJoin.selectSql}
          case
            when last_day(p.mes_ref) < trunc(sysdate) then 'FINALIZADA'
            when trunc(p.mes_ref, 'MM') > trunc(sysdate, 'MM') then 'AGENDADA'
            when p.revisao > 0 then 'MODIFICADA'
            else 'ATIVA'
          end as status
          from sgn_esc_prog p
       ${auditJoin.joinSql}
       where p.loja = :lojaId
         and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
         and ${ativaSql}
       group by p.mes_ref, p.revisao
       order by p.revisao desc`,
      { lojaId, mesRef },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows;
  });
}
async function listHistoricoEscala({ lojaId, mesRef, lojasPermitidas = [] }) {
  return withConnection(async (connection) => {
    try {
      const binds = {};
      const filters = [];
      if (lojaId) {
        binds.lojaId = lojaId;
        filters.push("a.loja = :lojaId");
      } else if (Array.isArray(lojasPermitidas) && lojasPermitidas.length > 0) {
        lojasPermitidas.forEach((loja, index) => { binds['loja' + index] = loja; });
        filters.push('a.loja in (' + lojasPermitidas.map((_, index) => ':loja' + index).join(', ') + ')');
      }
      if (mesRef) { binds.mesRef = mesRef; filters.push("a.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')"); }
      const whereSql = filters.length ? `where ${filters.join(" and ")}` : "";
      const result = await connection.execute(
        `select a.auditoria_id, a.usuario_id, a.login, a.nome_usuario, a.perfil, a.acao, a.entidade, a.entidade_id,
                a.loja, a.mes_ref, a.revisao, a.detalhe, a.dt_hr_incl
         from sgn_esc_auditoria a
         ${whereSql}
         order by a.dt_hr_incl desc, a.auditoria_id desc`,
        binds,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      if (error?.errorNum === 942 || error?.code === "ORA-00942") return [];
      throw error;
    }
  });
}

async function getEscalaMensal({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
    if (latestRevision === null) return { revisao: null, status: null, dias: [] };
    const ativaSql = await getAtivaSql(connection, 'p');
    const ativaSubSql = await getAtivaSql(connection, 'px');

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
            when trunc(p.mes_ref, 'MM') > trunc(sysdate, 'MM') then 'AGENDADA'
            when p.revisao > 0 then 'MODIFICADA'
            else 'ATIVA'
          end as status
       from sgn_esc_prog p
       left join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
       left join sgn_esc_secao s on s.escsecao_id = p.escsecao_id
       left join sgn_esc_funcao fn on fn.escfuncao_id = p.escfuncao_id
       left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
       where p.loja = :lojaId
         and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
         and p.revisao = (
           select max(px.revisao)
           from sgn_esc_prog px
           where px.loja = p.loja
             and px.mes_ref = p.mes_ref
             and px.escfunc_id = p.escfunc_id
             and ${ativaSubSql}
         )
         and ${ativaSql}
       order by s.descr, f.nome, p.chapa, d.dt`,
      { lojaId, mesRef },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return {
      revisao: latestRevision,
      status: getMesStatus(mesRef, latestRevision),
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
      if (latestRevision === null || revisaoAtual !== latestRevision) {
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

      const ativaSql = await getAtivaSql(connection, 'p');
      const headersToCopy = await connection.execute(
        `select p.escprog_id, p.mes_ref, p.escfunc_id, p.escsecao_id, p.escfuncao_id, p.loja, p.chapa, p.oficializada
         from sgn_esc_prog p
         where p.loja = :loja
           and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
           and p.revisao = :latestRevision
           and ${ativaSql}
         order by p.escprog_id`,
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
            oficializada: 0,
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
  const progColumns = await getTableColumns(connection, 'SGN_ESC_PROG');
  const primeiroDiaTrabalho = (dias || []).find((dia) => String(dia.programacao || dia.PROGRAMACAO || 'TRB').toUpperCase() === 'TRB');
  const horarioOficial = funcionario.turnoOficial || {
    escsecaoTurnoId: funcionario.escsecaoTurnoId || funcionario.ESCSECAOTURNO_ID || null,
    hrEnt1: primeiroDiaTrabalho?.hrEnt1 || primeiroDiaTrabalho?.HR_ENT1 || null,
    hrSai1: primeiroDiaTrabalho?.hrSai1 || primeiroDiaTrabalho?.HR_SAI1 || null,
    hrEnt2: primeiroDiaTrabalho?.hrEnt2 || primeiroDiaTrabalho?.HR_ENT2 || null,
    hrSai2: primeiroDiaTrabalho?.hrSai2 || primeiroDiaTrabalho?.HR_SAI2 || null
  };

  const headerColumns = ['escprog_id', 'mes_ref', 'escfunc_id', 'escsecao_id', 'escfuncao_id', 'loja', 'chapa'];
  const headerValues = ['sgn_esc_prog_seq.nextval', "to_date(:mesRef, 'YYYY-MM-DD')", ':escfuncId', ':escsecaoId', ':escfuncaoId', ':lojaId', ':chapa'];
  const headerBinds = {
    mesRef,
    escfuncId,
    escsecaoId,
    escfuncaoId,
    lojaId: lojaFuncionario,
    chapa,
    revisao,
    oficializada,
    escprogId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
  };

  const optionalHeaderFields = [
    ['ESCSECAOTURNO_ID', 'escsecaoTurnoId', horarioOficial.escsecaoTurnoId],
    ['HR_OFICIAL_ENT1', 'hrOficialEnt1', horarioOficial.hrEnt1],
    ['HR_OFICIAL_SAI1', 'hrOficialSai1', horarioOficial.hrSai1],
    ['HR_OFICIAL_ENT2', 'hrOficialEnt2', horarioOficial.hrEnt2],
    ['HR_OFICIAL_SAI2', 'hrOficialSai2', horarioOficial.hrSai2]
  ];
  optionalHeaderFields.forEach(([column, bind, value]) => {
    if (!progColumns.has(column)) return;
    headerColumns.push(column.toLowerCase());
    headerValues.push(`:${bind}`);
    headerBinds[bind] = value;
  });
  headerColumns.push('revisao', 'oficializada', 'dt_hr_incl');
  headerValues.push(':revisao', ':oficializada', 'sysdate');

  const header = await connection.execute(
    `insert into sgn_esc_prog (
        ${headerColumns.join(', ')}
     ) values (
        ${headerValues.join(', ')}
     )
     returning escprog_id into :escprogId`,
    headerBinds,
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

async function copyPreviousRevision(connection, { lojaId, mesRef, latestRevision, nextRevision, secoesAlteradas }) {
  if (latestRevision === null || latestRevision === undefined || secoesAlteradas.length === 0) return;
  const ativaSql = await getAtivaSql(connection, 'p');

  const binds = {
    lojaId,
    mesRef,
    latestRevision,
    ...Object.fromEntries(secoesAlteradas.map((secaoId, index) => [`secao${index}`, secaoId]))
  };
  const secaoPlaceholders = secoesAlteradas.map((_, index) => `:secao${index}`).join(', ');
  const copyHeaders = await connection.execute(
    `select p.escprog_id, p.mes_ref, p.escfunc_id, p.escsecao_id, p.escfuncao_id, p.loja, p.chapa, p.oficializada
     from sgn_esc_prog p
     where p.loja = :lojaId
       and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       and p.revisao = :latestRevision
       and ${ativaSql}
       and p.escsecao_id not in (${secaoPlaceholders})
     order by p.escprog_id`,
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
        oficializada: 0,
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
      const nextRevision = latestRevision === null ? 0 : latestRevision + 1;
      const secoesAlteradas = [...new Set((funcionarios || [])
        .map((funcionario) => Number(funcionario.escsecaoId || funcionario.ESCSECAO_ID || 0))
        .filter(Boolean))];

      await copyPreviousRevision(connection, {
        lojaId,
        mesRef,
        latestRevision,
        nextRevision,
        secoesAlteradas,
        oficializada: 0
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

async function saveEscalaFuncionarioRevision({ lojaId, mesRef, funcionario, dias, oficializada = 0 }) {
  return withConnection(async (connection) => {
    try {
      if (isMesFinalizado(mesRef)) {
        const error = new Error('Escala finalizada nao pode ser editada.');
        error.statusCode = 422;
        throw error;
      }

      const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
      if (latestRevision === null) {
        const error = new Error('Escala mensal nao encontrada.');
        error.statusCode = 404;
        throw error;
      }
      const nextRevision = latestRevision + 1;
      const escfuncId = Number(funcionario.escfuncId || funcionario.ESCFUNC_ID);
      const ativaSql = await getAtivaSql(connection, 'p');
      const headers = await connection.execute(
        `select p.escprog_id, p.mes_ref, p.escfunc_id, p.escsecao_id, p.escfuncao_id, p.loja, p.chapa, p.oficializada
         from sgn_esc_prog p
         where p.loja = :lojaId
           and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
           and p.revisao = :latestRevision
           and p.escfunc_id = :escfuncId
           and ${ativaSql}
         order by p.escprog_id`,
        { lojaId, mesRef, latestRevision, escfuncId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      for (const row of headers.rows) {
        if (Number(pick(row, 'ESCFUNC_ID', 'escfunc_id')) === escfuncId) continue;
        const inserted = await insertEscalaOracle(connection, {
          lojaId,
          mesRef,
          funcionario: {
            escfuncId: pick(row, 'ESCFUNC_ID', 'escfunc_id'),
            escsecaoId: pick(row, 'ESCSECAO_ID', 'escsecao_id'),
            escfuncaoId: pick(row, 'ESCFUNCAO_ID', 'escfuncao_id'),
            chapa: pick(row, 'CHAPA', 'chapa')
          },
          dias: [],
          oficializada: 0,
          revisao: nextRevision
        });
        await connection.execute(
          `insert into sgn_esc_prog_dia (escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao)
           select sgn_esc_prog_dia_seq.nextval, :newEscprogId, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
           from sgn_esc_prog_dia
           where escprog_id = :oldEscprogId`,
          { newEscprogId: inserted.escprogId, oldEscprogId: pick(row, 'ESCPROG_ID', 'escprog_id') },
          { autoCommit: false }
        );
      }

      const saved = await insertEscalaOracle(connection, {
        lojaId, mesRef, funcionario, dias, oficializada, revisao: nextRevision
      });
      await connection.commit();
      return saved;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function oficializarEscala({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
    if (latestRevision === null) return { affectedRows: 0, revisao: null };
    const ativaSql = await getAtivaSql(connection, 'p');
    const result = await connection.execute(
      `update sgn_esc_prog p
       set p.oficializada = 1
       where p.loja = :lojaId
         and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
         and p.revisao = :latestRevision
         and ${ativaSql}`,
      { lojaId, mesRef, latestRevision },
      { autoCommit: true }
    );
    return { affectedRows: result.rowsAffected || 0, revisao: latestRevision };
  });
}

async function inativarEscala({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    const latestRevision = await getLatestRevision(connection, { lojaId, mesRef });
    if (latestRevision === null) return { affectedRows: 0, revisao: null };
    if (!(await hasProgAtivaColumn(connection))) {
      const error = new Error('Coluna ATIVA nao encontrada em SGN_ESC_PROG. Execute a migration 20260630_add_prog_ativa.sql antes de inativar escalas.');
      error.statusCode = 500;
      throw error;
    }
    const result = await connection.execute(
      `update sgn_esc_prog
       set ativa = 0, oficializada = 0
       where loja = :lojaId
         and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
         and nvl(ativa, 1) = 1`,
      { lojaId, mesRef },
      { autoCommit: true }
    );
    return { affectedRows: result.rowsAffected || 0, revisao: latestRevision };
  });
}

async function validateAusencias({ funcionarios }) {
  return withConnection(async (connection) => {
    const errors = [];

    for (const funcionario of funcionarios) {
      for (const dia of funcionario.dias || []) {
        const trabalha = String(dia.programacao || 'TRB').toUpperCase() === 'TRB';
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
  getMesStatus,
  listEscalas,
  listEscalasResumo,
  listEscalaRevisoes,
  listHistoricoEscala,
  getEscalaMensal,
  getEscalaHeader,
  getEscalaDias,
  updateEscalaDia,
  saveEscala,
  saveEscalasBatch,
  saveEscalaFuncionarioRevision,
  oficializarEscala,
  inativarEscala,
  validateAusencias
};
