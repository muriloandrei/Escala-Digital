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

function sanitizeCpf(value) {
  return String(value || '').replace(/\D/g, '');
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
  const baseUrl = rmConfig.baseUrl.replace(/\/$/, '');
  const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const method = options.method || 'GET';
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
        const error = new Error(`RM retornou HTTP ${response.status} em ${method} ${path}${detail ? `: ${detail}` : ''}`);
        error.statusCode = response.status;
        error.body = body;
        throw error;
      }
      return body;
    } catch (error) {
      lastError = new Error(`Falha ao chamar RM em ${method} ${path}: ${error.message}`);
      lastError.cause = error;
      if (attempt >= rmConfig.retries) break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError;
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

        const funcionarioRm = await requestRm(`/funcionarios/${encodeURIComponent(cpf)}`);
        const codColigadaRm = pick(funcionarioRm, 'codColigada', 'CODCOLIGADA', 'CodColigada') || funcionario.codcoligada;
        const codTabFolga = pick(funcionarioRm, 'codTabFolga', 'CODTABFOLGA', 'CodTabFolga');
        if (!codTabFolga) {
          throw new Error(`RM nao retornou CODTABFOLGA para o CPF ${mask(cpf)}.`);
        }

        const inicio = formatDate(mesRef);
        const fimDate = new Date(`${inicio}T00:00:00`);
        fimDate.setMonth(fimDate.getMonth() + 1, 0);
        const fim = formatDate(fimDate);
        const existentes = await requestRm(`/folgas?codColigada=${encodeURIComponent(codColigadaRm)}&chapa=${encodeURIComponent(funcionario.chapa)}&inicio=${inicio}&fim=${fim}`);
        const desejadas = new Set(funcionario.eventos.map((evento) => `${evento.data}|${evento.programacao}`));
        const existentesRows = Array.isArray(existentes) ? existentes : existentes?.items || [];

        for (const folga of existentesRows) {
          const key = `${formatDate(folga.data || folga.dt)}|${String(folga.programacao || folga.tipo || 'F').toUpperCase()}`;
          if (!desejadas.has(key) && folga.id) {
            await requestRm(`/folgas/${encodeURIComponent(folga.id)}`, { method: 'DELETE' });
          }
        }

        for (const evento of funcionario.eventos) {
          const alreadyExists = existentesRows.some((folga) => `${formatDate(folga.data || folga.dt)}|${String(folga.programacao || folga.tipo || 'F').toUpperCase()}` === `${evento.data}|${evento.programacao}`);
          if (!alreadyExists) {
            await requestRm('/folgas', {
              method: 'POST',
              body: JSON.stringify({
                cpf,
                chapa: funcionario.chapa,
                codColigada: codColigadaRm,
                codTabFolga,
                data: evento.data,
                tipo: evento.programacao
              })
            });
          }
        }

        enviados += funcionario.eventos.length;
        await registrarRmLog(connection, {
          loja: lojaId, mesRef, revisao, escfuncId: funcionario.escfuncId, chapa: funcionario.chapa, cpf: mask(cpf),
          acao: 'RM_ENVIAR_DESCANSOS', status: 'SUCESSO',
          mensagem: `${funcionario.eventos.length} evento(s) sincronizado(s).`,
          payloadResumo: `chapa=${funcionario.chapa}; eventos=${funcionario.eventos.length}`
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
