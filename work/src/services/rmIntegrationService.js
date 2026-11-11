const { randomUUID } = require('node:crypto');
const { getEnv } = require('../config/env');
const { withConnection, oracledb } = require('../db/oracle');
const { getOperationalPeriodIso } = require('../domain/operationalPeriod');

const FOLGA_RM = Object.freeze({
  horaInicio: 0,
  horaFim: 1440,
  horaInicioStr: '00:00',
  horaFimStr: '24:00',
  consextrainter: 1
});

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  if (!row || typeof row !== 'object') return undefined;

  const expected = new Set(keys.map(normalizeFieldName));
  const stack = [row];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== 'object') continue;

    for (const [key, value] of Object.entries(current)) {
      if (expected.has(normalizeFieldName(key))) return value;
      if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
        stack.push(value);
      }
    }
  }
  return undefined;
}

function normalizeFieldName(value) {
  return String(value || '')
    .replace(/^[^.]+\./, '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();
}

function formatDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value || '').slice(0, 10);
}

function mask(value) {
  const text = String(value || '');
  if (text.length <= 4) return '****';
  return `${text.slice(0, 2)}****${text.slice(-2)}`;
}

function maskRmPath(value) {
  return String(value || '')
    .replace(/CPF(%3D|=)(\d{3})\d+(\d{2})/gi, 'CPF$1$2****$3')
    .replace(/(parameters=CPF%3D)(\d{3})\d+(\d{2})/gi, '$1$2****$3');
}

function sanitizeCpf(value) {
  return String(value || '').replace(/\D/g, '');
}

function describeNetworkError(error, timeoutMs) {
  if (error?.name === 'AbortError') return `timeout apos ${timeoutMs}ms`;

  const details = [];
  const collect = (item) => {
    if (!item || typeof item !== 'object') return;
    const parts = [
      item.code,
      item.errno,
      item.syscall,
      item.address,
      item.port
    ].filter((part) => part !== undefined && part !== null && part !== '');
    if (parts.length) details.push(parts.join(' '));
  };

  collect(error);
  collect(error?.cause);
  if (Array.isArray(error?.errors)) error.errors.forEach(collect);
  if (Array.isArray(error?.cause?.errors)) error.cause.errors.forEach(collect);

  return [...new Set(details)].join('; ');
}

function isEscritaIncertaRm(erro) {
  return /Timeout de escrita|Falha ao chamar RM em (POST|DELETE).*timeout/i.test(String(erro || ''));
}

function toArrayResult(body) {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  for (const key of ['items', 'Itens', 'data', 'Data', 'rows', 'Rows', 'result', 'Result', 'resultado', 'Resultado']) {
    if (Array.isArray(body[key])) return body[key];
  }
  return [body];
}

function extrairFolgasConsultadasRm(body) {
  if (!body || typeof body !== 'object') return [body];
  const semRegistros = !Array.isArray(body) && body.data === null && body.length === 0
    && Array.isArray(body.messages) && body.messages.length === 1
    && String(body.messages[0]?.code) === '0003'
    && String(body.messages[0]?.type).toLowerCase() === 'info';
  return semRegistros ? [] : toArrayResult(body);
}

function formatRmDate(value, options = {}) {
  const date = formatDate(value);
  const time = options.endOfDay ? '23:59:59' : '00:00:00';
  return `${date}T${time}${options.offset || ''}`;
}

function getFuncionarioRmData(body) {
  const rows = toArrayResult(body);
  return rows.find((row) => isFuncionarioRmAtivo(row) && getCodTabFolga(row))
    || rows.find(isFuncionarioRmAtivo)
    || rows.find((row) => getCodTabFolga(row))
    || rows[0]
    || {};
}

function getCodTabFolga(funcionarioRm, chapaEsperada = null) {
  const codigo = pick(funcionarioRm, 'CODTABFOLGA', 'codTabFolga', 'codtabfolga', 'CodTabFolga');
  if (codigo != null && String(codigo).trim()) return String(codigo).trim();
  const chapaRm = String(pick(funcionarioRm, 'CHAPA', 'chapa', 'Chapa') || '').trim();
  if (!chapaRm || (chapaEsperada && chapaRm !== String(chapaEsperada).trim())) return null;
  return chapaRm;
}

function isFuncionarioRmAtivo(funcionarioRm) {
  return String(pick(funcionarioRm, 'CODSITUACAO', 'codSituacao', 'codsituacao', 'CodSituacao') || '')
    .trim()
    .toUpperCase() === 'A';
}

function getCodColigada(funcionarioRm, fallback) {
  return pick(funcionarioRm, 'CODCOLIGADA', 'codColigada', 'codcoligada', 'CodColigada') || fallback;
}

function getFolgaDateValue(folga) {
  return pick(
    folga,
    'DATA',
    'data',
    'Data',
    'DT',
    'dt',
    'DATAFOLGA',
    'dataFolga',
    'DataFolga',
    'ADTTABFOLGA.DATA',
    'ADTTABFOLGA_DATA'
  );
}

function getFolgaHoraInicioValue(folga) {
  return pick(
    folga,
    'HORAINICIO',
    'horainicio',
    'HoraInicio',
    'HORA_INICIO',
    'hora_inicio',
    'ADTTABFOLGA.HORAINICIO',
    'ADTTABFOLGA_HORAINICIO'
  );
}

function isFolgaRmCompleta(folga) {
  return Number(pick(folga, 'HORAINICIO', 'ADTTABFOLGA.HORAINICIO')) === FOLGA_RM.horaInicio
    && Number(pick(folga, 'HORAFIM', 'ADTTABFOLGA.HORAFIM')) === FOLGA_RM.horaFim
    && String(pick(folga, 'HORAINICIOSTR', 'ADTTABFOLGA.HORAINICIOSTR') || '') === FOLGA_RM.horaInicioStr
    && String(pick(folga, 'HORAFIMSTR', 'ADTTABFOLGA.HORAFIMSTR') || '') === FOLGA_RM.horaFimStr
    && Number(pick(folga, 'CONSEXTRAINTER', 'ADTTABFOLGA.CONSEXTRAINTER')) === FOLGA_RM.consextrainter;
}

function assertFolgasRmVerificaveis(folgas, eventos) {
  const datasDesejadas = new Set(eventos.map((evento) => evento.data));
  const chaves = new Set();
  for (const folga of folgas) {
    const chave = getFolgaKey(folga);
    if (!chave) throw new Error('RM retornou folga sem data ou hora inicial. Nenhuma folga foi reconciliada.');
    if (!datasDesejadas.has(chave.split('|')[0])) continue;
    if (chaves.has(chave)) throw new Error('RM retornou folgas duplicadas para a mesma data e hora. Nenhuma folga foi reconciliada.');
    chaves.add(chave);
    if (Number(getFolgaHoraInicioValue(folga)) === FOLGA_RM.horaInicio
      && ['HORAFIM', 'HORAINICIOSTR', 'HORAFIMSTR', 'CONSEXTRAINTER'].some((campo) => pick(folga, campo, `ADTTABFOLGA.${campo}`) == null)) {
      throw new Error('RM nao retornou os campos necessarios para conferir a folga de dia inteiro. Nenhuma folga foi reconciliada.');
    }
  }
}

