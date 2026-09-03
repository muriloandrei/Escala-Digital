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

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
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

function getMonthEndIso(mesRef) {
  const ref = new Date(`${formatDateValue(mesRef)}T00:00:00`);
  return formatDateValue(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));
}

function normalizeTime(value, fallback) {
  const text = String(value || '').trim();
  return /^\d{2}:\d{2}$/.test(text) ? text : fallback;
}

function normalizarAusenciaSigla(motivo) {
  const text = String(motivo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (text === 'fer' || text.includes('ferias')) return 'FER';
  if (text === 'afa' || text.includes('afast')) return 'AFA';
  return 'F';
}

function getAusenciaMotivo(ausencia = {}) {
  return pick(ausencia, 'MOTIVO', 'motivo', 'SIGLA', 'sigla', 'TIPO', 'tipo', 'DESCR', 'descr', 'CLASSIFICACAO', 'classificacao') || '';
}

function ausenciaCobreDia(ausencia, dataIso) {
  const inicio = formatDateValue(ausencia?.DT_INIC || ausencia?.dt_inic);
  const fim = formatDateValue(ausencia?.DT_FIM || ausencia?.dt_fim || inicio);
  return inicio && fim && inicio <= dataIso && fim >= dataIso;
}

function criarIndiceAusencias(ausencias = []) {
  const porFuncionario = new Map();
  (ausencias || []).forEach((ausencia) => {
    const keys = [
      ausencia?.ESCFUNC_ID,
      ausencia?.escfunc_id,
      ausencia?.CHAPA,
      ausencia?.chapa
    ].map((value) => String(value || '').trim()).filter(Boolean);
    keys.forEach((key) => {
      if (!porFuncionario.has(key)) porFuncionario.set(key, []);
      porFuncionario.get(key).push(ausencia);
    });
  });
  return porFuncionario;
}

function criarIndiceFixos(fixos = []) {
  const map = new Map();
  (fixos || []).forEach((fixo) => {
    const escfuncId = fixo?.ESCFUNC_ID || fixo?.escfunc_id || fixo?.escfuncId;
    const data = formatDateValue(fixo?.DT || fixo?.dt || fixo?.data);
    if (!escfuncId || !data) return;
    map.set(`${escfuncId}|${data}`, fixo);
  });
  return map;
}

function encontrarAusencia(indiceAusencias, funcionario, dataIso) {
  const keys = [
    funcionario?.ESCFUNC_ID,
    funcionario?.escfuncId,
    funcionario?.CHAPA,
    funcionario?.chapa
  ].map((value) => String(value || '').trim()).filter(Boolean);
  for (const key of keys) {
    const ausencia = (indiceAusencias?.get(key) || []).find((item) => ausenciaCobreDia(item, dataIso));
    if (ausencia) return ausencia;
  }
  return null;
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

function hasNoConsecutiveRestsCircular(folgas) {
  for (let index = 0; index < 14; index += 1) {
    if (folgas.has(index) && folgas.has((index + 1) % 14)) return false;
  }
  return true;
}

function hasMaxWeeklyRestsCircular(folgas, maxFolgasSemana = 2) {
  const semana1 = [0, 1, 2, 3, 4, 5, 6].filter((index) => folgas.has(index)).length;
  const semana2 = [7, 8, 9, 10, 11, 12, 13].filter((index) => folgas.has(index)).length;
  return semana1 <= maxFolgasSemana && semana2 <= maxFolgasSemana;
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
          if (!hasMaxWeeklyRestsCircular(folgas, 2)) continue;
          if (!hasNoConsecutiveRestsCircular(folgas)) continue;
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
  return padroes[Number(index || 0) % padroes.length] || [0, 3, 6, 10];
}

function isFolgaAutomatica(date, funcionarioIndex = 0) {
  const pattern = getPadraoFolgaPorIndice(funcionarioIndex);
  return pattern.includes(getCycleIndex(date));
}

function getHorarioBaseFuncionario(funcionario, turno) {
  const hrEnt1 = normalizeTime(turno?.HR_ENT1 || funcionario.HR_ENT1, '08:00');
  const hrSai1 = normalizeTime(turno?.HR_SAI1 || funcionario.HR_SAI1, '12:00');
  const hrEnt2 = normalizeTime(turno?.HR_ENT2 || funcionario.HR_ENT2, '13:10');
  const hrSai2 = normalizeTime(turno?.HR_SAI2 || funcionario.HR_SAI2, '17:58');
  return { hrEnt1, hrSai1, hrEnt2, hrSai2 };
}

function montarFuncionarioRascunho(funcionario, turno, dias, horario) {
  const { hrEnt1, hrSai1, hrEnt2, hrSai2 } = horario;
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

function buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso = formatDateValue(new Date()), folgasDatas = [], opcoes = {}) {
  const horario = getHorarioBaseFuncionario(funcionario, turno);
  const folgas = new Set((folgasDatas || []).map(formatDateValue).filter(Boolean));
  const indiceAusencias = opcoes.indiceAusencias || criarIndiceAusencias(opcoes.ausencias || []);
  const diasFixos = opcoes.diasFixos || criarIndiceFixos(opcoes.fixos || []);

  const dias = getMonthDays(mesRef)
    .filter((date) => formatDateValue(date) >= hojeIso)
    .map((date) => {
      const data = formatDateValue(date);
      const ausencia = encontrarAusencia(indiceAusencias, funcionario, data);
      if (ausencia) {
        const motivo = getAusenciaMotivo(ausencia);
        const sigla = normalizarAusenciaSigla(motivo);
        return {
          data,
          hrEnt1: sigla,
          hrSai1: sigla,
          hrEnt2: sigla,
          hrSai2: sigla,
          programacao: sigla,
          justificativa: motivo || 'Ausencia'
        };
      }
      const fixo = diasFixos.get(`${funcionario.ESCFUNC_ID || funcionario.escfuncId}|${data}`);
      if (fixo) {
        const programacaoFixa = String(fixo.programacao || fixo.PROGRAMACAO || 'TRB').toUpperCase();
        const descansoFixo = programacaoFixa !== 'TRB';
        return {
          data,
          hrEnt1: descansoFixo ? programacaoFixa : normalizeTime(fixo.hrEnt1 || fixo.HR_ENT1, horario.hrEnt1),
          hrSai1: descansoFixo ? programacaoFixa : normalizeTime(fixo.hrSai1 || fixo.HR_SAI1, horario.hrSai1),
          hrEnt2: descansoFixo ? programacaoFixa : normalizeTime(fixo.hrEnt2 || fixo.HR_ENT2, horario.hrEnt2),
          hrSai2: descansoFixo ? programacaoFixa : normalizeTime(fixo.hrSai2 || fixo.HR_SAI2, horario.hrSai2),
          programacao: programacaoFixa,
          justificativa: fixo.justificativa || fixo.JUSTIFICATIVA || 'Horario/folga fixa'
        };
      }
      const folga = folgas.has(data);
      return {
        data,
        hrEnt1: folga ? 'F' : horario.hrEnt1,
        hrSai1: folga ? 'F' : horario.hrSai1,
        hrEnt2: folga ? 'F' : horario.hrEnt2,
        hrSai2: folga ? 'F' : horario.hrSai2,
        programacao: folga ? 'F' : 'TRB',
        justificativa: folga ? 'Folga 5x2 automatica' : 'Liberacao automatica mensal'
      };
    });

  return montarFuncionarioRascunho(funcionario, turno, dias, horario);
}

function buildFuncionarioRascunho(funcionario, turno, mesRef, hojeIso = formatDateValue(new Date()), funcionarioIndex = 0, padraoFolga = null, opcoes = {}) {
  const folgasCiclo = new Set(padraoFolga || getPadraoFolgaPorIndice(funcionarioIndex));
  const folgasDatas = getMonthDays(mesRef)
    .filter((date) => formatDateValue(date) >= hojeIso)
    .filter((date) => folgasCiclo.has(getCycleIndex(date)))
    .map(formatDateValue);

  return buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso, folgasDatas, opcoes);
}

function getSecaoKey(funcionario) {
  return String(Number(funcionario.ESCSECAO_ID || 0));
}

function getTurnoKey(funcionario, turno) {
  return turno?.ESCSECAOTURNO_ID ? `turno:${turno.ESCSECAOTURNO_ID}` : getHorarioSignature(turno || funcionario);
}

function getWeekKeyFromIso(dataIso) {
  const date = new Date(`${formatDateValue(dataIso)}T00:00:00`);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diffToMonday);
  return formatDateValue(date);
}

