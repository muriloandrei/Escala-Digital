const catalogService = require('./catalogService');
const escalaService = require('./escalaService');
const { validateEscalaPayload } = require('../rules/escalaRules');

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
  const turnosSecao = (turnos || []).filter((turno) => Number(turno.ESCSECAO_ID) === Number(funcionario.ESCSECAO_ID));
  const horarioFuncionario = getHorarioSignature(funcionario);
  return turnosSecao.find((turno) => getHorarioSignature(turno) === horarioFuncionario) || turnosSecao[0] || null;
}

function getCycleIndex(date, seed = 0) {
  const anchorMonday = Date.UTC(2026, 0, 5);
  const current = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const days = Math.floor((current - anchorMonday) / 86400000);
  return ((days + seed) % 14 + 14) % 14;
}

function getHorarioSignature(source) {
  return [source?.HR_ENT1, source?.HR_SAI1, source?.HR_ENT2, source?.HR_SAI2]
    .map((value) => String(value || '').trim())
    .join('|');
}

function hasMaxConsecutiveWorkCircular(folgas, maxDias = 5) {
  let consecutivos = 0;
  for (let index = 0; index < 28; index += 1) {
    const diaCiclo = index % 14;
    if (folgas.has(diaCiclo)) {
      consecutivos = 0;
      continue;
    }
    consecutivos += 1;
    if (consecutivos > maxDias) return false;
  }
  return true;
}

let padroesFolgaCache = null;
function getPadroesFolgaValidos() {
  if (padroesFolgaCache) return padroesFolgaCache;
  const padroes = [];
  for (let a = 0; a < 11; a += 1) {
    for (let b = a + 1; b < 12; b += 1) {
      for (let c = b + 1; c < 13; c += 1) {
        for (let d = c + 1; d < 14; d += 1) {
          const folgas = new Set([a, b, c, d]);
          const domingosFolga = (folgas.has(6) ? 1 : 0) + (folgas.has(13) ? 1 : 0);
          if (domingosFolga !== 1) continue;
          if (!hasMaxConsecutiveWorkCircular(folgas, 5)) continue;
          padroes.push([a, b, c, d]);
        }
      }
    }
  }
  padroesFolgaCache = padroes.sort((left, right) => {
    const leftWeekend = left.filter((day) => [5, 6, 12, 13].includes(day)).length;
    const rightWeekend = right.filter((day) => [5, 6, 12, 13].includes(day)).length;
    return rightWeekend - leftWeekend || left.join('-').localeCompare(right.join('-'));
  });
  return padroesFolgaCache;
}

function getPadraoFolgaPorIndice(index = 0) {
  const padroes = getPadroesFolgaValidos();
  return padroes[Number(index || 0) % padroes.length] || [0, 1, 6, 8];
}

function isFolgaAutomatica(date, funcionarioIndex = 0) {
  const pattern = getPadraoFolgaPorIndice(funcionarioIndex);
  return pattern.includes(getCycleIndex(date));
}