function getFolgaCodColigadaValue(folga) {
  return pick(
    folga,
    'CODCOLIGADA',
    'codColigada',
    'codcoligada',
    'CodColigada',
    'ADTTABFOLGA.CODCOLIGADA',
    'ADTTABFOLGA_CODCOLIGADA'
  );
}

function getFolgaCodTabFolgaValue(folga) {
  return pick(
    folga,
    'CODTABFOLGA',
    'codTabFolga',
    'codtabfolga',
    'CodTabFolga',
    'ADTTABFOLGA.CODTABFOLGA',
    'ADTTABFOLGA_CODTABFOLGA'
  );
}

async function getTableColumns(connection, tableName) {
  const result = await connection.execute(
    `select column_name from user_tab_columns where table_name = :tableName`,
    { tableName: String(tableName).toUpperCase() },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
}

async function registrarRmLog(connection, data) {
  try {
    await connection.execute(
      `insert into sgn_esc_rm_log (
         escrmlog_id, loja, mes_ref, revisao, escfunc_id, chapa, cpf, acao, status, mensagem, payload_resumo, dt_hr_incl
       ) values (
         sgn_esc_rm_log_seq.nextval, :loja, to_date(:mesRef, 'YYYY-MM-DD'), :revisao, :escfuncId, :chapa, :cpf, :acao, :status, :mensagem, :payloadResumo, sysdate
       )`,
      {
        loja: data.loja || null,
        mesRef: formatDate(data.mesRef),
        revisao: data.revisao ?? null,
        escfuncId: data.escfuncId ?? null,
        chapa: data.chapa || null,
        cpf: data.cpf || null,
        acao: data.acao,
        status: data.status,
        mensagem: String(data.mensagem || '').slice(0, 1000),
        payloadResumo: String(data.payloadResumo || '').slice(0, 1000)
      },
      { autoCommit: false }
    );
  } catch (error) {
    if (![942, 904, 2289].includes(error?.errorNum)) throw error;
  }
}

function buildAuthHeader(rmConfig) {
  if (!rmConfig.username || !rmConfig.password) return {};
  const token = Buffer.from(`${rmConfig.username}:${rmConfig.password}`).toString('base64');
  return { Authorization: `Basic ${token}` };
}

async function requestRm(path, options = {}) {
  const rmConfig = getEnv().rm;
  if (!rmConfig.baseUrl) {
    throw new Error('RM_API_BASE_URL nao configurado.');
  }
  const baseUrl = rmConfig.baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const { returnStatus = false, ...requestOptions } = options;
  const method = requestOptions.method || 'GET';
  const maxRetries = ['GET', 'HEAD'].includes(String(method).toUpperCase()) ? rmConfig.retries : 0;
  const logPath = maskRmPath(path);
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), rmConfig.timeoutMs);
    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeader(rmConfig),
          ...(requestOptions.headers || {})
        }
      });
      const text = await response.text();
      let body = null;
      if (text) {
        try {
          body = JSON.parse(text);
        } catch (_) {
          body = text;
        }
      }
      if (!response.ok) {
        const detail = typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body || {}).slice(0, 300);
        const error = new Error(`RM retornou HTTP ${response.status} em ${method} ${logPath}${detail ? `: ${detail}` : ''}`);
        error.statusCode = response.status;
        error.body = body;
        throw error;
      }
      return returnStatus ? { status: response.status, body } : body;
    } catch (error) {
      const detail = describeNetworkError(error, rmConfig.timeoutMs);
      lastError = new Error(`Falha ao chamar RM em ${method} ${logPath}: ${error.message}${detail ? ` (${detail})` : ''}`);
      lastError.cause = error;
      lastError.statusCode = error.statusCode;
      lastError.body = error.body;
      if (attempt >= maxRetries) break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
}

async function getFuncionarioRmPorCpf(cpf) {
  const rmConfig = getEnv().rm;
  const parameters = encodeURIComponent(`CPF=${cpf}`);
  return getFuncionarioRmData(await requestRm(`${rmConfig.funcionarioPath}?parameters=${parameters}`));
}

async function getFolgasExistentes({ codTabFolga, inicio, fim }) {
  const rmConfig = getEnv().rm;
  const filter = JSON.stringify([
    'ADTTABFOLGA.CODTABFOLGA=:codtabfolga AND ADTTABFOLGA.DATA>=:dataInicio AND ADTTABFOLGA.DATA<=:dataFim',
    String(codTabFolga),
    formatRmDate(inicio),
    formatRmDate(fim, { endOfDay: true })
  ]);
  const resposta = await requestRm(`${rmConfig.folgasPath}?filter=${encodeURIComponent(filter)}`);
  const folgas = extrairFolgasConsultadasRm(resposta);
  validarFolgasConsultadasRm(resposta, folgas, { inicio, fim });
  return folgas;
}

function validarFolgasConsultadasRm(resposta, folgas, { inicio, fim }) {
  const incompleta = resposta?.hasMore === true || Boolean(resposta?.nextPage || resposta?.nextToken);
  const foraDoPeriodo = folgas.some((folga) => {
    const data = formatDate(getFolgaDateValue(folga));
    return !/^\d{4}-\d{2}-\d{2}$/.test(data) || data < inicio || data > fim;
  });
  if (incompleta || foraDoPeriodo) {
    const error = new Error('Resposta de folgas do RM incompleta ou fora do periodo consultado. Nenhuma escala foi reconciliada.');
    error.statusCode = 502;
    throw error;
  }
}

async function consultarFolgasFuncionarioMes({ cpf, inicio, fim, codColigadaFallback }) {
  const cpfLimpo = sanitizeCpf(cpf);
  if (!cpfLimpo) {
    const error = new Error('CPF do funcionario nao informado para consulta ao RM.');
    error.statusCode = 422;
    throw error;
  }

  const funcionarioRm = await getFuncionarioRmPorCpf(cpfLimpo);
  const codColigada = getCodColigada(funcionarioRm, codColigadaFallback);
  const codTabFolga = getCodTabFolga(funcionarioRm);
  if (!codTabFolga) {
    const error = new Error(`RM nao retornou CODTABFOLGA para o CPF ${mask(cpfLimpo)}.`);
    error.statusCode = 422;
    throw error;
  }

  const folgas = await getFolgasExistentes({ codTabFolga, inicio, fim });
  const datas = [...new Set(folgas
    .map((folga) => formatDate(getFolgaDateValue(folga)))
    .filter(Boolean))]
    .sort();

  return {
    funcionarioRm,
    codColigada,
    codTabFolga,
    folgas,
    datas
  };
}

