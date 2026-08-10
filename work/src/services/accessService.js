const bcrypt = require('bcryptjs');
const { withConnection, oracledb } = require('../db/oracle');

function pick(row, ...keys) {
  for (const key of keys) {
    if (row?.[key] !== undefined) return row[key];
  }
  return undefined;
}

function normalizeUser(usuario, lojas) {
  return {
    USUARIO_ID: pick(usuario, 'USUARIO_ID', 'usuario_id'),
    LOGIN: pick(usuario, 'LOGIN', 'login'),
    NOME: pick(usuario, 'NOME', 'nome'),
    PERFIL: pick(usuario, 'PERFIL', 'perfil'),
    STATUS: pick(usuario, 'STATUS', 'status'),
    LOJAS: lojas
  };
}

const PERFIL_PAGES = [
  { key: 'escalas', label: 'Escalas Geradas' },
  { key: 'escalas-funcionarios', label: 'Escalas por Funcionario' },
  { key: 'funcionarios', label: 'Funcionarios' },
  { key: 'secoes', label: 'Secoes' },
  { key: 'turnos-secao', label: 'Turnos por Secao' },
  { key: 'historico', label: 'Historico' },
  { key: 'regras', label: 'Regras da Escala' },
  { key: 'tipos-descanso', label: 'Tipos de Descanso' },
  { key: 'horarios-padrao', label: 'Horarios Padrao' },
  { key: 'integracao-rm', label: 'Integracao RM' },
  { key: 'acessos', label: 'Controle de Acesso' },
  { key: 'roles', label: 'Perfil de Acesso' },
  { key: 'configuracoes', label: 'Configuracoes' }
];

const BASE_PERMISSION_FIELDS = ['PODE_VISUALIZAR', 'PODE_EDITAR', 'PODE_EXCLUIR'];
const EXTRA_PERMISSION_FIELDS = ['PODE_CRIAR', 'PODE_OFICIALIZAR', 'PODE_REPROCESSAR', 'PODE_ADMINISTRAR'];
const ALL_PERMISSION_FIELDS = [...BASE_PERMISSION_FIELDS, ...EXTRA_PERMISSION_FIELDS];
const permissionColumnsCache = new Map();

function isMissingObjectError(error) {
  return error?.errorNum === 942 || error?.code === 'ORA-00942';
}

async function getTableColumns(connection, tableName) {
  const key = String(tableName || '').toUpperCase();
  if (permissionColumnsCache.has(key)) return permissionColumnsCache.get(key);
  const result = await connection.execute(
    `select column_name from user_tab_columns where table_name = :tableName`,
    { tableName: key },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  const columns = new Set(result.rows.map((row) => pick(row, 'COLUMN_NAME', 'column_name')));
  permissionColumnsCache.set(key, columns);
  return columns;
}

async function getPermissionColumns(connection) {
  const columns = await getTableColumns(connection, 'SGN_ESC_PERFIL_PERMISSAO');
  return ALL_PERMISSION_FIELDS.filter((field) => columns.has(field));
}

function buildPermissionSelect(permissionColumns) {
  return permissionColumns
    .map((field) => `pp.${field.toLowerCase()}`)
    .join(', ');
}

function normalizePermission(rawPermission = {}, perfilNome = '') {
  const isAdmin = String(perfilNome || '').toUpperCase() === 'ADMIN';
  if (isAdmin) {
    return {
      PAGINA: rawPermission.PAGINA,
      PODE_VISUALIZAR: 1,
      PODE_CRIAR: 1,
      PODE_EDITAR: 1,
      PODE_OFICIALIZAR: 1,
      PODE_REPROCESSAR: 1,
      PODE_EXCLUIR: 1,
      PODE_ADMINISTRAR: 1
    };
  }
  const editar = Number(rawPermission.PODE_EDITAR ?? (isAdmin ? 1 : 0));
  const visualizar = Number(rawPermission.PODE_VISUALIZAR ?? 1);
  const excluir = Number(rawPermission.PODE_EXCLUIR ?? (isAdmin ? 1 : 0));

  return {
    PAGINA: rawPermission.PAGINA,
    PODE_VISUALIZAR: visualizar,
    PODE_CRIAR: Number(rawPermission.PODE_CRIAR ?? editar),
    PODE_EDITAR: editar,
    PODE_OFICIALIZAR: Number(rawPermission.PODE_OFICIALIZAR ?? editar),
    PODE_REPROCESSAR: Number(rawPermission.PODE_REPROCESSAR ?? editar),
    PODE_EXCLUIR: excluir,
    PODE_ADMINISTRAR: Number(rawPermission.PODE_ADMINISTRAR ?? (isAdmin ? 1 : 0))
  };
}

function canSeeUser(requestUser, lojas) {
  if (requestUser?.perfil === 'ADMIN') return true;
  const permitidas = new Set((requestUser?.lojas || []).map(Number));
  return lojas.some((loja) => permitidas.has(Number(loja)));
}

async function listUsuariosAcesso(requestUser) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `select
          u.usuario_id,
          u.login,
          u.nome,
          u.perfil,
          u.status,
          listagg(ul.loja, ', ') within group (order by ul.loja) as lojas
       from sgn_esc_usuario u
       left join sgn_esc_usuario_loja ul on ul.usuario_id = u.usuario_id
       group by u.usuario_id, u.login, u.nome, u.perfil, u.status
       order by u.login`,
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return result.rows.map((row) => {
      const lojas = pick(row, 'LOJAS', 'lojas')
        ? String(pick(row, 'LOJAS', 'lojas')).split(',').map((loja) => Number(loja.trim()))
        : [];
      return normalizeUser(row, lojas);
    }).filter((usuario) => canSeeUser(requestUser, usuario.LOJAS));
  });
}

