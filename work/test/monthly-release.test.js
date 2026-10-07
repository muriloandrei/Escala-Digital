const test = require('node:test');
const assert = require('node:assert/strict');
const monthlyReleaseService = require('../src/services/monthlyReleaseService');
const { buildFuncionarioRascunho, buildFuncionariosRascunhoBalanceado, buildFuncionariosLiberacao, getPadroesFolgaValidos } = monthlyReleaseService;
const { _private } = require('../src/services/escalaService');
const { validateEscalaPayload } = require('../src/rules/escalaRules');
const catalogService = require('../src/services/catalogService');
const escalaService = require('../src/services/escalaService');
const pendenciaFuncionarioService = require('../src/services/pendenciaFuncionarioService');
pendenciaFuncionarioService.listarIntervalosSuspensos = async () => new Map();

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
  assert.equal(rascunho.dias.at(-1).data, '2026-09-06');
  assert.equal(rascunho.dias.some((dia) => dia.programacao === 'F'), true);
  assert.equal(rascunho.dias.some((dia) => dia.programacao === 'TRB'), true);
});

test('monthly release uses the employee schedule before the section shift', () => {
  const funcionario = {
    ESCFUNC_ID: 10, CHAPA: '000010', NOME: 'Funcionario Teste',
    ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '09:00', HR_SAI1: '13:00', HR_ENT2: '14:10', HR_SAI2: '18:58'
  };
  const turno = {
    ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  };
  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-10-05', '2026-10-05');
  const trabalho = rascunho.dias.find((dia) => dia.programacao === 'TRB');
  assert.ok(trabalho);
  assert.equal(trabalho.hrEnt1, '09:00');
  assert.equal(trabalho.hrSai2, '18:58');
});

test('scale upsert after inactive month uses a revision above inactive history', () => {
  assert.equal(_private.escolherRevisaoParaUpsertSemNovaRevisao(null, null), 0);
  assert.equal(_private.escolherRevisaoParaUpsertSemNovaRevisao(2, 4), 2);
  assert.equal(_private.escolherRevisaoParaUpsertSemNovaRevisao(null, 0), 1);
  assert.equal(_private.escolherRevisaoParaUpsertSemNovaRevisao(null, 7), 8);
});

test('history query adapts to legacy audit columns', () => {
  const columns = new Set(['ESCAUDITORIA_ID', 'USUARIO', 'TIPO_ACAO', 'OBJETO', 'ESCPROG_ID', 'DESCRICAO', 'CRIADO_EM']);
  const query = _private.buildHistoricoAuditoriaQuery(columns, { lojaId: 2, mesRef: '2026-10-01', lojasPermitidas: [2] });

  assert.match(query.sql, /a\.escauditoria_id as auditoria_id/);
  assert.match(query.sql, /a\.usuario as login/);
  assert.match(query.sql, /a\.descricao as detalhe/);
  assert.doesNotMatch(query.sql, /a\.loja|a\.mes_ref|a\.auditoria_id|a\.dt_hr_incl/);
  assert.deepEqual(query.binds, {});
});

test('history query adapts loja and month filters to text audit columns', () => {
  const columns = new Set(['AUDITORIA_ID', 'LOJA', 'MES_REF', 'DT_HR_INCL']);
  const columnDetails = new Map([
    ['LOJA', { dataType: 'VARCHAR2' }],
    ['MES_REF', { dataType: 'VARCHAR2' }],
    ['DT_HR_INCL', { dataType: 'DATE' }]
  ]);
  const query = _private.buildHistoricoAuditoriaQuery(
    columns,
    { lojaId: 2, mesRef: '2026-10-01', lojasPermitidas: [2] },
    columnDetails
  );

  assert.match(query.sql, /to_char\(a\.loja\) = :lojaIdText/);
  assert.match(query.sql, /substr\(to_char\(a\.mes_ref\), 1, 10\) = :mesRef/);
  assert.deepEqual(query.binds, { lojaIdText: '2', mesRef: '2026-10-01' });
});

test('history query converts clob audit details before JSON response', () => {
  const columns = new Set(['AUDITORIA_ID', 'DETALHE']);
  const columnDetails = new Map([
    ['DETALHE', { dataType: 'CLOB' }]
  ]);
  const query = _private.buildHistoricoAuditoriaQuery(columns, {}, columnDetails);

  assert.match(query.sql, /dbms_lob\.substr\(a\.detalhe, 1000, 1\) as detalhe/);
});