function getFolgaKey(folga) {
  const data = formatDate(getFolgaDateValue(folga));
  if (!data) return null;
  const horaInicioValue = getFolgaHoraInicioValue(folga);
  if (horaInicioValue === null || horaInicioValue === undefined || horaInicioValue === '') return null;
  const horaInicio = Number(horaInicioValue);
  if (!Number.isFinite(horaInicio)) return null;
  return `${data}|${horaInicio}`;
}

function buildDeleteFolgaPath(folga, defaults) {
  const rmConfig = getEnv().rm;
  const codColigada = getFolgaCodColigadaValue(folga) || defaults.codColigada;
  const codTabFolga = getFolgaCodTabFolgaValue(folga) || defaults.codTabFolga;
  const dataValue = getFolgaDateValue(folga);
  const data = dataValue ? formatRmDate(dataValue) : null;
  const horaInicioValue = getFolgaHoraInicioValue(folga);
  if (horaInicioValue === null || horaInicioValue === undefined || horaInicioValue === '') return null;
  const horaInicio = Number(horaInicioValue);
  if (!codColigada || !codTabFolga || !data || !Number.isFinite(horaInicio)) return null;
  const id = `${codColigada}$_$${codTabFolga}$_$${data}$_$${horaInicio}`;
  return `${rmConfig.folgasPath}/${id}`;
}

function buildFolgaPayload({ evento, codColigada, codTabFolga }) {
  const rmConfig = getEnv().rm;
  return {
    CODCOLIGADA: Number(codColigada),
    CODTABFOLGA: String(codTabFolga),
    DATA: formatRmDate(evento.data, { offset: rmConfig.timezoneOffset }),
    HORAINICIO: FOLGA_RM.horaInicio,
    HORAFIM: FOLGA_RM.horaFim,
    HORAINICIOSTR: FOLGA_RM.horaInicioStr,
    HORAFIMSTR: FOLGA_RM.horaFimStr,
    CONSEXTRAINTER: FOLGA_RM.consextrainter,
    RECCREATEDBY: null,
    RECCREATEDON: null,
    RECMODIFIEDBY: null,
    RECMODIFIEDON: null
  };
}

function planejarFolgasRm({ existentesRows, funcionario, codColigada, codTabFolga }) {
  assertFolgasRmVerificaveis(existentesRows, funcionario.eventos);
  const diasCobertos = new Set(funcionario.diasCobertos);
  const desejadas = new Set(funcionario.eventos.map((evento) => `${evento.data}|${FOLGA_RM.horaInicio}`));
  const deletePaths = [];

  for (const folga of existentesRows) {
    const folgaKey = getFolgaKey(folga);
    if (!diasCobertos.has(folgaKey.split('|')[0])) continue;
    if (desejadas.has(folgaKey) && isFolgaRmCompleta(folga)) continue;
    const deletePath = buildDeleteFolgaPath(folga, { codColigada, codTabFolga });
    if (!deletePath) throw new Error('RM retornou folga sem chave completa para exclusao. Nenhuma folga foi reconciliada.');
    deletePaths.push(deletePath);
  }

  const payloadInclusao = funcionario.eventos
    .filter((evento) => !existentesRows.some((folga) => getFolgaKey(folga) === `${evento.data}|${FOLGA_RM.horaInicio}`
      && isFolgaRmCompleta(folga)))
    .map((evento) => buildFolgaPayload({ evento, codColigada, codTabFolga }));

  return { deletePaths, payloadInclusao };
}

function diagnosticarFolgasRm({ payload, getAntes, getDepois, erroGetDepois }) {
  const resumir = (folgas) => folgas.map((folga) => ({
    codcoligada: getFolgaCodColigadaValue(folga) ?? null,
    codtabfolga: getFolgaCodTabFolgaValue(folga) ?? null,
    data: formatDate(getFolgaDateValue(folga)),
    horaInicio: getFolgaHoraInicioValue(folga) ?? null,
    horaFim: pick(folga, 'HORAFIM', 'ADTTABFOLGA.HORAFIM') ?? null,
    horaInicioStr: pick(folga, 'HORAINICIOSTR', 'ADTTABFOLGA.HORAINICIOSTR') ?? null,
    horaFimStr: pick(folga, 'HORAFIMSTR', 'ADTTABFOLGA.HORAFIMSTR') ?? null,
    consextrainter: pick(folga, 'CONSEXTRAINTER', 'ADTTABFOLGA.CONSEXTRAINTER') ?? null,
    completa: isFolgaRmCompleta(folga)
  }));
  const antes = resumir(getAntes);
  const depois = getDepois === null ? null : resumir(getDepois);
  const contagem = new Map();
  for (const folga of payload) {
    const chave = `${formatDate(folga.DATA)}|${folga.HORAINICIO}`;
    contagem.set(chave, (contagem.get(chave) || 0) + 1);
  }
  const comparar = (folgas, data, horaInicio) => folgas
    .filter((folga) => folga.data === data && Number(folga.horaInicio) === Number(horaInicio))
    .map((folga) => ({ completa: folga.completa, horaFim: folga.horaFim, consextrainter: folga.consextrainter }));

  return {
    payload,
    getAntes: antes,
    getDepois: depois,
    erroGetDepois: erroGetDepois || null,
    comparacao: payload.map((folga) => {
      const data = formatDate(folga.DATA);
      const chave = `${data}|${folga.HORAINICIO}`;
      return {
        data,
        horaInicio: folga.HORAINICIO,
        repeticoesNoPayload: contagem.get(chave),
        getAntes: comparar(antes, data, folga.HORAINICIO),
        getDepois: depois === null ? null : comparar(depois, data, folga.HORAINICIO)
      };
    })
  };
}

async function postFolgas(payload) {
  if (!payload.length) return null;
  const rmConfig = getEnv().rm;
  const parametroColigada = `?codcoligada=${encodeURIComponent(rmConfig.folgasPostCodcoligada)}`;
  const enviarDetalhes = () => requestRm(`${rmConfig.folgasPath}${parametroColigada}`, {
    method: 'POST', body: JSON.stringify(payload)
  });
  try {
    return { body: await enviarDetalhes(), cabecalhoCriado: false };
  } catch (error) {
    const violacaoFk = error.statusCode === 500 && Array.isArray(error.body?.messages)
      && error.body.messages.some((message) => String(message.code) === '0007'
        && /chave estrangeira|foreign key/i.test(String(message.detail || '')));
    if (!violacaoFk) throw error;
  }

  const { CODCOLIGADA, CODTABFOLGA } = payload[0];
  if (payload.some((folga) => folga.CODCOLIGADA !== CODCOLIGADA || folga.CODTABFOLGA !== CODTABFOLGA)) {
    throw new Error('Folgas de mais de uma tabela no mesmo POST; cabecalho RM nao foi criado.');
  }
  const cabecalho = await requestRm(`${rmConfig.folgasMasterPath}${parametroColigada}`, {
    method: 'POST', returnStatus: true,
    body: JSON.stringify([{ CODCOLIGADA, CODTABFOLGA, DESCRICAO: 'Folga API Escala' }])
  });
  if (cabecalho.status !== 200 && cabecalho.status !== 201) {
    throw new Error(`RM retornou HTTP ${cabecalho.status} ao criar cabecalho da tabela de folga; detalhes nao reenviados.`);
  }
  return { body: await enviarDetalhes(), cabecalhoCriado: true };
}