async function updateUsuarioAcesso(usuarioId, updates) {
  const allowed = ['NOME', 'PERFIL', 'STATUS', 'LOJAS'];
  const data = Object.fromEntries(Object.entries(updates || {}).filter(([field]) => allowed.includes(field)));

  return withConnection(async (connection) => {
    const fields = [];
    const binds = { usuarioId };
    for (const field of ['NOME', 'PERFIL', 'STATUS']) {
      if (data[field] !== undefined) {
        fields.push(`${field.toLowerCase()} = :${field}`);
        binds[field] = data[field];
      }
    }

    if (fields.length > 0) {
      const result = await connection.execute(
        `update sgn_esc_usuario set ${fields.join(', ')} where usuario_id = :usuarioId`,
        binds,
        { autoCommit: false }
      );
      if (result.rowsAffected === 0) {
        await connection.rollback();
        return null;
      }
    }

    if (data.LOJAS !== undefined) {
      await connection.execute('delete from sgn_esc_usuario_loja where usuario_id = :usuarioId', { usuarioId }, { autoCommit: false });
      if (data.LOJAS.length > 0) {
        await connection.executeMany(
          'insert into sgn_esc_usuario_loja (usuario_id, loja) values (:usuarioId, :loja)',
          data.LOJAS.map((loja) => ({ usuarioId, loja })),
          { autoCommit: false }
        );
      }
    }

    await connection.commit();
    const usuarios = await listUsuariosAcesso({ perfil: 'ADMIN' });
    return usuarios.find((usuario) => Number(usuario.USUARIO_ID) === Number(usuarioId)) || null;
  });
}

async function createUsuarioAcesso({ login, nome, password, perfil, status = 'A', lojas = [] }) {
  const senhaHash = await bcrypt.hash(password, 10);

  return withConnection(async (connection) => {
    const result = await connection.execute(
      `insert into sgn_esc_usuario (usuario_id, login, nome, senha_hash, perfil, status, dt_hr_incl)
       values (sgn_esc_usuario_seq.nextval, :login, :nome, :senhaHash, :perfil, :status, sysdate)
       returning usuario_id into :usuarioId`,
      {
        login,
        nome,
        senhaHash,
        perfil,
        status,
        usuarioId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: false }
    );
    const usuarioId = result.outBinds.usuarioId[0];

    if (lojas.length > 0) {
      await connection.executeMany(
        'insert into sgn_esc_usuario_loja (usuario_id, loja) values (:usuarioId, :loja)',
        lojas.map((loja) => ({ usuarioId, loja })),
        { autoCommit: false }
      );
    }

    await connection.commit();
    return { USUARIO_ID: usuarioId, LOGIN: login, NOME: nome, PERFIL: perfil, STATUS: status, LOJAS: lojas };
  });
}