test('monthly release uses complete operational weeks from first Monday to last Sunday', () => {
  const funcionario = {
    ESCFUNC_ID: 14,
    CHAPA: '000014',
    NOME: 'Funcionario Outubro',
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

  const rascunho = buildFuncionarioRascunho(funcionario, turno, '2026-10-01', '2026-01-01');

  assert.equal(rascunho.dias[0].data, '2026-10-05');
  assert.equal(rascunho.dias.at(-1).data, '2026-11-01');
  assert.equal(rascunho.dias.length, 28);
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

test('monthly release fixes apprentice work schedule to 05:15', () => {
  const funcionario = {
    ESCFUNC_ID: 15,
    CHAPA: '000015',
    NOME: 'Funcionario Aprendiz',
    FUNCAO_DESCR: 'JOVEM APRENDIZ',
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  };

  const rascunho = buildFuncionarioRascunho(funcionario, null, '2026-09-01', '2026-09-01', 0);
  const trabalho = rascunho.dias.find((dia) => dia.programacao === 'TRB');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: [rascunho]
  });

  assert.equal(rascunho.aprendiz, true);
  assert.equal(trabalho.hrEnt1, '08:00');
  assert.equal(trabalho.hrSai1, '13:15');
  assert.equal(trabalho.hrEnt2, null);
  assert.equal(trabalho.hrSai2, null);
  assert.deepEqual(errors, []);
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
    { ESCFUNC_ID: 880, DT: '2026-09-08', PROGRAMACAO: 'FXF' },
    { ESCFUNC_ID: 880, DT: '2026-09-10', PROGRAMACAO: 'FXF' }
  ];

  const [rascunho] = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-01', { fixos });
  const semanaInicial = rascunho.dias.filter((dia) => dia.data >= '2026-09-07' && dia.data <= '2026-09-13');

  assert.equal(semanaInicial.filter((dia) => dia.programacao === 'F').length, 0);
  assert.equal(semanaInicial.filter((dia) => dia.programacao === 'FXF').length, 2);
  assert.ok(rascunho.dias.filter((dia) => dia.data > '2026-09-13' && dia.programacao === 'F').length > 0);
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
      { ESCFUNC_ID: 800, CHAPA: '080080', DT_INIC: '2026-09-08', DT_FIM: '2026-09-09', MOTIVO: 'FER' },
      { ESCFUNC_ID: 800, CHAPA: '080080', DT_INIC: '2026-09-10', DT_FIM: '2026-09-10', MOTIVO: 'AFA' },
      { ESCFUNC_ID: 999999, CHAPA: '080080', DT_INIC: '2026-09-11', DT_FIM: '2026-09-11', MOTIVO: 'AFASTAMENTO' }
    ],
    fixos: [{ ESCFUNC_ID: 800, DT: '2026-09-02', PROGRAMACAO: 'TRB', HR_ENT1: '07:00', HR_SAI1: '11:00', HR_ENT2: '12:10', HR_SAI2: '15:58' }]
  });
  const dias = new Map(rascunhos[0].dias.map((dia) => [dia.data, dia]));

  assert.equal(dias.get('2026-09-08').programacao, 'FER');
  assert.equal(dias.get('2026-09-09').programacao, 'FER');
  assert.equal(dias.get('2026-09-10').programacao, 'AFA');
  assert.equal(dias.get('2026-09-11').programacao, 'AFA');
  assert.equal(dias.get('2026-09-08').hrEnt1, 'FER');
  assert.equal(dias.get('2026-09-10').hrSai2, 'AFA');
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