async function getEscalaParaRm(connection, { lojaId, mesRef, revisao, escsecaoId = null, escfuncIds = null, apenasOficializada = false, apenasNaoOficializada = false }) {
  const funcionarioColumns = await getTableColumns(connection, 'SGN_ESC_FUNCIONARIO');
  const progColumns = await getTableColumns(connection, 'SGN_ESC_PROG');
  const cpfSelect = funcionarioColumns.has('CPF') ? 'f.cpf' : funcionarioColumns.has('CPF_FUNCIONARIO') ? 'f.cpf_funcionario as cpf' : 'cast(null as varchar2(20)) as cpf';
  const ativaSql = progColumns.has('ATIVA') ? 'and nvl(p.ativa, 1) = 1' : '';
  const ativaSubSql = progColumns.has('ATIVA') ? 'and nvl(px.ativa, 1) = 1' : '';
  const binds = { lojaId, mesRef, revisao };
  const filtroSecao = escsecaoId ? 'and p.escsecao_id = :escsecaoId' : '';
  if (escsecaoId) binds.escsecaoId = escsecaoId;
  const ids = Array.isArray(escfuncIds) ? [...new Set(escfuncIds.map(Number).filter(Boolean))] : null;
  if (ids && !ids.length) return [];
  const filtroIds = ids ? `and p.escfunc_id in (${ids.map((id, index) => {
    binds[`escfuncId${index}`] = id;
    return `:escfuncId${index}`;
  }).join(', ')})` : '';
  const filtroOficializada = apenasOficializada ? 'and nvl(p.oficializada, 0) = 1'
    : apenasNaoOficializada ? 'and nvl(p.oficializada, 0) = 0' : '';
  const result = await connection.execute(
    `select p.loja, p.mes_ref, p.revisao, p.escfunc_id, p.chapa, f.nome, f.codcoligada, ${cpfSelect},
            d.dt, d.programacao,
            case when f.dt_demiss is not null and trunc(d.dt) > trunc(f.dt_demiss)
              then 1 else 0 end as apos_demissao
     from sgn_esc_prog p
     left join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
     join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
     where p.loja = :lojaId
       and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       ${filtroSecao}
       ${filtroIds}
       ${filtroOficializada}
       and exists (select 1 from sgn_esc_prog_dia ativo_d where ativo_d.escprog_id = p.escprog_id)
       and p.revisao = (
         select max(px.revisao)
         from sgn_esc_prog px
         where px.loja = p.loja
           and px.mes_ref = p.mes_ref
           and px.escfunc_id = p.escfunc_id
           and px.revisao <= :revisao
           ${ativaSubSql}
       )
       ${ativaSql}
     order by p.chapa, d.dt`,
    binds,
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows;
}

async function getLatestRevisionForRm(connection, { lojaId, mesRef }) {
  const progColumns = await getTableColumns(connection, 'SGN_ESC_PROG');
  const ativaSql = progColumns.has('ATIVA') ? 'and nvl(ativa, 1) = 1' : '';
  const result = await connection.execute(
    `select max(revisao) as revisao
     from sgn_esc_prog
     where loja = :lojaId
       and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       ${ativaSql}`,
    { lojaId, mesRef },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const revision = pick(result.rows?.[0], 'REVISAO', 'revisao');
  return revision === null || revision === undefined ? null : Number(revision);
}

function agruparPorFuncionario(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const key = String(pick(row, 'ESCFUNC_ID', 'escfunc_id'));
    if (!map.has(key)) {
      map.set(key, {
        escfuncId: pick(row, 'ESCFUNC_ID', 'escfunc_id'),
        chapa: pick(row, 'CHAPA', 'chapa'),
        cpf: pick(row, 'CPF', 'cpf'),
        codcoligada: pick(row, 'CODCOLIGADA', 'codcoligada'),
        revisao: pick(row, 'REVISAO', 'revisao'),
        diasCobertos: [],
        eventos: [],
        fdoDatas: []
      });
    }
    const data = pick(row, 'DT', 'dt');
    if (data) {
      const dataIso = formatDate(data);
      const programacao = String(pick(row, 'PROGRAMACAO', 'programacao') || '').toUpperCase();
      if (!['FER', 'FERIAS', 'AFA', 'AFASTAMENTO', 'FDO'].includes(programacao)) {
        map.get(key).diasCobertos.push(dataIso);
      }
      if (['F', 'FOLGA', 'FXF', 'FOLGA_FIXA'].includes(programacao)) {
        map.get(key).eventos.push({ data: dataIso, programacao });
      } else if (programacao === 'FDO') {
        map.get(key).fdoDatas.push(dataIso);
      }
    }
  });
  return [...map.values()];
}

async function validarPreRequisitosRm({ lojaId, mesRef, revisao, escsecaoId, escfuncIds }) {
  const rmConfig = getEnv().rm;
  if (!rmConfig.enabled) {
    return { enabled: false, revisao: revisao ?? null, errors: [] };
  }

  return withConnection(async (connection) => {
    const revisaoAlvo = revisao ?? await getLatestRevisionForRm(connection, { lojaId, mesRef });
    if (revisaoAlvo === null) {
      return { enabled: true, revisao: null, errors: ['Escala ativa nao encontrada para oficializacao.'] };
    }

    const funcionarios = agruparPorFuncionario(await getEscalaParaRm(connection, { lojaId, mesRef, revisao: revisaoAlvo, escsecaoId, escfuncIds, apenasNaoOficializada: true }));
    const errors = [];
    for (const funcionario of funcionarios) {
      const cpf = sanitizeCpf(funcionario.cpf);
      if (!cpf) {
        const mensagem = `CPF nao cadastrado para o funcionario ${funcionario.chapa}. Atualize SGN_ESC_FUNCIONARIO.CPF antes de oficializar no RM.`;
        errors.push(mensagem);
        await registrarRmLog(connection, {
          loja: lojaId,
          mesRef,
          revisao: funcionario.revisao ?? revisaoAlvo,
          escfuncId: funcionario.escfuncId,
          chapa: funcionario.chapa,
          cpf: null,
          acao: 'RM_VALIDAR_CPF',
          status: 'FALHA',
          mensagem,
          payloadResumo: `chapa=${funcionario.chapa}`
        });
      }
    }
    if (errors.length) await connection.commit();

    return { enabled: true, revisao: revisaoAlvo, errors };
  });
}

