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

function hasNoConsecutiveRestsCircular(folgas) {
  for (let index = 0; index < 14; index += 1) {
    if (folgas.has(index) && folgas.has((index + 1) % 14)) return false;
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

function buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso = formatDateValue(new Date()), folgasDatas = []) {
  const horario = getHorarioBaseFuncionario(funcionario, turno);
  const folgas = new Set((folgasDatas || []).map(formatDateValue).filter(Boolean));

  const dias = getMonthDays(mesRef)
    .filter((date) => formatDateValue(date) >= hojeIso)
    .map((date) => {
      const data = formatDateValue(date);
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

function buildFuncionarioRascunho(funcionario, turno, mesRef, hojeIso = formatDateValue(new Date()), funcionarioIndex = 0, padraoFolga = null) {
  const folgasCiclo = new Set(padraoFolga || getPadraoFolgaPorIndice(funcionarioIndex));
  const folgasDatas = getMonthDays(mesRef)
    .filter((date) => formatDateValue(date) >= hojeIso)
    .filter((date) => folgasCiclo.has(getCycleIndex(date)))
    .map(formatDateValue);

  return buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso, folgasDatas);
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

function calcularExcessoFolgasPorDia(counter, secaoSize = 1) {
  const limiteDiaComum = Math.max(1, Math.ceil(Number(secaoSize || 1) * 2 / 7));
  const limiteDomingo = Math.max(limiteDiaComum, Math.ceil(Number(secaoSize || 1) / 2));
  return [...counter.entries()].reduce((acc, [data, total]) => {
    const limite = isDomingoIso(data) ? limiteDomingo : limiteDiaComum;
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
        .filter((data) => !folgas.has(data) && !domingosTrabalhoSet.has(data) && !isDomingoIso(data) && !isFolgaVizinha(folgas, data))
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
  domingosTrabalhoAlvo = []
}) {
  const datasGeradas = getDatasGeradas(diasMes, hojeIso);
  const primeiraJanela = datasGeradas.slice(0, Math.min(7, datasGeradas.length));
  const folgasEsperadas = Math.max(1, Math.round(datasGeradas.length * 2 / 7));
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
    if ([...domingosFolgaSet].some((data) => !folgas.includes(data))) return;
    if ([...domingosTrabalhoSet].some((data) => folgas.includes(data))) return;
    const rascunho = buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso, folgas);
    if (!hasNoConsecutiveAutomaticRests(rascunho.dias)) return;
    const errors = validateEscalaPayload({
      lojaId: Number(funcionario.LOJA || 0) || 1,
      mesRef,
      funcionarios: [rascunho]
    });

    const projetadaSecao = new Map(contagemFolgasSecao);
    const projetadaTurno = new Map(contagemFolgasTurno);
    const projetadaSemanaSecao = new Map(contagemFolgasSemanaSecao);
    folgas.forEach((data) => {
      projetadaSecao.set(data, (projetadaSecao.get(data) || 0) + 1);
      projetadaTurno.set(data, (projetadaTurno.get(data) || 0) + 1);
      const weekKey = getWeekKeyFromIso(data);
      projetadaSemanaSecao.set(weekKey, (projetadaSemanaSecao.get(weekKey) || 0) + 1);
    });

    const maxFolgasSecaoDia = Math.max(...getCounterValues(projetadaSecao));
    const maxFolgasTurnoDia = Math.max(...getCounterValues(projetadaTurno));
    const excessoFolgaSecao = calcularExcessoFolgasPorDia(projetadaSecao, secaoSize);
    const somaQuadradosSecao = getCounterValues(projetadaSecao).reduce((acc, value) => acc + (value * value), 0);
    const somaQuadradosTurno = getCounterValues(projetadaTurno).reduce((acc, value) => acc + (value * value), 0);
    const somaQuadradosSemana = getCounterValues(projetadaSemanaSecao).reduce((acc, value) => acc + (value * value), 0);
    const primeiraJanelaCounts = primeiraJanela.map((data) => projetadaSecao.get(data) || 0);
    const maxFolgasInicio = Math.max(...primeiraJanelaCounts, 0);
    const somaQuadradosInicio = primeiraJanelaCounts.reduce((acc, value, index) => acc + (value * value * (primeiraJanela.length - index)), 0);
    const folgasPrimeiroDia = hojeIso ? (projetadaSecao.get(hojeIso) || 0) : 0;
    const turnoSemCobertura = Number(turnoSize || 0) > 1 && folgas.some((data) => (projetadaTurno.get(data) || 0) >= Number(turnoSize || 0));
    const limiteDesejadoTurno = Math.max(1, Math.ceil(Number(turnoSize || 1) / 2));
    const excessoFolgaTurno = Math.max(0, maxFolgasTurnoDia - limiteDesejadoTurno);
    const diferencaFolgasEsperadas = Math.abs(folgas.length - folgasEsperadas);
    const desempate = Math.abs(planoIndex - (indiceSecao % Math.max(planos.length, 1)));
    const score = (errors.length * 100000)
      + (turnoSemCobertura ? 50000 : 0)
      + (diferencaFolgasEsperadas * 9000)
      + (excessoFolgaSecao * 26000)
      + (excessoFolgaTurno * 70000)
      + (maxFolgasTurnoDia * 2600)
      + (folgasPrimeiroDia * folgasPrimeiroDia * 2200)
      + (maxFolgasInicio * 1800)
      + (maxFolgasSecaoDia * 1400)
      + (somaQuadradosInicio * 18)
      + (somaQuadradosSecao * 10)
      + (somaQuadradosTurno * 8)
      + (somaQuadradosSemana * 3)
      + (repeticaoExata ? 250 : 0)
      + (desempate / 1000);
    const candidato = { padrao, folgas, score };
    if (!melhor || score < melhor.score) melhor = candidato;
    if (!errors.length && !excessoFolgaTurno && !excessoFolgaSecao && (!melhorIdeal || score < melhorIdeal.score)) {
      melhorIdeal = candidato;
    }
    if (!errors.length && !excessoFolgaTurno && (!melhorComCobertura || score < melhorComCobertura.score)) {
      melhorComCobertura = candidato;
    }
  });
  return melhorIdeal || melhorComCobertura || melhor || { padrao: getPadraoFolgaPorIndice(indiceSecao), folgas: [] };
}

function buildFuncionariosRascunhoBalanceado(funcionarios, turnos, mesRef, hojeIso = formatDateValue(new Date())) {
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
    const contagemFolgasSecao = new Map(diasMes.map((date) => [formatDateValue(date), 0]));
    const contagemFolgasSemanaSecao = new Map(diasMes.map((date) => [getWeekKeyFromIso(formatDateValue(date)), 0]));
    const contagensTurno = new Map();
    const turnoSizes = new Map();

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
          domingosTrabalhoAlvo
        });
        escolhido.folgas.forEach((data) => {
          contagemFolgasSecao.set(data, (contagemFolgasSecao.get(data) || 0) + 1);
          contagemFolgasTurno.set(data, (contagemFolgasTurno.get(data) || 0) + 1);
          const weekKey = getWeekKeyFromIso(data);
          contagemFolgasSemanaSecao.set(weekKey, (contagemFolgasSemanaSecao.get(weekKey) || 0) + 1);
        });
        payload.push(buildFuncionarioRascunhoComFolgas(funcionario, turno, mesRef, hojeIso, escolhido.folgas));
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
    criticas: ruleErrors.slice(0, 50)
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
