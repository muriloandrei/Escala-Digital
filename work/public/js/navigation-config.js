(function () {
  const pageTitles = {
    home: 'Home',
    escalasCriadas: 'Escalas Criadas',
    escalasGeradas: 'Escalas Liberadas',
    funcionarios: 'Funcionarios',
    secoes: 'Secoes',
    subsecoes: 'Subsecoes',
    secaoForm: 'Cadastro de Secao',
    turnosSecao: 'Turnos por Secao',
    turnoSecaoForm: 'Cadastro de Turno',
    escalaBanco: 'Detalhamento da Escala',
    escalasFuncionarios: 'Escalas por Funcionario',
    escalaFuncionarioEdicao: 'Editar Escala do Funcionario',
    historico: 'Historico',
    tiposDescanso: 'Tipos de Descanso',
    regras: 'Regras da Escala',
    horariosPadrao: 'Horarios Padrao',
    integracaoRm: 'Integracao RM',
    acessos: 'Controle de Acesso',
    liberacaoSecoes: 'Liberacao de Secoes',
    roles: 'Perfil de Acesso',
    configuracoes: 'Configuracoes'
  };

  const pageParents = {
    home: 'Escalas',
    escalasCriadas: 'Escalas',
    escalasGeradas: 'Escalas',
    escalaBanco: 'Escalas',
    escalasFuncionarios: 'Escalas',
    escalaFuncionarioEdicao: 'Escalas',
    secoes: 'Escalas',
    secaoForm: 'Escalas',
    turnosSecao: 'Escalas',
    turnoSecaoForm: 'Escalas',
    regras: 'Escalas',
    historico: 'Escalas',
    tiposDescanso: 'Funcionarios',
    funcionarios: 'Funcionarios',
    horariosPadrao: 'Configuracoes',
    subsecoes: 'Escalas',
    integracaoRm: 'Configuracoes',
    acessos: 'Configuracoes',
    liberacaoSecoes: 'Configuracoes',
    roles: 'Configuracoes',
    configuracoes: 'Configuracoes'
  };

  const permissionBindings = [
    ['nav-registros', 'escalas', 'visualizar'],
    ['nav-escalas-funcionarios', 'escalas-funcionarios', 'visualizar'],
    ['nav-secoes', 'secoes', 'visualizar'],
    ['nav-turnos-secao', 'turnos-secao', 'visualizar'],
    ['nav-regras', 'regras', 'visualizar'],
    ['nav-funcionarios', 'funcionarios', 'visualizar'],
    ['nav-acessos', 'acessos', 'visualizar'],
    ['nav-roles', 'roles', 'visualizar'],
    ['nav-horarios-padrao', 'horarios-padrao', 'visualizar'],
    ['nav-integracao-rm', 'integracao-rm', 'visualizar'],
    ['nav-settings', 'configuracoes', 'visualizar'],
    ['nav-liberacao-secoes', 'liberacao-secoes', 'visualizar'],
    ['goToTimelineBtn', 'escalas', 'criar'],
    ['novoTurnoCriacaoBtn', 'turnos-secao', 'criar'],
    ['gerarTimelineCriacaoBtn', 'escalas', 'editar'],
    ['carregarFuncionariosCriacaoBtn', 'escalas', 'editar'],
    ['salvarDetalheBancoBtn', 'escalas', 'editar'],
    ['salvarEscalaFuncionarioBtn', 'escalas-funcionarios', 'editar'],
    ['distribuirFolgasFuncionarioBtn', 'escalas-funcionarios', 'editar'],
    ['novoHorarioPadraoBtn', 'horarios-padrao', 'criar'],
    ['novoTipoDescansoBtn', 'tipos-descanso', 'criar'],
    ['salvarSettingsBtn', 'configuracoes', 'editar']
  ];

  const permissionPageByRoute = {
    '/home': 'escalas',
    '/timeline': 'escalas',
    '/escalas/nova': 'escalas',
    '/escalas-geradas': 'escalas',
    '/criar-escala': 'escalas',
    '/escalas-funcionarios': 'escalas-funcionarios',
    '/escala-funcionario': 'escalas-funcionarios',
    '/funcionarios': 'funcionarios',
    '/secoes': 'secoes',
    '/secao': 'secoes',
    '/turnos-secao': 'turnos-secao',
    '/turno-secao': 'turnos-secao',
    '/regras': 'regras',
    '/historico': 'historico',
    '/tipos-descanso': 'tipos-descanso',
    '/horarios-padrao': 'horarios-padrao',
    '/integracao-rm': 'integracao-rm',
    '/acessos': 'acessos',
    '/liberacao-secoes': 'liberacao-secoes',
    '/roles': 'roles',
    '/configuracoes': 'configuracoes'
  };

  window.EscalaNavigationConfig = {
    pageTitles,
    pageParents,
    permissionBindings,
    permissionPageByRoute
  };
})();
