const test = require('node:test');
const assert = require('node:assert/strict');
const { classificar, diagnosticar } = require('../scripts/diagnosticar-portarias');

test('diagnostico preserva loja 999 e distingue frente ausente de subseção a criar', () => {
  assert.equal(classificar({ CODFILIAL: 999 }), 'PRESERVADA_LOJA_999');
  assert.equal(classificar({ CODFILIAL: 47, FRENTES_CANONICAS: 0 }), 'REVISAR_FRENTE');
  assert.equal(classificar({ CODFILIAL: 47, FRENTES_CANONICAS: 1, PORTEIROS_ATIVOS: 0 }), 'CRIAR_SUBSECAO');
  assert.equal(classificar({ CODFILIAL: 309, FRENTES_CANONICAS: 1, PORTEIROS_ATIVOS: 1 }), 'PRONTA');
  assert.equal(classificar({ CODFILIAL: 47, FRENTES_CANONICAS: 1, PORTEIROS_CADASTRADOS: 2, PORTEIROS_ATIVOS: 2 }), 'REVISAR_SUBSECOES');
  assert.equal(classificar({ CODFILIAL: 47, FRENTES_CANONICAS: 1, PORTEIROS_CADASTRADOS: 1, PORTEIROS_ATIVOS: 0 }), 'REVISAR_SUBSECOES');
});

test('diagnostico consulta somente o Oracle e mostra funcoes sem alterar cadastros', async () => {
  let consultas = 0;
  const connection = {
    execute: async (sql, binds) => {
      consultas += 1;
      assert.match(sql, /^select\b/i);
      assert.deepEqual(binds, {});
      assert.match(sql, /02\[\.\]012/);
      if (consultas === 1) {
        assert.match(sql, /02\[\.\]002/);
        assert.match(sql, /from sgn_esc_prog p/);
        return { rows: [
          { ESCSECAO_ID: 4842, CODFILIAL: 999 },
          { ESCSECAO_ID: 5468, CODFILIAL: 309, FRENTES_CANONICAS: 1, PORTEIROS_ATIVOS: 1 }
        ] };
      }
      assert.match(sql, /join sgn_esc_funcionario f/);
      assert.match(sql, /join sgn_esc_funcao fn/);
      return { rows: [
        { ESCSECAO_ID: 4842, ESCFUNCAO_ID: 1, FUNCAO: 'PORTEIRO', FUNCIONARIOS: 2 },
        { ESCSECAO_ID: 5468, ESCFUNCAO_ID: 2, FUNCAO: 'OUTRA FUNCAO', FUNCIONARIOS: 1 }
      ] };
    }
  };
  const rows = await diagnosticar(connection);
  assert.equal(consultas, 2);
  assert.equal(rows[0].SITUACAO, 'PRESERVADA_LOJA_999');
  assert.deepEqual(rows[0].FUNCOES, [{ funcaoId: 1, funcao: 'PORTEIRO', funcionarios: 2 }]);
  assert.deepEqual(rows[1].FUNCOES, [{ funcaoId: 2, funcao: 'OUTRA FUNCAO', funcionarios: 1 }]);
});