function getCounterValues(counter) {
  return [...counter.values(), 0];
}

function isDomingoIso(dataIso) {
  return new Date(`${formatDateValue(dataIso)}T00:00:00`).getDay() === 0;
}

function calcularExcessoFolgasPorDia(counter, secaoSize = 1, options = {}) {
  const limiteFolgas60 = Math.max(1, Math.floor(Number(secaoSize || 1) * 0.4));
  return [...counter.entries()].reduce((acc, [data, total]) => {
    if (options.ignorarDomingos && isDomingoIso(data)) return acc;
    const limite = limiteFolgas60;
    const excesso = Math.max(0, Number(total || 0) - limite);
    return acc + (excesso * excesso);
  }, 0);
}

function hasNoConsecutiveAutomaticRests(dias = []) {
  const ordenados = [...dias].sort((left, right) => String(left.data || left.DT).localeCompare(String(right.data || right.DT)));
  for (let index = 1; index < ordenados.length; index += 1) {
    if (ordenados[index - 1].programacao === 'F' && ordenados[index].programacao === 'F') return false;
  }
  return true;
}

function getDatasGeradas(diasMes, hojeIso) {
  return (diasMes || [])
    .map(formatDateValue)
    .filter((data) => data >= hojeIso);
}

function contarBloqueiosPorData(secao, diasMes, indiceAusencias, diasFixos) {
  const contagemSecao = new Map(diasMes.map((date) => [formatDateValue(date), 0]));
  const contagensTurno = new Map();
  secao.forEach(({ funcionario, turnoKey }) => {
    if (!contagensTurno.has(turnoKey)) {
      contagensTurno.set(turnoKey, new Map(diasMes.map((date) => [formatDateValue(date), 0])));
    }
    diasMes.forEach((date) => {
      const data = formatDateValue(date);
      const fixo = diasFixos.get(`${funcionario.ESCFUNC_ID || funcionario.escfuncId}|${data}`);
      const folgaFixa = fixo && String(fixo.PROGRAMACAO || fixo.programacao || '').toUpperCase() !== 'TRB';
      if (!encontrarAusencia(indiceAusencias, funcionario, data) && !folgaFixa) return;
      contagemSecao.set(data, (contagemSecao.get(data) || 0) + 1);
      const turnoCounter = contagensTurno.get(turnoKey);
      turnoCounter.set(data, (turnoCounter.get(data) || 0) + 1);
    });
  });
  return { contagemSecao, contagensTurno };
}

const PADRAO_VARIACOES_MENSAIS = [0, 7, 13, 29, 43, 61];

