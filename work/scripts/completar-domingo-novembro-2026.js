const { withConnection, closeOraclePool, oracledb } = require('../src/db/oracle');
const escalaService = require('../src/services/escalaService');
const { permiteEscala } = require('../src/domain/employeeStatus');
const { validateEscalaPayload } = require('../src/rules/escalaRules');

const MES_REF = '2026-11-01';
const PRIMEIRO_DIA = '2026-11-01';
const DOMINGO_SEGUINTE = '2026-11-08';

function parseArgs(args) {
  const lojaArg = args.find((arg) => /^--loja=[1-9]\d*$/.test(arg));
  const all = args.includes('--all');
  const apply = args.includes('--apply');
  const actorArg = args.find((arg) => /^--by=[\w.@-]{2,80}$/.test(arg));
  const includeOfficialized = args.includes('--include-officialized');
  const onlyAbsences = args.includes('--only-absences');
  const valid = args.length === (1 + Number(apply) + Number(Boolean(actorArg)) + Number(includeOfficialized) + Number(onlyAbsences))
    && Boolean(lojaArg) !== all && (!lojaArg || Number.isSafeInteger(Number(lojaArg.slice(7))))
    && (!apply || actorArg) && (apply || !actorArg);
  if (!valid) throw new Error('Use --loja=NUMERO ou --all [--only-absences] [--include-officialized] [--apply --by=OPERADOR].');
  return { loja: lojaArg ? Number(lojaArg.slice(7)) : null, all,
    apply, actor: actorArg?.slice(5) || null, includeOfficialized, onlyAbsences };
}

function dayFromRow(row) {
  return {
    data: row.DT,
    hrEnt1: row.HR_ENT1,
    hrSai1: row.HR_SAI1,
    hrEnt2: row.HR_ENT2,
    hrSai2: row.HR_SAI2,
    programacao: row.PROGRAMACAO
  };
}

function planEmployee(rows, { includeOfficialized = false, onlyAbsences = false,
  todayIso = new Date().toISOString().slice(0, 10) } = {}) {
  const head = rows[0];
  const reason = (motivo) => ({ escfuncId: Number(head.ESCFUNC_ID), chapa: head.CHAPA, acao: 'BLOQUEADA', motivo });
  if (rows.some((row) => Number(row.ESCPROG_ID) !== Number(head.ESCPROG_ID))) return reason('Mais de uma programacao ativa na revisao atual.');
  const days = rows.filter((row) => row.DT).map(dayFromRow).sort((a, b) => a.data.localeCompare(b.data));
  if (days.some((day) => day.data === PRIMEIRO_DIA)) {
    return { escfuncId: Number(head.ESCFUNC_ID), chapa: head.CHAPA, acao: 'JA_PRESENTE' };
  }
  if (onlyAbsences && !head.AUSENCIA_01) {
    return { escfuncId: Number(head.ESCFUNC_ID), chapa: head.CHAPA, acao: 'IGNORADA' };
  }
  if (todayIso > PRIMEIRO_DIA && (!onlyAbsences || !head.AUSENCIA_01)) {
    return reason('01/11 ja passou; ajuste historico de ausencia exige --only-absences.');
  }
  if (Number(head.OFICIALIZADA) === 1 && !includeOfficialized) return reason('Escala oficializada; use --include-officialized apos aprovar nova revisao pendente.');
  if (!permiteEscala(head.FUNCIONARIO_STATUS) || (head.DT_DEMISS && head.DT_DEMISS < PRIMEIRO_DIA)) {
    return reason('Funcionario inativo ou desligado antes de 01/11.');
  }
  if (Number(head.SUSPENSAO_01)) return reason('Suspensao em 01/11 requer revisao individual.');
  if (Number(head.FIXO_01) && !head.AUSENCIA_01) {
    return reason('Dia fixo em 01/11 requer revisao individual.');
  }
  if (Number(head.OUTUBRO_OFICIAL_01)) return reason('01/11 ja foi oficializado na escala de outubro.');
  const nextSunday = days.find((day) => day.data === DOMINGO_SEGUINTE);
  if (!head.AUSENCIA_01 && (!nextSunday || !['F', 'TRB'].includes(nextSunday.programacao))) {
    return reason('Domingo 08/11 sem folga ou trabalho definido.');
  }
  const programacao = head.AUSENCIA_01 ||
    (nextSunday.programacao === 'TRB' || Number(head.OUTUBRO_25_TRB) ? 'F' : 'TRB');
  const shift = days.find((day) => day.programacao === 'TRB'
    && [day.hrEnt1, day.hrSai1, day.hrEnt2, day.hrSai2].every((value) => /^\d{2}:\d{2}$/.test(String(value || ''))));
  if (programacao === 'TRB' && !shift) return reason('Horario de trabalho valido nao encontrado para 01/11.');
  const first = programacao !== 'TRB'
    ? { data: PRIMEIRO_DIA, hrEnt1: programacao, hrSai1: programacao,
      hrEnt2: programacao, hrSai2: programacao, programacao }
    : { ...shift, data: PRIMEIRO_DIA };
  const originalErrors = new Set(validateEscalaPayload({ lojaId: head.LOJA, mesRef: MES_REF, funcionarios: [{ nome: head.NOME, dias: days }] }));
  const payload = {
    escfuncId: Number(head.ESCFUNC_ID), escsecaoId: Number(head.ESCSECAO_ID),
    escfuncaoId: Number(head.ESCFUNCAO_ID), chapa: head.CHAPA, nome: head.NOME,
    revisaoBase: Number(head.REVISAO), dias: [first, ...days]
  };
  const newErrors = validateEscalaPayload({ lojaId: head.LOJA, mesRef: MES_REF, funcionarios: [payload] })
    .filter((error) => !originalErrors.has(error));
  if (newErrors.length) return reason(`A programacao proposta criou criticas: ${newErrors.slice(0, 2).join(' ')}`);
  return { escfuncId: payload.escfuncId, chapa: payload.chapa, acao: 'COMPLETAR',
    programacao, revisaoAtual: payload.revisaoBase, oficializada: Number(head.OFICIALIZADA) === 1,
    payload };
}

