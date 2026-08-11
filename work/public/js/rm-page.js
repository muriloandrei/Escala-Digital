(function () {
  const createRmPage = (ctx) => ({
    prepararFiltros: ctx.prepararFiltrosRm,
    aplicarFiltros: ctx.aplicarFiltroRmTela,
    carregarLogs: ctx.carregarRmLogsTela
  });

  window.RmPage = { createRmPage };
})();