function getPlanosFolgaCandidatos(diasMes, hojeIso) {
  const padroes = getPadroesFolgaValidos();
  const datasGeradas = getDatasGeradas(diasMes, hojeIso);
  const planos = new Map();

  padroes.forEach((padrao, padraoIndex) => {
    PADRAO_VARIACOES_MENSAIS.forEach((variacao) => {
      const folgas = datasGeradas.filter((data, indexGerado) => {
        const date = new Date(`${data}T00:00:00`);
        const bloco = Math.floor(indexGerado / 14);
        const padraoBloco = padroes[(padraoIndex + (variacao * bloco)) % padroes.length] || padrao;
        return padraoBloco.includes(getCycleIndex(date));
      });
      const key = folgas.join('|');
      if (!planos.has(key)) planos.set(key, { padrao, folgas, repeticaoExata: variacao === 0 });
    });
  });

  return [...planos.values()];
}

function addPlanoUnico(planos, folgas, meta = {}) {
  const normalizadas = [...new Set((folgas || []).map(formatDateValue).filter(Boolean))].sort();
  const key = normalizadas.join('|');
  if (!planos.has(key)) planos.set(key, { padrao: meta.padrao || [], folgas: normalizadas, repeticaoExata: Boolean(meta.repeticaoExata) });
}

function isFolgaVizinha(folgas, dataIso) {
  const date = new Date(`${formatDateValue(dataIso)}T00:00:00`);
  const anterior = new Date(date);
  anterior.setDate(anterior.getDate() - 1);
  const proximo = new Date(date);
  proximo.setDate(proximo.getDate() + 1);
  return folgas.has(formatDateValue(anterior)) || folgas.has(formatDateValue(proximo));
}

function getWeekGroups(datasGeradas) {
  const weeks = new Map();
  (datasGeradas || []).forEach((data) => {
    const key = getWeekKeyFromIso(data);
    if (!weeks.has(key)) weeks.set(key, []);
    weeks.get(key).push(data);
  });
  return [...weeks.values()];
}

function hasMaxFolgasPorSemanaDatas(folgas = [], maxFolgasSemana = 2) {
  const counter = new Map();
  for (const data of folgas || []) {
    const weekKey = getWeekKeyFromIso(data);
    const total = (counter.get(weekKey) || 0) + 1;
    if (total > maxFolgasSemana) return false;
    counter.set(weekKey, total);
  }
  return true;
}

function getFolgasFixasFuncionario(diasFixos, funcionario, datasGeradas = []) {
  const escfuncId = funcionario.ESCFUNC_ID || funcionario.escfuncId;
  const datasSet = new Set((datasGeradas || []).map(formatDateValue));
  const folgas = [];
  for (const [key, fixo] of diasFixos.entries()) {
    const [fixoEscfuncId, data] = String(key).split('|');
    if (String(fixoEscfuncId) !== String(escfuncId)) continue;
    if (datasSet.size && !datasSet.has(data)) continue;
    const programacao = String(fixo.PROGRAMACAO || fixo.programacao || '').toUpperCase();
    if (programacao && programacao !== 'TRB') folgas.push(data);
  }
  return [...new Set(folgas)].sort();
}

function hasMaxFolgasAutomaticasComFixos(folgasAutomaticas = [], folgasFixas = [], maxFolgasSemana = 2) {
  const counter = new Map();
  (folgasFixas || []).forEach((data) => {
    const weekKey = getWeekKeyFromIso(data);
    counter.set(weekKey, (counter.get(weekKey) || 0) + 1);
  });
  for (const data of folgasAutomaticas || []) {
    const weekKey = getWeekKeyFromIso(data);
    const total = (counter.get(weekKey) || 0) + 1;
    if (total > maxFolgasSemana) return false;
    counter.set(weekKey, total);
  }
  return true;
}

function limitarFolgasAutomaticasPorFixos(folgasAutomaticas = [], folgasFixas = [], maxFolgasSemana = 2) {
  const counter = new Map();
  (folgasFixas || []).forEach((data) => {
    const weekKey = getWeekKeyFromIso(data);
    counter.set(weekKey, (counter.get(weekKey) || 0) + 1);
  });
  return [...new Set((folgasAutomaticas || []).map(formatDateValue).filter(Boolean))]
    .sort()
    .filter((data) => {
      const weekKey = getWeekKeyFromIso(data);
      const totalAtual = counter.get(weekKey) || 0;
      if (totalAtual >= maxFolgasSemana) return false;
      counter.set(weekKey, totalAtual + 1);
      return true;
    });
}

function hasNoAutomaticRestNearFixedRest(folgasAutomaticas = [], folgasFixas = []) {
  const fixasSet = new Set((folgasFixas || []).map(formatDateValue));
  if (!fixasSet.size) return true;
  return !(folgasAutomaticas || []).some((data) => isFolgaVizinha(fixasSet, data));
}

