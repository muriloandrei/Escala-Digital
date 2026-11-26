const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { aggregateRows, buildQuery, buildStoreQuery, withEmptyMonths } = require('../src/services/adesaoEscalasService');
const { _private } = require('../src/services/accessService');

function row(loja, mes, escsecaoId, values = {}) {
  return {
    LOJA: loja, MES_ESCALA: mes, ESCSECAO_ID: escsecaoId, COD_SECAO: `${loja}.02.002`,
    SECAO: 'Frente de Caixa', FUNCIONARIOS: 2, FUNCIONARIOS_OFICIALIZADOS: 0,
    DIAS_GRAVADOS: 0, DIAS_OFICIALIZADOS: 0, PERCENTUAL_DIAS_OFICIALIZADOS: null,
    FOLGAS_NORMAIS: 0, MAIOR_REVISAO: 5, STATUS: 'SEM_DIAS', ...values
  };
}

test('adesao classifica os quatro estagios e consolida a loja', () => {
  const result = aggregateRows([
    row(1, '2026-12', 11),
    row(2, '2026-12', 21, { DIAS_GRAVADOS: 20, STATUS: 'NAO_OFICIALIZADA' }),
    row(3, '2026-12', 31, { FUNCIONARIOS_OFICIALIZADOS: 1, DIAS_GRAVADOS: 45,
      DIAS_OFICIALIZADOS: 20, PERCENTUAL_DIAS_OFICIALIZADOS: 44.4, STATUS: 'PARCIAL' }),
    row(4, '2026-12', 41, { FUNCIONARIOS_OFICIALIZADOS: 2, DIAS_GRAVADOS: 60,
      DIAS_OFICIALIZADOS: 60, PERCENTUAL_DIAS_OFICIALIZADOS: 100, FOLGAS_NORMAIS: 8, STATUS: 'OFICIALIZADA' }),
    row(4, '2026-12', 42, { FUNCIONARIOS: 1, FUNCIONARIOS_OFICIALIZADOS: 1, DIAS_GRAVADOS: 30,
      DIAS_OFICIALIZADOS: 30, PERCENTUAL_DIAS_OFICIALIZADOS: 100, STATUS: 'OFICIALIZADA' })
  ]);
  assert.deepEqual(result.map((item) => item.estagio),
    ['NAO_INICIADA', 'EM_PREENCHIMENTO', 'EM_OFICIALIZACAO', 'CONCLUIDA']);
  assert.equal(result[1].coberturaDias, 33.3);
  assert.equal(result[3].funcionarios, 3);
  assert.equal(result[3].funcionariosOficializados, 3);
  assert.equal(result[3].secoesOficializadas, 2);
  assert.equal(result[3].folgasNormais, 8);
});

test('consulta usa somente a ultima revisao ativa e restringe loja e secao do lider', () => {
  const params = { mes_inicial: '2026-11', mes_final: '2026-12' };
  const { sql, binds } = buildQuery(params, { perfil: 'LIDER', lojas: [35, 24] }, [4200]);
  assert.match(sql, /nvl\(p\.ativa, 1\) = 1/);
  assert.match(sql, /partition by p\.loja, p\.mes_ref, p\.escfunc_id/);
  assert.match(sql, /order by p\.revisao desc, p\.escprog_id desc/);
  assert.match(sql, /from revisoes where rn = 1/);
  assert.match(sql, /p\.loja in \(:lojaPermitida0, :lojaPermitida1\)/);
  assert.match(sql, /p\.escsecao_id in \(:secaoPermitida0\)/);
  assert.equal(binds.lojaPermitida0, 35);
  assert.equal(binds.secaoPermitida0, 4200);
  assert.match(buildQuery(params, { perfil: 'LIDER', lojas: [35] }, []).sql, /and 1 = 0/);
  assert.match(buildQuery(params, { perfil: 'ADMIN', lojas: [] }, null).sql, /count\(distinct p\.escfunc_id\)/);
  const storeQuery = buildStoreQuery(params, { perfil: 'LIDER', lojas: [35] }, [4200]);
  assert.match(storeQuery.sql, /from sgn_esc_loja l/);
  assert.match(storeQuery.sql, /l\.loja in \(:lojaPermitida0\)/);
  assert.match(storeQuery.sql, /s\.escsecao_id in \(:secaoPermitida0\)/);
  assert.match(buildStoreQuery(params, { perfil: 'LIDER', lojas: [35] }, []).sql, /and 1 = 0/);
});

test('lojas sem cabecalho aparecem como nao iniciadas no mes', () => {
  const groups = aggregateRows([row(2, '2026-11', 20, { DIAS_GRAVADOS: 60, STATUS: 'NAO_OFICIALIZADA' })]);
  const months = withEmptyMonths(groups, [2, 3], '2026-11', '2026-12');
  assert.equal(months.length, 4);
  assert.equal(months.find((item) => item.loja === 2 && item.mesEscala === '2026-11').diasGravados, 60);
  assert.equal(months.find((item) => item.loja === 2 && item.mesEscala === '2026-12').estagio, 'NAO_INICIADA');
  assert.equal(months.find((item) => item.loja === 3 && item.mesEscala === '2026-12').totalSecoes, 0);
});

test('adesao requer concessao explicita fora do perfil admin', () => {
  const rh = _private.completarPermissoesPerfil({ NOME: 'RH', PERMISSOES: [] });
  const permission = rh.PERMISSOES.find((item) => item.PAGINA === 'adesao-escalas');
  assert.equal(permission.PODE_VISUALIZAR, 0);
  assert.equal(_private.normalizePermission({ PAGINA: 'adesao-escalas', PODE_VISUALIZAR: 1 }, 'RH').PODE_VISUALIZAR, 1);
});

test('rota valida mes e loja antes da consulta e exige permissao propria', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/routes/reportRoutes.js'), 'utf8');
  let registered;
  let queried = 0;
  const router = { get: (route, ...handlers) => { registered = { route, handlers }; } };
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module,
    require: (name) => {
      if (name === 'express') return { Router: () => router };
      if (name === '../middleware/auth') return { requirePermission: (page) => {
        assert.equal(page, 'adesao-escalas');
        return () => {};
      } };
      if (name === '../services/adesaoEscalasService') return { getAdesaoEscalas: async (query) => {
        queried += 1;
        assert.equal(query.loja, 35);
        return { lojas: [] };
      } };
      return require(name);
    }
  });
  assert.equal(registered.route, '/adesao-escalas');
  const handler = registered.handlers.at(-1);
  const response = () => ({ statusCode: 200, status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; } });
  const invalid = response();
  await handler({ query: { mes_inicial: '2026-13', mes_final: '2026-12' } }, invalid, assert.fail);
  assert.equal(invalid.statusCode, 400);
  assert.equal(queried, 0);
  const valid = response();
  await handler({ query: { mes_inicial: '2026-11', mes_final: '2026-12', loja: '35' }, user: { perfil: 'ADMIN' } }, valid, assert.fail);
  assert.equal(valid.statusCode, 200);
  assert.equal(queried, 1);
});
