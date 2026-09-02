const { withConnection, oracledb } = require('../db/oracle');
const { getEnv } = require('../config/env');
const REQUIRED_TABLES = [
  'SGN_ESC_FUNCIONARIO',
  'SGN_ESC_AUSENCIA',
  'SGN_ESC_LOJA',
  'SGN_ESC_FUNCAO',
  'SGN_ESC_SECAO',
  'SGN_ESC_SECAO_TURNO',
  'SGN_ESC_PROG',
  'SGN_ESC_PROG_DIA',
  'SGN_ESC_USUARIO',
  'SGN_ESC_USUARIO_LOJA',
  'SGN_ESC_AUDITORIA',
  'SGN_ESC_PERFIL',
  'SGN_ESC_PERFIL_PERMISSAO',
  'SGN_ESC_TIPO_DESCANSO',
  'SGN_ESC_HORARIO_PADRAO',
  'SGN_ESC_RM_LOG',
  'SGN_ESC_FIXO_ESCALA'
];

const REQUIRED_SEQUENCES = [
  'SGN_ESC_SECAO_SEQ',
  'SGN_ESC_SECAO_TURNO_SEQ',
  'SGN_ESC_PROG_SEQ',
  'SGN_ESC_PROG_DIA_SEQ',
  'SGN_ESC_USUARIO_SEQ',
  'SGN_ESC_AUDITORIA_SEQ',
  'SGN_ESC_PERFIL_SEQ',
  'SGN_ESC_TIPO_DESCANSO_SEQ',
  'SGN_ESC_HORARIO_PADRAO_SEQ',
  'SGN_ESC_RM_LOG_SEQ',
  'SGN_ESC_FIXO_ESCALA_SEQ'
];

async function checkOracle() {
  return withConnection(async (connection) => {
    const ping = await connection.execute(
      `select sys_context('USERENV', 'CURRENT_SCHEMA') as current_schema from dual`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const tables = await connection.execute(
      `select table_name
       from user_tables
       where table_name in (${REQUIRED_TABLES.map((_, index) => `:table${index}`).join(', ')})`,
      Object.fromEntries(REQUIRED_TABLES.map((table, index) => [`table${index}`, table])),
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const sequences = await connection.execute(
      `select sequence_name
       from user_sequences
       where sequence_name in (${REQUIRED_SEQUENCES.map((_, index) => `:seq${index}`).join(', ')})`,
      Object.fromEntries(REQUIRED_SEQUENCES.map((sequence, index) => [`seq${index}`, sequence])),
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const foundTables = new Set(tables.rows.map((row) => row.TABLE_NAME));
    const foundSequences = new Set(sequences.rows.map((row) => row.SEQUENCE_NAME));
    const missingTables = REQUIRED_TABLES.filter((table) => !foundTables.has(table));
    const missingSequences = REQUIRED_SEQUENCES.filter((sequence) => !foundSequences.has(sequence));

    return {
      driver: 'oracle',
      status: missingTables.length === 0 && missingSequences.length === 0 ? 'ok' : 'warning',
      currentSchema: ping.rows[0]?.CURRENT_SCHEMA || null,
      tables: {
        required: REQUIRED_TABLES,
        missing: missingTables
      },
      sequences: {
        required: REQUIRED_SEQUENCES,
        missing: missingSequences
      }
    };
  });
}

async function checkRm() {
  const env = getEnv();
  const rm = env.rm;
  if (!rm.enabled) {
    return {
      integration: 'rm',
      enabled: false,
      status: 'disabled'
    };
  }

  if (!rm.baseUrl) {
    return {
      integration: 'rm',
      enabled: true,
      status: 'error',
      error: 'RM_API_BASE_URL nao configurada.'
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(rm.timeoutMs || 15000, 15000));
  const startedAt = Date.now();

  try {
    const response = await fetch(rm.baseUrl, {
      method: 'GET',
      signal: controller.signal
    });

    return {
      integration: 'rm',
      enabled: true,
      status: 'reachable',
      baseUrl: maskBaseUrl(rm.baseUrl),
      httpStatus: response.status,
      durationMs: Date.now() - startedAt
    };
  } catch (error) {
    return {
      integration: 'rm',
      enabled: true,
      status: 'unreachable',
      baseUrl: maskBaseUrl(rm.baseUrl),
      error: error.name === 'AbortError' ? 'timeout' : error.message,
      durationMs: Date.now() - startedAt
    };
  } finally {
    clearTimeout(timeout);
  }
}

function maskBaseUrl(value) {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`;
  } catch (error) {
    return String(value || '').replace(/\/\/([^/@]+)@/, '//***@');
  }
}

module.exports = {
  checkOracle,
  checkRm
};
