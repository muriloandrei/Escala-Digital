const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET ||= 'test-secret';
process.env.ORACLE_USER ||= 'test';
process.env.ORACLE_PASSWORD ||= 'test';
process.env.ORACLE_CONNECT_STRING ||= 'localhost/XEPDB1';

const { _private } = require('../src/services/rmIntegrationService');

test('monta DELETE do RM com data direta retornada pela API', () => {
  const path = _private.buildDeleteFolgaPath(
    {
      CODCOLIGADA: 1,
      CODTABFOLGA: '999.8537',
      DATA: '2026-09-01T00:00:00',
      HORAINICIO: 480
    },
    {}
  );

  assert.equal(
    path,
    '/rmsrestdataserver/rest/PtoAdtTabFolgaData/1$_$999.8537$_$2026-09-01T00:00:00$_$480'
  );
});

test('identifica chave de folga em retorno RM com campo qualificado', () => {
  const folga = {
    'ADTTABFOLGA.DATA': '2026-09-02T00:00:00',
    'ADTTABFOLGA.HORAINICIO': 480
  };

  assert.equal(_private.getFolgaKey(folga), '2026-09-02|480');
});

test('identifica chave de folga em retorno RM aninhado', () => {
  const folga = {
    ADTTABFOLGA: {
      DATA: '2026-09-03T00:00:00',
      HORAINICIO: 480
    }
  };

  assert.equal(_private.getFolgaKey(folga), '2026-09-03|480');
});

test('nao monta DELETE do RM sem data valida', () => {
  const path = _private.buildDeleteFolgaPath(
    { CODCOLIGADA: 1, CODTABFOLGA: '999.8537', HORAINICIO: 480 },
    { codColigada: 1, codTabFolga: '999.8537' }
  );

  assert.equal(_private.getFolgaKey({ CODTABFOLGA: '999.8537' }), null);
  assert.equal(path, null);
});

test('seleciona cadastro ativo do funcionario retornado pelo RM', () => {
  const funcionario = _private.getFuncionarioRmData([
    {
      CPF: '25657613848',
      CODCOLIGADA: 1,
      CHAPA: '001.8537',
      CODSITUACAO: 'D',
      CODTABFOLGA: '01.8537'
    },
    {
      CPF: '25657613848',
      CODCOLIGADA: 1,
      CHAPA: '999.8537',
      CODSITUACAO: 'A',
      CODTABFOLGA: '999.8537'
    }
  ]);

  assert.equal(funcionario.CHAPA, '999.8537');
  assert.equal(funcionario.CODTABFOLGA, '999.8537');
});

test('rejeita resposta RM incompleta ou com datas fora do periodo', () => {
  const periodo = { inicio: '2026-10-05', fim: '2026-11-01' };
  assert.throws(() => _private.validarFolgasConsultadasRm({ hasMore: true }, [], periodo));
  assert.throws(() => _private.validarFolgasConsultadasRm({}, [{}], periodo));
  assert.throws(() => _private.validarFolgasConsultadasRm({}, [{ DATA: '2026-11-02' }], periodo));
  assert.doesNotThrow(() => _private.validarFolgasConsultadasRm({ items: [] }, [], periodo));
  assert.doesNotThrow(() => _private.validarFolgasConsultadasRm({}, [{ DATA: '2026-11-01' }], periodo));
});

test('RM does not repeat uncertain writes but can retry read requests', async () => {
  const previousFetch = global.fetch;
  const previousBaseUrl = process.env.RM_API_BASE_URL;
  const previousRetries = process.env.RM_API_RETRIES;
  let attempts = 0;
  process.env.RM_API_BASE_URL = 'http://localhost:1';
  process.env.RM_API_RETRIES = '2';
  global.fetch = async () => { attempts += 1; throw new Error('timeout'); };
  try {
    await assert.rejects(_private.requestRm('/test', { method: 'POST' }), /timeout/);
    assert.equal(attempts, 1);
    await assert.rejects(_private.requestRm('/test', { method: 'GET' }), /timeout/);
    assert.equal(attempts, 4);
  } finally {
    global.fetch = previousFetch;
    if (previousBaseUrl === undefined) delete process.env.RM_API_BASE_URL;
    else process.env.RM_API_BASE_URL = previousBaseUrl;
    if (previousRetries === undefined) delete process.env.RM_API_RETRIES;
    else process.env.RM_API_RETRIES = previousRetries;
  }
});
