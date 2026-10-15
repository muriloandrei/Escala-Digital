const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, avaliar, normalizar } = require('../scripts/normalizar-fixos-loja16-novembro');

const rows = [
  { ESCFIXO_ID: 1, ESCFUNC_ID: 90, ESCSECAO_ID: 20, FIXO_PROGRAMACAO: 'FXF',
    DATA: '2026-11-02', ESCPROGDIA_ID: 101, DIA_PROGRAMACAO: 'FXF', REVISAO: 2, OFICIALIZADA: 0 },
  { ESCFIXO_ID: 2, ESCFUNC_ID: 90, ESCSECAO_ID: 20, FIXO_PROGRAMACAO: 'TRB',
    DATA: '2026-11-03', ESCPROGDIA_ID: 102, DIA_PROGRAMACAO: 'TRB', REVISAO: 2, OFICIALIZADA: 0 }
];
const diasFxf = [{ ESCFUNC_ID: 90, ESCSECAO_ID: 20, REVISAO: 2, OFICIALIZADA: 0,
  ESCPROGDIA_ID: 101, DATA: '2026-11-02' }];

test('conversao aceita apenas loja 16 em novembro e exige operador para aplicar', () => {
  assert.deepEqual(parseArgs([]), { apply: false, actor: null });
  assert.deepEqual(parseArgs(['--apply', '--by=opc']), { apply: true, actor: 'opc' });
  assert.throws(() => parseArgs(['--apply']), /OPERADOR/);
  assert.throws(() => parseArgs(['--loja=17']), /sem argumentos/);
});

test('previa contabiliza fixo sem dia e bloqueia divergencia, duplicidade ou oficializacao', () => {
  const report = avaliar([
    { ...rows[0], ESCPROGDIA_ID: null },
    { ...rows[0], DIA_PROGRAMACAO: 'TRB' },
    { ...rows[1], OFICIALIZADA: 1 }
  ]);
  assert.equal(report.fixosSemDia, 1);
  assert.equal(report.blockers.some((item) => item.includes('nao encontrado')), false);
  assert.ok(report.blockers.some((item) => item.includes('diverge')));
  assert.ok(report.blockers.some((item) => item.includes('duplicada')));
  assert.ok(report.blockers.some((item) => item.includes('oficializada')));
});

test('previa nao grava e aplicacao converte apenas FXF, desativa fixos e audita no mesmo commit', async () => {
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push(sql);
      if (/^select user as schema_user/i.test(sql)) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
      if (/from sgn_esc_funcionario f/i.test(sql) && /for update wait 5/i.test(sql)) return { rows: [{ ESCFUNC_ID: 90 }] };
      if (/select x\.escfixo_id from sgn_esc_fixo_escala/i.test(sql)) return { rows: [{ ESCFIXO_ID: 1 }, { ESCFIXO_ID: 2 }] };
      if (/select p\.escprog_id from sgn_esc_prog p/i.test(sql)) return { rows: [{ ESCPROG_ID: 100 }] };
      if (/select x\.escfixo_id, x\.escfunc_id/i.test(sql)) {
        assert.equal(binds.loja, 16);
        assert.equal(binds.mesRef, '2026-11-01');
        return { rows };
      }
      if (/select p\.escfunc_id, p\.escsecao_id, p\.revisao/i.test(sql)) return { rows: diasFxf };
      if (/update sgn_esc_prog_dia/i.test(sql)) {
        assert.equal(binds.id, 101);
        return { rowsAffected: 1 };
      }
      if (/update sgn_esc_fixo_escala/i.test(sql)) return { rowsAffected: 2 };
      if (/insert into sgn_esc_evento/i.test(sql)) return { rowsAffected: 1 };
      throw new Error(`SQL inesperado: ${sql}`);
    },
    async commit() { statements.push('COMMIT'); },
    async rollback() { statements.push('ROLLBACK'); }
  };
  const preview = await normalizar(connection, { apply: false });
  assert.equal(preview.fixos, 2);
  assert.equal(preview.diasParaNormalizar, 1);
  assert.equal(preview.fxfsSemFixoAtivo, 0);
  assert.equal(statements.length, 2);
  const applied = await normalizar(connection, { apply: true, actor: 'opc', expectedSchema: 'ESCALAINT' });
  assert.equal(applied.aplicado, true);
  assert.equal(applied.eventos, 1);
  assert.equal(statements.filter((sql) => /update sgn_esc_prog_dia/i.test(sql)).length, 1);
  assert.equal(statements.filter((sql) => /update sgn_esc_fixo_escala/i.test(sql)).length, 1);
  assert.equal(statements.filter((sql) => /insert into sgn_esc_evento/i.test(sql)).length, 1);
  assert.equal(statements.some((sql) => /select p\.escprog_id from sgn_esc_prog p/i.test(sql)), true);
  assert.equal(statements.at(-1), 'COMMIT');
});