function getPlanoSemanalGreedy({
  datasGeradas,
  contagemFolgasSecao,
  contagemFolgasTurno,
  contagemFolgasSemanaSecao,
  domingosFolgaSet,
  domingosTrabalhoSet,
  seed = 0
}) {
  const folgas = new Set([...domingosFolgaSet]);
  const localSecao = new Map(contagemFolgasSecao);
  const localTurno = new Map(contagemFolgasTurno);
  const localSemana = new Map(contagemFolgasSemanaSecao);
  [...folgas].forEach((data) => {
    localSecao.set(data, (localSecao.get(data) || 0) + 1);
    localTurno.set(data, (localTurno.get(data) || 0) + 1);
    const weekKey = getWeekKeyFromIso(data);
    localSemana.set(weekKey, (localSemana.get(weekKey) || 0) + 1);
  });

  const escolherCandidatos = (candidatos, quantidade) => {
    let restantes = Math.max(0, quantidade);
    while (restantes > 0) {
      const opcoes = candidatos
        .filter((data) => {
          if (folgas.has(data) || domingosTrabalhoSet.has(data) || isDomingoIso(data) || isFolgaVizinha(folgas, data)) return false;
          const weekKey = getWeekKeyFromIso(data);
          return [...folgas].filter((folga) => getWeekKeyFromIso(folga) === weekKey).length < 2;
        })
        .map((data, index) => ({
          data,
          score: ((localTurno.get(data) || 0) * 1000)
            + ((localSecao.get(data) || 0) * 700)
            + ((localSemana.get(getWeekKeyFromIso(data)) || 0) * 60)
            + (((index + seed) % 17) / 100)
        }))
        .sort((left, right) => left.score - right.score || left.data.localeCompare(right.data));
      if (!opcoes.length) break;
      const data = opcoes[0].data;
      folgas.add(data);
      localSecao.set(data, (localSecao.get(data) || 0) + 1);
      localTurno.set(data, (localTurno.get(data) || 0) + 1);
      const weekKey = getWeekKeyFromIso(data);
      localSemana.set(weekKey, (localSemana.get(weekKey) || 0) + 1);
      restantes -= 1;
    }
  };

  getWeekGroups(datasGeradas).forEach((semana) => {
    const folgasSemana = semana.filter((data) => folgas.has(data)).length;
    const alvoSemana = Math.max(folgasSemana, Math.round(semana.length * 2 / 7));
    const candidatos = [...semana].sort((left, right) => {
      const leftDay = new Date(`${left}T00:00:00`).getDay();
      const rightDay = new Date(`${right}T00:00:00`).getDay();
      return ((leftDay + seed) % 7) - ((rightDay + seed) % 7) || left.localeCompare(right);
    });
    escolherCandidatos(candidatos, alvoSemana - folgasSemana);
  });

  const alvoMes = Math.max(folgas.size, Math.round(datasGeradas.length * 2 / 7));
  escolherCandidatos([...datasGeradas], alvoMes - folgas.size);
  return [...folgas].sort();
}

function getPlanosFolgaGreedyCandidatos(args) {
  const planos = new Map();
  for (let seed = 0; seed < 14; seed += 1) {
    addPlanoUnico(planos, getPlanoSemanalGreedy({ ...args, seed }), { padrao: [] });
  }
  return [...planos.values()];
}

