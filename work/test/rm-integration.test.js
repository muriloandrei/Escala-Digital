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