test('fixo de 30 de novembro sem dia gerado e desativado sem criar dia', async () => {
  const semDia = { ...rows[1], ESCFIXO_ID: 3, DATA: '2026-11-30', ESCPROGDIA_ID: null,
    DIA_PROGRAMACAO: null, REVISAO: null, OFICIALIZADA: null };
  const statements = [];
  const connection = {
    async execute(sql) {
      statements.push(sql);
      if (/^select user as schema_user/i.test(sql)) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
      if (/select x\.escfixo_id, x\.escfunc_id/i.test(sql)) return { rows: [semDia] };
      if (/select p\.escfunc_id, p\.escsecao_id, p\.revisao/i.test(sql)) return { rows: [] };
      if (/update sgn_esc_fixo_escala/i.test(sql)) return { rowsAffected: 1 };
      if (/insert into sgn_esc_evento/i.test(sql)) return { rowsAffected: 1 };
      return { rows: [] };
    },
    async commit() { statements.push('COMMIT'); },
    async rollback() { statements.push('ROLLBACK'); }
  };
  const preview = await normalizar(connection, { apply: false });
  assert.equal(preview.fixosSemDia, 1);
  assert.deepEqual(preview.blockers, []);
  const applied = await normalizar(connection, { apply: true, actor: 'opc', expectedSchema: 'ESCALAINT' });
  assert.equal(applied.aplicado, true);
  assert.equal(statements.some((sql) => /update sgn_esc_prog_dia/i.test(sql)), false);
  assert.equal(statements.at(-1), 'COMMIT');
});

test('FXF sem fixo ativo ainda aparece na previa e e convertido', async () => {
  const statements = [];
  const connection = {
    async execute(sql, binds) {
      statements.push(sql);
      if (/^select user as schema_user/i.test(sql)) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
      if (/select x\.escfixo_id, x\.escfunc_id/i.test(sql)) return { rows: [] };
      if (/select p\.escfunc_id, p\.escsecao_id, p\.revisao/i.test(sql)) return { rows: diasFxf };
      if (/update sgn_esc_prog_dia/i.test(sql)) {
        assert.equal(binds.id, 101);
        return { rowsAffected: 1 };
      }
      if (/insert into sgn_esc_evento/i.test(sql)) return { rowsAffected: 1 };
      return { rows: [] };
    },
    async commit() { statements.push('COMMIT'); },
    async rollback() { statements.push('ROLLBACK'); }
  };
  const preview = await normalizar(connection, { apply: false });
  assert.equal(preview.fixos, 0);
  assert.equal(preview.diasParaNormalizar, 1);
  assert.equal(preview.fxfsSemFixoAtivo, 1);
  const applied = await normalizar(connection, { apply: true, actor: 'opc', expectedSchema: 'ESCALAINT' });
  assert.equal(applied.aplicado, true);
  assert.equal(statements.filter((sql) => /update sgn_esc_prog_dia/i.test(sql)).length, 1);
  assert.equal(statements.filter((sql) => /update sgn_esc_fixo_escala/i.test(sql)).length, 0);
  assert.equal(statements.at(-1), 'COMMIT');
});

test('escala oficializada impede qualquer alteracao', async () => {
  const statements = [];
  const connection = {
    async execute(sql) {
      statements.push(sql);
      if (/^select user as schema_user/i.test(sql)) return { rows: [{ SCHEMA_USER: 'ESCALAINT' }] };
      if (/select x\.escfixo_id, x\.escfunc_id/i.test(sql)) return { rows: [{ ...rows[0], OFICIALIZADA: 1 }] };
      if (/select p\.escfunc_id, p\.escsecao_id, p\.revisao/i.test(sql)) return { rows: diasFxf };
      return { rows: [] };
    },
    async rollback() { statements.push('ROLLBACK'); }
  };
  const report = await normalizar(connection, { apply: true, actor: 'opc', expectedSchema: 'ESCALAINT' });
  assert.equal(report.blockers.length, 1);
  assert.equal(report.aplicado, false);
  assert.equal(statements.some((sql) => /^update|^insert/i.test(sql)), false);
  assert.equal(statements.at(-1), 'ROLLBACK');
});
