const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadService(connection) {
  const module = { exports: {} };
  const context = vm.createContext({
    module,
    require(name) {
      if (name === '../db/oracle') return {
        withConnection: async (work) => work(connection),
        oracledb: { OUT_FORMAT_OBJECT: 1 }
      };
      throw new Error(`Dependencia inesperada: ${name}`);
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/trainingProgressService.js'), 'utf8'), context);
  return module.exports;
}

test('treinamento novo reinicia progresso da versao anterior', async () => {
  const service = loadService({ execute: async () => ({ rows: [{ VERSAO: 1, ETAPA: 7 }] }) });
  const progress = await service.getProgress(42);
  assert.equal(progress.version, 2);
  assert.equal(progress.stage, 0);
  assert.equal(progress.found, true);
});

test('treinamento aceita a conclusao da etapa 12 e rejeita etapa 13', async () => {
  let saved;
  const service = loadService({
    async execute(sql, binds) {
      if (sql.includes('merge into')) {
        saved = binds;
        return { rows: [] };
      }
      return { rows: [{ VERSAO: 2, ETAPA: 12 }] };
    }
  });
  const progress = await service.saveProgress(42, 12);
  assert.equal(saved.versao, 2);
  assert.equal(saved.etapa, 12);
  assert.equal(progress.stage, 12);
  await assert.rejects(service.saveProgress(42, 13), /Etapa de treinamento invalida/);
});
