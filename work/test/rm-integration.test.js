const test = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET ||= 'test-secret';
process.env.ORACLE_USER ||= 'test';
process.env.ORACLE_PASSWORD ||= 'test';
process.env.ORACLE_CONNECT_STRING ||= 'localhost/XEPDB1';

const { consultarFolgasFuncionarioMes, _private } = require('../src/services/rmIntegrationService');

test('envia DSR como dia inteiro com intervalo extra', () => {
  const payload = _private.buildFolgaPayload({
    evento: { data: '2026-11-08', programacao: 'F' }, codColigada: 1, codTabFolga: '064.0075'
  });
  assert.equal(payload.HORAINICIO, 0);
  assert.equal(payload.HORAFIM, 1440);
  assert.equal(payload.HORAINICIOSTR, '00:00');
  assert.equal(payload.HORAFIMSTR, '24:00');
  assert.equal(payload.CONSEXTRAINTER, 1);
});

test('reprocessamento substitui formato antigo e preserva folga ja corrigida', () => {
  const funcionario = { diasCobertos: ['2026-11-08'], eventos: [{ data: '2026-11-08', programacao: 'F' }] };
  const options = { funcionario, codColigada: 1, codTabFolga: '064.0075' };
  const antigo = {
    CODCOLIGADA: 1, CODTABFOLGA: '064.0075', DATA: '2026-11-08T00:00:00',
    HORAINICIO: 480, HORAFIM: 720, HORAINICIOSTR: '08:00', HORAFIMSTR: '12:00', CONSEXTRAINTER: 0
  };
  const plano = _private.planejarFolgasRm({ ...options, existentesRows: [antigo] });
  assert.equal(plano.deletePaths.length, 1);
  assert.match(plano.deletePaths[0], /\$_\$480$/);
  assert.equal(plano.payloadInclusao.length, 1);
  const correto = { ...antigo, ...plano.payloadInclusao[0] };
  assert.deepEqual(_private.planejarFolgasRm({ ...options, existentesRows: [correto] }), {
    deletePaths: [], payloadInclusao: []
  });
  const metadadosAntigos = { ...correto, CONSEXTRAINTER: 0 };
  const correcao = _private.planejarFolgasRm({ ...options, existentesRows: [metadadosAntigos] });
  assert.equal(correcao.deletePaths.length, 1);
  assert.equal(correcao.payloadInclusao.length, 1);
});

test('reprocessamento bloqueia resposta RM incompleta ou ambigua antes do DELETE', () => {
  const funcionario = { diasCobertos: ['2026-11-08'], eventos: [{ data: '2026-11-08', programacao: 'F' }] };
  const folga = { CODCOLIGADA: 1, CODTABFOLGA: '064.0075', DATA: '2026-11-08', HORAINICIO: 0 };
  const options = { funcionario, codColigada: 1, codTabFolga: '064.0075' };
  assert.throws(() => _private.planejarFolgasRm({ ...options, existentesRows: [folga] }), /campos necessarios/);
  const completa = { ...folga, HORAFIM: 1440, HORAINICIOSTR: '00:00', HORAFIMSTR: '24:00', CONSEXTRAINTER: 1 };
  assert.throws(() => _private.planejarFolgasRm({ ...options, existentesRows: [completa, completa] }), /duplicadas/);
});

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

test('aceita somente o aviso 0003 do RM como consulta de folgas vazia', () => {
  const periodo = { inicio: '2026-11-02', fim: '2026-12-06' };
  const semRegistros = {
    messages: [{ code: '0003', type: 'info', detail: 'Nenhum registro foi encontrado no banco de dados.' }],
    length: 0,
    data: null
  };
  const folgas = _private.extrairFolgasConsultadasRm(semRegistros);
  assert.deepEqual(folgas, []);
  assert.doesNotThrow(() => _private.validarFolgasConsultadasRm(semRegistros, folgas, periodo));

  for (const resposta of [
    null,
    '',
    { ...semRegistros, messages: [{ code: '0003', type: 'erro' }] },
    { ...semRegistros, messages: [{ code: '0004', type: 'info' }] },
    { ...semRegistros, length: 1 },
    { ...semRegistros, messages: [...semRegistros.messages, { code: '0004', type: 'erro' }] }
  ]) {
    assert.throws(() => _private.validarFolgasConsultadasRm(
      resposta, _private.extrairFolgasConsultadasRm(resposta), periodo));
  }
});

