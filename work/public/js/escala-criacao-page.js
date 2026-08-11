(function () {
  const createEscalaCriacaoPage = (ctx) => ({
    prepararPaineis: ctx.prepararPaineisCriacao,
    iniciarCriacao: ctx.iniciarCriacaoEscalaPagina,
    gerarTimeline: ctx.gerarTimelineCriacaoPagina,
    iniciarRascunho: ctx.iniciarNovaEscalaRascunho,
    renderizarSecoes: ctx.renderizarSecoesCriacao,
    abrirTurnoSecao: ctx.abrirModalTurnoSecaoCriacao,
    salvar: ctx.salvarEscalaCriacao
  });

  window.EscalaCriacaoPage = { createEscalaCriacaoPage };
})();
