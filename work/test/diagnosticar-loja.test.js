const test = require('node:test');
const assert = require('node:assert/strict');
const { parseLoja, diagnosticar } = require('../scripts/diagnosticar-loja');

test('store diagnostic requires an explicit positive store number', () => {
  assert.equal(parseLoja(['--loja=64']), 64);
  assert.throws(() => parseLoja([]), /--loja/);
  assert.throws(() => parseLoja(['--loja=0']), /--loja/);
  assert.throws(() => parseLoja(['--loja=64', '--apply']), /--loja/);
});

test('store diagnostic reads catalog, employees, sections and account links without writing', async () => {
  const queries = [];
  const connection = {
    execute: async (sql, binds) => {
      queries.push(sql);
      if (sql.includes('user_tab_columns')) return { rows: [{ COLUMN_NAME: 'CODFILIAL' }] };
      assert.equal(binds.loja, 64);
      if (sql.includes('from sgn_esc_loja')) return { rows: [] };
      if (sql.includes('from sgn_esc_funcionario')) return { rows: [{ CODCOLIGADA: 1, TOTAL: 3, ATIVOS: 3 }] };
      if (sql.includes('from sgn_esc_secao')) {
        assert.match(sql, /where codfilial = :loja/);
        return { rows: [{ CODCOLIGADA: 1, STATUS: 'A', TOTAL: 2 }] };
      }
      if (sql.includes('join sgn_esc_usuario_loja')) return { rows: [] };
      if (sql.includes('regexp_like')) return { rows: [{ USUARIO_ID: 9, LOGIN: 'lider.frente64' }] };
      throw new Error(`SQL inesperado: ${sql}`);
    }
  };
  const result = await diagnosticar(connection, 64);
  assert.equal(result.catalogo, null);
  assert.equal(result.funcionarios[0].TOTAL, 3);
  assert.equal(result.possiveisUsuariosSemVinculo[0].LOGIN, 'lider.frente64');
  assert.equal(queries.length, 6);
  assert.ok(queries.every((sql) => /^\s*select\b/i.test(sql)));
});
