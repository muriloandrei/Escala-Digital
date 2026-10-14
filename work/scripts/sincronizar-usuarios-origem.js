const dotenv = require('dotenv');
const oracledb = require('oracledb');
const { loginKey, lojaSugerida, perfilSugerido } = require('./diagnosticar-usuarios-origem');

const TARGET = 'ESCALAINT';
const OPTIONS = { outFormat: oracledb.OUT_FORMAT_OBJECT };

function parseArgs(argv) {
  const apply = argv.includes('--apply');
  const byArg = argv.find((arg) => arg.startsWith('--by='));
  const sourceArg = argv.find((arg) => arg.startsWith('--source='));
  const expected = Number(apply) + Number(Boolean(byArg)) + Number(Boolean(sourceArg));
  const source = sourceArg?.slice(9) || 'SGN_USUARIO';
  if (argv.length !== expected || !/^[A-Za-z][A-Za-z0-9_$#]*$/.test(source)
      || (apply && !/^[A-Za-z0-9._-]{2,60}$/.test(byArg?.slice(5) || ''))
      || (!apply && byArg)) {
    throw new Error('Use [--source=SGN_USUARIO] [--apply --by=OPERADOR]. A execucao padrao e somente previa.');
  }
  return { source: source.toUpperCase(), apply, by: byArg?.slice(5) || null };
}

function isMd5(value) {
  return /^[a-f0-9]{32}$/i.test(String(value || '').trim());
}

function dateMs(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function sourcePasswordAction(source, target) {
  if (!isMd5(source.SENHA)) return 'invalid';
  if (!target) return 'insert';
  const old = String(target.SENHA_HASH || '').trim();
  const current = String(source.SENHA).trim();
  if (isMd5(old) && old.toLowerCase() !== current.toLowerCase()) return 'replace';
  if (isMd5(old)) return 'keep';
  const sourceDate = dateMs(source.DT_HR_ULT_SENHA);
  const baseline = dateMs(target.DT_HR_ULT_SENHA_ORIGEM);
  if (sourceDate !== null && baseline !== null && sourceDate > baseline) return 'replace';
  if (baseline === null && !isMd5(old)) return 'baseline_only';
  return 'keep';
}

function normalized(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function sectionsForLeader(login, loja, sections) {
  const name = normalized(login);
  if (!name.includes('FRENTE') && !name.includes('CAIXA')) return null;
  const selected = sections.filter((row) => Number(row.CODFILIAL) === loja
    && /FRENTE.*CAIXA|SERVIC.*CLIENT|TRANSP|PORTARIA/.test(normalized(row.DESCR)));
  return selected.length ? selected.map((row) => Number(row.ESCSECAO_ID)) : null;
}

function plan(sourceRows, targetRows, stores, sections, links) {
  const sourceCounts = new Map();
  const sourceIds = new Map();
  const targetByLogin = new Map();
  const targetCounts = new Map();
  const targetByOriginId = new Map();
  for (const row of sourceRows) {
    sourceCounts.set(loginKey(row.LOGIN), (sourceCounts.get(loginKey(row.LOGIN)) || 0) + 1);
    sourceIds.set(Number(row.USUARIO_ID), (sourceIds.get(Number(row.USUARIO_ID)) || 0) + 1);
  }
  for (const row of targetRows) {
    const key = loginKey(row.LOGIN);
    targetByLogin.set(key, row);
    targetCounts.set(key, (targetCounts.get(key) || 0) + 1);
    if (row.ORIGEM_USUARIO_ID != null) targetByOriginId.set(Number(row.ORIGEM_USUARIO_ID), row);
  }
  const storeSet = new Set(stores.map((row) => Number(row.LOJA)));
  const linksByUser = new Map();
  for (const row of links) {
    const id = Number(row.USUARIO_ID);
    if (!linksByUser.has(id)) linksByUser.set(id, []);
    linksByUser.get(id).push(Number(row.LOJA));
  }
  return sourceRows.map((source) => {
    const login = loginKey(source.LOGIN);
    const target = targetByLogin.get(login);
    const loja = lojaSugerida(login);
    const perfil = perfilSugerido(login);
    let reason = null;
    const inactive = String(source.STATUS || '').trim().toUpperCase() !== 'A';
    if (!login || sourceCounts.get(login) !== 1 || targetCounts.get(login) > 1 || sourceIds.get(Number(source.USUARIO_ID)) !== 1) reason = 'login_ou_id_duplicado';
    else if (inactive && (!target || Number(target.ORIGEM_USUARIO_ID) !== Number(source.USUARIO_ID))) reason = 'origem_inativa_sem_vinculo';
    else if (inactive && ['ADMIN', 'CONTROLADORIA'].includes(normalized(target.PERFIL))) reason = 'perfil_global_preservado';
    else if (inactive) reason = 'inativar';
    else if (!loja || !storeSet.has(loja)) reason = 'loja_ausente';
    else if (!isMd5(source.SENHA)) reason = 'senha_invalida';
    else if (target && target.ORIGEM_USUARIO_ID != null && Number(target.ORIGEM_USUARIO_ID) !== Number(source.USUARIO_ID)) reason = 'id_origem_divergente';
    else if (targetByOriginId.has(Number(source.USUARIO_ID)) && targetByOriginId.get(Number(source.USUARIO_ID)) !== target) reason = 'id_origem_em_outro_login';
    else if (target && ['ADMIN', 'CONTROLADORIA'].includes(normalized(target.PERFIL))) reason = 'perfil_global_preservado';
    const sectionIds = perfil === 'LIDER' ? sectionsForLeader(login, loja, sections) : [];
    if (!reason && perfil === 'LIDER' && !sectionIds) reason = 'secao_lider_ambigua';
    const password = reason ? 'none' : sourcePasswordAction(source, target);
    return {
      source, target, login, loja, perfil, sectionIds, password, reason,
      oldStores: target ? linksByUser.get(Number(target.USUARIO_ID)) || [] : []
    };
  });
}

async function load(connection, sourceTable) {
  const columns = await connection.execute(
    'select column_name from user_tab_columns where table_name = :tableName',
    { tableName: sourceTable }, OPTIONS
  );
  const sourceColumns = new Set(columns.rows.map((row) => row.COLUMN_NAME));
  for (const required of ['USUARIO_ID', 'LOGIN', 'NOME', 'SENHA', 'DT_HR_ULT_SENHA', 'STATUS']) {
    if (!sourceColumns.has(required)) throw new Error(`Origem ${sourceTable} sem ${required}; nenhuma conta foi alterada.`);
  }
  const targetColumns = await connection.execute(
    `select column_name from all_tab_columns where owner = '${TARGET}' and table_name = 'SGN_ESC_USUARIO'`, {}, OPTIONS
  );
  const targetSet = new Set(targetColumns.rows.map((row) => row.COLUMN_NAME));
  for (const required of ['ORIGEM_USUARIO_ID', 'DT_HR_ULT_SENHA_ORIGEM', 'AUTH_VERSION']) {
    if (!targetSet.has(required)) throw new Error(`Destino sem ${required}; aplique primeiro 20261014_usuario_origem_sync.sql.`);
  }
  const source = await connection.execute(`select usuario_id, login, nome, senha, dt_hr_ult_senha, status from ${sourceTable}`, {}, OPTIONS);
  const target = await connection.execute(`select usuario_id, login, nome, senha_hash, perfil, status, loja_principal, origem_usuario_id, dt_hr_ult_senha_origem from ${TARGET}.sgn_esc_usuario`, {}, OPTIONS);
  const stores = await connection.execute(`select loja from ${TARGET}.sgn_esc_loja`, {}, OPTIONS);
  const sections = await connection.execute(`select escsecao_id, codfilial, descr from ${TARGET}.sgn_esc_secao where status = 'A'`, {}, OPTIONS);
  const links = await connection.execute(`select usuario_id, loja from ${TARGET}.sgn_esc_usuario_loja`, {}, OPTIONS);
  return plan(source.rows, target.rows, stores.rows, sections.rows, links.rows);
}

async function applyPlan(connection, entries) {
  const counts = { inserted: 0, updated: 0, deactivated: 0, passwords: 0, stores: 0, sections: 0 };
  for (const item of entries) {
    if (item.reason === 'inativar') {
      if (String(item.target.STATUS).toUpperCase() === 'A') {
        await connection.execute(
          `update ${TARGET}.sgn_esc_usuario
              set status = 'I', auth_version = auth_version + 1
            where usuario_id = :id and origem_usuario_id = :sourceId and status = 'A'`,
          { id: item.target.USUARIO_ID, sourceId: item.source.USUARIO_ID },
          { autoCommit: false }
        );
        counts.deactivated++;
      }
      continue;
    }
    if (item.reason) continue;
    const source = item.source;
    let id = item.target?.USUARIO_ID;
    const sourceId = Number(source.USUARIO_ID);
    if (!item.target) {
      const result = await connection.execute(
        `insert into ${TARGET}.sgn_esc_usuario
           (usuario_id, login, nome, senha_hash, perfil, status, loja_principal,
            origem_usuario_id, dt_hr_ult_senha_origem, auth_version, dt_hr_incl)
         values (${TARGET}.sgn_esc_usuario_seq.nextval, :login, :nome, :hash, :perfil, 'A', :loja,
                 :sourceId, :sourceDate, 0, sysdate)
         returning usuario_id into :id`,
        { login: item.login, nome: source.NOME, hash: String(source.SENHA).toLowerCase(), perfil: item.perfil,
          loja: item.loja, sourceId, sourceDate: source.DT_HR_ULT_SENHA,
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
        { autoCommit: false }
      );
      id = result.outBinds.id[0];
      counts.inserted++;
    } else {
      const changePassword = item.password === 'replace';
      await connection.execute(
        `update ${TARGET}.sgn_esc_usuario
            set nome = :nome, perfil = :perfil, loja_principal = :loja,
                origem_usuario_id = :sourceId,
                dt_hr_ult_senha_origem = :sourceDate,
                senha_hash = case when :changePassword = 1 then :hash else senha_hash end,
                auth_version = auth_version + :changePassword
          where usuario_id = :id`,
        { id, nome: source.NOME, perfil: item.perfil, loja: item.loja, sourceId,
          sourceDate: source.DT_HR_ULT_SENHA, changePassword: Number(changePassword),
          hash: String(source.SENHA).toLowerCase() },
        { autoCommit: false }
      );
      counts.updated++;
      if (changePassword) counts.passwords++;
    }
    if (item.oldStores.length !== 1 || item.oldStores[0] !== item.loja) {
      await connection.execute(`delete from ${TARGET}.sgn_esc_usuario_loja where usuario_id = :id`, { id }, { autoCommit: false });
      await connection.execute(`insert into ${TARGET}.sgn_esc_usuario_loja (usuario_id, loja) values (:id, :loja)`,
        { id, loja: item.loja }, { autoCommit: false });
      counts.stores++;
    }
    for (const sectionId of item.sectionIds) {
      await connection.execute(
        `merge into ${TARGET}.sgn_esc_usuario_secao dest
         using (select :id usuario_id, :sectionId escsecao_id from dual) src
         on (dest.usuario_id = src.usuario_id and dest.escsecao_id = src.escsecao_id)
         when matched then update set dest.status = 'A' where dest.status <> 'A'
         when not matched then insert (usuario_id, escsecao_id, status, dt_hr_incl)
           values (src.usuario_id, src.escsecao_id, 'A', sysdate)`,
        { id, sectionId }, { autoCommit: false }
      );
      counts.sections++;
    }
  }
  return counts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  dotenv.config(process.env.ESCALA_ENV_FILE ? { path: process.env.ESCALA_ENV_FILE } : undefined);
  const missing = ['ORACLE_USER', 'ORACLE_PASSWORD', 'ORACLE_CONNECT_STRING'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Configure a conexao do schema de origem: ${missing.join(', ')}.`);
  const connection = await oracledb.getConnection({
    user: process.env.ORACLE_USER, password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING
  });
  try {
    const entries = await load(connection, args.source);
    const skipped = entries.filter((item) => item.reason && item.reason !== 'inativar');
    console.log(`${args.apply ? 'APLICACAO' : 'PREVIA'} - ${entries.length} conta(s) de origem; ${skipped.length} ignorada(s).`);
    console.log(JSON.stringify(Object.fromEntries([...new Set(skipped.map((item) => item.reason))]
      .map((reason) => [reason, skipped.filter((item) => item.reason === reason).length]))));
    if (skipped.length) console.table(skipped.slice(0, 50).map((item) => ({ login: item.login, motivo: item.reason })));
    console.log(`Novas: ${entries.filter((item) => !item.reason && !item.target).length}; inativacoes: ${entries.filter((item) => item.reason === 'inativar' && item.target.STATUS === 'A').length}; senhas a substituir: ${entries.filter((item) => item.password === 'replace').length}; bcrypt sem linha de base: ${entries.filter((item) => item.password === 'baseline_only').length}.`);
    if (!args.apply) return;
    try {
      const counts = await applyPlan(connection, entries);
      await connection.commit();
      console.log(`Concluido por ${args.by}: ${JSON.stringify(counts)}`);
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } finally {
    await connection.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Sincronizacao interrompida: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, sourcePasswordAction, sectionsForLeader, plan, load, applyPlan };
