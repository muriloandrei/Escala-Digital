const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const escalaEventService = require('../src/services/escalaEventService');
const { START, END, planDecemberTransfer } = require('../src/domain/decemberTransfer');

const NOVEMBER = '2026-11-01';
const DECEMBER = '2026-12-01';
const options = { outFormat: oracledb.OUT_FORMAT_OBJECT };

function parseArgs(args) {
  const store = args.find((arg) => /^--loja=[1-9]\d*$/.test(arg));
  const all = args.includes('--all');
  const apply = args.includes('--apply');
  const by = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  if (Boolean(store) === all || (apply && !by) || (!apply && by)
    || args.length !== 1 + Number(apply) + Number(Boolean(by))) {
    throw new Error('Use --loja=NUMERO ou --all [--apply --by=OPERADOR].');
  }
  return { loja: store ? Number(store.slice(7)) : null, all, apply, by: by?.slice(5) || null };
}

function groupHeaders(rows) {
  const headers = new Map();
  for (const row of rows || []) {
    const id = Number(row.ESCPROG_ID);
    if (!headers.has(id)) headers.set(id, { id, revision: Number(row.REVISAO),
      officialized: Number(row.OFICIALIZADA) === 1, sectionId: Number(row.ESCSECAO_ID), days: [] });
    if (row.DT) headers.get(id).days.push({
      DT: row.DT, PROGRAMACAO: row.PROGRAMACAO,
      HR_ENT1: row.HR_ENT1, HR_SAI1: row.HR_SAI1,
      HR_ENT2: row.HR_ENT2, HR_SAI2: row.HR_SAI2
    });
  }
  return [...headers.values()];
}

async function loadMonth(connection, loja, escfuncId, mesRef) {
  const result = await connection.execute(
    `select p.escprog_id, p.revisao, p.oficializada, p.escsecao_id,
            to_char(d.dt, 'YYYY-MM-DD') dt, d.programacao,
            d.hr_ent1, d.hr_sai1, d.hr_ent2, d.hr_sai2
       from sgn_esc_prog p
       left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
      where p.loja = :loja and p.escfunc_id = :escfuncId
        and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD') and nvl(p.ativa, 1) = 1
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
          where px.loja = p.loja and px.escfunc_id = p.escfunc_id
            and px.mes_ref = p.mes_ref and nvl(px.ativa, 1) = 1)
      order by p.escprog_id, d.dt`,
    { loja, escfuncId, mesRef }, options
  );
  return groupHeaders(result.rows);
}

async function loadFixes(connection, loja, escfuncId, mesRef) {
  const result = await connection.execute(
    `select escfixo_id, escsecao_id, to_char(dt, 'YYYY-MM-DD') dt,
            programacao, hr_ent1, hr_sai1, hr_ent2, hr_sai2, justificativa
       from sgn_esc_fixo_escala
      where loja = :loja and escfunc_id = :escfuncId
        and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
        and dt between date '2026-11-30' and date '2026-12-06'
        and nvl(status, 'A') = 'A'
      order by dt`, { loja, escfuncId, mesRef }, options
  );
  return result.rows || [];
}

async function loadPlan(connection, loja, escfuncId) {
  const november = await loadMonth(connection, loja, escfuncId, NOVEMBER);
  const december = await loadMonth(connection, loja, escfuncId, DECEMBER);
  const novemberFixes = await loadFixes(connection, loja, escfuncId, NOVEMBER);
  const decemberFixes = await loadFixes(connection, loja, escfuncId, DECEMBER);
  const plan = planDecemberTransfer({ november, december, novemberFixes, decemberFixes });
  if (plan.action === 'TRANSFER' && (!november.length || !november[0].days.some((day) => day.DT < START))) {
    return { plan: { action: 'BLOCKED', reason: 'Novembro sem dias anteriores a dezembro; revisar individualmente.' } };
  }
  return { plan, november, december, novemberFixes, decemberFixes };
}

async function nextRevision(connection, loja, escfuncId, mesRef) {
  const result = await connection.execute(
    `select nvl(max(revisao), -1) + 1 revisao from sgn_esc_prog
      where loja = :loja and escfunc_id = :escfuncId
        and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')`,
    { loja, escfuncId, mesRef }, options
  );
  return Number(result.rows[0].REVISAO);
}

