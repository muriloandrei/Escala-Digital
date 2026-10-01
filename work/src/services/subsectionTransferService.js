const { withConnection, oracledb } = require('../db/oracle');
const { getOperationalPeriodIso } = require('../domain/operationalPeriod');
const catalogService = require('./catalogService');
const escalaService = require('./escalaService');
const monthlyReleaseService = require('./monthlyReleaseService');
const escalaEventService = require('./escalaEventService');

function todayIso(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function nextMonday(iso) {
  const date = new Date(`${iso}T12:00:00Z`);
  const distance = (8 - date.getUTCDay()) % 7 || 7;
  date.setUTCDate(date.getUTCDate() + distance);
  return date.toISOString().slice(0, 10);
}

function effectiveDate(vigencia, hoje = todayIso()) {
  if (vigencia === 'PROXIMA_SEMANA') return nextMonday(hoje);
  if (vigencia === 'PROXIMO_MES') {
    const [year, month] = hoje.split('-').map(Number);
    const first = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
    return getOperationalPeriodIso(first).inicio;
  }
  throw new Error('Vigencia agendada invalida.');
}

function businessError(message, statusCode = 422) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.permanent = true;
  return error;
}

async function agendar({ lojaId, escfuncId, escsecaoId, destinoId, vigencia, actor }) {
  const data = effectiveDate(vigencia);
  if (!Number.isInteger(Number(destinoId)) || Number(destinoId) <= 0) {
    throw businessError('Selecione uma subsecao de destino para agendar a transferencia.');
  }
  return withConnection(async (connection) => {
    try {
      const employee = await connection.execute(
        `select escfunc_id, escsecao_id, escsubsecao_id, dt_demiss
           from sgn_esc_funcionario
          where loja = :lojaId and escfunc_id = :escfuncId for update wait 5`,
        { lojaId, escfuncId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const current = employee.rows[0];
      if (!current || current.DT_DEMISS || Number(current.ESCSECAO_ID) !== Number(escsecaoId)) {
        throw businessError('Funcionario ativo nao encontrado na secao informada. Confira a carga do RM.');
      }
      if (Number(current.ESCSUBSECAO_ID || 0) === Number(destinoId || 0)) {
        throw businessError('Funcionario ja esta na subsecao de destino.');
      }
      const destination = await connection.execute(
        `select escsubsecao_id from sgn_esc_subsecao
          where escsubsecao_id = :destinoId and escsecao_id = :escsecaoId
            and nvl(status, 'A') = 'A'`,
        { destinoId, escsecaoId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (!destination.rows.length) throw businessError('Subsecao de destino ativa nao encontrada nesta secao.');
      const pending = await connection.execute(
        `select transf_id from sgn_esc_transfer_sub
          where loja = :lojaId and escfunc_id = :escfuncId and status in ('P', 'E', 'F')`,
        { lojaId, escfuncId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      if (pending.rows.length) throw businessError('Ja existe transferencia agendada para este funcionario.', 409);
      const operacaoId = escalaEventService.createOperationId();
      const inserted = await connection.execute(
        `insert into sgn_esc_transfer_sub (
           transf_id, operacao_id, loja, escfunc_id, escsecao_id,
           origem_id, destino_id, dt_vigencia, status, tentativas,
           dt_proxima, usuario_id, login, meses_gerados
         ) values (
           sgn_esc_transfer_sub_seq.nextval, :operacaoId, :lojaId, :escfuncId, :escsecaoId,
           :origemId, :destinoId, to_date(:data, 'YYYY-MM-DD'), 'P', 0,
           sysdate, :usuarioId, :login, :mesesGerados
         ) returning transf_id into :transfId`,
        {
          operacaoId, lojaId, escfuncId, escsecaoId,
          origemId: current.ESCSUBSECAO_ID || null, destinoId, data,
          usuarioId: actor?.sub ? Number(actor.sub) : null,
          login: String(actor?.login || 'SISTEMA').slice(0, 100),
          mesesGerados: { val: '[]', type: oracledb.CLOB },
          transfId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        }, { autoCommit: false }
      );
      await escalaEventService.appendEvent(connection, {
        operacaoId, lojaId, mesRef: `${data.slice(0, 7)}-01`, escsecaoId, escfuncId,
        escsubsecaoId: current.ESCSUBSECAO_ID || null,
        actor, acao: 'AGENDAR_TRANSFERENCIA_SUBSECAO', origem: 'USUARIO', situacao: 'CADASTRO',
        detalhe: { origemId: current.ESCSUBSECAO_ID || null, destinoId, vigencia: data }
      });
      await connection.commit();
      return { id: Number(inserted.outBinds.transfId[0]), vigencia: data, status: 'PENDENTE' };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function listar({ lojaId, escfuncId = null }) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select t.transf_id, t.loja, t.escfunc_id, t.escsecao_id, t.origem_id, t.destino_id,
              to_char(t.dt_vigencia, 'YYYY-MM-DD') as vigencia, t.status, t.tentativas,
              t.dt_hr_incl, t.dt_hr_aplic, t.login, t.erro, t.meses_gerados,
              origem.descr as origem_nome, destino.descr as destino_nome
         from sgn_esc_transfer_sub t
         left join sgn_esc_subsecao origem on origem.escsubsecao_id = t.origem_id
         left join sgn_esc_subsecao destino on destino.escsubsecao_id = t.destino_id
        where t.loja = :lojaId and (:escfuncId is null or t.escfunc_id = :escfuncId)
        order by t.dt_vigencia desc, t.transf_id desc`,
      { lojaId, escfuncId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { MESES_GERADOS: { type: oracledb.STRING } } }
    );
    return (result.rows || []).map((row) => ({
      ...row, MESES_GERADOS: JSON.parse(row.MESES_GERADOS || '[]')
    }));
  });
}

async function retryFailed({ lojaId, escfuncId, transfId, actor }) {
  return withConnection(async (connection) => {
    try {
      const result = await connection.execute(
        `select transf_id, escsecao_id, origem_id, destino_id,
                to_char(dt_vigencia, 'YYYY-MM-DD') as vigencia, status
           from sgn_esc_transfer_sub
          where transf_id = :transfId and loja = :lojaId and escfunc_id = :escfuncId
          for update wait 5`,
        { transfId, lojaId, escfuncId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const transfer = result.rows?.[0];
      if (!transfer) throw businessError('Transferencia nao encontrada para este funcionario.', 404);
      if (transfer.STATUS !== 'F') throw businessError('Somente transferencias em falha podem ser retomadas.', 409);
      await connection.execute(
        `update sgn_esc_transfer_sub
            set status = 'P', tentativas = 0, dt_proxima = sysdate,
                dt_hr_claim = null, erro = null
          where transf_id = :transfId`,
        { transfId }, { autoCommit: false }
      );
      await escalaEventService.appendEvent(connection, {
        operacaoId: escalaEventService.createOperationId(), lojaId, escfuncId,
        escsecaoId: transfer.ESCSECAO_ID, escsubsecaoId: transfer.DESTINO_ID,
        mesRef: `${transfer.VIGENCIA.slice(0, 7)}-01`, actor,
        acao: 'RETOMAR_TRANSFERENCIA_SUBSECAO', origem: 'USUARIO', situacao: 'CADASTRO',
        detalhe: { transfId, origemId: transfer.ORIGEM_ID, destinoId: transfer.DESTINO_ID, vigencia: transfer.VIGENCIA }
      });
      await connection.commit();
      return { id: transfId, status: 'PENDENTE' };
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function claimDue() {
  return withConnection(async (connection) => {
    try {
      await connection.execute(
        `update sgn_esc_transfer_sub set status = 'P', dt_proxima = sysdate,
                erro = 'Execucao interrompida; retomando.'
          where status = 'E' and dt_hr_claim < sysdate - 30/1440`,
        {}, { autoCommit: false }
      );
      const result = await connection.execute(
        `select transf_id from sgn_esc_transfer_sub
          where status = 'P' and dt_vigencia <= to_date(:hoje, 'YYYY-MM-DD')
            and dt_proxima <= sysdate
          order by dt_vigencia, transf_id for update skip locked`,
        { hoje: todayIso() }, { outFormat: oracledb.OUT_FORMAT_OBJECT, maxRows: 1 }
      );
      const id = Number(result.rows?.[0]?.TRANSF_ID || 0);
      if (id) await connection.execute(
        `update sgn_esc_transfer_sub
            set status = 'E', tentativas = tentativas + 1, dt_hr_claim = sysdate
          where transf_id = :id`,
        { id }, { autoCommit: false }
      );
      await connection.commit();
      return id || null;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  });
}

async function listGeneratedMonths({ lojaId, escfuncId, vigencia }) {
  return withConnection(async (connection) => {
    const column = await connection.execute(
      `select count(*) as total from user_tab_columns
        where table_name = 'SGN_ESC_PROG' and column_name = 'ATIVA'`,
      {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const active = Number(column.rows[0]?.TOTAL) ? 'and nvl(p.ativa, 1) = 1' : '';
    const result = await connection.execute(
      `select distinct to_char(p.mes_ref, 'YYYY-MM-DD') as mes_ref
         from sgn_esc_prog p
        where p.loja = :lojaId and p.escfunc_id = :escfuncId ${active}
          and exists (select 1 from sgn_esc_prog_dia d
                       where d.escprog_id = p.escprog_id
                         and d.dt >= to_date(:vigencia, 'YYYY-MM-DD'))
        order by mes_ref`,
      { lojaId, escfuncId, vigencia }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return (result.rows || []).map((row) => row.MES_REF);
  });
}

async function updateTransfer(id, sql, binds = {}) {
  return withConnection(async (connection) => connection.execute(sql, { id, ...binds }, { autoCommit: true }));
}

async function processOne(id) {
  const transfer = await withConnection(async (connection) => {
    const result = await connection.execute(
      `select transf_id, operacao_id, loja, escfunc_id, escsecao_id,
              origem_id, destino_id, to_char(dt_vigencia, 'YYYY-MM-DD') as vigencia,
              status, tentativas, usuario_id, login, meses_gerados
         from sgn_esc_transfer_sub where transf_id = :id`,
      { id }, { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { MESES_GERADOS: { type: oracledb.STRING } } }
    );
    return result.rows?.[0] || null;
  });
  if (!transfer || transfer.STATUS !== 'E') return { id, status: 'IGNORADO' };
  const lojaId = Number(transfer.LOJA);
  const escfuncId = Number(transfer.ESCFUNC_ID);
  const escsecaoId = Number(transfer.ESCSECAO_ID);
  const vigencia = transfer.VIGENCIA;
  const mesesGerados = new Set(JSON.parse(transfer.MESES_GERADOS || '[]'));
  try {
    const [employee] = (await catalogService.listFuncionariosByLoja(lojaId, { includeInactive: true }))
      .filter((item) => Number(item.ESCFUNC_ID) === escfuncId);
    if (!employee || employee.DT_DEMISS || Number(employee.ESCSECAO_ID) !== escsecaoId) {
      throw businessError('Funcionario nao esta mais ativo nesta loja e secao. Confira o RM.');
    }
    const currentSub = Number(employee.ESCSUBSECAO_ID || 0);
    if (currentSub !== Number(transfer.ORIGEM_ID || 0) && currentSub !== Number(transfer.DESTINO_ID || 0)) {
      throw businessError('Vinculo alterado desde o agendamento. Revise esta transferencia.');
    }
    const months = await listGeneratedMonths({ lojaId, escfuncId, vigencia });
    for (const mesRef of months.filter((month) => !mesesGerados.has(month))) {
      if (await escalaService.isEscalaSecaoOficializada({ lojaId, mesRef, escsecaoId, escfuncIds: [escfuncId] })) {
        throw businessError(`Escala ${mesRef} oficializada. Desbloqueie o fluxo antes de aplicar a transferencia.`);
      }
    }
    if (currentSub !== Number(transfer.DESTINO_ID || 0)) {
      const updated = await catalogService.updateFuncionarioEscala({
        lojaId, escfuncId, data: { ESCSUBSECAO_ID: Number(transfer.DESTINO_ID) },
        actor: { sub: transfer.USUARIO_ID, login: transfer.LOGIN },
        mesRef: `${vigencia.slice(0, 7)}-01`, vigencia
      });
      if (!updated) throw businessError('Vinculo nao foi confirmado apos a tentativa de atualizacao.');
    }
    for (const mesRef of months.filter((month) => !mesesGerados.has(month))) {
      const result = await monthlyReleaseService.gerarEscalaSecao({
        lojaId, mesRef, escsecaoId, escfuncIds: [escfuncId],
        hojeIso: [todayIso(), vigencia].sort().at(-1),
        actor: { sub: transfer.USUARIO_ID, login: transfer.LOGIN }
      });
      if (!result.criada) throw new Error(result.motivo || `Escala ${mesRef} nao foi regerada.`);
      mesesGerados.add(mesRef);
      await updateTransfer(id,
        `update sgn_esc_transfer_sub set meses_gerados = :mesesGerados where transf_id = :id`,
        { mesesGerados: { val: JSON.stringify([...mesesGerados]), type: oracledb.CLOB } }
      );
    }
    await updateTransfer(id,
      `update sgn_esc_transfer_sub
          set status = 'C', dt_hr_aplic = sysdate, erro = null where transf_id = :id`
    );
    return { id, status: 'APLICADA', mesesGerados: [...mesesGerados] };
  } catch (error) {
    const failed = error.permanent || Number(transfer.TENTATIVAS) >= 5;
    await updateTransfer(id,
      `update sgn_esc_transfer_sub
          set status = :status, erro = :erro,
              dt_proxima = sysdate + 5/1440 where transf_id = :id`,
      { status: failed ? 'F' : 'P', erro: String(error.message || error).slice(0, 1000) }
    );
    return { id, status: failed ? 'FALHA' : 'PENDENTE', erro: error.message };
  }
}

async function processDue(limit = 20) {
  const results = [];
  for (let index = 0; index < limit; index += 1) {
    const id = await claimDue();
    if (!id) break;
    results.push(await processOne(id));
  }
  return results;
}

function startScheduler({ enabled = false, intervalMs = 60 * 1000 } = {}) {
  if (!enabled) return null;
  let running = false;
  const tick = async () => {
    if (running) return;
    running = true;
    try {
      const results = await processDue();
      if (results.length) console.log(JSON.stringify({ event: 'subsection_transfers', results }));
    } catch (error) {
      console.error(JSON.stringify({ event: 'subsection_transfers_failed', message: error.message }));
    } finally { running = false; }
  };
  const interval = setInterval(tick, intervalMs);
  tick();
  return interval;
}

module.exports = { todayIso, effectiveDate, agendar, listar, retryFailed, processDue, startScheduler,
  _private: { claimDue, processOne, listGeneratedMonths } };
