const catalogService = require('./catalogService');
const escalaService = require('./escalaService');

function formatDateValue(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(value || '').slice(0, 10);
}

function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthDays(mesRef) {
  const ref = new Date(`${formatDateValue(mesRef)}T00:00:00`);
  const days = [];
  const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= lastDay; day++) {
    days.push(new Date(ref.getFullYear(), ref.getMonth(), day));
  }
  return days;
}

function normalizeTime(value, fallback) {
  const text = String(value || '').trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback;
}

function findTurnoParaFuncionario(funcionario, turnos) {
  return (turnos || []).find((turno) => Number(turno.ESCSECAO_ID) === Number(funcionario.ESCSECAO_ID)) || null;
}

function buildFuncionarioRascunho(funcionario, turno, mesRef, hojeIso = formatDateValue(new Date())) {
  const hrEnt1 = normalizeTime(turno?.HR_ENT1 || funcionario.HR_ENT1, '08:00');
  const hrSai1 = normalizeTime(turno?.HR_SAI1 || funcionario.HR_SAI1, '12:00');
  const hrEnt2 = normalizeTime(turno?.HR_ENT2 || funcionario.HR_ENT2, '13:10');
  const hrSai2 = normalizeTime(turno?.HR_SAI2 || funcionario.HR_SAI2, '17:58');

  const dias = getMonthDays(mesRef)
    .map(formatDateValue)
    .filter((data) => data >= hojeIso)
    .map((data) => ({
      data,
      hrEnt1,
      hrSai1,
      hrEnt2,
      hrSai2,
      programacao: 'TRB',
      justificativa: 'Liberacao automatica mensal'
    }));

  return {
    escfuncId: Number(funcionario.ESCFUNC_ID),
    chapa: String(funcionario.CHAPA || ''),
    nome: funcionario.NOME,
    escsecaoId: Number(funcionario.ESCSECAO_ID),
    escfuncaoId: Number(funcionario.ESCFUNCAO_ID),
    escsecaoTurnoId: turno?.ESCSECAOTURNO_ID ? Number(turno.ESCSECAOTURNO_ID) : null,
    turnoOficial: {
      escsecaoTurnoId: turno?.ESCSECAOTURNO_ID ? Number(turno.ESCSECAOTURNO_ID) : null,
      hrEnt1,
      hrSai1,
      hrEnt2,
      hrSai2
    },
    dias
  };
}

async function escalaMensalJaExiste(lojaId, mesRef) {
  const existentes = await escalaService.listEscalasResumo({ lojaId, mesRef, lojasPermitidas: [lojaId] });
  return existentes.length > 0;
}

async function liberarEscalaLojaMes({ lojaId, mesRef, hojeIso = formatDateValue(new Date()) }) {
  if (await escalaMensalJaExiste(lojaId, mesRef)) {
    return { lojaId, mesRef, criada: false, motivo: 'Escala mensal ja existente.' };
  }

  const [funcionarios, turnos] = await Promise.all([
    catalogService.listFuncionariosByLoja(lojaId),
    catalogService.listTurnosByLoja(lojaId)
  ]);

  const funcionariosPayload = (funcionarios || [])
    .map((funcionario) => buildFuncionarioRascunho(funcionario, findTurnoParaFuncionario(funcionario, turnos), mesRef, hojeIso))
    .filter((funcionario) => funcionario.escfuncId && funcionario.chapa && funcionario.dias.length > 0);

  if (!funcionariosPayload.length) {
    return { lojaId, mesRef, criada: false, motivo: 'Nenhum funcionario apto para liberacao.' };
  }

  const saved = await escalaService.saveEscalasBatch({
    lojaId,
    mesRef,
    funcionarios: funcionariosPayload,
    oficializada: 0
  });

  return {
    lojaId,
    mesRef,
    criada: true,
    funcionarios: saved.length
  };
}

async function liberarEscalasMensais({ mesRef = formatDateValue(getMonthStart()), lojas = null, hojeIso = formatDateValue(new Date()) } = {}) {
  const lojasBase = lojas || (await catalogService.listLojas()).map((loja) => Number(loja.LOJA)).filter(Boolean);
  const resultados = [];
  for (const lojaId of [...new Set(lojasBase.map(Number).filter(Boolean))]) {
    try {
      resultados.push(await liberarEscalaLojaMes({ lojaId, mesRef, hojeIso }));
    } catch (error) {
      resultados.push({
        lojaId,
        mesRef,
        criada: false,
        erro: error.message
      });
    }
  }
  return resultados;
}

function startMonthlyReleaseScheduler(env) {
  if (!env?.scheduler?.monthlyReleaseEnabled) return null;

  let running = false;
  let lastRunKey = '';
  const tick = async () => {
    const now = new Date();
    const shouldRun = now.getDate() === env.scheduler.monthlyReleaseDay
      && now.getHours() === env.scheduler.monthlyReleaseHour
      && now.getMinutes() === env.scheduler.monthlyReleaseMinute;
    const runKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
    if (!shouldRun || running || lastRunKey === runKey) return;

    running = true;
    lastRunKey = runKey;
    try {
      const resultados = await liberarEscalasMensais();
      console.log(JSON.stringify({ event: 'monthly_release_finished', resultados }));
    } catch (error) {
      console.error(JSON.stringify({ event: 'monthly_release_failed', message: error.message }));
    } finally {
      running = false;
    }
  };

  const interval = setInterval(tick, env.scheduler.monthlyReleaseIntervalMs);
  tick();
  return interval;
}

module.exports = {
  buildFuncionarioRascunho,
  liberarEscalaLojaMes,
  liberarEscalasMensais,
  startMonthlyReleaseScheduler
};