async function listPerfisAcesso() {
  return withConnection(async (connection) => {
    try {
      const permissionColumns = await getPermissionColumns(connection);
      const permissionSelect = buildPermissionSelect(permissionColumns);
      const result = await connection.execute(
        `select p.perfil_id, p.nome, p.descr, p.status, p.dt_hr_incl,
                pp.pagina${permissionSelect ? `, ${permissionSelect}` : ''}
         from sgn_esc_perfil p
         left join sgn_esc_perfil_permissao pp on pp.perfil_id = p.perfil_id
         order by p.nome, pp.pagina`,
        {},
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      const map = new Map();
      result.rows.forEach((row) => {
        const id = pick(row, "PERFIL_ID", "perfil_id");
        if (!map.has(String(id))) {
          map.set(String(id), {
            PERFIL_ID: id,
            NOME: pick(row, "NOME", "nome"),
            DESCR: pick(row, "DESCR", "descr"),
            STATUS: pick(row, "STATUS", "status"),
            DT_HR_INCL: pick(row, "DT_HR_INCL", "dt_hr_incl"),
            PERMISSOES: []
          });
        }
        const pagina = pick(row, "PAGINA", "pagina");
        if (pagina) {
          const permission = {
            PAGINA: pagina,
          };
          permissionColumns.forEach((field) => {
            permission[field] = Number(pick(row, field, field.toLowerCase()) || 0);
          });
          map.get(String(id)).PERMISSOES.push(normalizePermission(permission, pick(row, "NOME", "nome")));
        }
      });
      return { perfis: Array.from(map.values()).map(completarPermissoesPerfil), paginas: PERFIL_PAGES };
    } catch (error) {
      if (!isMissingObjectError(error)) throw error;
      const usuarios = await listUsuariosAcesso({ perfil: "ADMIN" });
      const nomes = [...new Set(usuarios.map((usuario) => usuario.PERFIL || "OPERADOR"))];
      return { perfis: nomes.map((nome, index) => completarPermissoesPerfil({ PERFIL_ID: index + 1, NOME: nome, DESCR: "Perfil legado", STATUS: "A", PERMISSOES: [] })), paginas: PERFIL_PAGES };
    }
  });
}

function completarPermissoesPerfil(perfil) {
  const existentes = new Map((perfil.PERMISSOES || []).map((permissao) => [String(permissao.PAGINA), permissao]));
  const isAdmin = String(perfil.NOME || '').toUpperCase() === 'ADMIN';
  return {
    ...perfil,
    PERMISSOES: PERFIL_PAGES.map((pagina) => {
      const atual = existentes.get(pagina.key);
      if (atual) return normalizePermission(atual, perfil.NOME);
      return normalizePermission({
        PAGINA: pagina.key,
        PODE_VISUALIZAR: 1,
        PODE_EDITAR: isAdmin ? 1 : 0,
        PODE_EXCLUIR: isAdmin ? 1 : 0
      }, perfil.NOME);
    })
  };
}

async function createPerfilAcesso(data) {
  return withConnection(async (connection) => {
    const result = await connection.execute(
      `insert into sgn_esc_perfil (perfil_id, nome, descr, status, dt_hr_incl)
       values (sgn_esc_perfil_seq.nextval, :nome, :descr, :status, sysdate)
       returning perfil_id into :perfilId`,
      { nome: data.NOME, descr: data.DESCR || null, status: data.STATUS || "A", perfilId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } },
      { autoCommit: false }
    );
    const perfilId = result.outBinds.perfilId[0];
    await savePerfilPermissoesInConnection(connection, perfilId, data.PERMISSOES || []);
    await connection.commit();
    return { PERFIL_ID: perfilId, NOME: data.NOME, DESCR: data.DESCR || null, STATUS: data.STATUS || "A" };
  });
}