async function oficializarNoRm({ lojaId, mesRef, revisao, escsecaoId, escfuncIds, exigirEscala = false, somenteVerificar = false }) {
  const rmConfig = getEnv().rm;
  return withConnection(async (connection) => {
    const rows = await getEscalaParaRm(connection, { lojaId, mesRef, revisao, escsecaoId, escfuncIds, apenasOficializada: true });
    if (exigirEscala && !rows.length) {
      throw new Error('Programacao oficializada nao encontrada para a pendencia RM. Verifique a revisao antes de reprocessar.');
    }
    if (rows.some((row) => Number(pick(row, 'APOS_DEMISSAO', 'apos_demissao') || 0) === 1)) {
      throw new Error('Envio RM suspenso: ha dias programados apos a demissao registrada. Revise a escala e a pendencia antes de reprocessar.');
    }
    if (!rmConfig.enabled) {
      await registrarRmLog(connection, {
        loja: lojaId,
        mesRef,
        revisao,
        acao: 'RM_OFICIALIZAR',
        status: 'IGNORADO',
        mensagem: 'Integracao RM desabilitada em RM_API_ENABLED.',
        payloadResumo: `${rows.length} descanso(s) pendente(s)`
      });
      await connection.commit();
      return { enabled: false, enviados: 0, falhas: 0 };
    }

    let enviados = 0;
    let falhas = 0;
    const erros = [];
    for (const funcionario of agruparPorFuncionario(rows)) {
      let diagnosticoId = null;
      try {
        if (!funcionario.eventos.length && !funcionario.diasCobertos.length) {
          await registrarRmLog(connection, {
            loja: lojaId, mesRef, revisao: funcionario.revisao ?? revisao,
            escfuncId: funcionario.escfuncId, chapa: funcionario.chapa,
            acao: 'RM_ENVIAR_DESCANSOS', status: 'IGNORADO',
            mensagem: `${funcionario.fdoDatas.length} FDO ignorada(s); nenhum dia reconciliavel no RM.`,
            payloadResumo: `chapa=${funcionario.chapa}; fdo_ignorada=${funcionario.fdoDatas.length}`
          });
          continue;
        }
        const cpf = sanitizeCpf(funcionario.cpf);
        if (!cpf) {
          throw new Error(`CPF nao cadastrado para o funcionario ${funcionario.chapa}. Atualize SGN_ESC_FUNCIONARIO.CPF antes de oficializar no RM.`);
        }

        const funcionarioRm = await getFuncionarioRmPorCpf(cpf);
        const codColigadaRm = getCodColigada(funcionarioRm, funcionario.codcoligada);
        const codTabFolga = getCodTabFolga(funcionarioRm, funcionario.chapa);
        if (!codTabFolga) {
          throw new Error(`RM nao retornou CODTABFOLGA nem CHAPA correspondente a ${funcionario.chapa} para o CPF ${mask(cpf)}.`);
        }

        const { inicio, fim } = getOperationalPeriodIso(mesRef);
        const existentesRows = await getFolgasExistentes({ codTabFolga, inicio, fim });
        const { deletePaths, payloadInclusao } = planejarFolgasRm({
          existentesRows, funcionario, codColigada: codColigadaRm, codTabFolga
        });
        if (somenteVerificar && (deletePaths.length || payloadInclusao.length)) {
          throw new Error('Timeout de escrita no RM: consulta ainda nao confirma as folgas. Envio INCERTO; conferir no RM antes de reenviar.');
        }
        let removidas = 0;

        for (const deletePath of deletePaths) {
          await requestRm(deletePath, { method: 'DELETE' });
          removidas += 1;
        }
        let postResultado;
        try {
          postResultado = await postFolgas(payloadInclusao);
        } catch (error) {
          if (payloadInclusao.length) {
            diagnosticoId = randomUUID();
            let getDepois = null;
            let erroGetDepois = null;
            if (error.statusCode === 500 && /chave duplicada|conflito de descanso/i.test(error.message)) {
              try {
                getDepois = await getFolgasExistentes({ codTabFolga, inicio, fim });
              } catch (consultaError) {
                erroGetDepois = consultaError.message;
              }
            }
            console.error(JSON.stringify({
              event: 'rm_folgas_post_diagnostico', diagnosticoId,
              loja: lojaId, mesRef: formatDate(mesRef), revisao: funcionario.revisao ?? revisao,
              escfuncId: funcionario.escfuncId, chapa: funcionario.chapa,
              removidasAntesDoPost: removidas, erroPost: error.message,
              ...diagnosticarFolgasRm({ payload: payloadInclusao, getAntes: existentesRows, getDepois, erroGetDepois })
            }));
          }
          throw error;
        }

        enviados += funcionario.eventos.length;
        await registrarRmLog(connection, {
          loja: lojaId, mesRef, revisao: funcionario.revisao ?? revisao, escfuncId: funcionario.escfuncId, chapa: funcionario.chapa, cpf: mask(cpf),
          acao: 'RM_ENVIAR_DESCANSOS', status: 'SUCESSO',
          mensagem: `${funcionario.eventos.length} evento(s) sincronizado(s); ${funcionario.fdoDatas.length} FDO ignorada(s) no RM.`,
          payloadResumo: `chapa=${funcionario.chapa}; codtabfolga=${codTabFolga}; incluir=${payloadInclusao.length}; remover=${removidas}; existentes=${existentesRows.length}; fdo_ignorada=${funcionario.fdoDatas.length}; cabecalho_criado=${postResultado?.cabecalhoCriado ? 1 : 0}`
        });
      } catch (error) {
        falhas += 1;
        erros.push(error.message);
        await registrarRmLog(connection, {
          loja: lojaId, mesRef, revisao: funcionario.revisao ?? revisao, escfuncId: funcionario.escfuncId, chapa: funcionario.chapa, cpf: mask(funcionario.cpf),
          acao: 'RM_ENVIAR_DESCANSOS', status: 'FALHA',
          mensagem: error.message,
          payloadResumo: `chapa=${funcionario.chapa}${diagnosticoId ? `; diagnostico_id=${diagnosticoId}` : ''}`
        });
      }
    }

    await connection.commit();
    return { enabled: true, enviados, falhas, erros };
  });
}