test('monthly release liberation creates monthly headers with protected absence days', () => {
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

  const liberados = buildFuncionariosLiberacao(funcionarios, turnos, '2026-09-01', '2026-09-01', {
    ausencias: [
      { ESCFUNC_ID: 900, DT_INIC: '2026-09-08', DT_FIM: '2026-09-09', MOTIVO: 'FERIAS' },
      { ESCFUNC_ID: 900, DT_INIC: '2026-09-10', DT_FIM: '2026-09-10', MOTIVO: 'AFASTAMENTO' }
    ]
  });

  assert.equal(liberados.length, 1);
  assert.equal(liberados[0].dias.length, 3);
  assert.deepEqual(liberados[0].dias.map((dia) => [dia.data, dia.programacao]), [
    ['2026-09-08', 'FER'],
    ['2026-09-09', 'FER'],
    ['2026-09-10', 'AFA']
  ]);
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

test('monthly release first day smoothing keeps minimum rest distribution', () => {
  const funcionarios = Array.from({ length: 12 }, (_, index) => ({
    ESCFUNC_ID: 550 + index,
    CHAPA: `05550${index}`,
    NOME: `Funcionario Minimo ${index + 1}`,
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
  const folgasEsperadas = Math.max(1, Math.round(rascunhos[0].dias.length * 2 / 7));

  rascunhos.forEach((funcionario) => {
    const folgasFuncionario = funcionario.dias.filter((dia) => dia.programacao === 'F').length;
    assert.ok(folgasFuncionario >= folgasEsperadas, `${funcionario.nome} ficou com ${folgasFuncionario}/${folgasEsperadas} folgas`);
  });
});

test('monthly release rebalancing keeps rest in final partial week', () => {
  const funcionarios = Array.from({ length: 27 }, (_, index) => {
    const shift = index % 3;
    return {
      ESCFUNC_ID: 650 + index,
      CHAPA: `0630${String(index).padStart(3, '0')}`,
      NOME: `Funcionario Frente ${index + 1}`,
      LOJA: 10,
      ESCSECAO_ID: 20,
      ESCFUNCAO_ID: 30,
      HR_ENT1: shift === 0 ? '12:00' : shift === 1 ? '07:30' : '07:00',
      HR_SAI1: shift === 0 ? '16:00' : shift === 1 ? '13:00' : '12:00',
      HR_ENT2: shift === 0 ? '17:10' : shift === 1 ? '14:10' : '13:10',
      HR_SAI2: shift === 0 ? '21:58' : shift === 1 ? '17:28' : '16:58'
    };
  });
  const turnos = [
    { ESCSECAOTURNO_ID: 40, ESCSECAO_ID: 20, HR_ENT1: '12:00', HR_SAI1: '16:00', HR_ENT2: '17:10', HR_SAI2: '21:58' },
    { ESCSECAOTURNO_ID: 41, ESCSECAO_ID: 20, HR_ENT1: '07:30', HR_SAI1: '13:00', HR_ENT2: '14:10', HR_SAI2: '17:28' },
    { ESCSECAOTURNO_ID: 42, ESCSECAO_ID: 20, HR_ENT1: '07:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '16:58' }
  ];

  const rascunhos = buildFuncionariosRascunhoBalanceado(funcionarios, turnos, '2026-09-01', '2026-09-04');
  const errors = validateEscalaPayload({
    lojaId: 10,
    mesRef: '2026-09-01',
    funcionarios: rascunhos
  });

  assert.equal(errors.some((error) => error.includes('semana iniciada em 2026-09-28')), false);
  rascunhos.forEach((funcionario) => {
    const descansosSemanaFinal = funcionario.dias.filter((dia) => dia.data >= '2026-09-28' && dia.programacao !== 'TRB').length;
    assert.ok(descansosSemanaFinal >= 1, `${funcionario.nome} ficou sem descanso na semana parcial final`);
  });
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
    assert.equal(savedPayload.criarRevisao, false);
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

test('section generation leaves suspended employees out of a new draft', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch,
    listarIntervalosSuspensos: pendenciaFuncionarioService.listarIntervalosSuspensos
  };
  let savedPayload;
  catalogService.listFuncionariosByLoja = async () => [301, 302].map((id) => ({
    ESCFUNC_ID: id, CHAPA: String(id), NOME: `Funcionario ${id}`,
    LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }));
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => [];
  escalaService.saveEscalasBatch = async (payload) => { savedPayload = payload; return payload.funcionarios; };
  pendenciaFuncionarioService.listarIntervalosSuspensos = async () => new Map([[302, {
    inicio: '2026-10-05', fim: '2026-11-01'
  }]]);
  try {
    const result = await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10, mesRef: '2026-10-01', escsecaoId: 20, hojeIso: '2026-10-05'
    });
    assert.equal(result.criada, true);
    assert.deepEqual(savedPayload.funcionarios.map((item) => item.escfuncId), [301]);

    escalaService.listDiasSecaoAtual = async () => [{
      ESCFUNC_ID: 302, DT: '2026-10-14', PROGRAMACAO: 'TRB',
      HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
    }];
    await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10, mesRef: '2026-10-01', escsecaoId: 20, hojeIso: '2026-10-05'
    });
    assert.deepEqual(savedPayload.funcionarios.map((item) => item.escfuncId), [301, 302]);
    assert.deepEqual(savedPayload.funcionarios.find((item) => item.escfuncId === 302).dias, []);

    escalaService.listDiasSecaoAtual = async () => ['2026-10-13', '2026-10-16'].map((data) => ({
      ESCFUNC_ID: 302, DT: data, PROGRAMACAO: 'TRB',
      HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
    }));
    await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10, mesRef: '2026-10-01', escsecaoId: 20, hojeIso: '2026-10-15'
    });
    assert.deepEqual(savedPayload.funcionarios.find((item) => item.escfuncId === 302).dias.map((dia) => dia.data), ['2026-10-13']);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
    pendenciaFuncionarioService.listarIntervalosSuspensos = originals.listarIntervalosSuspensos;
  }
});

test('partial suspension keeps generation before and after its effective dates', async () => {
  const funcionarios = [301, 302, 303].map((id) => ({
    ESCFUNC_ID: id, CHAPA: String(id), NOME: `Funcionario ${id}`,
    LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }));
  const suspensoes = new Map([[302, { inicio: '2026-10-14', fim: '2026-10-20' }]]);
  const payload = monthlyReleaseService.buildFuncionariosRascunhoBalanceado(
    funcionarios, [], '2026-10-01', '2026-10-05', { suspensoes }
  );
  const diasSuspenso = payload.find((item) => item.escfuncId === 302).dias;
  const diasOutro = payload.find((item) => item.escfuncId === 301).dias;

  assert.ok(diasSuspenso.some((dia) => dia.data === '2026-10-13'));
  assert.ok(diasSuspenso.some((dia) => dia.data === '2026-10-21'));
  assert.equal(diasSuspenso.some((dia) => dia.data >= '2026-10-14' && dia.data <= '2026-10-20'), false);
  assert.equal(diasOutro.some((dia) => dia.data === '2026-10-14'), true);
  assert.deepEqual(validateEscalaPayload({ lojaId: 10, mesRef: '2026-10-01', funcionarios: payload }), []);
});

test('a single eligible day does not force an automatic rest', () => {
  const funcionario = {
    ESCFUNC_ID: 302, CHAPA: '302', NOME: 'Funcionario 302',
    LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  };
  const payload = monthlyReleaseService.buildFuncionariosRascunhoBalanceado(
    [funcionario], [], '2026-10-01', '2026-10-05', {
      suspensoes: new Map([[302, { inicio: '2026-10-06', fim: '2026-11-01' }]])
    }
  );
  assert.deepEqual(payload[0].dias.map((dia) => [dia.data, dia.programacao]), [['2026-10-05', 'TRB']]);
  assert.deepEqual(validateEscalaPayload({ lojaId: 10, mesRef: '2026-10-01', funcionarios: payload }), []);
});

