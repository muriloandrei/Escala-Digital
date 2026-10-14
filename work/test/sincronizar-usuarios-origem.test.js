const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, sourcePasswordAction, sectionsForLeader, plan, load, applyPlan } = require('../scripts/sincronizar-usuarios-origem');
const { sessionVersionMatches } = require('../src/middleware/auth');

const MD5_A = 'a'.repeat(32);
const MD5_B = 'b'.repeat(32);
const sections = [
  { ESCSECAO_ID: 7, CODFILIAL: 64, DESCR: 'Frente de Caixa' },
  { ESCSECAO_ID: 8, CODFILIAL: 64, DESCR: 'Transportes' },
  { ESCSECAO_ID: 10, CODFILIAL: 64, DESCR: 'Fiscal de Caixa Remoto' },
  { ESCSECAO_ID: 9, CODFILIAL: 35, DESCR: 'Portaria' }
];

test('sincronizacao exige opt-in explicito e operador para escrita', () => {
  assert.deepEqual(parseArgs([]), { source: 'SGN_USUARIO', apply: false, by: null });
  assert.deepEqual(parseArgs(['--apply', '--by=Murilo']), { source: 'SGN_USUARIO', apply: true, by: 'Murilo' });
  assert.throws(() => parseArgs(['--apply']), /execucao padrao/);
  assert.throws(() => parseArgs(['--source=X;delete']), /execucao padrao/);
});

test('bcrypt existente recebe linha de base sem substituicao imediata', () => {
  const source = { SENHA: MD5_A, DT_HR_ULT_SENHA: new Date('2026-10-10') };
  const bcrypt = { SENHA_HASH: '$2a$10$' + 'a'.repeat(53), DT_HR_INCL: new Date('2026-10-12'), DT_HR_ULT_SENHA_ORIGEM: null };
  assert.equal(sourcePasswordAction(source, bcrypt), 'baseline_only');
  bcrypt.DT_HR_ULT_SENHA_ORIGEM = new Date('2026-10-10');
  assert.equal(sourcePasswordAction(source, bcrypt), 'keep');
  source.DT_HR_ULT_SENHA = new Date('2026-10-11');
  assert.equal(sourcePasswordAction(source, bcrypt), 'replace');
  bcrypt.DT_HR_ULT_SENHA_ORIGEM = null;
  bcrypt.DT_HR_INCL = new Date('2026-10-01');
  assert.equal(sourcePasswordAction(source, bcrypt), 'replace');
  assert.equal(sourcePasswordAction({ ...source, SENHA: MD5_B }, { SENHA_HASH: MD5_A }), 'replace');
});

test('secao de lider frente de caixa restringe loja e conjunto operacional', () => {
  assert.deepEqual(sectionsForLeader('lider.frente64', 64, sections), [7, 8]);
  assert.equal(sectionsForLeader('lider.acougue64', 64, sections), null);
});

test('planejamento ignora origem inativa, loja ausente, conflito de id e lider ambiguo', () => {
  const rows = [
    { USUARIO_ID: 1, LOGIN: 'gerente64', NOME: 'Gerente', SENHA: MD5_A, STATUS: 'A' },
    { USUARIO_ID: 2, LOGIN: 'lider.acougue64', NOME: 'Lider', SENHA: MD5_A, STATUS: 'A' },
    { USUARIO_ID: 3, LOGIN: 'caixa35', NOME: 'Caixa', SENHA: MD5_A, STATUS: 'A' },
    { USUARIO_ID: 4, LOGIN: 'operador64', NOME: 'Inativo', SENHA: MD5_A, STATUS: 'I' },
    { USUARIO_ID: 5, LOGIN: 'adm99', NOME: 'RH', SENHA: MD5_A, STATUS: 'A' }
  ];
  const result = plan(rows, [{ USUARIO_ID: 40, LOGIN: 'caixa35', ORIGEM_USUARIO_ID: 22 }],
    [{ LOJA: 64 }, { LOJA: 35 }], sections, []);
  assert.equal(result[0].reason, null);
  assert.equal(result[0].perfil, 'GERENTE');
  assert.equal(result[1].reason, 'secao_lider_ambigua');
  assert.equal(result[2].reason, 'id_origem_divergente');
  assert.equal(result[3].reason, 'origem_inativa_sem_vinculo');
  assert.equal(result[4].reason, 'loja_ausente');
});

test('origem inativa revoga sessao apenas da conta previamente vinculada', async () => {
  const entries = plan(
    [{ USUARIO_ID: 7, LOGIN: 'caixa64', NOME: 'Caixa', SENHA: MD5_A, STATUS: 'I' }],
    [{ USUARIO_ID: 70, LOGIN: 'caixa64', PERFIL: 'OPERADOR', STATUS: 'A', ORIGEM_USUARIO_ID: 7 }],
    [{ LOJA: 64 }], sections, [{ USUARIO_ID: 70, LOJA: 64 }]
  );
  assert.equal(entries[0].reason, 'inativar');
  const calls = [];
  const connection = { execute: async (sql) => { calls.push(sql); return { rowsAffected: 1 }; } };
  const counts = await applyPlan(connection, entries);
  assert.equal(counts.deactivated, 1);
  assert.match(calls[0], /auth_version = auth_version \+ 1/);
  assert.equal(sessionVersionMatches({ authVersion: 0 }, { authVersion: 1 }), false);
  assert.equal(sessionVersionMatches({ authVersion: 2 }, { authVersion: 2 }), true);
});

test('carga recusa origem sem coluna STATUS antes de qualquer escrita', async () => {
  const sqls = [];
  const connection = {
    execute: async (sql) => {
      sqls.push(sql);
      return { rows: [{ COLUMN_NAME: 'USUARIO_ID' }] };
    }
  };
  await assert.rejects(load(connection, 'SGN_USUARIO'), /sem LOGIN/);
  assert.equal(sqls.every((sql) => /^select/i.test(sql)), true);
});

test('aplicacao preserva status existente, atualiza senha e alinha somente loja inferida', async () => {
  const calls = [];
  const connection = { execute: async (sql, binds) => { calls.push({ sql, binds }); return { rowsAffected: 1 }; } };
  const entries = plan(
    [{ USUARIO_ID: 5, LOGIN: 'gerente64', NOME: 'Gerente', SENHA: MD5_B,
      DT_HR_ULT_SENHA: new Date('2026-10-14'), STATUS: 'A' }],
    [{ USUARIO_ID: 6, LOGIN: 'gerente64', NOME: 'Antigo', SENHA_HASH: MD5_A,
      PERFIL: 'GERENTE', STATUS: 'A', ORIGEM_USUARIO_ID: null }],
    [{ LOJA: 64 }], sections, [{ USUARIO_ID: 6, LOJA: 35 }]
  );
  assert.equal(entries[0].password, 'replace');
  const counts = await applyPlan(connection, entries);
  assert.equal(counts.passwords, 1);
  assert.equal(counts.stores, 1);
  assert.match(calls[0].sql, /auth_version = auth_version \+ :changePassword/);
  assert.doesNotMatch(calls[0].sql, /set status/);
  assert.equal(calls.at(-1).binds.loja, 64);
});