test('consulta folgas do RM sem registros sem iniciar escrita', async () => {
  const previousFetch = global.fetch;
  const previousBaseUrl = process.env.RM_API_BASE_URL;
  const methods = [];
  process.env.RM_API_BASE_URL = 'http://localhost:1';
  global.fetch = async (_url, options) => {
    methods.push(options.method || 'GET');
    const body = methods.length === 1
      ? [{ CODSITUACAO: 'A', CODTABFOLGA: '035.1499', CODCOLIGADA: 1 }]
      : { messages: [{ code: '0003', type: 'info', detail: 'Nenhum registro foi encontrado no banco de dados.' }], length: 0, data: null };
    return { ok: true, status: 200, text: async () => JSON.stringify(body) };
  };
  try {
    const result = await consultarFolgasFuncionarioMes({
      cpf: '12345678901', inicio: '2026-11-02', fim: '2026-12-06', codColigadaFallback: 1
    });
    assert.deepEqual(result.folgas, []);
    assert.deepEqual(result.datas, []);
    assert.deepEqual(methods, ['GET', 'GET']);
  } finally {
    global.fetch = previousFetch;
    if (previousBaseUrl === undefined) delete process.env.RM_API_BASE_URL;
    else process.env.RM_API_BASE_URL = previousBaseUrl;
  }
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

async function simularPostFolgas(respostas, validar) {
  const fetchAnterior = global.fetch;
  const variaveis = ['RM_API_BASE_URL', 'RM_API_FOLGAS_POST_CODCOLIGADA'];
  const anteriores = Object.fromEntries(variaveis.map((nome) => [nome, process.env[nome]]));
  const chamadas = [];
  process.env.RM_API_BASE_URL = 'http://localhost:1';
  process.env.RM_API_FOLGAS_POST_CODCOLIGADA = '1';
  global.fetch = async (url, options) => {
    chamadas.push({ url, options });
    const resposta = respostas[chamadas.length - 1];
    if (!resposta) throw new Error('Chamada RM inesperada');
    return { ok: resposta.status >= 200 && resposta.status < 300,
      status: resposta.status, text: async () => JSON.stringify(resposta.body || {}) };
  };
  try {
    await validar(chamadas);
  } finally {
    global.fetch = fetchAnterior;
    for (const nome of variaveis) {
      if (anteriores[nome] === undefined) delete process.env[nome];
      else process.env[nome] = anteriores[nome];
    }
  }
}

const folgaParaPost = [{
  CODCOLIGADA: 1, CODTABFOLGA: '063.0651', DATA: '2026-11-08T00:00:00-03:00',
  HORAINICIO: 0, HORAFIM: 1440, HORAINICIOSTR: '00:00', HORAFIMSTR: '24:00', CONSEXTRAINTER: 1
}];
const erroMestreAusente = { messages: [{ code: '0007', type: 'error', detail: 'Violação de chave estrangeira' }], length: 0, data: null };

test('cria cabecalho RM apos FK 0007 e repete POST de detalhes somente uma vez', async () => {
  for (const statusMestre of [200, 201]) {
    await simularPostFolgas([
      { status: 500, body: erroMestreAusente }, { status: statusMestre }, { status: 201 }
    ], async (chamadas) => {
      const result = await _private.postFolgas(folgaParaPost);
      assert.equal(result.cabecalhoCriado, true);
      assert.equal(chamadas.length, 3);
      assert.match(chamadas[0].url, /PtoAdtTabFolgaData\?codcoligada=1$/);
      assert.match(chamadas[1].url, /PtoTabFolgaData\?codcoligada=1$/);
      assert.equal(chamadas[2].url, chamadas[0].url);
      assert.deepEqual(JSON.parse(chamadas[1].options.body), [{
        CODCOLIGADA: 1, CODTABFOLGA: '063.0651', DESCRICAO: 'Folga API Escala'
      }]);
      assert.equal(chamadas[2].options.body, chamadas[0].options.body);
      assert.equal('returnStatus' in chamadas[1].options, false);
    });
  }
});

test('nao cria cabecalho por HTTP 500 sem violacao FK 0007', async () => {
  await simularPostFolgas([{ status: 500, body: { messages: [{ code: '9999', detail: 'Erro interno' }] } }], async (chamadas) => {
    await assert.rejects(_private.postFolgas(folgaParaPost), /HTTP 500/);
    assert.equal(chamadas.length, 1);
  });
});

test('nao repete detalhes quando mestre falha', async () => {
  for (const resposta of [{ status: 500 }, { status: 204 }]) {
    await simularPostFolgas([{ status: 500, body: erroMestreAusente }, resposta], async (chamadas) => {
      await assert.rejects(_private.postFolgas(folgaParaPost), /HTTP (500|204)/);
      assert.equal(chamadas.length, 2);
    });
  }
});

test('diagnostico compara payload com GET antes e depois, inclusive duplicidade no payload', () => {
  const diagnostico = _private.diagnosticarFolgasRm({
    payload: [folgaParaPost[0], folgaParaPost[0]],
    getAntes: [],
    getDepois: [{ ...folgaParaPost[0], HORAFIM: 0 }],
    erroGetDepois: null
  });
  assert.deepEqual(diagnostico.payload, [folgaParaPost[0], folgaParaPost[0]]);
  assert.deepEqual(diagnostico.getAntes, []);
  assert.equal(diagnostico.getDepois[0].completa, false);
  assert.deepEqual(diagnostico.comparacao.map((item) => item.repeticoesNoPayload), [2, 2]);
  assert.equal(diagnostico.comparacao[0].getDepois[0].horaFim, 0);
});

test('nao cria outro mestre quando repeticao dos detalhes falha', async () => {
  await simularPostFolgas([
    { status: 500, body: erroMestreAusente }, { status: 201 }, { status: 500, body: erroMestreAusente }
  ], async (chamadas) => {
    await assert.rejects(_private.postFolgas(folgaParaPost), /HTTP 500/);
    assert.equal(chamadas.length, 3);
  });
});

test('RM reads only revisions up to the approved revision', async () => {
  let query;
  const connection = {
    async execute(sql, binds) {
      if (/user_tab_columns/i.test(sql)) return { rows: [{ COLUMN_NAME: 'CPF' }, { COLUMN_NAME: 'ATIVA' }] };
      query = { sql, binds };
      return { rows: [] };
    }
  };
  await _private.getEscalaParaRm(connection, { lojaId: 35, mesRef: '2026-10-01', revisao: 12 });
  assert.match(query.sql, /px\.revisao <= :revisao/);
  assert.match(query.sql, /left join sgn_esc_prog_dia d/i);
  assert.match(query.sql, /d\.dt >= to_date\(:inicio, 'YYYY-MM-DD'\) and d\.dt < to_date\(:fim, 'YYYY-MM-DD'\) \+ 1/i);
  assert.match(query.sql, /ativo_d\.dt >= to_date\(:inicio, 'YYYY-MM-DD'\) and ativo_d\.dt < to_date\(:fim, 'YYYY-MM-DD'\) \+ 1/i);
  assert.equal(query.binds.inicio, '2026-10-05');
  assert.equal(query.binds.fim, '2026-10-31');
  assert.equal(query.binds.revisao, 12);
  await _private.getEscalaParaRm(connection, { lojaId: 52, mesRef: '2026-11-01', revisao: 40 });
  assert.equal(query.binds.inicio, '2026-11-01');
  assert.equal(query.binds.fim, '2026-11-29');
  await _private.getEscalaParaRm(connection, { lojaId: 52, mesRef: '2026-12-01', revisao: 2 });
  assert.equal(query.binds.inicio, '2026-11-30');
  assert.equal(query.binds.fim, '2027-01-03');
  assert.doesNotMatch(query.sql, /nvl\(d\.programacao, 'TRB'\) <> 'TRB'/i);
  assert.equal(query.binds.revisao, 2);
});

test('RM separa dias cobertos de folgas e ignora ferias e afastamentos', () => {
  const funcionarios = _private.agruparPorFuncionario([
    { ESCFUNC_ID: 1, CHAPA: '001', DT: new Date('2026-10-05T12:00:00Z'), PROGRAMACAO: 'TRB' },
    { ESCFUNC_ID: 1, CHAPA: '001', DT: new Date('2026-10-06T12:00:00Z'), PROGRAMACAO: 'FER' },
    { ESCFUNC_ID: 2, CHAPA: '002', DT: new Date('2026-10-05T12:00:00Z'), PROGRAMACAO: 'F' }
  ]);
  assert.equal(funcionarios.length, 2);
  assert.deepEqual(funcionarios[0].eventos, []);
  assert.deepEqual(funcionarios[0].diasCobertos, ['2026-10-05']);
  assert.deepEqual(funcionarios[1].eventos, [{ data: '2026-10-05', programacao: 'F' }]);
});

test('RM conserva FDO separado dos eventos DSR', () => {
  const [funcionario] = _private.agruparPorFuncionario([
    { ESCFUNC_ID: 1, CHAPA: '001', DT: new Date('2026-10-05T12:00:00Z'), PROGRAMACAO: 'FDO' }
  ]);
  assert.deepEqual(funcionario.eventos, []);
  assert.deepEqual(funcionario.fdoDatas, ['2026-10-05']);
  assert.deepEqual(funcionario.diasCobertos, []);
});

test('RM nao envia nem remove folga nas datas FDO', () => {
  const [funcionario] = _private.agruparPorFuncionario([
    { ESCFUNC_ID: 1, CHAPA: '001', DT: new Date('2026-09-07T12:00:00Z'), PROGRAMACAO: 'FDO' },
    { ESCFUNC_ID: 1, CHAPA: '001', DT: new Date('2026-09-09T12:00:00Z'), PROGRAMACAO: 'F' }
  ]);
  const existentesRows = [{ CODCOLIGADA: 1, CODTABFOLGA: '001', DATA: '2026-09-07T00:00:00', HORAINICIO: 0 }];
  const plano = _private.planejarFolgasRm({ existentesRows, funcionario, codColigada: 1, codTabFolga: '001' });
  assert.deepEqual(plano.deletePaths, []);
  assert.equal(plano.payloadInclusao.length, 1);
  assert.match(plano.payloadInclusao[0].DATA, /2026-09-09/);
});

test('RM seleciona somente o escopo oficializado solicitado', async () => {
  let query;
  const connection = {
    async execute(sql, binds) {
      if (/user_tab_columns/i.test(sql)) return { rows: [{ COLUMN_NAME: 'CPF' }, { COLUMN_NAME: 'ATIVA' }] };
      query = { sql, binds };
      return { rows: [] };
    }
  };
  await _private.getEscalaParaRm(connection, {
    lojaId: 35, mesRef: '2026-10-01', revisao: 12,
    escsecaoId: 2003, escfuncIds: [10, 11], apenasOficializada: true
  });
  assert.match(query.sql, /p\.escsecao_id = :escsecaoId/);
  assert.match(query.sql, /p\.escfunc_id in \(:escfuncId0, :escfuncId1\)/);
  assert.match(query.sql, /nvl\(p\.oficializada, 0\) = 1/);
  assert.equal(query.binds.escsecaoId, 2003);
  assert.equal(query.binds.escfuncId0, 10);
  assert.equal(query.binds.escfuncId1, 11);
  query = null;
  assert.deepEqual(await _private.getEscalaParaRm(connection, {
    lojaId: 35, mesRef: '2026-10-01', revisao: 12, escfuncIds: []
  }), []);
  assert.equal(query, null);
});
