(function () {
  const createNavigationController = ({ config, hasPermission, showInfoModal, showInputModal }) => {
    const buildPermissionDeniedButton = (page, action = 'editar') => {
      if (hasPermission(page, action)) return '';
      return '<button type="button" class="action-btn-table" disabled title="Usuario sem permissao"><span class="material-symbols-outlined">lock</span>Sem permissao</button>';
    };

    const getDefaultAllowedRoute = () => {
      const entry = [
        ['/home', 'escalas'],
        ['/escalas-geradas', 'escalas'],
        ['/escalas-funcionarios', 'escalas-funcionarios'],
        ['/funcionarios', 'funcionarios'],
        ['/secoes', 'secoes'],
        ['/turnos-secao', 'turnos-secao'],
        ['/regras', 'regras'],
        ['/acessos', 'acessos'],
        ['/configuracoes', 'configuracoes']
      ].find(([, page]) => hasPermission(page, 'visualizar'));
      return entry?.[0] || '/escalas-geradas';
    };

    const checkRoutePermission = (route) => {
      const page = Object.entries(config.permissionPageByRoute)
        .sort((a, b) => b[0].length - a[0].length)
        .find(([prefix]) => route.startsWith(prefix))?.[1];
      if (!page || hasPermission(page, 'visualizar')) return true;
      const fallback = getDefaultAllowedRoute();
      if (route !== fallback) window.location.hash = fallback;
      showInfoModal('Usuario sem permissao para acessar esta pagina.', 'error');
      return false;
    };

    const bindPermissionElements = () => {
      config.permissionBindings.forEach(([id, page, action]) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.dataset.permissionPage = page;
        element.dataset.permissionAction = action;
      });
      window.EscalaPermissions?.applyDocument();
    };

    const setTitle = ({ titleElement, parentElement }, key) => {
      if (titleElement) titleElement.textContent = config.pageTitles[key] || config.pageTitles.home;
      if (parentElement) parentElement.textContent = config.pageParents[key] || config.pageParents.home;
    };

    const confirmDiscardDraft = async (hasDraft) => {
      if (!hasDraft) return true;
      return Boolean(await showInputModal({
        title: 'Descartar rascunho?',
        inputs: [{ type: 'message', text: 'Existe uma escala em rascunho. Se voce sair desta tela antes de salvar, o progresso sera perdido.' }],
        confirmText: 'Sair mesmo assim'
      }));
    };

    return {
      bindPermissionElements,
      buildPermissionDeniedButton,
      checkRoutePermission,
      confirmDiscardDraft,
      getDefaultAllowedRoute,
      setTitle
    };
  };

  window.EscalaNavigation = { createNavigationController };
})();
