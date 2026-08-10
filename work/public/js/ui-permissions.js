(function () {
  const ACTION_FIELD = {
    visualizar: 'PODE_VISUALIZAR',
    listar: 'PODE_VISUALIZAR',
    consultar: 'PODE_VISUALIZAR',
    criar: 'PODE_EDITAR',
    editar: 'PODE_EDITAR',
    salvar: 'PODE_EDITAR',
    oficializar: 'PODE_EDITAR',
    reprocessar: 'PODE_EDITAR',
    excluir: 'PODE_EXCLUIR',
    inativar: 'PODE_EXCLUIR'
  };

  let currentUser = null;
  let permissions = new Map();

  function normalize(value) {
    return String(value || '').trim();
  }

  function setUser(user) {
    currentUser = user || null;
    permissions = new Map();
    (user?.permissoes || []).forEach((permission) => {
      permissions.set(normalize(permission.PAGINA), permission);
    });
    applyDocument();
  }

  function can(page, action = 'visualizar') {
    if (!page) return true;
    if (normalize(currentUser?.perfil).toUpperCase() === 'ADMIN') return true;
    const permission = permissions.get(normalize(page));
    const field = ACTION_FIELD[normalize(action).toLowerCase()] || 'PODE_EDITAR';
    return Number(permission?.[field] || 0) === 1;
  }

  function applyDocument(root = document) {
    root.querySelectorAll('[data-permission-page]').forEach((element) => {
      const allowed = can(element.dataset.permissionPage, element.dataset.permissionAction || 'visualizar');
      element.classList.toggle('hidden', !allowed);
      if ('disabled' in element) element.disabled = !allowed;
      element.setAttribute('aria-hidden', allowed ? 'false' : 'true');
    });

    root.querySelectorAll('.nav-group').forEach((group) => {
      const visibleChildren = group.querySelectorAll('.nav-children a:not(.hidden)').length;
      const parent = group.querySelector('.nav-parent');
      if (parent) parent.classList.toggle('hidden', visibleChildren === 0);
      group.classList.toggle('hidden', visibleChildren === 0);
    });
  }

  function guard(page, action = 'editar', message = 'Usuario sem permissao para esta acao.') {
    return can(page, action) ? '' : `<button type="button" class="action-btn-table" disabled title="${message}"><span class="material-symbols-outlined">lock</span>Sem permissao</button>`;
  }

  window.EscalaPermissions = {
    setUser,
    can,
    applyDocument,
    guard
  };
}());
