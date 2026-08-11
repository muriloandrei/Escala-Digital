(function () {
  const createAccessPage = (ctx) => ({
    carregarAcessos: ctx.carregarAcessosTela,
    renderizarAcessos: ctx.renderizarAcessosTela,
    carregarPerfis: ctx.carregarPerfisAcesso,
    renderizarPerfis: ctx.renderizarRolesSettings,
    abrirPerfil: ctx.abrirModalPerfilAcesso
  });

  window.AccessPage = { createAccessPage };
})();
