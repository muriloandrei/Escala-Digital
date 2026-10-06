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
      if (name === '../config/trainingStages') return require('../src/config/trainingStages');
      throw new Error(`Dependencia inesperada: ${name}`);
    }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/services/trainingProgressService.js'), 'utf8'), context);
  return module.exports;
}

test('treinamento novo reinicia progresso da versao anterior', async () => {
  const service = loadService({ execute: async () => ({ rows: [{ VERSAO: 1, ETAPA: 7 }] }) });
  const progress = await service.getProgress(42);
  assert.equal(progress.version, 3);
  assert.equal(progress.stage, 0);
  assert.equal(progress.found, true);
});

test('treinamento aceita a conclusao da etapa 16 e rejeita etapa 17', async () => {
  let saved;
  const service = loadService({
    async execute(sql, binds) {
      if (sql.includes('merge into')) {
        saved = binds;
        return { rows: [] };
      }
      return { rows: [{ VERSAO: 3, ETAPA: saved?.etapa ?? 15 }] };
    }
  });
  const progress = await service.saveProgress(42, 16);
  assert.equal(saved.versao, 3);
  assert.equal(saved.etapa, 16);
  assert.equal(progress.stage, 16);
  await assert.rejects(service.saveProgress(42, 17), /Etapa de treinamento invalida/);
});

test('treinamento nao permite pular etapas por chamada direta', async () => {
  const service = loadService({ execute: async () => ({ rows: [{ VERSAO: 3, ETAPA: 0 }] }) });
  await assert.rejects(service.saveProgress(42, 16), /Conclua a etapa atual/);
});

test('treinamento v2 concluido continua liberado sem repeticao obrigatoria', async () => {
  const service = loadService({ execute: async () => ({ rows: [{ VERSAO: 2, ETAPA: 12 }] }) });
  const progress = await service.getProgress(42);
  assert.equal(progress.version, 3);
  assert.equal(progress.stage, 16);
});

test('constraint antiga de etapas informa a migration pendente', async () => {
  const service = loadService({
    async execute(sql) {
      if (sql.includes('merge into')) {
        const error = new Error('ORA-02290: check constraint (ESCALAINT.SGN_ESC_TREINAMENTO_ETAPA_CK) violated');
        error.errorNum = 2290;
        throw error;
      }
      return { rows: [{ VERSAO: 3, ETAPA: 12 }] };
    }
  });
  await assert.rejects(service.saveProgress(42, 13), (error) => {
    assert.equal(error.statusCode, 503);
    assert.match(error.message, /20261006_treinamento_tour_v3/);
    return true;
  });
});