async function copyHeader(connection, sourceId, revision) {
  const sequence = await connection.execute('select sgn_esc_prog_seq.nextval id from dual', {}, options);
  const id = Number(sequence.rows[0].ID);
  await connection.execute(
    `insert into sgn_esc_prog (escprog_id, mes_ref, escfunc_id, escsecao_id, escfuncao_id,
      loja, chapa, escsecaoturno_id, hr_oficial_ent1, hr_oficial_sai1,
      hr_oficial_ent2, hr_oficial_sai2, revisao, oficializada, ativa, dt_hr_incl)
     select :id, mes_ref, escfunc_id, escsecao_id, escfuncao_id,
            loja, chapa, escsecaoturno_id, hr_oficial_ent1, hr_oficial_sai1,
            hr_oficial_ent2, hr_oficial_sai2, :revision, 0, 1, sysdate
       from sgn_esc_prog where escprog_id = :sourceId`,
    { id, revision, sourceId }, { autoCommit: false }
  );
  return id;
}

async function applyEmployee(connection, { loja, escfuncId, by, current }) {
  await connection.execute(
    'select escfunc_id from sgn_esc_funcionario where loja = :loja and escfunc_id = :escfuncId for update wait 5',
    { loja, escfuncId }, options
  );
  const reloaded = await loadPlan(connection, loja, escfuncId);
  if (JSON.stringify(reloaded) !== JSON.stringify(current)) {
    throw new Error('Escala mudou desde a previa; execute novamente.');
  }
  const oldNov = current.november[0];
  const oldDec = current.december[0];
  const novRevision = await nextRevision(connection, loja, escfuncId, NOVEMBER);
  const decRevision = await nextRevision(connection, loja, escfuncId, DECEMBER);
  const novNew = await copyHeader(connection, oldNov.id, novRevision);
  const decNew = await copyHeader(connection, oldDec.id, decRevision);
  await connection.execute(
    `insert into sgn_esc_prog_dia (escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao)
     select sgn_esc_prog_dia_seq.nextval, :newId, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
       from sgn_esc_prog_dia where escprog_id = :oldId and dt < date '2026-11-30'`,
    { newId: novNew, oldId: oldNov.id }, { autoCommit: false }
  );
  await connection.execute(
    `insert into sgn_esc_prog_dia (escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao)
     select sgn_esc_prog_dia_seq.nextval, :newId, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao
       from sgn_esc_prog_dia where escprog_id = :oldId`,
    { newId: decNew, oldId: oldDec.id }, { autoCommit: false }
  );
  await connection.execute(
    `insert into sgn_esc_prog_dia (escprogdia_id, escprog_id, dt, hr_ent1, hr_sai1, hr_ent2, hr_sai2, programacao)
     select sgn_esc_prog_dia_seq.nextval, :newId, d.dt, d.hr_ent1, d.hr_sai1, d.hr_ent2, d.hr_sai2, d.programacao
       from sgn_esc_prog_dia d
      where d.escprog_id = :oldNov and d.dt between date '2026-11-30' and date '2026-12-06'
        and not exists (select 1 from sgn_esc_prog_dia x where x.escprog_id = :newId and x.dt = d.dt)`,
    { newId: decNew, oldNov: oldNov.id }, { autoCommit: false }
  );
  await connection.execute(
    `update sgn_esc_prog p set ativa = 0
      where p.loja = :loja and p.escfunc_id = :escfuncId
        and p.mes_ref = date '2026-11-01' and nvl(p.ativa, 1) = 1
        and p.escprog_id <> :novNew
        and exists (select 1 from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id
          and d.dt between date '2026-11-30' and date '2026-12-06')`,
    { loja, escfuncId, novNew }, { autoCommit: false }
  );
  await connection.execute('update sgn_esc_prog set ativa = 0 where escprog_id = :oldDec',
    { oldDec: oldDec.id }, { autoCommit: false });
  for (const fix of current.novemberFixes) {
    if (!current.decemberFixes.some((item) => item.DT === fix.DT)) {
      await connection.execute(
        `insert into sgn_esc_fixo_escala (escfixo_id, loja, mes_ref, escfunc_id, escsecao_id, dt,
          programacao, hr_ent1, hr_sai1, hr_ent2, hr_sai2, justificativa, status, dt_hr_incl)
         select sgn_esc_fixo_escala_seq.nextval, loja, date '2026-12-01', escfunc_id, escsecao_id,
                dt, programacao, hr_ent1, hr_sai1, hr_ent2, hr_sai2, justificativa, 'A', sysdate
           from sgn_esc_fixo_escala where escfixo_id = :id`,
        { id: fix.ESCFIXO_ID }, { autoCommit: false }
      );
    }
    await connection.execute('update sgn_esc_fixo_escala set status = :status where escfixo_id = :id',
      { status: 'I', id: fix.ESCFIXO_ID }, { autoCommit: false });
  }
  await connection.execute(
    `update sgn_esc_rm_envio set status = 'SUPERADO',
       erro = 'Transferencia de 30/11-06/12 para dezembro; nova oficializacao necessaria.', dt_hr_alter = sysdate
      where loja = :loja and escfunc_id = :escfuncId
        and mes_ref in (date '2026-11-01', date '2026-12-01') and status = 'PENDENTE'`,
    { loja, escfuncId }, { autoCommit: false }
  );
  const operationId = escalaEventService.createOperationId();
  for (const [mesRef, oldHeader, newRevision] of [
    [NOVEMBER, oldNov, novRevision], [DECEMBER, oldDec, decRevision]
  ]) {
    await escalaEventService.appendEvent(connection, {
      operacaoId: operationId, lojaId: loja, mesRef, escfuncId,
      escsecaoId: oldHeader.sectionId, actor: { login: by },
      acao: 'TRANSFERIR_DIAS_DEZEMBRO_2026', origem: 'SISTEMA',
      situacao: oldHeader.officialized ? 'POS_OFICIALIZACAO' : 'RASCUNHO',
      revisaoAnterior: oldHeader.revision, revisaoNova: newRevision,
      detalhe: { intervalo: [START, END], destino: DECEMBER, dias: current.plan.sourceDays,
        fixos: current.plan.fixes, origemId: oldHeader.id }
    });
  }
  await connection.commit();
  return { novRevision, decRevision };
}

