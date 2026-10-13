const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs, getCodcoligadaConfirmada, registrar } = require('../scripts/registrar-loja');

function makeConnection({ catalogo = [], funcionarios = [{ CODCOLIGADA: 1, ATIVOS: 5 }], secoes = [{ CODCOLIGADA: 1, STATUS: 'A', TOTAL: 4 }] } = {}) {
  const writes = [];
  const connection = {
    writes,
    commits: 0,
    rollbacks: 0,
    execute: async (sql, binds) => {
      if (sql.includes('user_tab_columns')) return { rows: [{ COLUMN_NAME: 'CODFILIAL' }] };
      if (sql.includes('insert into sgn_esc_loja')) {
        writes.push({ sql, binds });
        return { rowsAffected: 1 };
      }
      if (sql.includes('from sgn_esc_loja')) return { rows: catalogo };
      if (sql.includes('from sgn_esc_funcionario')) return { rows: funcionarios };
      if (sql.includes('from sgn_esc_secao')) return { rows: secoes };
      if (sql.includes('join sgn_esc_usuario_loja') || sql.includes('regexp_like')) return { rows: [] };
      throw new Error(`SQL inesperado: ${sql}`);
    },
    commit: async () => { connection.commits += 1; },
    rollback: async () => { connection.rollbacks += 1; }
  };
  return connection;
}

test('store registration requires operator for apply', () => {
  assert.deepEqual(parseArgs(['--loja=64']), { loja: 64, apply: false, by: null });
  assert.deepEqual(parseArgs(['--loja=64', '--apply', '--by=opc']), { loja: 64, apply: true, by: 'opc' });
  assert.throws(() => parseArgs(['--loja=64', '--apply']), /--by/);
  assert.throws(() => parseArgs(['--loja=64', '--by=opc']), /--apply/);
});

test('store registration refuses incomplete or conflicting RM data', () => {
  assert.throws(() => getCodcoligadaConfirmada({ funcionarios: [], secoes: [] }), /incompleto/);
  assert.throws(() => getCodcoligadaConfirmada({
    funcionarios: [{ CODCOLIGADA: 1, ATIVOS: 5 }],
    secoes: [{ CODCOLIGADA: 2, STATUS: 'A', TOTAL: 4 }]
  }), /divergentes/);
});

test('store registration preview is read-only', async () => {
  const connection = makeConnection();
  const messages = [];
  const result = await registrar(connection, { loja: 64, apply: false, by: null }, (message) => messages.push(message));
  assert.equal(result.cadastrada, false);
  assert.deepEqual(connection.writes, []);
  assert.equal(connection.commits, 0);
  assert.match(messages.join(' '), /PREVIA/);
});

test('store registration inserts only the catalog row after explicit apply', async () => {
  const connection = makeConnection();
  const result = await registrar(connection, { loja: 64, apply: true, by: 'opc' }, () => {});
  assert.equal(result.cadastrada, true);
  assert.equal(connection.writes.length, 1);
  assert.match(connection.writes[0].sql, /sgn_esc_loja_seq\.nextval/);
  assert.deepEqual(connection.writes[0].binds, { loja: 64, codcoligada: 1 });
  assert.equal(connection.commits, 1);
});

test('existing store is not rewritten', async () => {
  const connection = makeConnection({ catalogo: [{ LOJA: 64, CODCOLIGADA: 1 }] });
  const result = await registrar(connection, { loja: 64, apply: true, by: 'opc' }, () => {});
  assert.equal(result.jaExistia, true);
  assert.deepEqual(connection.writes, []);
});