function escolherPadraoBalanceado({
  funcionario,
  turno,
  mesRef,
  hojeIso,
  indiceSecao,
  diasMes,
  contagemFolgasSecao,
  contagemFolgasTurno,
  contagemFolgasSemanaSecao,
  secaoSize,
  turnoSize,
  domingosFolgaAlvo = [],
  domingosTrabalhoAlvo = [],
  indiceAusencias = null,
  diasFixos = new Map()
}) {
  const datasGeradas = getDatasGeradas(diasMes, hojeIso);
  const primeiraJanela = datasGeradas.slice(0, Math.min(7, datasGeradas.length));
  const folgasEsperadas = Math.max(1, Math.round(datasGeradas.length * 2 / 7));
  const folgasFixasFuncionario = getFolgasFixasFuncionario(diasFixos, funcionario, datasGeradas);
  const folgasFixasSet = new Set(folgasFixasFuncionario);
  const domingosFolgaSet = new Set((domingosFolgaAlvo || []).map(formatDateValue));
  const domingosTrabalhoSet = new Set((domingosTrabalhoAlvo || []).map(formatDateValue));
  const planosMap = new Map();
  getPlanosFolgaCandidatos(diasMes, hojeIso).forEach((plano) => addPlanoUnico(planosMap, plano.folgas, plano));
  getPlanosFolgaGreedyCandidatos({
    datasGeradas,
    contagemFolgasSecao,
    contagemFolgasTurno,
    contagemFolgasSemanaSecao,
    domingosFolgaSet,
    domingosTrabalhoSet
  }).forEach((plano) => addPlanoUnico(planosMap, plano.folgas, plano));
  const planos = [...planosMap.values()];
  let melhor = null;
  let melhorIdeal = null;
  let melhorComCobertura = null;
  planos.forEach(({ padrao, folgas, repeticaoExata }, planoIndex) => {
    const folgasPossiveis = folgas.filter((data) => !encontrarAusencia(indiceAusencias, funcionario, data)
      && !diasFixos.has(`${funcionario.ESCFUNC_ID || funcionario.escfuncId}|${data}`));
    const folgasEfetivas = limitarFolgasAutomaticasPorFixos(folgasPossiveis, folgasFixasFuncionario, 2);
    if (!hasMaxFolgasPorSemanaDatas(folgasEfetivas, 2)) return;
    if (!hasMaxFolgasAutomaticasComFixos(folgasEfetivas, folgasFixasFuncionario, 2)) return;
    const rascunho = buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso, folgasEfetivas, { indiceAusencias, diasFixos });
    if (!hasNoConsecutiveAutomaticRests(rascunho.dias)) return;
    const errors = validateEscalaPayload({
      lojaId: Number(funcionario.LOJA || 0) || 1,
      mesRef,
      funcionarios: [rascunho]
    });
    if (errors.some((error) => /domingos/i.test(String(error || '')))) return;

    const projetadaSecao = new Map(contagemFolgasSecao);
    const projetadaTurno = new Map(contagemFolgasTurno);
    const projetadaSemanaSecao = new Map(contagemFolgasSemanaSecao);
    folgasEfetivas.forEach((data) => {
      projetadaSecao.set(data, (projetadaSecao.get(data) || 0) + 1);
      projetadaTurno.set(data, (projetadaTurno.get(data) || 0) + 1);
      const weekKey = getWeekKeyFromIso(data);
      projetadaSemanaSecao.set(weekKey, (projetadaSemanaSecao.get(weekKey) || 0) + 1);
    });

    const folgasDiasComunsSecao = [...projetadaSecao.entries()]
      .filter(([data]) => !isDomingoIso(data))
      .map(([, total]) => total);
    const maxFolgasSecaoDia = Math.max(...folgasDiasComunsSecao, 0);
    const maxFolgasTurnoDia = Math.max(...getCounterValues(projetadaTurno));
    const excessoFolgaSecao = calcularExcessoFolgasPorDia(projetadaSecao, secaoSize, { ignorarDomingos: true });
    const somaQuadradosSecao = folgasDiasComunsSecao.reduce((acc, value) => acc + (value * value), 0);
    const somaQuadradosTurno = getCounterValues(projetadaTurno).reduce((acc, value) => acc + (value * value), 0);
    const somaQuadradosSemana = getCounterValues(projetadaSemanaSecao).reduce((acc, value) => acc + (value * value), 0);
    const primeiraJanelaCounts = primeiraJanela.map((data) => projetadaSecao.get(data) || 0);
    const maxFolgasInicio = Math.max(...primeiraJanelaCounts, 0);
    const somaQuadradosInicio = primeiraJanelaCounts.reduce((acc, value, index) => acc + (value * value * (primeiraJanela.length - index)), 0);
    const folgasPrimeiroDia = hojeIso ? (projetadaSecao.get(hojeIso) || 0) : 0;
    const turnoSemCobertura = Number(turnoSize || 0) > 1 && folgasEfetivas.some((data) => (projetadaTurno.get(data) || 0) >= Number(turnoSize || 0));
    const limiteDesejadoTurno = Math.max(1, Math.ceil(Number(turnoSize || 1) / 2));
    const excessoFolgaTurno = Math.max(0, maxFolgasTurnoDia - limiteDesejadoTurno);
    const folgasPlanejadasFuncionario = new Set([...folgasEfetivas, ...folgasFixasFuncionario]);
    const folgasAbaixoMinimo = Math.max(0, folgasEsperadas - folgasPlanejadasFuncionario.size);
    const folgasAcimaEsperado = Math.max(0, folgasPlanejadasFuncionario.size - folgasEsperadas);
    const domingosFolgaPerdidos = [...domingosFolgaSet].filter((data) => !encontrarAusencia(indiceAusencias, funcionario, data) && !folgasFixasSet.has(data) && !folgasEfetivas.includes(data)).length;
    const domingosTrabalhoViraramFolga = [...domingosTrabalhoSet].filter((data) => folgasEfetivas.includes(data)).length;
    const folgasAutomaticasPertoFixo = hasNoAutomaticRestNearFixedRest(folgasEfetivas, folgasFixasFuncionario) ? 0 : 1;
    const desempate = Math.abs(planoIndex - (indiceSecao % Math.max(planos.length, 1)));
    const score = (errors.length * 100000)
      + (turnoSemCobertura ? 50000 : 0)
      + (folgasAutomaticasPertoFixo * 42000)
      + (folgasAbaixoMinimo * 180000)
      + (folgasAcimaEsperado * 9000)
      + (domingosFolgaPerdidos * 8500)
      + (domingosTrabalhoViraramFolga * 3500)
      + (excessoFolgaSecao * 26000)
      + (excessoFolgaTurno * 70000)
      + (maxFolgasTurnoDia * 2600)
      + (folgasPrimeiroDia * folgasPrimeiroDia * 120)
      + (maxFolgasInicio * 220)
      + (maxFolgasSecaoDia * 1400)
      + (somaQuadradosInicio * 4)
      + (somaQuadradosSecao * 10)
      + (somaQuadradosTurno * 8)
      + (somaQuadradosSemana * 3)
      + (repeticaoExata ? 250 : 0)
      + (desempate / 1000);
    const candidato = { padrao, folgas: folgasEfetivas, score, folgasAbaixoMinimo };
    if (!melhor || score < melhor.score) melhor = candidato;
    if (!errors.length && !folgasAbaixoMinimo && !excessoFolgaTurno && !excessoFolgaSecao && (!melhorIdeal || score < melhorIdeal.score)) {
      melhorIdeal = candidato;
    }
    if (!errors.length && !folgasAbaixoMinimo && !excessoFolgaTurno && (!melhorComCobertura || score < melhorComCobertura.score)) {
      melhorComCobertura = candidato;
    }
  });
  return melhorIdeal || melhorComCobertura || melhor || { padrao: [], folgas: [] };
}

function isFolgaAutomaticaMovivel(dia = {}) {
  return String(dia.programacao || '').toUpperCase() === 'F'
    && /automatica/i.test(String(dia.justificativa || ''));
}

function isTrabalhoAutomaticoMovivel(dia = {}) {
  return String(dia.programacao || '').toUpperCase() === 'TRB'
    && /automatica|liberacao/i.test(String(dia.justificativa || ''));
}

function contarFolgasPorData(funcionariosPayload = []) {
  const counter = new Map();
  funcionariosPayload.forEach((funcionario) => {
    (funcionario.dias || []).forEach((dia) => {
      if (String(dia.programacao || '').toUpperCase() === 'F') {
        counter.set(dia.data, (counter.get(dia.data) || 0) + 1);
      }
    });
  });
  return counter;
}

function contarDescansosSemanaFuncionario(funcionario, weekKey, trocas = {}) {
  return (funcionario.dias || []).filter((dia) => {
    if (getWeekKeyFromIso(dia.data) !== weekKey) return false;
    const programacao = dia.data === trocas.origem
      ? 'TRB'
      : dia.data === trocas.destino
        ? 'F'
        : String(dia.programacao || '').toUpperCase();
    return programacao !== 'TRB';
  }).length;
}

function hasFolgaVizinhaAposTroca(funcionario, origem, destino) {
  const programacoes = new Map((funcionario.dias || []).map((dia) => [dia.data, String(dia.programacao || '').toUpperCase()]));
  programacoes.set(origem, 'TRB');
  programacoes.set(destino, 'F');
  const destinoDate = new Date(`${destino}T00:00:00`);
  const anterior = new Date(destinoDate);
  anterior.setDate(anterior.getDate() - 1);
  const proximo = new Date(destinoDate);
  proximo.setDate(proximo.getDate() + 1);
  return programacoes.get(formatDateValue(anterior)) === 'F' || programacoes.get(formatDateValue(proximo)) === 'F';
}

