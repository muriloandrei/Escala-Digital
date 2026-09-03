const test = require('node:test');
const assert = require('node:assert/strict');
const monthlyReleaseService = require('../src/services/monthlyReleaseService');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado, buildFuncionariosLiberacao, getPadroesFolgaValidos } = monthlyReleaseService;
const { _private } = require('../src/services/escalaService');
const { validateEscalaPayload } = require('../src/rules/escalaRules');
const catalogService = require('../src/services/catalogService');
const escalaService = require('../src/services/escalaService');

test('monthly release builds draft only from today onward', () => {
  const funcionario = {
    ESCFUNC_ID: 10,
    CHAPA: '000010',
    NOME: 'Funcionario Teste',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30
  };
  const turno = {
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-08-01', '2026-08-15');

  assert.equal(rascunho.escfuncId, 10);
  assert.equal(rascunho.escsecaoTurnoId, 40);
  assert.equal(rascunho.dias[0].data, '2026-08-15');
  assert.equal(rascunho.dias.at(-1).data, '2026-08-31');
  assert.equal(rascunho.dias.some((dia) => dia.programacao === 'F'), true);
  assert.equal(rascunho.dias.some((dia) => dia.programacao === 'TRB'), true);
});

test('monthly release distributes 5x2 rests without consecutive Sunday work', () => {
  const funcionario = {
    ESCFUNC_ID: 11,
    CHAPA: '000011',
    NOME: 'Funcionario 5x2',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30
  };
  const turno = {
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-09-01', '2026-09-01', 0);
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: [rascunho]
  });

  assert.deepEqual(errors, []);
  assert.equal(rascunho.dias.filter((dia) => dia.programacao === 'F').length >= 8, true);
});

test('monthly release automatic patterns do not create consecutive rests', () => {
  const patterns = getPadroesFolgaValidos();
  assert.ok(patterns.length > 0);
  patterns.forEach((pattern) => {
    const folgas = new Set(pattern);
    for (let index = 0; index < 14; index += 1) {
      assert.equal(folgas.has(index) && folgas.has((index + 1) % 14), false, `padrao invalido: ${pattern.join(',')}`);
    }
  });
});

test('monthly release automatic patterns keep at most two rests per week', () => {
  const patterns = getPadroesFolgaValidos();
  assert.ok(patterns.length > 0);
  patterns.forEach((pattern) => {
    const weekOne = pattern.filter((index) => index >= 0 && index <= 6).length;
    const weekTwo = pattern.filter((index) => index >= 7 && index <= 13).length;
    assert.ok(weekOne <= 2, `semana 1 invalida: ${pattern.join(',')}`);
    assert.ok(weekTwo <= 2, `semana 2 invalida: ${pattern.join(',')}`);
  });
});