test('monthly liberation does not copy protected days inside a partial suspension', () => {
  const funcionario = {
    ESCFUNC_ID: 302, CHAPA: '302', NOME: 'Funcionario 302',
    LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  };
  const payload = monthlyReleaseService.buildFuncionariosLiberacao(
    [funcionario], [], '2026-10-01', '2026-10-05', {
      suspensoes: new Map([[302, { inicio: '2026-10-14', fim: '2026-10-20' }]]),
      fixos: [
        { ESCFUNC_ID: 302, DT: '2026-10-13', PROGRAMACAO: 'FXF' },
        { ESCFUNC_ID: 302, DT: '2026-10-15', PROGRAMACAO: 'FXF' },
        { ESCFUNC_ID: 302, DT: '2026-10-21', PROGRAMACAO: 'FXF' }
      ]
    }
  );
  assert.deepEqual(payload[0].dias.map((dia) => dia.data), ['2026-10-13', '2026-10-21']);
});

test('RM absence remains visible even while a local suspension is open', () => {
  const funcionario = {
    ESCFUNC_ID: 302, CHAPA: '302', NOME: 'Funcionario 302',
    LOJA: 10, ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  };
  const opcoes = {
    suspensoes: new Map([[302, { inicio: '2026-10-14', fim: '2026-10-20' }]]),
    ausencias: [{ ESCFUNC_ID: 302, DT_INIC: '2026-10-16', DT_FIM: '2026-10-17', MOTIVO: 'FERIAS' }]
  };
  const protegidos = monthlyReleaseService.buildFuncionariosLiberacao(
    [funcionario], [], '2026-10-01', '2026-10-05', opcoes
  )[0].dias;
  const gerados = monthlyReleaseService.buildFuncionariosRascunhoBalanceado(
    [funcionario], [], '2026-10-01', '2026-10-05', opcoes
  )[0].dias;
  assert.deepEqual(protegidos.map((dia) => dia.data), ['2026-10-16', '2026-10-17']);
  assert.ok(gerados.filter((dia) => ['2026-10-16', '2026-10-17'].includes(dia.data))
    .every((dia) => dia.programacao === 'FER'));
  assert.equal(gerados.some((dia) => dia.data === '2026-10-15'), false);
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
    assert.equal(savedPayload.criarRevisao, false);
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
  escalaService.listDiasSecaoAtual = async () => [
    {
      ESCFUNC_ID: 301,
      DT: '2026-09-06',
      HR_ENT1: '07:30',
      HR_SAI1: '11:30',
      HR_ENT2: '12:40',
      HR_SAI2: '16:28',
      PROGRAMACAO: 'TRB'
    },
    {
      ESCFUNC_ID: 301,
      DT: '2026-09-07',
      HR_ENT1: '07:30',
      HR_SAI1: '11:30',
      HR_ENT2: '12:40',
      HR_SAI2: '16:28',
      PROGRAMACAO: 'TRB'
    }
  ];
  escalaService.saveEscalasBatch = async (payload) => {
    savedPayload = payload;
    return payload.funcionarios;
  };

  try {
    await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10,
      mesRef: '2026-09-01',
      escsecaoId: 20,
      hojeIso: '2026-09-08'
    });

    const dias = savedPayload.funcionarios[0].dias;
    assert.deepEqual(dias[0], {
      data: '2026-09-07',
      hrEnt1: '07:30',
      hrSai1: '11:30',
      hrEnt2: '12:40',
      hrSai2: '16:28',
      programacao: 'TRB',
      justificativa: null
    });
    assert.equal(dias.some((dia) => dia.data < '2026-09-07'), false);
    assert.equal(dias.some((dia) => dia.data === '2026-09-08'), true);
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
    { ESCFUNC_ID: 400, DT: '2026-09-09', PROGRAMACAO: 'FXF' },
    { ESCFUNC_ID: 401, DT: '2026-09-09', PROGRAMACAO: 'FXF' }
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

    assert.ok(result.criticas.some((critica) => critica.includes('Cobertura minima da secao abaixo de 60% em 2026-09-09')));
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

test('section reset preserves previous days and restores future protected absences', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    isEscalaSecaoOficializada: escalaService.isEscalaSecaoOficializada,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasBatch: escalaService.saveEscalasBatch,
    listarIntervalosSuspensos: pendenciaFuncionarioService.listarIntervalosSuspensos
  };
  let savedPayload = null;

  catalogService.listFuncionariosByLoja = async () => [501, 502].map((id) => ({
    ESCFUNC_ID: id,
    CHAPA: `050${id}`,
    NOME: `Funcionario Reset ${id}`,
    LOJA: 10,
    ESCSECAO_ID: 20,
    ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }));
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [
    { ESCFUNC_ID: 501, DT_INIC: '2026-09-08', DT_FIM: '2026-09-08', MOTIVO: 'FERIAS' },
    { ESCFUNC_ID: 501, DT_INIC: '2026-09-09', DT_FIM: '2026-09-09', MOTIVO: 'AFASTAMENTO' }
  ];
  escalaService.isEscalaSecaoOficializada = async () => false;
  escalaService.listFixosEscala = async () => [
    { ESCFUNC_ID: 501, DT: '2026-09-10', PROGRAMACAO: 'FXF' }
  ];
  pendenciaFuncionarioService.listarIntervalosSuspensos = async () => new Map([[501, {
    inicio: '2026-09-09', fim: '2026-09-10'
  }]]);
  escalaService.listDiasSecaoAtual = async () => [
    {
      ESCFUNC_ID: 501,
      DT: '2026-09-07',
      HR_ENT1: '07:30',
      HR_SAI1: '11:30',
      HR_ENT2: '12:40',
      HR_SAI2: '16:28',
      PROGRAMACAO: 'TRB'
    },
    {
      ESCFUNC_ID: 501,
      DT: '2026-09-06',
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
      escfuncIds: [501],
      hojeIso: '2026-09-08'
    });

    assert.equal(result.resetada, true);
    assert.deepEqual(result.escfuncIds, [501]);
    assert.equal(savedPayload.criarRevisao, false);
    assert.equal(savedPayload.funcionarios.length, 1);
    assert.equal(savedPayload.funcionarios[0].escfuncId, 501);
    assert.deepEqual(savedPayload.funcionarios[0].dias, [{
      data: '2026-09-07',
      hrEnt1: '07:30',
      hrSai1: '11:30',
      hrEnt2: '12:40',
      hrSai2: '16:28',
      programacao: 'TRB',
      justificativa: null
    }, {
      data: '2026-09-08',
      hrEnt1: 'FER',
      hrSai1: 'FER',
      hrEnt2: 'FER',
      hrSai2: 'FER',
      programacao: 'FER',
      justificativa: 'FERIAS'
    }, {
      data: '2026-09-09',
      hrEnt1: 'AFA',
      hrSai1: 'AFA',
      hrEnt2: 'AFA',
      hrSai2: 'AFA',
      programacao: 'AFA',
      justificativa: 'AFASTAMENTO'
    }]);

    pendenciaFuncionarioService.listarIntervalosSuspensos = async () => new Map([[502, {
      inicio: '2026-09-07', fim: '2026-10-04'
    }]]);
    escalaService.listDiasSecaoAtual = async () => [{
      ESCFUNC_ID: 502, DT: '2026-09-09', PROGRAMACAO: 'TRB',
      HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
    }];
    await monthlyReleaseService.resetarEscalaSecao({
      lojaId: 10, mesRef: '2026-09-01', escsecaoId: 20, escfuncIds: [502], hojeIso: '2026-09-08'
    });
    assert.deepEqual(savedPayload.funcionarios.map((item) => item.escfuncId), [502]);
    assert.deepEqual(savedPayload.funcionarios[0].dias, []);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.isEscalaSecaoOficializada = originals.isEscalaSecaoOficializada;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
    pendenciaFuncionarioService.listarIntervalosSuspensos = originals.listarIntervalosSuspensos;
  }
});

