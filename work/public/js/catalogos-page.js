(function () {
  const createCatalogosPage = (ctx) => ({
    carregarFuncionarios: ctx.carregarFuncionariosTela,
    carregarSecoes: ctx.carregarSecoesTela,
    prepararFormularioSecao: ctx.prepararFormularioSecao,
    carregarTurnosSecao: ctx.carregarTurnosSecaoTela,
    carregarTiposDescanso: ctx.carregarTiposDescansoTela,
    carregarHorariosPadrao: ctx.carregarHorariosPadraoTela,
    carregarRegras: ctx.carregarRegrasTela
  });

  window.CatalogosPage = { createCatalogosPage };
})();