async function listEnviosRm({ lojaId, mesRef, lojasPermitidas = [] }) {
  return withConnection(async (connection) => {
    const binds = {};
    const filters = [];
    if (lojaId) {
      binds.lojaId = Number(lojaId);
      filters.push('e.loja = :lojaId');
    } else if (Array.isArray(lojasPermitidas)) {
      const lojas = [...new Set(lojasPermitidas.map(Number).filter(Boolean))];
      if (!lojas.length) return [];
      filters.push(`e.loja in (${lojas.map((loja, index) => {
        binds[`loja${index}`] = loja;
        return `:loja${index}`;
      }).join(', ')})`);
    }
    if (mesRef) {
      binds.mesRef = mesRef;
      filters.push("e.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')");
    }
    const result = await connection.execute(
      `select e.envio_id, e.operacao_id, e.loja, e.mes_ref, e.escsecao_id,
              e.escfunc_id, e.revisao, e.status, e.tentativas, e.erro,
              e.dt_hr_incl, e.dt_hr_alter, f.chapa, f.nome
         from sgn_esc_rm_envio e
         left join sgn_esc_funcionario f on f.escfunc_id = e.escfunc_id
        ${filters.length ? `where ${filters.join(' and ')}` : ''}
        order by e.dt_hr_incl desc, e.envio_id desc`,
      binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
}

async function getEnviosOperacao(operacaoId) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select envio_id, loja, mes_ref, escsecao_id, escfunc_id, revisao, status
         from sgn_esc_rm_envio where operacao_id = :operacaoId order by envio_id`,
      { operacaoId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
}

async function listPendenciasRm({ lojaId = null, limit = 100, incertos = false, falhas = false, erroTipo = null } = {}) {
  const limite = Math.min(500, Math.max(1, Number(limit) || 100));
  return withConnection(async (connection) => {
    const binds = { limite };
    const filtroLoja = lojaId ? 'and e.loja = :lojaId' : '';
    if (lojaId) binds.lojaId = Number(lojaId);
    if (erroTipo && !['CODTABFOLGA', 'TIMEOUT'].includes(erroTipo)) throw new Error('Tipo de erro RM invalido.');
    const filtroErro = erroTipo ? 'and upper(e.erro) like :erroTipo' : '';
    if (erroTipo) binds.erroTipo = `%${erroTipo}%`;
    const result = await connection.execute(
      `select * from (
         select e.envio_id, e.loja, e.mes_ref, e.escsecao_id, e.escfunc_id,
                e.revisao, e.status, e.tentativas, e.erro, f.chapa,
                (select max(p.revisao) from sgn_esc_prog p
                  where p.loja = e.loja and p.mes_ref = e.mes_ref
                    and p.escfunc_id = e.escfunc_id and nvl(p.ativa, 1) = 1) revisao_atual,
                (select max(p.oficializada) from sgn_esc_prog p
                  where p.loja = e.loja and p.mes_ref = e.mes_ref
                    and p.escfunc_id = e.escfunc_id and p.revisao = e.revisao
                    and p.escsecao_id = e.escsecao_id and nvl(p.ativa, 1) = 1) oficializada
           from sgn_esc_rm_envio e
           left join sgn_esc_funcionario f on f.escfunc_id = e.escfunc_id
          where e.status = '${falhas ? 'FALHA' : incertos ? 'INCERTO' : 'PENDENTE'}' ${filtroLoja} ${filtroErro}
          order by e.dt_hr_incl, e.envio_id
       ) where rownum <= :limite`,
      binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
}

async function processarEnvioRm(envio, { manual = false, retry = false } = {}) {
  const envioId = Number(pick(envio, 'ENVIO_ID', 'envio_id'));
  const lojaId = Number(pick(envio, 'LOJA', 'loja'));
  const mesRef = formatDate(pick(envio, 'MES_REF', 'mes_ref'));
  const escfuncId = Number(pick(envio, 'ESCFUNC_ID', 'escfunc_id'));
  const revisao = Number(pick(envio, 'REVISAO', 'revisao'));
  const escsecaoId = Number(pick(envio, 'ESCSECAO_ID', 'escsecao_id'));
  const atual = await withConnection(async (connection) => {
    const result = await connection.execute(
      `select max(p.revisao) revisao_atual,
              max(case when p.revisao = :revisao and p.escsecao_id = :escsecaoId
                        then p.oficializada end) oficializada
         from sgn_esc_prog p
        where p.loja = :lojaId and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and p.escfunc_id = :escfuncId and nvl(p.ativa, 1) = 1`,
      { lojaId, mesRef, escfuncId, revisao, escsecaoId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows?.[0];
  });
  if (Number(pick(atual, 'REVISAO_ATUAL', 'revisao_atual')) !== revisao
    || Number(pick(atual, 'OFICIALIZADA', 'oficializada')) !== 1) {
    const erro = 'Envio nao corresponde a revisao ativa mais recente e oficializada. Oficialize a revisao atual antes de reenviar.';
    if (manual) {
      const error = new Error(erro);
      error.statusCode = 409;
      throw error;
    }
    await withConnection(async (connection) => {
      await connection.execute(
        `update sgn_esc_rm_envio set status = 'SUPERADO', erro = :erro, dt_hr_alter = sysdate
          where envio_id = :envioId and status in ('PENDENTE', 'INCERTO')`,
        { envioId, erro }, { autoCommit: false }
      );
      await connection.commit();
    });
    return { enabled: true, enviados: 0, falhas: 1, status: 'SUPERADO', erros: [erro] };
  }
  const claimed = await withConnection(async (connection) => {
    const statusSql = manual || retry
      ? "(status in ('PENDENTE', 'INCERTO', 'FALHA') or (status = 'PROCESSANDO' and dt_hr_alter < sysdate - 30/1440))"
      : "status = 'PENDENTE'";
    const result = await connection.execute(
      `update sgn_esc_rm_envio
          set status = 'PROCESSANDO', tentativas = tentativas + 1, dt_hr_alter = sysdate
        where envio_id = :envioId and ${statusSql}`,
      { envioId }, { autoCommit: false }
    );
    await connection.commit();
    return result.rowsAffected === 1;
  });
  if (!claimed) return { enabled: true, enviados: 0, falhas: 0, ignorado: true };

  let rm;
  // Apos timeout de escrita, apenas consultar: o RM pode ter aplicado o POST/DELETE.
  let somenteVerificar = isEscritaIncertaRm(pick(envio, 'ERRO', 'erro'));
  for (let tentativa = 0; tentativa < 3; tentativa += 1) {
    try {
      rm = await oficializarNoRm({
        lojaId, mesRef, escsecaoId, escfuncIds: [escfuncId], revisao, exigirEscala: true, somenteVerificar
      });
    } catch (error) {
      rm = { enabled: true, enviados: 0, falhas: 1, erros: [error.message] };
    }
    if (!rm.falhas) break;
    if (/timeout/i.test(rm.erros?.[0] || '') && /em (POST|DELETE)/i.test(rm.erros?.[0] || '')) {
      somenteVerificar = true;
    }
    if (!/RM nao retornou CODTABFOLGA|timeout/i.test(rm.erros?.[0] || '')) break;
  }
  await withConnection(async (connection) => {
    await connection.execute(
      `update sgn_esc_rm_envio
          set status = :status, erro = :erro, dt_hr_alter = sysdate
        where envio_id = :envioId and status = 'PROCESSANDO'`,
      {
        envioId,
        status: rm.falhas && !somenteVerificar && /RM nao retornou CODTABFOLGA/i.test(rm.erros?.[0] || '')
          ? 'FALHA' : rm.falhas ? 'INCERTO' : 'ENVIADO',
        erro: rm.erros?.[0] ? String(rm.erros[0]).slice(0, 1000) : null
      },
      { autoCommit: false }
    );
    await connection.commit();
  });
  return { ...rm, status: rm.falhas && !somenteVerificar && /RM nao retornou CODTABFOLGA/i.test(rm.erros?.[0] || '')
    ? 'FALHA' : rm.falhas ? 'INCERTO' : 'ENVIADO' };
}

async function processarOperacaoRm({ operacaoId }) {
  const envios = await getEnviosOperacao(operacaoId);
  if (!envios.length) throw new Error('Oficializacao sem pendencias RM registradas. Verifique a migracao e a transacao.');
  if (!getEnv().rm.enabled) {
    return { enabled: false, status: 'PENDENTE', pendentes: envios.length, enviados: 0, falhas: 0 };
  }
  const resultado = { enabled: true, status: 'ENVIADO', pendentes: 0, enviados: 0, falhas: 0 };
  for (const envio of envios) {
    const rm = await processarEnvioRm(envio);
    resultado.enviados += rm.enviados || 0;
    resultado.falhas += rm.falhas || 0;
    if (rm.ignorado) resultado.pendentes += 1;
  }
  if (resultado.falhas) resultado.status = 'INCERTO';
  else if (resultado.pendentes) resultado.status = 'PENDENTE';
  return resultado;
}

async function processarPendenciasRm({ lojaId = null, limit = 100, incertos = false, falhas = false, erroTipo = null } = {}) {
  if (!getEnv().rm.enabled) throw new Error('Integracao RM desabilitada. Nenhum envio foi iniciado.');
  const envios = await listPendenciasRm({ lojaId, limit, incertos, falhas, erroTipo });
  const resultados = [];
  for (const envio of envios) {
    const envioId = Number(pick(envio, 'ENVIO_ID', 'envio_id'));
    try {
      const resultado = await processarEnvioRm(envio, { retry: incertos || falhas });
      resultados.push({ envioId, status: resultado.ignorado ? 'IGNORADO' : resultado.status });
    } catch (error) {
      resultados.push({ envioId, status: 'VERIFICAR', erro: error.message });
    }
  }
  return resultados;
}

async function listarGruposRmComErro({ lojaId = null, afterId = 0, maxId = null, limit = 100 } = {}) {
  const binds = { afterId, limite: Math.min(500, Math.max(1, limit)) };
  const filtroLoja = lojaId ? 'and e.loja = :lojaId' : '';
  const filtroMaximo = maxId != null ? 'and e.envio_id <= :maxId' : '';
  if (lojaId) binds.lojaId = lojaId;
  if (maxId != null) binds.maxId = maxId;
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select * from (
         select min(e.envio_id) primeiro_envio_id, e.loja, e.mes_ref, e.escfunc_id,
                count(*) total_erros
           from sgn_esc_rm_envio e
          where e.status in ('INCERTO', 'FALHA')
                ${filtroMaximo} ${filtroLoja}
          group by e.loja, e.mes_ref, e.escfunc_id
         having min(e.envio_id) > :afterId
          order by min(e.envio_id)
       ) where rownum <= :limite`,
      binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
}

async function getMaiorEnvioErroId({ lojaId = null } = {}) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select max(envio_id) maior_id from sgn_esc_rm_envio
        where status in ('INCERTO', 'FALHA') ${lojaId ? 'and loja = :lojaId' : ''}`,
      lojaId ? { lojaId } : {}, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return Number(pick(result.rows?.[0], 'MAIOR_ID', 'maior_id') || 0);
  });
}

async function prepararGrupoRmComErro(grupo) {
  const lojaId = Number(pick(grupo, 'LOJA', 'loja'));
  const mesRef = formatDate(pick(grupo, 'MES_REF', 'mes_ref'));
  const escfuncId = Number(pick(grupo, 'ESCFUNC_ID', 'escfunc_id'));
  return withConnection(async (connection) => {
    const programacoes = await connection.execute(
      `select p.escsecao_id, p.revisao, p.oficializada,
              (select count(*) from sgn_esc_prog_dia d where d.escprog_id = p.escprog_id) dias
         from sgn_esc_prog p
        where p.loja = :lojaId and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and p.escfunc_id = :escfuncId and nvl(p.ativa, 1) = 1
          and p.revisao = (
            select max(px.revisao) from sgn_esc_prog px
             where px.loja = p.loja and px.mes_ref = p.mes_ref
               and px.escfunc_id = p.escfunc_id and nvl(px.ativa, 1) = 1
          )`,
      { lojaId, mesRef, escfuncId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (programacoes.rows?.length !== 1) return { acao: 'BLOQUEADO', motivo: 'Escala atual ausente ou ambigua.' };
    const prog = programacoes.rows[0];
    if (Number(pick(prog, 'OFICIALIZADA', 'oficializada')) !== 1 || Number(pick(prog, 'DIAS', 'dias')) < 1) {
      return { acao: 'BLOQUEADO', motivo: 'Revisao atual nao oficializada ou sem dias.' };
    }
    const revisao = Number(pick(prog, 'REVISAO', 'revisao'));
    const escsecaoId = Number(pick(prog, 'ESCSECAO_ID', 'escsecao_id'));
    const envios = await connection.execute(
      `select envio_id, loja, mes_ref, escsecao_id, escfunc_id, revisao, status, erro
         from sgn_esc_rm_envio
        where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and escfunc_id = :escfuncId and escsecao_id = :escsecaoId and revisao = :revisao`,
      { lojaId, mesRef, escfuncId, escsecaoId, revisao }, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (envios.rows?.length > 1) return { acao: 'BLOQUEADO', motivo: 'Mais de um envio na revisao atual.' };
    const envio = envios.rows?.[0];
    const status = String(pick(envio, 'STATUS', 'status') || '');
    const acao = status === 'ENVIADO' ? 'JA_ENVIADO'
      : !envio ? 'CRIAR_PENDENCIA'
        : ['PENDENTE', 'INCERTO', 'FALHA'].includes(status) ? 'REPROCESSAR' : 'BLOQUEADO';
    return { acao, motivo: acao === 'BLOQUEADO' ? `Status atual ${status} exige revisao individual.` : null,
      modo: isEscritaIncertaRm(pick(envio, 'ERRO', 'erro')) ? 'SOMENTE_VERIFICAR' : 'RECONCILIAR',
      lojaId, mesRef, escfuncId, escsecaoId, revisao, envio };
  });
}

async function reprocessarGrupoRmComErro(grupo, { expectedEnvioId = null, expectedErro = null } = {}) {
  if (!getEnv().rm.enabled) throw new Error('Integracao RM desabilitada.');
  const plano = await prepararGrupoRmComErro(grupo);
  if (expectedEnvioId !== null && (plano.acao !== 'REPROCESSAR'
    || Number(pick(plano.envio, 'ENVIO_ID', 'envio_id')) !== expectedEnvioId
    || String(pick(plano.envio, 'ERRO', 'erro') || '') !== expectedErro)) {
    return { ...plano, acao: 'BLOQUEADO', motivo: 'Envio ou erro atual mudou desde a previa. Nenhum POST executado.' };
  }
  if (plano.acao === 'BLOQUEADO') return plano;
  const { lojaId, mesRef, escfuncId, escsecaoId, revisao } = plano;
  if (plano.acao !== 'JA_ENVIADO') {
    let envio = plano.envio;
    if (!envio) {
      envio = await withConnection(async (connection) => {
        const result = await connection.execute(
          `insert into sgn_esc_rm_envio
             (envio_id, operacao_id, loja, mes_ref, escsecao_id, escfunc_id, revisao,
              status, tentativas, dt_hr_incl, dt_hr_alter)
           values (sgn_esc_rm_envio_seq.nextval, :operacaoId, :lojaId,
              to_date(:mesRef, 'YYYY-MM-DD'), :escsecaoId, :escfuncId, :revisao,
              'PENDENTE', 0, sysdate, sysdate)
           returning envio_id into :envioId`,
          { operacaoId: randomUUID(), lojaId, mesRef, escsecaoId, escfuncId, revisao,
            envioId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER } },
          { autoCommit: false }
        );
        await connection.commit();
        return { ENVIO_ID: result.outBinds.envioId[0], LOJA: lojaId, MES_REF: mesRef,
          ESCSECAO_ID: escsecaoId, ESCFUNC_ID: escfuncId, REVISAO: revisao, STATUS: 'PENDENTE' };
      });
    }
    const resultado = await processarEnvioRm(envio, { retry: true });
    if (resultado.status !== 'ENVIADO') return { ...plano, acao: resultado.status || 'IGNORADO',
      motivo: resultado.erros?.[0] || null };
  }
  await withConnection(async (connection) => {
    await connection.execute(
      `update sgn_esc_rm_envio set status = 'SUPERADO',
              erro = 'Revisao atual reconciliada no RM; envio antigo nao deve ser repetido.',
              dt_hr_alter = sysdate
        where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and escfunc_id = :escfuncId and status in ('INCERTO', 'FALHA')
          and (revisao < :revisao or (revisao = :revisao and escsecao_id <> :escsecaoId))`,
      { lojaId, mesRef, escfuncId, revisao, escsecaoId }, { autoCommit: false }
    );
    await connection.commit();
  });
  return { ...plano, acao: plano.acao === 'JA_ENVIADO' ? 'JA_ENVIADO' : 'ENVIADO' };
}

async function reprocessarEnvioRm({ lojaId, mesRef, revisao, escfuncId, envioId = null }) {
  const envios = await withConnection(async (connection) => {
    const binds = { lojaId, mesRef, escfuncId, revisao };
    const filtroEnvio = envioId ? 'and envio_id = :envioId' : '';
    if (envioId) binds.envioId = envioId;
    const result = await connection.execute(
      `select envio_id, loja, mes_ref, escsecao_id, escfunc_id, revisao, status
         from sgn_esc_rm_envio
        where loja = :lojaId and mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
          and escfunc_id = :escfuncId and revisao = :revisao ${filtroEnvio}`,
      binds, { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    return result.rows || [];
  });
  if (envioId && !envios.length) {
    const error = new Error('Pendencia RM nao encontrada para esta loja e funcionario.');
    error.statusCode = 404;
    throw error;
  }
  if (envios.length > 1) {
    const error = new Error('Ha mais de uma pendencia para este funcionario. Selecione a linha exata do envio.');
    error.statusCode = 409;
    throw error;
  }
  const envio = envios[0];
  if (!envio) {
    const error = new Error('Nao existe pendencia RM para esta revisao. Oficialize a escala antes de reenviar.');
    error.statusCode = 404;
    throw error;
  }
  if (!getEnv().rm.enabled) return { enabled: false, status: 'PENDENTE', enviados: 0, falhas: 0 };
  return processarEnvioRm(envio, { manual: true });
}

async function listRmLogs({ lojaId, mesRef, lojasPermitidas = [] }) {
  return withConnection(async (connection) => {
    try {
      const binds = {};
      const filters = [];
      if (lojaId) { binds.lojaId = lojaId; filters.push('loja = :lojaId'); }
      else if (Array.isArray(lojasPermitidas)) {
        const lojasUnicas = [...new Set(lojasPermitidas.map(Number).filter(Boolean))];
        if (lojasUnicas.length > 0) {
          lojasUnicas.forEach((loja, index) => { binds['loja' + index] = loja; });
          filters.push('loja in (' + lojasUnicas.map((_, index) => ':loja' + index).join(', ') + ')');
        } else {
          filters.push('1 = 0');
        }
      }
      if (mesRef) { binds.mesRef = mesRef; filters.push("mes_ref = to_date(:mesRef, 'YYYY-MM-DD')"); }
      const result = await connection.execute(
        `select escrmlog_id, loja, mes_ref, revisao, escfunc_id, chapa, cpf, acao, status, mensagem, payload_resumo, dt_hr_incl
         from sgn_esc_rm_log
         ${filters.length ? `where ${filters.join(' and ')}` : ''}
         order by dt_hr_incl desc, escrmlog_id desc`,
        binds,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } catch (error) {
      if ([942, 904].includes(error?.errorNum) || error?.code === 'ORA-00942') return [];
      throw error;
    }
  });
}

module.exports = {
  oficializarNoRm,
  processarOperacaoRm,
  listPendenciasRm,
  processarPendenciasRm,
  listarGruposRmComErro,
  getMaiorEnvioErroId,
  prepararGrupoRmComErro,
  reprocessarGrupoRmComErro,
  reprocessarEnvioRm,
  listEnviosRm,
  consultarFolgasFuncionarioMes,
  listRmLogs,
  validarPreRequisitosRm,
  _private: {
    requestRm,
    postFolgas,
    getEscalaParaRm,
    agruparPorFuncionario,
    buildDeleteFolgaPath,
    getFuncionarioRmData,
    getFolgaKey,
    buildFolgaPayload,
    planejarFolgasRm,
    diagnosticarFolgasRm,
    isFolgaRmCompleta,
    assertFolgasRmVerificaveis,
    extrairFolgasConsultadasRm,
    validarFolgasConsultadasRm,
    pick
  }
};