async function candidateStores(connection) {
  const result = await connection.execute(
    `select distinct loja from (
       select loja from sgn_esc_prog where mes_ref = date '2026-11-01'
       union all
       select loja from sgn_esc_fixo_escala
        where mes_ref = date '2026-11-01' and nvl(status, 'A') = 'A'
          and dt between date '2026-11-30' and date '2026-12-06'
     ) order by loja`, {}, options
  );
  return result.rows.map((row) => Number(row.LOJA));
}

async function candidateEmployees(connection, loja) {
  const result = await connection.execute(
    `select distinct escfunc_id from (
       select p.escfunc_id from sgn_esc_prog p
       join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
       where p.loja = :loja and p.mes_ref = date '2026-11-01'
         and nvl(p.ativa, 1) = 1 and d.dt between date '2026-11-30' and date '2026-12-06'
         and p.revisao = (select max(px.revisao) from sgn_esc_prog px
           where px.loja = p.loja and px.escfunc_id = p.escfunc_id
             and px.mes_ref = p.mes_ref and nvl(px.ativa, 1) = 1)
       union all
       select f.escfunc_id from sgn_esc_fixo_escala f
       where f.loja = :loja and f.mes_ref = date '2026-11-01'
         and nvl(f.status, 'A') = 'A' and f.dt between date '2026-11-30' and date '2026-12-06'
     ) order by escfunc_id`, { loja }, options
  );
  return result.rows.map((row) => Number(row.ESCFUNC_ID));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const stores = args.all ? await withConnection(candidateStores) : [args.loja];
    let blocked = 0;
    let transferred = 0;
    for (const loja of stores) {
      const ids = await withConnection((connection) => candidateEmployees(connection, loja));
      let plannedStore = 0;
      let blockedStore = 0;
      let transferredStore = 0;
      for (const escfuncId of ids) {
        const current = await withConnection((connection) => loadPlan(connection, loja, escfuncId));
        const info = { loja, escfuncId, ...current.plan };
        if (current.plan.action === 'BLOCKED') { blocked += 1; blockedStore += 1; }
        if (current.plan.action !== 'TRANSFER') { if (!args.all || current.plan.action === 'BLOCKED') console.log(JSON.stringify(info)); continue; }
        plannedStore += 1;
        if (args.apply) {
          try {
            info.result = await withConnection(async (connection) => {
              try { return await applyEmployee(connection, { loja, escfuncId, by: args.by, current }); }
              catch (error) { await connection.rollback(); throw error; }
            });
            transferred += 1;
            transferredStore += 1;
          } catch (error) {
            blocked += 1;
            blockedStore += 1;
            info.action = 'BLOCKED'; info.reason = error.message;
          }
        }
        if (!args.all || info.action === 'BLOCKED') console.log(JSON.stringify(info));
      }
      console.log(JSON.stringify({ loja, candidates: ids.length, planned: plannedStore,
        transferred: transferredStore, blocked: blockedStore }));
    }
    if (blocked) process.exitCode = 1;
  } finally { await closeOraclePool(); }
}

if (require.main === module) main().catch((error) => {
  console.error(`Transferencia interrompida: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, groupHeaders, loadPlan, candidateEmployees };
