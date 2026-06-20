const { withConnection, oracledb } = require('../db/oracle');

const TABLE_NAME = 'SGN_ESC_AUDITORIA';
const SEQUENCE_NAME = 'SGN_ESC_AUDITORIA_SEQ';
const columnsCache = new Map();
let tableAvailability;

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function normalizeDate(value) {
  return String(value || '').slice(0, 10);
}

function compactDetails(details = {}) {
  return Object.entries(details)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')
    .slice(0, 1000);
}

async function tableExists(connection) {
  if (tableAvailability !== undefined) return tableAvailability;
  const result = await connection.execute(
    `select table_name from user_tables where table_name = :tableName`,
    { tableName: TABLE_NAME },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  tableAvailability = result.rows.length > 0;
  return tableAvailability;
}

async function getTableColumns(connection) {
  if (columnsCache.has(TABLE_NAME)) return columnsCache.get(TABLE_NAME);
  const result = await connection.execute(
    `select column_name from user_tab_columns where table_name = :tableName`,
    { tableName: TABLE_NAME },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const columns = new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
  columnsCache.set(TABLE_NAME, columns);
  return columns;
}

function addColumn(insert, columns, names, value, options = {}) {
  const name = names.find((candidate) => columns.has(candidate));
  if (!name) return;
  insert.columns.push(name.toLowerCase());
  if (options.raw) {
    insert.values.push(value);
    return;
  }
  const bindName = name.toLowerCase();
  insert.values.push(`:${bindName}`);
  insert.binds[bindName] = value;
}

async function registerAudit({ action, entity = 'ESCALA', user, lojaId, mesRef, revisao, referenceId, details }) {
  try {
    return await withConnection(async (connection) => {
      if (!(await tableExists(connection))) return { skipped: true, reason: 'missing_table' };
      const columns = await getTableColumns(connection);
      const insert = { columns: [], values: [], binds: {} };

      addColumn(insert, columns, ['ESCAUDITORIA_ID', 'AUDITORIA_ID', 'ID'], `${SEQUENCE_NAME}.nextval`, { raw: true });
      addColumn(insert, columns, ['USUARIO_ID'], user?.sub ? Number(user.sub) : null);
      addColumn(insert, columns, ['LOGIN', 'USUARIO', 'USUARIO_LOGIN'], user?.login || null);
      addColumn(insert, columns, ['NOME_USUARIO'], user?.nome || null);
      addColumn(insert, columns, ['PERFIL'], user?.perfil || null);
      addColumn(insert, columns, ['ACAO', 'TIPO_ACAO'], action);
      addColumn(insert, columns, ['ENTIDADE', 'OBJETO'], entity);
      addColumn(insert, columns, ['REFERENCIA_ID', 'ESCPROG_ID', 'ENTIDADE_ID'], referenceId || null);
      addColumn(insert, columns, ['LOJA'], lojaId ? Number(lojaId) : null);
      if (columns.has('MES_REF')) {
        insert.columns.push('mes_ref');
        insert.values.push(`to_date(:mes_ref, 'YYYY-MM-DD')`);
        insert.binds.mes_ref = normalizeDate(mesRef);
      }
      addColumn(insert, columns, ['REVISAO'], revisao || null);
      addColumn(insert, columns, ['DETALHE', 'DESCRICAO', 'OBSERVACAO'], compactDetails(details));
      addColumn(insert, columns, ['DT_HR_INCL', 'CRIADO_EM', 'DATA_HORA'], 'sysdate', { raw: true });

      if (insert.columns.length === 0) return { skipped: true, reason: 'no_supported_columns' };

      await connection.execute(
        `insert into ${TABLE_NAME.toLowerCase()} (${insert.columns.join(', ')}) values (${insert.values.join(', ')})`,
        insert.binds,
        { autoCommit: true }
      );
      return { skipped: false };
    });
  } catch (error) {
    if (error?.errorNum === 942 || error?.code === 'ORA-00942' || error?.errorNum === 904 || error?.code === 'ORA-00904') {
      console.warn(`Auditoria ignorada: ${error.message}`);
      return { skipped: true, reason: error.code || error.errorNum };
    }
    console.warn(`Falha ao registrar auditoria: ${error.message}`);
    return { skipped: true, reason: 'audit_error' };
  }
}

module.exports = {
  registerAudit
};
