const { getEnv } = require('../config/env');
const { withConnection, oracledb } = require('../db/oracle');

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
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

function toArrayResult(body) {
  if (Array.isArray(body)) return body;
  if (!body || typeof body !== 'object') return [];
  for (const key of ['items', 'Itens', 'data', 'Data', 'rows', 'Rows', 'result', 'Result', 'resultado', 'Resultado']) {
    if (Array.isArray(body[key])) return body[key];
  }
  return [body];
}

function formatRmDate(value, options = {}) {
  const date = formatDate(value);
  const time = options.endOfDay ? '23:59:59' : '00:00:00';
  return `${date}T${time}${options.offset || ''}`;
}

function getMonthEnd(value) {
  const inicio = formatDate(value);
  const fimDate = new Date(`${inicio}T00:00:00`);
  fimDate.setMonth(fimDate.getMonth() + 1, 0);
  return formatDate(fimDate);
}

function getFuncionarioRmData(body) {
  const rows = toArrayResult(body);
  return rows.find((row) => pick(row, 'CODTABFOLGA', 'codTabFolga', 'codtabfolga'))
    || rows[0]
    || {};
}

function getCodTabFolga(funcionarioRm) {
  return pick(funcionarioRm, 'CODTABFOLGA', 'codTabFolga', 'codtabfolga', 'CodTabFolga');
}

function getCodColigada(funcionarioRm, fallback) {
  return pick(funcionarioRm, 'CODCOLIGADA', 'codColigada', 'codcoligada', 'CodColigada') || fallback;
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
  const method = options.method || 'GET';
  const logPath = maskRmPath(path);
  let lastError;

  for (let attempt = 0; attempt <= rmConfig.retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), rmConfig.timeoutMs);
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...buildAuthHeader(rmConfig),
          ...(options.headers || {})
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
      return body;
    } catch (error) {
      const detail = describeNetworkError(error, rmConfig.timeoutMs);
      lastError = new Error(`Falha ao chamar RM em ${method} ${logPath}: ${error.message}${detail ? ` (${detail})` : ''}`);
      lastError.cause = error;
      if (attempt >= rmConfig.retries) break;
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
  return toArrayResult(await requestRm(`${rmConfig.folgasPath}?filter=${encodeURIComponent(filter)}`));
}

function getFolgaKey(folga) {
  const data = formatDate(pick(folga, 'DATA', 'data', 'DT', 'dt'));
  const horaInicio = Number(pick(folga, 'HORAINICIO', 'horainicio', 'HORA_INICIO', 'hora_inicio') ?? getEnv().rm.folgaHoraInicio);
  return `${data}|${horaInicio}`;
}

function buildDeleteFolgaPath(folga, defaults) {
  const rmConfig = getEnv().rm;
  const codColigada = pick(folga, 'CODCOLIGADA', 'codColigada', 'codcoligada') || defaults.codColigada;
  const codTabFolga = pick(folga, 'CODTABFOLGA', 'codTabFolga', 'codtabfolga') || defaults.codTabFolga;
  const data = formatRmDate(pick(folga, 'DATA', 'data', 'DT', 'dt'));
  const horaInicio = Number(pick(folga, 'HORAINICIO', 'horainicio', 'HORA_INICIO', 'hora_inicio') ?? rmConfig.folgaHoraInicio);
  const id = `${codColigada}$_$${codTabFolga}$_$${data}$_$${horaInicio}`;
  return `${rmConfig.folgasPath}/${id}`;
}

function buildFolgaPayload({ evento, codColigada, codTabFolga }) {
  const rmConfig = getEnv().rm;
  return {
    CODCOLIGADA: Number(codColigada),
    CODTABFOLGA: String(codTabFolga),
    DATA: formatRmDate(evento.data, { offset: rmConfig.timezoneOffset }),
    HORAINICIO: rmConfig.folgaHoraInicio,
    HORAFIM: rmConfig.folgaHoraFim,
    HORAINICIOSTR: rmConfig.folgaHoraInicioStr,
    HORAFIMSTR: rmConfig.folgaHoraFimStr,
    CONSEXTRAINTER: 0,
    RECCREATEDBY: null,
    RECCREATEDON: null,
    RECMODIFIEDBY: null,
    RECMODIFIEDON: null
  };
}