async function savePerfilPermissoesInConnection(connection, perfilId, permissoes) {
  const permissionColumns = await getPermissionColumns(connection);
  await connection.execute("delete from sgn_esc_perfil_permissao where perfil_id = :perfilId", { perfilId }, { autoCommit: false });
  if (!Array.isArray(permissoes) || permissoes.length === 0) return;
  const insertColumns = ['perfil_id', 'pagina', ...permissionColumns.map((field) => field.toLowerCase()), 'dt_hr_incl'];
  const insertValues = [':perfilId', ':pagina', ...permissionColumns.map((field) => `:${field.toLowerCase()}`), 'sysdate'];
  await connection.executeMany(
    `insert into sgn_esc_perfil_permissao (${insertColumns.join(', ')})
     values (${insertValues.join(', ')})`,
    permissoes.map((permissao) => {
      const normalized = normalizePermission(permissao);
      return {
        perfilId,
        pagina: normalized.PAGINA,
        ...Object.fromEntries(permissionColumns.map((field) => [field.toLowerCase(), normalized[field] ? 1 : 0]))
      };
    }),
    { autoCommit: false }
  );
}

async function updatePerfilAcesso(perfilId, data) {
  return withConnection(async (connection) => {
    const fields = [];
    const binds = { perfilId };
    if (data.NOME !== undefined) { fields.push("nome = :nome"); binds.nome = data.NOME; }
    if (data.DESCR !== undefined) { fields.push("descr = :descr"); binds.descr = data.DESCR || null; }
    if (data.STATUS !== undefined) { fields.push("status = :status"); binds.status = data.STATUS; }
    if (fields.length) {
      const result = await connection.execute(`update sgn_esc_perfil set ${fields.join(", ")} where perfil_id = :perfilId`, binds, { autoCommit: false });
      if (!result.rowsAffected) { await connection.rollback(); return null; }
    }
    if (data.PERMISSOES !== undefined) await savePerfilPermissoesInConnection(connection, perfilId, data.PERMISSOES);
    await connection.commit();
    const { perfis } = await listPerfisAcesso();
    return perfis.find((perfil) => Number(perfil.PERFIL_ID) === Number(perfilId)) || null;
  });
}

async function getPermissaoPerfil(perfilNome, pagina) {
  const normalizedPerfil = String(perfilNome || '').trim().toUpperCase();
  if (normalizedPerfil === 'ADMIN') {
    return normalizePermission({ PAGINA: pagina, PODE_VISUALIZAR: 1, PODE_EDITAR: 1, PODE_EXCLUIR: 1 }, 'ADMIN');
  }

  const { perfis } = await listPerfisAcesso();
  const perfil = perfis.find((item) => String(item.NOME || '').trim().toUpperCase() === normalizedPerfil);
  if (!perfil) {
    return normalizePermission({ PAGINA: pagina, PODE_VISUALIZAR: 1, PODE_EDITAR: 0, PODE_EXCLUIR: 0 });
  }

  return (perfil.PERMISSOES || []).find((permissao) => String(permissao.PAGINA) === String(pagina))
    || normalizePermission({ PAGINA: pagina, PODE_VISUALIZAR: 1, PODE_EDITAR: 0, PODE_EXCLUIR: 0 });
}

async function getPermissoesPerfil(perfilNome) {
  const normalizedPerfil = String(perfilNome || '').trim().toUpperCase();
  if (normalizedPerfil === 'ADMIN') {
    return PERFIL_PAGES.map((pagina) => normalizePermission({
      PAGINA: pagina.key,
      LABEL: pagina.label,
      PODE_VISUALIZAR: 1,
      PODE_EDITAR: 1,
      PODE_EXCLUIR: 1
    }, 'ADMIN'));
  }

  const { perfis } = await listPerfisAcesso();
  const perfil = perfis.find((item) => String(item.NOME || '').trim().toUpperCase() === normalizedPerfil);
  return perfil?.PERMISSOES || PERFIL_PAGES.map((pagina) => normalizePermission({
    PAGINA: pagina.key,
    LABEL: pagina.label,
    PODE_VISUALIZAR: 1,
    PODE_EDITAR: 0,
    PODE_EXCLUIR: 0
  }));
}

module.exports = {
  PERFIL_PAGES,
  listUsuariosAcesso,
  updateUsuarioAcesso,
  createUsuarioAcesso,
  listPerfisAcesso,
  createPerfilAcesso,
  updatePerfilAcesso,
  getPermissaoPerfil,
  getPermissoesPerfil
};