function buildFuncionarioRascunho(funcionario, turno, mesRef, hojeIso = formatDateValue(new Date()), funcionarioIndex = 0, padraoFolga = null) {
  const hrEnt1 = normalizeTime(turno?.HR_ENT1 || funcionario.HR_ENT1, '08:00');
  const hrSai1 = normalizeTime(turno?.HR_SAI1 || funcionario.HR_SAI1, '12:00');
  const hrEnt2 = normalizeTime(turno?.HR_ENT2 || funcionario.HR_ENT2, '13:10');
  const hrSai2 = normalizeTime(turno?.HR_SAI2 || funcionario.HR_SAI2, '17:58');
  const folgasCiclo = new Set(padraoFolga || getPadraoFolgaPorIndice(funcionarioIndex));

  const dias = getMonthDays(mesRef)
    .filter((date) => formatDateValue(date) >= hojeIso)
    .map((date) => {
      const data = formatDateValue(date);
      const folga = folgasCiclo.has(getCycleIndex(date));
      return {
        data,
        hrEnt1: folga ? 'F' : hrEnt1,
        hrSai1: folga ? 'F' : hrSai1,
        hrEnt2: folga ? 'F' : hrEnt2,
        hrSai2: folga ? 'F' : hrSai2,
        programacao: folga ? 'F' : 'TRB',
        justificativa: folga ? 'Folga 5x2 automatica' : 'Liberacao automatica mensal'
      };
    });

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

function getGrupoOperacionalKey(funcionario, turno) {
  return [
    Number(funcionario.ESCSECAO_ID || 0),
    turno?.ESCSECAOTURNO_ID ? `turno:${turno.ESCSECAOTURNO_ID}` : getHorarioSignature(turno || funcionario)
  ].join('|');
}

function escolherPadraoBalanceado({ funcionario, turno, mesRef, hojeIso, indiceGrupo, diasMes, contagemFolgas }) {
  const padroes = getPadroesFolgaValidos();
  let melhor = null;
  padroes.forEach((padrao, padraoIndex) => {
    const rascunho = buildFuncionarioRascunho(funcionario, turno, mesRef, hojeIso, indiceGrupo, padrao);
    const errors = validateEscalaPayload({
      lojaId: Number(funcionario.LOJA || 0) || 1,
      mesRef,
      funcionarios: [rascunho]
    });
    const folgas = diasMes
      .map((date) => formatDateValue(date))
      .filter((data) => data >= hojeIso)
      .filter((data, index) => rascunho.dias[index]?.programacao === 'F');
    const projetada = new Map(contagemFolgas);
    folgas.forEach((data) => projetada.set(data, (projetada.get(data) || 0) + 1));
    const maxFolgasDia = Math.max(...[...projetada.values(), 0]);
    const somaQuadrados = [...projetada.values()].reduce((acc, value) => acc + (value * value), 0);
    const desempate = Math.abs(padraoIndex - (indiceGrupo % padroes.length));
    const score = (errors.length * 100000) + (maxFolgasDia * 1000) + somaQuadrados + (desempate / 1000);
    if (!melhor || score < melhor.score) melhor = { padrao, folgas, score };
  });
  return melhor || { padrao: getPadraoFolgaPorIndice(indiceGrupo), folgas: [] };
}

function buildFuncionariosRascunhoBalanceado(funcionarios, turnos, mesRef, hojeIso = formatDateValue(new Date())) {
  const grupos = new Map();
  (funcionarios || []).forEach((funcionario) => {
    const turno = findTurnoParaFuncionario(funcionario, turnos);
    const key = getGrupoOperacionalKey(funcionario, turno);
    if (!grupos.has(key)) grupos.set(key, []);
    grupos.get(key).push({ funcionario, turno });
  });

  const diasMes = getMonthDays(mesRef);
  const payload = [];
  [...grupos.values()].forEach((grupo) => {
    const contagemFolgas = new Map(diasMes.map((date) => [formatDateValue(date), 0]));
    grupo
      .sort((left, right) => String(left.funcionario.NOME || '').localeCompare(String(right.funcionario.NOME || '')) || String(left.funcionario.CHAPA || '').localeCompare(String(right.funcionario.CHAPA || '')))
      .forEach(({ funcionario, turno }, indiceGrupo) => {
        const escolhido = escolherPadraoBalanceado({ funcionario, turno, mesRef, hojeIso, indiceGrupo, diasMes, contagemFolgas });
        escolhido.folgas.forEach((data) => contagemFolgas.set(data, (contagemFolgas.get(data) || 0) + 1));
        payload.push(buildFuncionarioRascunho(funcionario, turno, mesRef, hojeIso, indiceGrupo, escolhido.padrao));
      });
  });
  return payload;
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

  const funcionariosPayload = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, mesRef, hojeIso)
    .filter((funcionario) => funcionario.escfuncId && funcionario.chapa && funcionario.dias.length > 0);

  if (!funcionariosPayload.length) {
    return { lojaId, mesRef, criada: false, motivo: 'Nenhum funcionario apto para liberacao.' };
  }

  const ruleErrors = validateEscalaPayload({ lojaId, mesRef, funcionarios: funcionariosPayload });
  if (ruleErrors.length) {
    return {
      lojaId,
      mesRef,
      criada: false,
      motivo: 'Distribuicao automatica gerou criticas e nao foi gravada.',
      criticas: ruleErrors.slice(0, 20)
    };
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
  buildFuncionariosRascunhoBalanceado,
  getPadroesFolgaValidos,
  isFolgaAutomatica,
  liberarEscalaLojaMes,
  liberarEscalasMensais,
  startMonthlyReleaseScheduler
};