async function postFolgas(payload) {
  if (!payload.length) return null;
  const rmConfig = getEnv().rm;
  return requestRm(`${rmConfig.folgasPath}?codcoligada=${encodeURIComponent(rmConfig.folgasPostCodcoligada)}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function getEscalaParaRm(connection, { lojaId, mesRef, revisao }) {
  const funcionarioColumns = await getTableColumns(connection, 'SGN_ESC_FUNCIONARIO');
  const progColumns = await getTableColumns(connection, 'SGN_ESC_PROG');
  const cpfSelect = funcionarioColumns.has('CPF') ? 'f.cpf' : funcionarioColumns.has('CPF_FUNCIONARIO') ? 'f.cpf_funcionario as cpf' : 'cast(null as varchar2(20)) as cpf';
  const ativaSql = progColumns.has('ATIVA') ? 'and nvl(p.ativa, 1) = 1' : '';
  const result = await connection.execute(
    `select p.loja, p.mes_ref, p.revisao, p.escfunc_id, p.chapa, f.nome, f.codcoligada, ${cpfSelect},
            d.dt, d.programacao
     from sgn_esc_prog p
     join sgn_esc_prog_dia d on d.escprog_id = p.escprog_id
     join sgn_esc_funcionario f on f.escfunc_id = p.escfunc_id
     where p.loja = :lojaId
       and p.mes_ref = to_date(:mesRef, 'YYYY-MM-DD')
       and p.revisao = :revisao
       ${ativaSql}
       and nvl(d.programacao, 'TRB') <> 'TRB'
     order by p.chapa, d.dt`,
    { lojaId, mesRef, revisao },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  return result.rows;
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
        eventos: []
      });
    }
    map.get(key).eventos.push({
      data: formatDate(pick(row, 'DT', 'dt')),
      programacao: String(pick(row, 'PROGRAMACAO', 'programacao') || '').toUpperCase()
    });
  });
  return [...map.values()];
}

async function oficializarNoRm({ lojaId, mesRef, revisao }) {
  const rmConfig = getEnv().rm;
  return withConnection(async (connection) => {
    const rows = await getEscalaParaRm(connection, { lojaId, mesRef, revisao });
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
    for (const funcionario of agruparPorFuncionario(rows)) {
      try {
        const cpf = sanitizeCpf(funcionario.cpf);
        if (!cpf) {
          throw new Error(`CPF nao cadastrado para o funcionario ${funcionario.chapa}. Atualize SGN_ESC_FUNCIONARIO.CPF antes de oficializar no RM.`);
        }

        const funcionarioRm = await getFuncionarioRmPorCpf(cpf);
        const codColigadaRm = getCodColigada(funcionarioRm, funcionario.codcoligada);
        const codTabFolga = getCodTabFolga(funcionarioRm);
        if (!codTabFolga) {
          throw new Error(`RM nao retornou CODTABFOLGA para o CPF ${mask(cpf)}.`);
        }

        const inicio = formatDate(mesRef);
        const fim = getMonthEnd(mesRef);
        const existentesRows = await getFolgasExistentes({ codTabFolga, inicio, fim });
        const desejadas = new Set(funcionario.eventos.map((evento) => `${evento.data}|${rmConfig.folgaHoraInicio}`));

        for (const folga of existentesRows) {
          if (!desejadas.has(getFolgaKey(folga))) {
            await requestRm(buildDeleteFolgaPath(folga, { codColigada: codColigadaRm, codTabFolga }), { method: 'DELETE' });
          }
        }

        const payloadInclusao = [];
        for (const evento of funcionario.eventos) {
          const alreadyExists = existentesRows.some((folga) => getFolgaKey(folga) === `${evento.data}|${rmConfig.folgaHoraInicio}`);
          if (!alreadyExists) {
            payloadInclusao.push(buildFolgaPayload({ evento, codColigada: codColigadaRm, codTabFolga }));
          }
        }
        await postFolgas(payloadInclusao);

        enviados += funcionario.eventos.length;
        await registrarRmLog(connection, {
          loja: lojaId, mesRef, revisao, escfuncId: funcionario.escfuncId, chapa: funcionario.chapa, cpf: mask(cpf),
          acao: 'RM_ENVIAR_DESCANSOS', status: 'SUCESSO',
          mensagem: `${funcionario.eventos.length} evento(s) sincronizado(s).`,
          payloadResumo: `chapa=${funcionario.chapa}; codtabfolga=${codTabFolga}; incluir=${payloadInclusao.length}; existentes=${existentesRows.length}`
        });
      } catch (error) {
        falhas += 1;
        await registrarRmLog(connection, {
          loja: lojaId, mesRef, revisao, escfuncId: funcionario.escfuncId, chapa: funcionario.chapa, cpf: mask(funcionario.cpf),
          acao: 'RM_ENVIAR_DESCANSOS', status: 'FALHA',
          mensagem: error.message,
          payloadResumo: `chapa=${funcionario.chapa}`
        });
      }
    }

    await connection.commit();
    return { enabled: true, enviados, falhas };
  });
}

async function listRmLogs({ lojaId, mesRef }) {
  return withConnection(async (connection) => {
    try {
      const binds = {};
      const filters = [];
      if (lojaId) { binds.lojaId = lojaId; filters.push('loja = :lojaId'); }
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

module.exports = { oficializarNoRm, listRmLogs };