function podeMoverFolgaAutomatica(funcionario, origemDia, destinoDia) {
  if (!isFolgaAutomaticaMovivel(origemDia) || !isTrabalhoAutomaticoMovivel(destinoDia)) return false;
  if (isDomingoIso(origemDia.data) || isDomingoIso(destinoDia.data)) return false;
  if (hasFolgaVizinhaAposTroca(funcionario, origemDia.data, destinoDia.data)) return false;
  const origemWeek = getWeekKeyFromIso(origemDia.data);
  const destinoWeek = getWeekKeyFromIso(destinoDia.data);
  if (origemWeek !== destinoWeek && contarDescansosSemanaFuncionario(funcionario, destinoWeek, { origem: origemDia.data, destino: destinoDia.data }) > 2) {
    return false;
  }
  return true;
}

function moverFolgaAutomatica(funcionario, origemDia, destinoDia) {
  origemDia.programacao = 'TRB';
  origemDia.hrEnt1 = funcionario.turnoOficial?.hrEnt1 || origemDia.hrEnt1;
  origemDia.hrSai1 = funcionario.turnoOficial?.hrSai1 || origemDia.hrSai1;
  origemDia.hrEnt2 = funcionario.turnoOficial?.hrEnt2 || origemDia.hrEnt2;
  origemDia.hrSai2 = funcionario.turnoOficial?.hrSai2 || origemDia.hrSai2;
  origemDia.justificativa = 'Liberacao automatica mensal';

  destinoDia.programacao = 'F';
  destinoDia.hrEnt1 = 'F';
  destinoDia.hrSai1 = 'F';
  destinoDia.hrEnt2 = 'F';
  destinoDia.hrSai2 = 'F';
  destinoDia.justificativa = 'Folga 5x2 automatica';
}

function rebalancearFolgasDiasComunsSecao(funcionariosPayload = [], secaoSize = 1) {
  const limiteFolgasDiaComum = Math.max(1, Math.ceil(Number(secaoSize || 1) * 2 / 7));
  let contador = contarFolgasPorData(funcionariosPayload);
  let tentativas = 0;
  const maxTentativas = Math.max(20, funcionariosPayload.length * 40);

  while (tentativas < maxTentativas) {
    tentativas += 1;
    const origemEntry = [...contador.entries()]
      .filter(([data, total]) => !isDomingoIso(data) && total > limiteFolgasDiaComum)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0];
    if (!origemEntry) break;

    const [origemData] = origemEntry;
    const destinos = [...contador.entries()]
      .filter(([data, total]) => !isDomingoIso(data) && total < limiteFolgasDiaComum)
      .sort((left, right) => left[1] - right[1] || left[0].localeCompare(right[0]));
    let moveu = false;
    for (const [destinoData] of destinos) {
      for (const funcionario of funcionariosPayload) {
        const origemDia = (funcionario.dias || []).find((dia) => dia.data === origemData);
        const destinoDia = (funcionario.dias || []).find((dia) => dia.data === destinoData);
        if (!origemDia || !destinoDia || !podeMoverFolgaAutomatica(funcionario, origemDia, destinoDia)) continue;
        moverFolgaAutomatica(funcionario, origemDia, destinoDia);
        contador = contarFolgasPorData(funcionariosPayload);
        moveu = true;
        break;
      }
      if (moveu) break;
    }
    if (!moveu) break;
  }

  return funcionariosPayload;
}