test('section reset includes saved employees no longer in the active section catalog', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    isEscalaSecaoOficializada: escalaService.isEscalaSecaoOficializada,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasBatch: escalaService.saveEscalasBatch,
    listarIntervalosSuspensos: pendenciaFuncionarioService.listarIntervalosSuspensos
  };
  let savedPayload;
  catalogService.listFuncionariosByLoja = async (_lojaId, options) => options.secoesPermitidas ? [] : [{
    ESCFUNC_ID: 701, CHAPA: '000701', NOME: 'Transferido', ESCSECAO_ID: 30, ESCFUNCAO_ID: 40,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }];
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.isEscalaSecaoOficializada = async () => false;
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => [{ ESCFUNC_ID: 701, DT: '2026-10-12', PROGRAMACAO: 'TRB' }];
  escalaService.saveEscalasBatch = async (payload) => { savedPayload = payload; return payload.funcionarios; };
  pendenciaFuncionarioService.listarIntervalosSuspensos = async () => new Map();
  try {
    const result = await monthlyReleaseService.resetarEscalaSecao({
      lojaId: 10, mesRef: '2026-10-01', escsecaoId: 20, hojeIso: '2026-10-05'
    });
    assert.equal(result.resetada, true);
    assert.deepEqual(savedPayload.funcionarios.map((item) => item.escfuncId), [701]);
    assert.equal(savedPayload.funcionarios[0].escsecaoId, 20);
  } finally {
    Object.assign(catalogService, { listFuncionariosByLoja: originals.listFuncionariosByLoja, listTurnosByLoja: originals.listTurnosByLoja, listAusenciasByLojaMes: originals.listAusenciasByLojaMes });
    Object.assign(escalaService, { isEscalaSecaoOficializada: originals.isEscalaSecaoOficializada, listDiasSecaoAtual: originals.listDiasSecaoAtual, listFixosEscala: originals.listFixosEscala, saveEscalasBatch: originals.saveEscalasBatch });
    pendenciaFuncionarioService.listarIntervalosSuspensos = originals.listarIntervalosSuspensos;
  }
});

