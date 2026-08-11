(function () {
  const createEscalaFuncionarioPage = (ctx) => ({
    prepararFiltros: ctx.prepararFiltrosEscalaFuncionarios,
    carregarLista: ctx.carregarEscalasFuncionarios,
    carregarEdicao: ctx.carregarEscalaFuncionarioEdicao,
    renderizarEdicao: ctx.renderizarEscalaFuncionarioEdicao,
    distribuirFolgas: ctx.distribuirFolgasFuncionario,
    validar: ctx.validarEscalaFuncionarioAtual
  });

  window.EscalaFuncionarioPage = { createEscalaFuncionarioPage };
})();