test('monthly release draft does not include consecutive automatic rests', () => {
  const funcionario = {
    ESCFUNC_ID: 12,
    CHAPA: '000012',
    NOME: 'Funcionario Sem Folga Seguida',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30
  };
  const turno = {
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-09-01', '2026-09-01', 0);
  const dias = rascunho.dias;
  for (let index = 1; index < dias.length; index += 1) {
    assert.equal(dias[index - 1].programacao === 'F' && dias[index].programacao === 'F', false);
  }
});

test('monthly release draft keeps at most two rests per employee week', () => {
  const funcionarios = Array.from({ length: 8 }, (_, index) => ({
    ESCFUNC_ID: 700 + index,
    CHAPA: `07070${index}`,
    NOME: `Funcionario Semana ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  const getWeekKey = (dataIso) => {
    const date = new Date(`${dataIso}T00:00:00`);
    const diffToMonday = date.getDay() === 0 ? -6 : 1 - date.getDay();
    date.setDate(date.getDate() + diffToMonday);
    return date.toISOString().slice(0, 10);
  };

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');

  rascunhos.forEach((funcionario) => {
    const folgasPorSemana = new Map();
    funcionario.dias
      .filter((dia) => dia.programacao === 'F')
      .forEach((dia) => {
        const weekKey = getWeekKey(dia.data);
        folgasPorSemana.set(weekKey, (folgasPorSemana.get(weekKey) || 0) + 1);
      });
    folgasPorSemana.forEach((total) => assert.ok(total <= 2));
  });
});

test('monthly release does not add automatic rest to a week already filled by fixed rests', () => {
  const funcionarios = [{
    ESCFUNC_ID: 880,
    CHAPA: '088000',
    NOME: 'Funcionario Com Fixos Semanais',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  const fixos = [
    { ESCFUNC_ID: 880, DT: '2026-09-02', PROGRAMACAO: 'FXF' },
    { ESCFUNC_ID: 880, DT: '2026-09-04', PROGRAMACAO: 'FXF' }
  ];

  const [rascunho] = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01', { fixos });
  const semanaInicial = rascunho.dias.filter((dia) => dia.data >= '2026-09-01' && dia.data <= '2026-09-06');

  assert.equal(semanaInicial.filter((dia) => dia.programacao === 'F').length, 0);
  assert.equal(semanaInicial.filter((dia) => dia.programacao === 'FXF').length, 2);
  assert.ok(rascunho.dias.filter((dia) => dia.data > '2026-09-06' && dia.programacao === 'F').length > 0);
});

test('monthly release applies vacations and absences as protected rest days', () => {
  const funcionarios = [{
    ESCFUNC_ID: 800,
    CHAPA: '080080',
    NOME: 'Funcionario Ausente',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01', {
    ausencias: [
      { ESCFUNC_ID: 800, CHAPA: '080080', DT_INIC: '2026-09-02', DT_FIM: '2026-09-03', MOTIVO: 'FER' },
      { ESCFUNC_ID: 800, CHAPA: '080080', DT_INIC: '2026-09-08', DT_FIM: '2026-09-08', MOTIVO: 'AFA' }
    ],
    fixos: [{ ESCFUNC_ID: 800, DT: '2026-09-02', PROGRAMACAO: 'TRB', HR_ENT1: '07:00', HR_SAI1: '11:00', HR_ENT2: '12:10', HR_SAI2: '15:58' }]
  });
  const dias = new Map(rascunhos[0].dias.map((dia) => [dia.data, dia]));

  assert.equal(dias.get('2026-09-02').programacao, 'FER');
  assert.equal(dias.get('2026-09-03').programacao, 'FER');
  assert.equal(dias.get('2026-09-08').programacao, 'AFA');
  assert.equal(dias.get('2026-09-02').hrEnt1, 'FER');
  assert.equal(dias.get('2026-09-08').hrSai2, 'AFA');
});

test('monthly release preserves fixed rest days before automatic distribution', () => {
  const funcionarios = [{
    ESCFUNC_ID: 810,
    CHAPA: '081081',
    NOME: 'Funcionario Fixo',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01', {
    fixos: [{ ESCFUNC_ID: 810, DT: '2026-09-10', PROGRAMACAO: 'FXF', JUSTIFICATIVA: 'Folga fixa do lider' }]
  });
  const diaFixo = rascunhos[0].dias.find((dia) => dia.data === '2026-09-10');

  assert.equal(diaFixo.programacao, 'FXF');
  assert.equal(diaFixo.hrEnt1, 'FXF');
  assert.equal(diaFixo.justificativa, 'Folga fixa do lider');
});

test('monthly release liberation creates only monthly headers', () => {
  const funcionarios = [{
    ESCFUNC_ID: 900,
    CHAPA: '090090',
    NOME: 'Funcionario Liberado',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const liberados = buildFuncionariosLiberacao(funcionarios, turnos);

  assert.equal(liberados.length, 1);
  assert.equal(liberados[0].dias.length, 0);
  assert.equal(liberados[0].turnoOficial.hrEnt1, '08:00');
});

test('monthly release keeps legacy 07:20 schedule and flags it as critique', () => {
  const funcionario = {
    ESCFUNC_ID: 13,
    CHAPA: '000013',
    NOME: 'Funcionario Horario Legado',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '16:30'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, null, '2026-09-01', '2026-09-01', 0);
  const primeiroTrabalho = rascunho.dias.find((dia) => dia.programacao === 'TRB');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: [rascunho]
  });

  assert.equal(primeiroTrabalho.hrEnt1, '08:00');
  assert.equal(primeiroTrabalho.hrSai1, '12:00');
  assert.equal(primeiroTrabalho.hrEnt2, '13:10');
  assert.equal(primeiroTrabalho.hrSai2, '16:30');
  assert.ok(errors.some((error) => error.includes('jornada total deve ser 08:48')));
});

test('monthly release balances rests between employees in the same section and shift', () => {
  const funcionarios = Array.from({ length: 6 }, (_, index) => ({
    ESCFUNC_ID: 100 + index,
    CHAPA: `01010${index}`,
    NOME: `Funcionario ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: rascunhos
  });
  const folgasPorDia = new Map();
  rascunhos.forEach((funcionario) => {
    funcionario.dias
      .filter((dia) => dia.programacao === 'F')
      .forEach((dia) => folgasPorDia.set(dia.data, (folgasPorDia.get(dia.data) || 0) + 1));
  });

  assert.deepEqual(errors, []);
  assert.equal(Math.max(...folgasPorDia.values()) < funcionarios.length, true);
  assert.equal(new Set([...folgasPorDia.values()]).size > 1, true);
});

test('monthly release separates balance by section and shift', () => {
  const funcionarios = [
    { ESCFUNC_ID: 1, CHAPA: 'A1', NOME: 'A1', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCFUNC_ID: 2, CHAPA: 'A2', NOME: 'A2', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCFUNC_ID: 3, CHAPA: 'B1', NOME: 'B1', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' },
    { ESCFUNC_ID: 4, CHAPA: 'B2', NOME: 'B2', LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 1, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' }
  ];
  const turnos = [
    { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCSECAOTURNO_ID: 41, ESCSECAO_ID: 20, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' }
  ];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');

  assert.deepEqual(rascunhos.map((item) => item.escsecaoTurnoId).sort(), [40, 40, 41, 41]);
});

test('monthly release balances rests across the whole section before each shift', () => {
  const funcionarios = [];
  for (let index = 0; index < 8; index += 1) {
    const segundoTurno = index >= 4;
    funcionarios.push({
      ESCFUNC_ID: 200 + index,
      CHAPA: `02020${index}`,
      NOME: `Funcionario Secao ${index + 1}`,
      LOJA: 10,
      ESCSECAO_ID: 20,
      ESCFUNCAO_ID: 30,
      HR_ENT1: segundoTurno ? '10:00' : '08:00',
      HR_SAI1: segundoTurno ? '14:00' : '12:00',
      HR_ENT2: segundoTurno ? '15:10' : '13:10',
      HR_SAI2: segundoTurno ? '19:58' : '17:58'
    });
  }
  const turnos = [
    { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCSECAOTURNO_ID: 41, ESCSECAO_ID: 20, HR_ENT1: '10:00', HR_SAI1: '14:00', HR_ENT2: '15:10', HR_SAI2: '19:58' }
  ];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: rascunhos
  });
  const folgasPorDiaSecao = new Map();
  const folgasPorDiaTurno = new Map();
  const assinaturaPorTurno = new Map();

  rascunhos.forEach((funcionario) => {
    const turnoKey = String(funcionario.escsecaoTurnoId);
    if (!folgasPorDiaTurno.has(turnoKey)) folgasPorDiaTurno.set(turnoKey, new Map());
    if (!assinaturaPorTurno.has(turnoKey)) assinaturaPorTurno.set(turnoKey, []);
    const folgas = funcionario.dias
      .filter((dia) => dia.programacao === 'F')
      .map((dia) => dia.data);
    assinaturaPorTurno.get(turnoKey).push(folgas.join('|'));
    folgas.forEach((data) => {
      folgasPorDiaSecao.set(data, (folgasPorDiaSecao.get(data) || 0) + 1);
      const turnoCounter = folgasPorDiaTurno.get(turnoKey);
      turnoCounter.set(data, (turnoCounter.get(data) || 0) + 1);
    });
  });

  assert.deepEqual(errors, []);
  const folgasForaDomingo = [...folgasPorDiaSecao.entries()]
    .filter(([data]) => new Date(`${data}T00:00:00`).getDay() !== 0)
    .map(([, total]) => total);
  assert.ok(Math.max(...folgasForaDomingo) <= 3);
  folgasPorDiaTurno.forEach((counter) => {
    assert.ok(Math.max(...counter.values()) <= 2);
  });
  assert.notDeepEqual(assinaturaPorTurno.get('40'), assinaturaPorTurno.get('41'));
});

test('monthly release smooths the first generated day and common days', () => {
  const funcionarios = Array.from({ length: 12 }, (_, index) => ({
    ESCFUNC_ID: 500 + index,
    CHAPA: `05050${index}`,
    NOME: `Funcionario Balanceado ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');
  const folgasPorDia = new Map();
  rascunhos.forEach((funcionario) => {
    funcionario.dias
      .filter((dia) => dia.programacao === 'F')
      .forEach((dia) => folgasPorDia.set(dia.data, (folgasPorDia.get(dia.data) || 0) + 1));
  });

  const limiteDiaComum = Math.ceil(funcionarios.length * 2 / 7);
  const folgasPrimeiroDia = rascunhos.filter((funcionario) => funcionario.dias[0]?.programacao === 'F').length;
  const maxFolgasDiaComum = Math.max(...[...folgasPorDia.entries()]
    .filter(([data]) => new Date(`${data}T00:00:00`).getDay() !== 0)
    .map(([, total]) => total));

  assert.ok(folgasPrimeiroDia <= limiteDiaComum);
  assert.ok(maxFolgasDiaComum <= limiteDiaComum);
});

test('monthly release does not repeat the same 14 day rest shape for every employee', () => {
  const funcionarios = Array.from({ length: 8 }, (_, index) => ({
    ESCFUNC_ID: 600 + index,
    CHAPA: `06060${index}`,
    NOME: `Funcionario Ciclo ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');
  const todosRepetemMesmoCiclo = rascunhos.every((funcionario) => {
    const folgas = funcionario.dias
      .map((dia, index) => dia.programacao === 'F' ? index : null)
      .filter((index) => index !== null);
    const primeiroCiclo = folgas.filter((index) => index < 14).join('|');
    const segundoCiclo = folgas.filter((index) => index >= 14 && index < 28).map((index) => index - 14).join('|');
    return primeiroCiclo === segundoCiclo;
  });

  assert.equal(todosRepetemMesmoCiclo, false);
});

test('monthly release avoids automatic consecutive worked Sundays', () => {
  const funcionarios = Array.from({ length: 3 }, (_, index) => ({
    ESCFUNC_ID: 900 + index,
    CHAPA: `09090${index}`,
    NOME: `Funcionario Domingo ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  const turnos = [{
    ESCSECAOTURNO_ID: 40,
    ESCSECAO_ID: 20,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: rascunhos
  });

  assert.equal(errors.some((error) => /domingos/i.test(error)), false);
});

test('section generation saves draft even when automatic validation returns critiques', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let savedPayload = null;

  catalogService.listFuncionariosByLoja = async () => [{
    ESCFUNC_ID: 300,
    CHAPA: '030030',
    NOME: 'Funcionario Com Critica',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '15:00',
    HR_ENT2: '16:10',
    HR_SAI2: '17:58'
  }];
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => [];
  escalaService.saveEscalasBatch = async (payload) => {
    savedPayload = payload;
    return payload.funcionarios;
  };

  try {
    const result = await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10,
      mesRef: '2026-09-01',
      escsecaoId: 20,
      hojeIso: '2026-09-01'
    });

    assert.equal(result.criada, true);
    assert.equal(result.funcionarios, 1);
    assert.ok(result.criticas.length > 0);
    assert.equal(savedPayload.oficializada, 0);
    assert.equal(savedPayload.funcionarios.length, 1);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('section generation can be limited to selected employees in a subsection', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let savedPayload = null;

  catalogService.listFuncionariosByLoja = async () => [301, 302, 303].map((id) => ({
    ESCFUNC_ID: id,
    CHAPA: `030${id}`,
    NOME: `Funcionario ${id}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => [];
  escalaService.saveEscalasBatch = async (payload) => {
    savedPayload = payload;
    return payload.funcionarios;
  };

  try {
    const result = await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10,
      mesRef: '2026-09-01',
      escsecaoId: 20,
      escfuncIds: [301, 303],
      hojeIso: '2026-09-01'
    });

    assert.equal(result.criada, true);
    assert.deepEqual(savedPayload.funcionarios.map((funcionario) => funcionario.escfuncId), [301, 303]);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('section generation preserves previous days and only generates editable dates', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let savedPayload = null;

  catalogService.listFuncionariosByLoja = async () => [{
    ESCFUNC_ID: 301,
    CHAPA: '030031',
    NOME: 'Funcionario Com Passado',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => [{
    ESCFUNC_ID: 301,
    DT: '2026-09-01',
    HR_ENT1: '07:30',
    HR_SAI1: '11:30',
    HR_ENT2: '12:40',
    HR_SAI2: '16:28',
    PROGRAMACAO: 'TRB'
  }];
  escalaService.saveEscalasBatch = async (payload) => {
    savedPayload = payload;
    return payload.funcionarios;
  };

  try {
    await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10,
      mesRef: '2026-09-01',
      escsecaoId: 20,
      hojeIso: '2026-09-02'
    });

    const dias = savedPayload.funcionarios[0].dias;
    assert.deepEqual(dias[0], {
      data: '2026-09-01',
      hrEnt1: '07:30',
      hrSai1: '11:30',
      hrEnt2: '12:40',
      hrSai2: '16:28',
      programacao: 'TRB',
      justificativa: null
    });
    assert.equal(dias.some((dia) => dia.data < '2026-09-01'), false);
    assert.equal(dias.some((dia) => dia.data === '2026-09-02'), true);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('section generation reports daily coverage below sixty percent', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  const funcionarios = Array.from({ length: 4 }, (_, index) => ({
    ESCFUNC_ID: 400 + index,
    CHAPA: `04040${index}`,
    NOME: `Funcionario Cobertura ${index + 1}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));

  catalogService.listFuncionariosByLoja = async () => funcionarios;
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [
    { ESCFUNC_ID: 400, DT: '2026-09-03', PROGRAMACAO: 'FXF' },
    { ESCFUNC_ID: 401, DT: '2026-09-03', PROGRAMACAO: 'FXF' }
  ];
  escalaService.listDiasSecaoAtual = async () => [];
  escalaService.saveEscalasBatch = async (payload) => payload.funcionarios;

  try {
    const result = await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10,
      mesRef: '2026-09-01',
      escsecaoId: 20,
      hojeIso: '2026-09-01'
    });

    assert.ok(result.criticas.some((critica) => critica.includes('Cobertura minima da secao abaixo de 60% em 2026-09-03')));
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('section reset blocks officialized schedule', async () => {
  const original = escalaService.isEscalaSecaoOficializada;
  escalaService.isEscalaSecaoOficializada = async () => true;

  try {
    await assert.rejects(
      () => monthlyReleaseService.resetarEscalaSecao({
        lojaId: 10,
        mesRef: '2026-09-01',
        escsecaoId: 20,
        hojeIso: '2026-09-02'
      }),
      (error) => error.statusCode === 422 && /oficializada/i.test(error.message)
    );
  } finally {
    escalaService.isEscalaSecaoOficializada = original;
  }
});

test('section reset preserves previous days and clears only editable dates', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    isEscalaSecaoOficializada: escalaService.isEscalaSecaoOficializada,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let savedPayload = null;

  catalogService.listFuncionariosByLoja = async () => [{
    ESCFUNC_ID: 501,
    CHAPA: '050001',
    NOME: 'Funcionario Reset',
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  catalogService.listTurnosByLoja = async () => [];
  escalaService.isEscalaSecaoOficializada = async () => false;
  escalaService.listDiasSecaoAtual = async () => [
    {
      ESCFUNC_ID: 501,
      DT: '2026-09-01',
      HR_ENT1: '07:30',
      HR_SAI1: '11:30',
      HR_ENT2: '12:40',
      HR_SAI2: '16:28',
      PROGRAMACAO: 'TRB'
    },
    {
      ESCFUNC_ID: 501,
      DT: '2026-09-02',
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:10',
      HR_SAI2: '17:58',
      PROGRAMACAO: 'TRB'
    }
  ];
  escalaService.saveEscalasBatch = async (payload) => {
    savedPayload = payload;
    return payload.funcionarios;
  };

  try {
    const result = await monthlyReleaseService.resetarEscalaSecao({
      lojaId: 10,
      mesRef: '2026-09-01',
      escsecaoId: 20,
      hojeIso: '2026-09-02'
    });

    assert.equal(result.resetada, true);
    assert.equal(savedPayload.funcionarios.length, 1);
    assert.deepEqual(savedPayload.funcionarios[0].dias, [{
      data: '2026-09-01',
      hrEnt1: '07:30',
      hrSai1: '11:30',
      hrEnt2: '12:40',
      hrSai2: '16:28',
      programacao: 'TRB',
      justificativa: null
    }]);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    escalaService.isEscalaSecaoOficializada = originals.isEscalaSecaoOficializada;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('date lock blocks only previous days, not current day', () => {
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-14', '2026-08-15'), true);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-15', '2026-08-15'), false);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-16', '2026-08-15'), false);
});