test('monthly release defaults to operational sections led by Frente de Caixa', async () => {
  const originals = {
    listSecoesByLoja: catalogService.listSecoesByLoja,
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listEscalasResumo: escalaService.listEscalasResumo,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let resumoOptions = null;
  let funcionariosOptions = null;
  let turnosOptions = null;
  let savedPayload = null;

  catalogService.listSecoesByLoja = async () => [
    { ESCSECAO_ID: 20, DESCR: '010.02.002 - Frente de Caixa' },
    { ESCSECAO_ID: 23, DESCR: '010.03.001 - Servicos a Clientes' },
    { ESCSECAO_ID: 24, DESCR: '010.03.002 - Transportes' },
    { ESCSECAO_ID: 21, DESCR: '010.02.001 - Deposito Lideranca' },
    { ESCSECAO_ID: 22, DESCR: '010.02.006 - Mercearia Lideranca' }
  ];
  escalaService.listEscalasResumo = async (options) => {
    resumoOptions = options;
    return [];
  };
  catalogService.listFuncionariosByLoja = async (_lojaId, options) => {
    funcionariosOptions = options;
    return [{
      ESCFUNC_ID: 700,
      CHAPA: '070000',
      NOME: 'Funcionario Frente',
      LOJA: 35,
      ESCSECAO_ID: 20,
      ESCFUNCAO_ID: 30,
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:10',
      HR_SAI2: '17:58'
    }];
  };
  catalogService.listTurnosByLoja = async (_lojaId, options) => {
    turnosOptions = options;
    return [{
      ESCSECAOTURNO_ID: 40,
      ESCSECAO_ID: 20,
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:10',
      HR_SAI2: '17:58'
    }];
  };
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.saveEscalasBatch = async (payload) => {
    savedPayload = payload;
    return payload.funcionarios;
  };

  try {
    const preview = await monthlyReleaseService.liberarEscalaLojaMes({
      lojaId: 35,
      mesRef: '2026-09-01',
      hojeIso: '2026-09-01',
      dryRun: true
    });
    assert.equal(preview.prevista, true);
    assert.equal(preview.funcionarios, 1);
    assert.equal(savedPayload, null);

    const result = await monthlyReleaseService.liberarEscalaLojaMes({
      lojaId: 35,
      mesRef: '2026-09-01',
      hojeIso: '2026-09-01'
    });

    assert.equal(result.criada, true);
    assert.equal(result.escopo, 'Frente de Caixa, Servicos a Clientes e Transportes');
    assert.deepEqual(resumoOptions.secoesPermitidas, [20, 23, 24]);
    assert.deepEqual(funcionariosOptions.secoesPermitidas, [20, 23, 24]);
    assert.deepEqual(turnosOptions.secoesPermitidas, [20, 23, 24]);
    assert.equal(savedPayload.funcionarios.length, 1);
    assert.equal(savedPayload.funcionarios[0].escsecaoId, 20);
  } finally {
    catalogService.listSecoesByLoja = originals.listSecoesByLoja;
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listEscalasResumo = originals.listEscalasResumo;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('monthly release includes Fiscal Remoto only for loja 999', async () => {
  const originals = {
    listSecoesByLoja: catalogService.listSecoesByLoja,
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listEscalasResumo: escalaService.listEscalasResumo,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let funcionariosOptions = null;

  catalogService.listSecoesByLoja = async () => [
    { ESCSECAO_ID: 90, COD_SECAO: '999.03.008', DESCR: 'Fiscal Remoto' },
    { ESCSECAO_ID: 91, DESCR: '999.02.002 - Frente de Caixa' }
  ];
  escalaService.listEscalasResumo = async () => [];
  catalogService.listFuncionariosByLoja = async (_lojaId, options) => {
    funcionariosOptions = options;
    return [{
      ESCFUNC_ID: 990,
      CHAPA: '099990',
      NOME: 'Funcionario Remoto',
      LOJA: 999,
      ESCSECAO_ID: 90,
      ESCFUNCAO_ID: 930,
      HR_ENT1: '08:00',
      HR_SAI1: '12:00',
      HR_ENT2: '13:10',
      HR_SAI2: '17:58'
    }];
  };
  catalogService.listTurnosByLoja = async () => [{
    ESCSECAOTURNO_ID: 940,
    ESCSECAO_ID: 90,
    HR_ENT1: '08:00',
    HR_SAI1: '12:00',
    HR_ENT2: '13:10',
    HR_SAI2: '17:58'
  }];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.saveEscalasBatch = async (payload) => payload.funcionarios;

  try {
    const result = await monthlyReleaseService.liberarEscalaLojaMes({
      lojaId: 999,
      mesRef: '2026-09-01',
      hojeIso: '2026-09-01'
    });

    assert.equal(result.criada, true);
    assert.equal(result.escopo, 'Frente de Caixa, Servicos a Clientes, Transportes e Fiscal Remoto');
    assert.deepEqual(funcionariosOptions.secoesPermitidas, [90, 91]);
  } finally {
    catalogService.listSecoesByLoja = originals.listSecoesByLoja;
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listEscalasResumo = originals.listEscalasResumo;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('monthly scale detail does not add catalog sections outside active schedule', () => {
  const rows = [
    { ESCFUNC_ID: 1, ESCSECAO_ID: 20, SECAO_DESCR: 'Frente de Caixa' }
  ];
  const funcionariosCatalogo = [
    { ESCFUNC_ID: 1, ESCSECAO_ID: 20, SECAO_DESCR: 'Frente de Caixa' },
    { ESCFUNC_ID: 2, ESCSECAO_ID: 30, SECAO_DESCR: 'Deposito Lideranca' },
    { ESCFUNC_ID: 3, ESCSECAO_ID: 40, SECAO_DESCR: 'Mercearia Lideranca' }
  ];

  const filtrados = _private.filtrarFuncionariosCatalogoPorSecoesEscala(funcionariosCatalogo, rows);

  assert.deepEqual(filtrados.map((funcionario) => funcionario.ESCFUNC_ID), [1]);
});

test('monthly scale read keeps days through dismissal and flags later saved days', () => {
  const rows = [
    { ESCFUNC_ID: 1, DT_DEMISS: new Date(2026, 9, 18), DT: new Date(2026, 9, 17) },
    { ESCFUNC_ID: 1, DT_DEMISS: new Date(2026, 9, 18), DT: new Date(2026, 9, 18) },
    { ESCFUNC_ID: 1, DT_DEMISS: new Date(2026, 9, 18), DT: new Date(2026, 9, 19) },
    { ESCFUNC_ID: 2, DT_DEMISS: null, DT: new Date(2026, 9, 19) }
  ];
  const projected = _private.projetarDemissoesNaEscala(rows, '2026-10-20');
  assert.deepEqual(projected.rows.map((row) => row.ESCFUNC_ID), [1, 1, 2]);
  assert.deepEqual(projected.pendencias, { dias: 1, funcionarios: 1, futuros: 0, passados: 1 });
  assert.deepEqual(_private.listarDiasAposDemissao(rows).map((row) => row.ESCFUNC_ID), [1]);
});

test('edits cannot add or change days after dismissal, but can preserve stale days for cleanup', () => {
  const atual = { DT: '2026-10-19', PROGRAMACAO: 'TRB', HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' };
  const igual = { data: '2026-10-19', programacao: 'TRB', hrEnt1: '08:00', hrSai1: '12:00', hrEnt2: '13:10', hrSai2: '17:58' };
  assert.doesNotThrow(() => _private.assertSemNovaProgramacaoAposDemissao([igual], [atual], '2026-10-18'));
  assert.doesNotThrow(() => _private.assertSemNovaProgramacaoAposDemissao([], [atual], '2026-10-18'));
  assert.doesNotThrow(() => _private.assertSemNovaProgramacaoAposDemissao([{ data: '2026-10-18', programacao: 'F' }], [], '2026-10-18'));
  assert.throws(() => _private.assertSemNovaProgramacaoAposDemissao([igual], [], '2026-10-18'), /apos a demissao/);
  assert.throws(() => _private.assertSemNovaProgramacaoAposDemissao([{ ...igual, programacao: 'F' }], [atual], '2026-10-18'), /apos a demissao/);
});

test('release and generation never create days after the RM dismissal date', () => {
  const funcionario = {
    ESCFUNC_ID: 701, CHAPA: '701', NOME: 'Funcionario 701', LOJA: 10,
    ESCSECAO_ID: 20, ESCFUNCAO_ID: 30, DT_DEMISS: new Date(2026, 9, 18),
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  };
  const options = {
    fixos: [{ ESCFUNC_ID: 701, DT: '2026-10-20', PROGRAMACAO: 'FXF' }],
    ausencias: [{ ESCFUNC_ID: 701, DT_INIC: '2026-10-21', DT_FIM: '2026-10-21', MOTIVO: 'FERIAS' }]
  };
  const liberada = buildFuncionariosLiberacao([funcionario], [], '2026-10-01', '2026-10-16', options)[0];
  const gerada = buildFuncionarioRascunho(funcionario, null, '2026-10-01', '2026-10-16', 0, null, options);
  assert.ok(gerada.dias.length > 0);
  assert.ok(liberada.dias.every((dia) => dia.data <= '2026-10-18'));
  assert.ok(gerada.dias.every((dia) => dia.data <= '2026-10-18'));
});

test('full-period absence excludes employee, while partial absence and vacation remain scheduled', () => {
  const funcionario = {
    ESCFUNC_ID: 801, CHAPA: '801', NOME: 'Funcionario 801', LOJA: 10,
    ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  };
  const fullPeriod = { ESCFUNC_ID: 801, DT_INIC: '2026-10-05', DT_FIM: '2026-11-01' };
  const fullAbsence = { ...fullPeriod, MOTIVO: 'AFASTAMENTO' };
  const partialAbsence = { ...fullAbsence, DT_FIM: '2026-10-31' };
  const fullVacation = { ...fullPeriod, MOTIVO: 'FERIAS' };
  const options = (ausencia) => ({ ausencias: [ausencia] });

  assert.deepEqual(buildFuncionarioRascunho(funcionario, null, '2026-10-01', '2026-10-05', 0, null, options(fullAbsence)).dias, []);
  assert.deepEqual(buildFuncionariosLiberacao([funcionario], [], '2026-10-01', '2026-10-05', options(fullAbsence))[0].dias, []);
  assert.ok(buildFuncionarioRascunho(funcionario, null, '2026-10-01', '2026-10-05', 0, null, options(partialAbsence)).dias.length > 0);
  assert.ok(buildFuncionarioRascunho(funcionario, null, '2026-10-01', '2026-10-05', 0, null, options(fullVacation)).dias.length > 0);
});

test('monthly release skips an employee absent for the whole operational period', async () => {
  const originals = {
    listSecoesByLoja: catalogService.listSecoesByLoja,
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listEscalasResumo: escalaService.listEscalasResumo,
    listFixosEscala: escalaService.listFixosEscala,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  const funcionario = (id) => ({
    ESCFUNC_ID: id, CHAPA: String(id), NOME: `Funcionario ${id}`, LOJA: 10,
    ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  });
  let savedPayload;
  catalogService.listSecoesByLoja = async () => [{ ESCSECAO_ID: 20, DESCR: 'Frente de Caixa' }];
  catalogService.listFuncionariosByLoja = async () => [funcionario(801), funcionario(802)];
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [{
    ESCFUNC_ID: 801, DT_INIC: '2026-10-05', DT_FIM: '2026-11-01', MOTIVO: 'AFA'
  }];
  escalaService.listEscalasResumo = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.saveEscalasBatch = async (payload) => { savedPayload = payload; return payload.funcionarios; };
  try {
    const result = await monthlyReleaseService.liberarEscalaLojaMes({
      lojaId: 10, mesRef: '2026-10-01', hojeIso: '2026-10-05'
    });
    assert.equal(result.criada, true);
    assert.deepEqual(savedPayload.funcionarios.map((item) => item.escfuncId), [802]);
  } finally {
    Object.assign(catalogService, {
      listSecoesByLoja: originals.listSecoesByLoja,
      listFuncionariosByLoja: originals.listFuncionariosByLoja,
      listTurnosByLoja: originals.listTurnosByLoja,
      listAusenciasByLojaMes: originals.listAusenciasByLojaMes
    });
    Object.assign(escalaService, {
      listEscalasResumo: originals.listEscalasResumo,
      listFixosEscala: originals.listFixosEscala,
      saveEscalasBatch: originals.saveEscalasBatch
    });
  }
});

test('regeneration clears future days of a fully absent employee without deleting history', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let savedPayload;
  catalogService.listFuncionariosByLoja = async () => [801, 802].map((id) => ({
    ESCFUNC_ID: id, CHAPA: String(id), NOME: `Funcionario ${id}`, LOJA: 10,
    ESCSECAO_ID: 20, ESCFUNCAO_ID: 30,
    HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58'
  }));
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [{
    ESCFUNC_ID: 801, DT_INIC: '2026-10-05', DT_FIM: '2026-11-01', MOTIVO: 'AFA'
  }];
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => ['2026-10-09', '2026-10-12'].map((data) => ({
    ESCFUNC_ID: 801, DT: data, PROGRAMACAO: 'AFA',
    HR_ENT1: 'AFA', HR_SAI1: 'AFA', HR_ENT2: 'AFA', HR_SAI2: 'AFA'
  }));
  escalaService.saveEscalasBatch = async (payload) => { savedPayload = payload; return payload.funcionarios; };
  try {
    await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10, mesRef: '2026-10-01', escsecaoId: 20, hojeIso: '2026-10-10'
    });
    const afastado = savedPayload.funcionarios.find((item) => item.escfuncId === 801);
    assert.deepEqual(afastado.dias.map((dia) => dia.data), ['2026-10-09']);
    assert.ok(savedPayload.funcionarios.some((item) => item.escfuncId === 802));
  } finally {
    Object.assign(catalogService, {
      listFuncionariosByLoja: originals.listFuncionariosByLoja,
      listTurnosByLoja: originals.listTurnosByLoja,
      listAusenciasByLojaMes: originals.listAusenciasByLojaMes
    });
    Object.assign(escalaService, {
      listFixosEscala: originals.listFixosEscala,
      listDiasSecaoAtual: originals.listDiasSecaoAtual,
      saveEscalasBatch: originals.saveEscalasBatch
    });
  }
});

test('section generation clears future days of a dismissed employee but keeps past days', async () => {
  const originals = {
    listFuncionariosByLoja: catalogService.listFuncionariosByLoja,
    listTurnosByLoja: catalogService.listTurnosByLoja,
    listAusenciasByLojaMes: catalogService.listAusenciasByLojaMes,
    listFixosEscala: escalaService.listFixosEscala,
    listDiasSecaoAtual: escalaService.listDiasSecaoAtual,
    saveEscalasBatch: escalaService.saveEscalasBatch
  };
  let savedPayload;
  let listOptions;
  catalogService.listFuncionariosByLoja = async (_lojaId, options) => {
    listOptions = options;
    return [
      { ESCFUNC_ID: 701, CHAPA: '701', NOME: 'Funcionario 701', LOJA: 10,
        ESCSECAO_ID: 20, ESCFUNCAO_ID: 30, DT_DEMISS: new Date(2026, 9, 15) },
      { ESCFUNC_ID: 702, CHAPA: '702', NOME: 'Funcionario 702', LOJA: 10,
        ESCSECAO_ID: 20, ESCFUNCAO_ID: 30, DT_DEMISS: new Date(2026, 9, 15) }
    ];
  };
  catalogService.listTurnosByLoja = async () => [];
  catalogService.listAusenciasByLojaMes = async () => [];
  escalaService.listFixosEscala = async () => [];
  escalaService.listDiasSecaoAtual = async () => [
    { ESCFUNC_ID: 701, DT: '2026-10-14', PROGRAMACAO: 'TRB',
      HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' },
    { ESCFUNC_ID: 701, DT: '2026-10-17', PROGRAMACAO: 'TRB',
      HR_ENT1: '08:00', HR_SAI1: '12:00', HR_ENT2: '13:10', HR_SAI2: '17:58' }
  ];
  escalaService.saveEscalasBatch = async (payload) => { savedPayload = payload; return payload.funcionarios; };
  try {
    const result = await monthlyReleaseService.gerarEscalaSecao({
      lojaId: 10, mesRef: '2026-10-01', escsecaoId: 20, hojeIso: '2026-10-17'
    });
    assert.equal(result.criada, true);
    assert.equal(listOptions.includeInactive, true);
    assert.deepEqual(savedPayload.funcionarios.map((item) => item.escfuncId), [701]);
    assert.deepEqual(savedPayload.funcionarios[0].dias.map((dia) => dia.data), ['2026-10-14']);
  } finally {
    catalogService.listFuncionariosByLoja = originals.listFuncionariosByLoja;
    catalogService.listTurnosByLoja = originals.listTurnosByLoja;
    catalogService.listAusenciasByLojaMes = originals.listAusenciasByLojaMes;
    escalaService.listFixosEscala = originals.listFixosEscala;
    escalaService.listDiasSecaoAtual = originals.listDiasSecaoAtual;
    escalaService.saveEscalasBatch = originals.saveEscalasBatch;
  }
});

test('date lock blocks only previous days, not current day', () => {
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-14', '2026-08-15'), true);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-15', '2026-08-15'), false);
  assert.equal(_private.isDiaBloqueadoParaEdicao('2026-08-16', '2026-08-15'), false);
});
