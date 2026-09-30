const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService(connection, appendEvent) {
  const module = { exports: {} };
  const context = vm.createContext({
    module, console,
    require(name) {
      if (name === '../db/oracle') return {
        withConnection: async (work) => work(connection), oracledb: { OUT_FORMAT_OBJECT: 1, STRING: 2 }
      };
      if (name === './escalaEventService') return { createOperationId: () => 'op-gerada', appendEvent };
      if (name === './catalogService') return {};
      if (name === '../domain/operationalPeriod') return {};
      if (name === '../utils/scheduleDiff') return {};
      throw new Error(`Dependencia inesperada: ${name}`);
    }
  });
  const source = fs.readFileSync(path.join(__dirname, '../src/services/escalaService.js'), 'utf8');
  vm.runInContext(source, context);
  vm.runInContext('saveEscalasFuncionariosRevisionComConnection = async () => [{ escprogId: 9, revisao: 6 }]', context);
  return module.exports;
}

const payload = {
  lojaId: 35, mesRef: '2026-10-01', operacaoId: 'd676c4e3-a279-445c-bac4-4fb323387524',
  funcionarios: [{ escfuncId: 90 }], actor: { sub: 7, login: 'lider35' }
};

test('confirmacao do rascunho e gravada antes do commit', async () => {
  const operations = [];
  const service = loadService({
    async commit() { operations.push('commit'); },
    async rollback() { operations.push('rollback'); }
  }, async (_, event) => {
    assert.equal(event.operacaoId, payload.operacaoId);
    assert.equal(event.acao, 'CONFIRMAR_RASCUNHO');
    assert.equal(event.detalhe.revisoes[0].escfuncId, 90);
    assert.equal(event.detalhe.revisoes[0].revisao, 6);
    operations.push('evento');
  });
  const saved = await service.saveEscalasFuncionariosRevision(payload);
  assert.equal(saved[0].revisao, 6);
  assert.deepEqual(operations, ['evento', 'commit']);
});

test('falha na confirmacao reverte a transacao', async () => {
  const operations = [];
  const service = loadService({
    async commit() { operations.push('commit'); },
    async rollback() { operations.push('rollback'); }
  }, async () => { throw new Error('evento indisponivel'); });
  await assert.rejects(service.saveEscalasFuncionariosRevision(payload), /evento indisponivel/);
  assert.deepEqual(operations, ['rollback']);
});

test('consulta de confirmacao vincula operacao ao usuario, loja e mes', async () => {
  let captured;
  const service = loadService({
    async execute(sql, binds) {
      captured = { sql, binds };
      return { rows: [{ DETALHE: JSON.stringify({ revisoes: [{ escfuncId: 90, revisao: 6 }] }) }] };
    }
  }, async () => {});
  const result = await service.getCommittedDraftOperation({
    lojaId: 35, mesRef: '2026-10-01', operacaoId: payload.operacaoId, usuarioId: 7
  });
  assert.equal(result.revisoes[0].revisao, 6);
  assert.match(captured.sql, /usuario_id = :usuarioId/);
  assert.equal(captured.binds.operacaoId, payload.operacaoId);
  assert.equal(captured.binds.usuarioId, 7);
});