async function loadRows(connection, loja) {
  const result = await connection.execute(
    `select p.escprog_id, p.escfunc_id, p.escsecao_id, p.escfuncao_id,
            p.loja, p.chapa, p.revisao, p.oficializada, f.nome,
            f.status as funcionario_status, to_char(f.dt_demiss, 'YYYY-MM-DD') as dt_demiss,
            to_char(d.dt, 'YYYY-MM-DD') as dt, d.hr_ent1, d.hr_sai1, d.hr_ent2, d.hr_sai2, d.programacao,
            case when exists (select 1 from sgn_esc_ausencia a where a.escfunc_id = p.escfunc_id
              and date '2026-11-01' between trunc(a.dt_inic) and trunc(nvl(a.dt_fim, date '2099-12-31'))
              and upper(a.id_erp) = 'FER') then 'FER'
              when exists (select 1 from sgn_esc_ausencia a where a.escfunc_id = p.escfunc_id
              and date '2026-11-01' between trunc(a.dt_inic) and trunc(nvl(a.dt_fim, date '2099-12-31')))
              then 'AFA' else null end as ausencia_01,
            case when exists (select 1 from sgn_esc_pendencia_func sp where sp.escfunc_id = p.escfunc_id
              and sp.loja = p.loja and sp.status = 'P' and sp.dt_inicio <= date '2026-11-01'
              and (sp.dt_fim is null or sp.dt_fim >= date '2026-11-01')) then 1 else 0 end as suspensao_01,
            case when exists (select 1 from sgn_esc_fixo_escala fx where fx.escfunc_id = p.escfunc_id
              and fx.loja = p.loja and fx.mes_ref = p.mes_ref and fx.dt = date '2026-11-01'
              and nvl(fx.status, 'A') = 'A') then 1 else 0 end as fixo_01,
            case when exists (select 1 from sgn_esc_prog po join sgn_esc_prog_dia dia_out on dia_out.escprog_id = po.escprog_id
              where po.escfunc_id = p.escfunc_id and po.loja = p.loja
                and po.mes_ref = date '2026-10-01' and po.oficializada = 1
                and nvl(po.ativa, 1) = 1 and dia_out.dt = date '2026-11-01') then 1 else 0 end as outubro_oficial_01,
            case when exists (select 1 from sgn_esc_prog po join sgn_esc_prog_dia dia_out on dia_out.escprog_id = po.escprog_id
              where po.escfunc_id = p.escfunc_id and po.loja = p.loja and po.mes_ref = date '2026-10-01'
                and nvl(po.ativa, 1) = 1 and po.revisao = (select max(po2.revisao) from sgn_esc_prog po2
                  where po2.escfunc_id = po.escfunc_id and po2.loja = po.loja
                    and po2.mes_ref = po.mes_ref and nvl(po2.ativa, 1) = 1)
                and dia_out.dt = date '2026-10-25' and dia_out.programacao = 'TRB')
              then 1 else 0 end as outubro_25_trb
       from sgn_esc_prog p
       join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
       left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
      where p.loja = :loja and p.mes_ref = date '2026-11-01' and nvl(p.ativa, 1) = 1
        and p.revisao = (select max(px.revisao) from sgn_esc_prog px
          where px.loja = p.loja and px.mes_ref = p.mes_ref
            and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1)
      order by p.escfunc_id, d.dt`,
    { loja }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const grouped = new Map();
  for (const row of result.rows || []) {
    if (!grouped.has(Number(row.ESCFUNC_ID))) grouped.set(Number(row.ESCFUNC_ID), []);
    grouped.get(Number(row.ESCFUNC_ID)).push(row);
  }
  return [...grouped.values()];
}

async function loadStores(connection) {
  const result = await connection.execute(
    `select distinct loja from sgn_esc_prog
      where mes_ref = date '2026-11-01' and nvl(ativa, 1) = 1
      order by loja`, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return (result.rows || []).map((row) => Number(row.LOJA));
}

async function processStore(args, loja, todayIso) {
  const groups = await withConnection((connection) => loadRows(connection, loja));
  const plans = groups.map((rows) => planEmployee(rows, { includeOfficialized: args.includeOfficialized,
    onlyAbsences: args.onlyAbsences, todayIso }));
  const candidatos = plans.filter((item) => item.acao === 'COMPLETAR');
  const bloqueados = plans.filter((item) => item.acao === 'BLOQUEADA');
  const jaPresentes = plans.filter((item) => item.acao === 'JA_PRESENTE').length;
  const ignorados = plans.filter((item) => item.acao === 'IGNORADA').length;
  console.log(JSON.stringify({ modo: args.apply ? 'APLICACAO' : 'PREVIA', loja,
    mesRef: MES_REF, candidatos: candidatos.length, bloqueados: bloqueados.length,
    jaPresentes, ignorados, detalhes: args.all ? bloqueados : plans.map(({ payload, ...item }) => item) }, null, 2));
  let aplicadas = 0;
  let falhas = 0;
  if (args.apply) {
    for (const plan of candidatos) {
      try {
        await escalaService.completarDomingoNovembro2026({ lojaId: loja, mesRef: MES_REF,
          funcionarios: [plan.payload], oficializada: 0, actor: { login: args.actor },
          acao: 'COMPLETAR_DOMINGO_NOVEMBRO_2026' });
        aplicadas += 1;
        if (!args.all) console.log(`COMPLETADA chapa=${plan.chapa} dia=${PRIMEIRO_DIA} programacao=${plan.programacao}`);
      } catch (error) {
        falhas += 1;
        console.error(`FALHA loja=${loja} chapa=${plan.chapa}: ${error.message}`);
      }
    }
    console.log(`Loja ${loja}: ${aplicadas} aplicada(s), ${bloqueados.length} bloqueada(s), ${falhas} falha(s).`);
  }
  return { loja, candidatos: candidatos.length, bloqueados: bloqueados.length,
    jaPresentes, ignorados, aplicadas, falhas };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const localDate = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const todayIso = `${localDate.year}-${localDate.month}-${localDate.day}`;
    const stores = args.all ? await withConnection(loadStores) : [args.loja];
    const results = [];
    for (const loja of stores) {
      try {
        results.push(await processStore(args, loja, todayIso));
      } catch (error) {
        results.push({ loja, candidatos: 0, bloqueados: 0, jaPresentes: 0, ignorados: 0, aplicadas: 0, falhas: 1 });
        console.error(`FALHA loja=${loja}: ${error.message}`);
      }
    }
    const total = (key) => results.reduce((sum, item) => sum + item[key], 0);
    console.log(`Resumo geral: ${stores.length} loja(s), ${total('candidatos')} candidata(s), ` +
      `${total('aplicadas')} aplicada(s), ${total('ignorados')} ignorada(s), ` +
      `${total('bloqueados')} bloqueada(s), ${total('falhas')} falha(s).`);
    if (total('falhas') || (args.apply && total('bloqueados'))) process.exitCode = 1;
  } finally {
    await closeOraclePool();
  }
}

if (require.main === module) main().catch((error) => {
  console.error(`Correcao interrompida: ${error.message}`);
  process.exitCode = 1;
});

module.exports = { parseArgs, planEmployee, loadStores };