function buildFuncionariosRascunhoBalanceado(funcionarios, turnos, mesRef, hojeIso = formatDateValue(new Date()), opcoes = {}) {
  const indiceAusencias = opcoes.indiceAusencias || criarIndiceAusencias(opcoes.ausencias || []);
  const diasFixos = opcoes.diasFixos || criarIndiceFixos(opcoes.fixos || []);
  const secoes = new Map();
  (funcionarios || []).forEach((funcionario) => {
    const turno = findTurnoParaFuncionario(funcionario, turnos);
    const secaoKey = getSecaoKey(funcionario);
    if (!secoes.has(secaoKey)) secoes.set(secaoKey, []);
    secoes.get(secaoKey).push({
      funcionario,
      turno,
      turnoKey: getTurnoKey(funcionario, turno)
    });
  });

  const diasMes = getMonthDays(mesRef);
  const domingosGerados = getDatasGeradas(diasMes, hojeIso).filter(isDomingoIso);
  const payload = [];
  [...secoes.values()].forEach((secao) => {
    const contagemAusencias = contarBloqueiosPorData(secao, diasMes, indiceAusencias, diasFixos);
    const contagemFolgasSecao = new Map(contagemAusencias.contagemSecao);
    const contagemFolgasSemanaSecao = new Map(diasMes.map((date) => [getWeekKeyFromIso(formatDateValue(date)), 0]));
    const contagensTurno = new Map(contagemAusencias.contagensTurno);
    const turnoSizes = new Map();

    diasMes.forEach((date) => {
      const data = formatDateValue(date);
      const weekKey = getWeekKeyFromIso(data);
      contagemFolgasSemanaSecao.set(weekKey, (contagemFolgasSemanaSecao.get(weekKey) || 0) + (contagemFolgasSecao.get(data) || 0));
    });

    secao.forEach(({ turnoKey }) => {
      turnoSizes.set(turnoKey, (turnoSizes.get(turnoKey) || 0) + 1);
      if (!contagensTurno.has(turnoKey)) {
        contagensTurno.set(turnoKey, new Map(diasMes.map((date) => [formatDateValue(date), 0])));
      }
    });

    const posicaoNoTurno = new Map();
    const secaoOrdenada = secao
      .sort((left, right) => left.turnoKey.localeCompare(right.turnoKey)
        || String(left.funcionario.NOME || '').localeCompare(String(right.funcionario.NOME || ''))
        || String(left.funcionario.CHAPA || '').localeCompare(String(right.funcionario.CHAPA || '')));

    secaoOrdenada.forEach(({ funcionario, turnoKey }) => {
      const atual = posicaoNoTurno.get(turnoKey) || 0;
      posicaoNoTurno.set(String(funcionario.ESCFUNC_ID), atual);
      posicaoNoTurno.set(turnoKey, atual + 1);
    });

    const payloadSecao = [];
    secaoOrdenada
      .forEach(({ funcionario, turno, turnoKey }, indiceSecao) => {
        const contagemFolgasTurno = contagensTurno.get(turnoKey);
        const turnoIndex = posicaoNoTurno.get(String(funcionario.ESCFUNC_ID)) || 0;
        const paridadeDomingo = turnoIndex % 2;
        const domingosFolgaAlvo = domingosGerados.filter((_, index) => index % 2 === paridadeDomingo);
        const domingosTrabalhoAlvo = domingosGerados.filter((_, index) => index % 2 !== paridadeDomingo);
        const escolhido = escolherPadraoBalanceado({
          funcionario,
          turno,
          mesRef,
          hojeIso,
          indiceSecao,
          diasMes,
          contagemFolgasSecao,
          contagemFolgasTurno,
          contagemFolgasSemanaSecao,
          secaoSize: secao.length,
          turnoSize: turnoSizes.get(turnoKey) || 1,
          domingosFolgaAlvo,
          domingosTrabalhoAlvo,
          indiceAusencias,
          diasFixos
        });
        escolhido.folgas.forEach((data) => {
          contagemFolgasSecao.set(data, (contagemFolgasSecao.get(data) || 0) + 1);
          contagemFolgasTurno.set(data, (contagemFolgasTurno.get(data) || 0) + 1);
          const weekKey = getWeekKeyFromIso(data);
          contagemFolgasSemanaSecao.set(weekKey, (contagemFolgasSemanaSecao.get(weekKey) || 0) + 1);
        });
        payloadSecao.push(buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso, escolhido.folgas, { indiceAusencias, diasFixos }));
      });
    payload.push(...rebalancearFolgasDiasComunsSecao(payloadSecao, secao.length));
  });
  return payload;
}

function buildFuncionariosLiberacao(funcionarios, turnos) {
  return (funcionarios || []).map((funcionario) => {
    const turno = findTurnoParaFuncionario(funcionario, turnos);
    const horario = getHorarioBaseFuncionario(funcionario, turno);
    return montarFuncionarioRascunho(funcionario, turno, [], horario);
  });
}

function normalizarDiaAtualParaPayload(row = {}) {
  const programacao = String(pick(row, 'PROGRAMACAO', 'programacao') || 'TRB').trim().toUpperCase() || 'TRB';
  const descanso = programacao !== 'TRB';
  return {
    data: formatDateValue(pick(row, 'DT', 'dt') || row.data),
    hrEnt1: descanso ? null : pick(row, 'HR_ENT1', 'hr_ent1', 'hrEnt1'),
    hrSai1: descanso ? null : pick(row, 'HR_SAI1', 'hr_sai1', 'hrSai1'),
    hrEnt2: descanso ? null : pick(row, 'HR_ENT2', 'hr_ent2', 'hrEnt2'),
    hrSai2: descanso ? null : pick(row, 'HR_SAI2', 'hr_sai2', 'hrSai2'),
    programacao,
    justificativa: null
  };
}

function agruparDiasPassadosPorFuncionario(diasAtuais = [], hojeIso = formatDateValue(new Date())) {
  const grupos = new Map();
  (diasAtuais || []).forEach((dia) => {
    const data = formatDateValue(pick(dia, 'DT', 'dt') || dia.data);
    if (!data || data >= hojeIso) return;
    const escfuncId = pick(dia, 'ESCFUNC_ID', 'escfunc_id', 'escfuncId');
    if (!escfuncId) return;
    if (!grupos.has(String(escfuncId))) grupos.set(String(escfuncId), []);
    grupos.get(String(escfuncId)).push(normalizarDiaAtualParaPayload(dia));
  });
  grupos.forEach((dias) => dias.sort((left, right) => left.data.localeCompare(right.data)));
  return grupos;
}

function anexarDiasPassados(funcionariosPayload = [], diasAtuais = [], hojeIso = formatDateValue(new Date())) {
  const passadosPorFuncionario = agruparDiasPassadosPorFuncionario(diasAtuais, hojeIso);
  return (funcionariosPayload || []).map((funcionario) => {
    const passados = passadosPorFuncionario.get(String(funcionario.escfuncId || funcionario.ESCFUNC_ID)) || [];
    const datasPassadas = new Set(passados.map((dia) => dia.data));
    const diasFuturos = (funcionario.dias || []).filter((dia) => !datasPassadas.has(formatDateValue(dia.data || dia.DT)));
    return {
      ...funcionario,
      dias: [...passados, ...diasFuturos].sort((left, right) => left.data.localeCompare(right.data))
    };
  });
}

