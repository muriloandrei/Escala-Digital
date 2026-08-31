const test = require('node:test');
const assert = require('node:assert/strict');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado, getPadroesFolgaValidos } = require('../src/services/monthlyReleaseService');
const { _private } = require('../src/services/escalaService');
const { validateEscalaPayload } = require('../src/rules/escalaRules');

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

test('date lock blocks only previous days, not current day', () => {
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-14', '2026-08-15'), true);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-15', '2026-08-15'), false);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-16', '2026-08-15'), false);
});
