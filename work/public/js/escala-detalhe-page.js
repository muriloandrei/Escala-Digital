(function () {
  const createEscalaDetalhePage = (ctx) => ({
    carregarIndividual: ctx.carregarDetalheEscalaBanco,
    carregarMensal: ctx.carregarDetalheEscalaMensal,
    renderizarSecaoAtiva: ctx.renderizarSecaoAtivaEscala,
    validar: ctx.validarDetalheBancoAtual,
    salvar: ctx.salvarDetalheBancoAtual,
    editarDia: ctx.editarDiaEscalaPorId
  });

  window.EscalaDetalhePage = { createEscalaDetalhePage };
})();