function getCriticasCoberturaMinima(funcionariosPayload = [], percentualMinimo = 60, hojeIso = formatDateValue(new Date())) {
  const dias = new Map();
  (funcionariosPayload || []).forEach((funcionario) => {
    (funcionario.dias || []).forEach((dia) => {
      const data = formatDateValue(dia.data || dia.DT);
      if (!data || data < hojeIso) return;
      if (!dias.has(data)) dias.set(data, { total: 0, trabalhando: 0 });
      const item = dias.get(data);
      item.total += 1;
      if (String(dia.programacao || dia.PROGRAMACAO || 'TRB').toUpperCase() === 'TRB') item.trabalhando += 1;
    });
  });

  return [...dias.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .filter(([, item]) => item.total > 0 && (item.trabalhando / item.total) * 100 < percentualMinimo)
    .map(([data, item]) => `Cobertura minima da secao abaixo de ${percentualMinimo}% em ${data}. Trabalhando: ${item.trabalhando}/${item.total}.`);
}

async function escalaMensalJaExiste(lojaId, mesRef) {
  const existentes = await escalaService.listEscalasResumo({ lojaId, mesRef, lojasPermitidas: [lojaId] });
  return existentes.length > 0;
}

async function liberarEscalaLojaMes({ lojaId, mesRef }) {
  if (await escalaMensalJaExiste(lojaId, mesRef)) {
    return { lojaId, mesRef, criada: false, motivo: 'Escala mensal ja existente.' };
  }

  const [funcionarios, turnos] = await Promise.all([
    catalogService.listFuncionariosByLoja(lojaId),
    catalogService.listTurnosByLoja(lojaId)
  ]);

  const funcionariosPayload = buildFuncionariosLiberacao(funcionarios, turnos)
    .filter((funcionario) => funcionario.escfuncId && funcionario.chapa);

  if (!funcionariosPayload.length && funcionarios.length === 0) {
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
    funcionarios: saved.length,
    pendenteGeracao: true,
    criticas: []
  };
}

async function gerarEscalaSecao({ lojaId, mesRef, escsecaoId, escfuncIds = null, hojeIso = formatDateValue(new Date()) }) {
  const inicio = formatDateValue(mesRef);
  const fim = getMonthEndIso(mesRef);
  const [funcionarios, turnos, ausencias, fixos] = await Promise.all([
    catalogService.listFuncionariosByLoja(lojaId, { secoesPermitidas: [Number(escsecaoId)] }),
    catalogService.listTurnosByLoja(lojaId),
    catalogService.listAusenciasByLojaMes(lojaId, inicio, fim),
    escalaService.listFixosEscala({ lojaId, mesRef, escsecaoId })
  ]);
  const diasAtuaisSecao = await escalaService.listDiasSecaoAtual({ lojaId, mesRef, escsecaoId });
  const filtroFuncionarios = Array.isArray(escfuncIds) && escfuncIds.length
    ? new Set(escfuncIds.map(Number).filter(Boolean))
    : null;
  const funcionariosSecao = funcionarios.filter((funcionario) => Number(funcionario.ESCSECAO_ID) === Number(escsecaoId))
    .filter((funcionario) => !filtroFuncionarios || filtroFuncionarios.has(Number(funcionario.ESCFUNC_ID)));
  const turnosSecao = turnos.filter((turno) => Number(turno.ESCSECAO_ID) === Number(escsecaoId));
  const funcionariosPayload = anexarDiasPassados(
    buildFuncionariosRascunhoBalanceado(funcionariosSecao, turnosSecao, mesRef, hojeIso, { ausencias, fixos }),
    diasAtuaisSecao,
    hojeIso
  )
    .filter((funcionario) => funcionario.escfuncId && funcionario.chapa && funcionario.dias.length > 0);

  if (!funcionariosPayload.length) {
    return { lojaId, mesRef, escsecaoId, criada: false, motivo: 'Nenhum funcionario apto para geracao da secao.' };
  }

  const ruleErrors = [
    ...validateEscalaPayload({ lojaId, mesRef, funcionarios: funcionariosPayload }),
    ...getCriticasCoberturaMinima(funcionariosPayload, 60, hojeIso)
  ];
  const saved = await escalaService.saveEscalasBatch({
    lojaId,
    mesRef,
    funcionarios: funcionariosPayload,
    oficializada: 0
  });

  return {
    lojaId,
    mesRef,
    escsecaoId,
    escfuncIds: filtroFuncionarios ? [...filtroFuncionarios] : null,
    criada: true,
    funcionarios: saved.length,
    criticas: ruleErrors.slice(0, 100)
  };
}

async function resetarEscalaSecao({ lojaId, mesRef, escsecaoId, hojeIso = formatDateValue(new Date()) }) {
  if (await escalaService.isEscalaSecaoOficializada({ lojaId, mesRef, escsecaoId })) {
    const error = new Error('Escala oficializada nao pode ser resetada.');
    error.statusCode = 422;
    throw error;
  }
  const [funcionarios, turnos] = await Promise.all([
    catalogService.listFuncionariosByLoja(lojaId, { secoesPermitidas: [Number(escsecaoId)] }),
    catalogService.listTurnosByLoja(lojaId)
  ]);
  const diasAtuaisSecao = await escalaService.listDiasSecaoAtual({ lojaId, mesRef, escsecaoId });
  const funcionariosSecao = funcionarios.filter((funcionario) => Number(funcionario.ESCSECAO_ID) === Number(escsecaoId));
  const turnosSecao = turnos.filter((turno) => Number(turno.ESCSECAO_ID) === Number(escsecaoId));
  const funcionariosPayload = anexarDiasPassados(buildFuncionariosLiberacao(funcionariosSecao, turnosSecao), diasAtuaisSecao, hojeIso)
    .filter((funcionario) => funcionario.escfuncId && funcionario.chapa);

  if (!funcionariosPayload.length) {
    return { lojaId, mesRef, escsecaoId, resetada: false, motivo: 'Nenhum funcionario encontrado para resetar a secao.' };
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
    escsecaoId,
    resetada: true,
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
  buildFuncionariosLiberacao,
  getPadroesFolgaValidos,
  isFolgaAutomatica,
  liberarEscalaLojaMes,
  liberarEscalasMensais,
  gerarEscalaSecao,
  resetarEscalaSecao,
  startMonthlyReleaseScheduler
};
