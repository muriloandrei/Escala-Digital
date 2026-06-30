// --- SELETORES DE PÁGINAS E NAVEGAÇÃO ---
        const timelinePage = document.getElementById('timeline-page');
        const registrosPage = document.getElementById('registros-page');
        const funcionariosPage = document.getElementById('funcionarios-page');
        const escalaCriacaoPage = document.getElementById('escala-criacao-page');
        const secoesPage = document.getElementById('secoes-page');
        const secaoFormPage = document.getElementById('secao-form-page');
        const turnosSecaoPage = document.getElementById('turnos-secao-page');
        const escalaDetalhePage = document.getElementById('escala-detalhe-page');
        const escalasFuncionariosPage = document.getElementById('escalas-funcionarios-page');
        const escalaFuncionarioEdicaoPage = document.getElementById('escala-funcionario-edicao-page');
        const acessosPage = document.getElementById('acessos-page');
        const rolesPage = document.getElementById('roles-page');
        const settingsPage = document.getElementById('settings-page');
        
        const navTimeline = document.getElementById('nav-timeline');
        const navEscalasCriadas = document.getElementById('nav-escalas-criadas');
        const navRegistros = document.getElementById('nav-registros');
        const navEscalasFuncionarios = document.getElementById('nav-escalas-funcionarios');
        const navFuncionarios = document.getElementById('nav-funcionarios');
        const navSecoes = document.getElementById('nav-secoes');
        const navTurnosSecao = document.getElementById('nav-turnos-secao');
        const navAcessos = document.getElementById('nav-acessos');
        const navRoles = document.getElementById('nav-roles');
        const navSettings = document.getElementById('nav-settings');
        
        const salvarSettingsBtn = document.getElementById('salvarSettingsBtn');
        const navLinks = document.querySelectorAll('.sidebar-nav a');
        const goToTimelineBtn = document.getElementById('goToTimelineBtn');
        const voltarEscalasCriacaoBtn = document.getElementById('voltarEscalasCriacaoBtn');
        const criacaoEscalaLoja = document.getElementById('criacaoEscalaLoja');
        const criacaoEscalaMes = document.getElementById('criacaoEscalaMes');
        const criacaoEscalaAno = document.getElementById('criacaoEscalaAno');
        const iniciarCriacaoEscalaBtn = document.getElementById('iniciarCriacaoEscalaBtn');
        const criacaoEscalaStatus = document.getElementById('criacaoEscalaStatus');
        const criacaoSecoesCard = document.getElementById('criacaoSecoesCard');
        const criacaoSecoesLista = document.getElementById('criacaoSecoesLista');
        const gerarTimelineCriacaoBtn = document.getElementById('gerarTimelineCriacaoBtn');
        const criacaoTimelineCard = document.getElementById('criacaoTimelineCard');
        const carregarFuncionariosCriacaoBtn = document.getElementById('carregarFuncionariosCriacaoBtn');
        const imprimirTimelineCriacaoBtn = document.getElementById('imprimirTimelineCriacaoBtn');
        const gerarDetalhadaCriacaoBtn = document.getElementById('gerarDetalhadaCriacaoBtn');
        const consultarBancoBtn = document.getElementById('consultarBancoBtn');
        const sincronizarBancoBtn = document.getElementById('sincronizarBancoBtn');
        const tabelaBancoBody = document.getElementById('tabela-banco-body');
        const bancoResumo = document.getElementById('bancoResumo');
        const escalasPesquisaInput = document.getElementById('escalasPesquisaInput');
        const escalasFiltroLoja = document.getElementById('escalasFiltroLoja');
        const escalasFiltroMes = document.getElementById('escalasFiltroMes');
        const escalasFiltroAno = document.getElementById('escalasFiltroAno');
        const escalasFiltroStatus = document.getElementById('escalasFiltroStatus');
        const funcionariosLojaSelect = document.getElementById('funcionariosLojaSelect');
        const carregarFuncionariosTelaBtn = document.getElementById('carregarFuncionariosTelaBtn');
        const funcionariosTitulo = document.getElementById('funcionariosTitulo');
        const tabelaFuncionariosBody = document.getElementById('tabela-funcionarios-body');
        const funcionariosPesquisaInput = document.getElementById('funcionariosPesquisaInput');
        const funcionariosSecaoFiltro = document.getElementById('funcionariosSecaoFiltro');
        const funcionariosFuncaoFiltro = document.getElementById('funcionariosFuncaoFiltro');
        const secoesLojaSelect = document.getElementById('secoesLojaSelect');
        const novaSecaoBtn = document.getElementById('novaSecaoBtn');
        const carregarSecoesBtn = document.getElementById('carregarSecoesBtn');
        const secoesTitulo = document.getElementById('secoesTitulo');
        const tabelaSecoesBody = document.getElementById('tabela-secoes-body');
        const secoesPesquisaInput = document.getElementById('secoesPesquisaInput');
        const secaoFormTitulo = document.getElementById('secaoFormTitulo');
        const voltarSecoesBtn = document.getElementById('voltarSecoesBtn');
        const secaoForm = document.getElementById('secaoForm');
        const secaoFormId = document.getElementById('secaoFormId');
        const secaoFormLoja = document.getElementById('secaoFormLoja');
        const secaoFormCodigo = document.getElementById('secaoFormCodigo');
        const secaoFormDescr = document.getElementById('secaoFormDescr');
        const turnosSecaoLojaSelect = document.getElementById('turnosSecaoLojaSelect');
        const novoTurnoSecaoBtn = document.getElementById('novoTurnoSecaoBtn');
        const carregarTurnosSecaoBtn = document.getElementById('carregarTurnosSecaoBtn');
        const turnosSecaoTitulo = document.getElementById('turnosSecaoTitulo');
        const tabelaTurnosSecaoBody = document.getElementById('tabela-turnos-secao-body');
        const turnosPesquisaInput = document.getElementById('turnosPesquisaInput');
        const turnosSecaoFiltro = document.getElementById('turnosSecaoFiltro');
        const turnoSecaoForm = document.getElementById('turnoSecaoForm');
        const turnoSecaoFormPage = document.getElementById('turno-secao-form-page');
        const voltarTurnosSecaoBtn = document.getElementById('voltarTurnosSecaoBtn');
        const turnoSecaoFormTitulo = document.getElementById('turnoSecaoFormTitulo');
        const turnoSecaoFormId = document.getElementById('turnoSecaoFormId');
        const turnoSecaoFormSecao = document.getElementById('turnoSecaoFormSecao');
        const turnoSecaoFormQtde = document.getElementById('turnoSecaoFormQtde');
        const turnoSecaoFormHrEnt1 = document.getElementById('turnoSecaoFormHrEnt1');
        const turnoSecaoFormHrSai1 = document.getElementById('turnoSecaoFormHrSai1');
        const turnoSecaoFormHrEnt2 = document.getElementById('turnoSecaoFormHrEnt2');
        const turnoSecaoFormHrSai2 = document.getElementById('turnoSecaoFormHrSai2');
        const detalheMesSelect = document.getElementById('detalheMesSelect');
        const detalheFuncionarioSelect = document.getElementById('detalheFuncionarioSelect');
        const voltarEscalasBtn = document.getElementById('voltarEscalasBtn');
        const escalaDetalheTitulo = document.getElementById('escalaDetalheTitulo');
        const escalaDetalheResumo = document.getElementById('escalaDetalheResumo');
        const tabelaEscalaDetalheBody = document.getElementById('tabela-escala-detalhe-body');
        const escalaSecaoTabs = document.getElementById('escalaSecaoTabs');
        const escalaBancoTimelineContent = document.getElementById('escalaBancoTimelineContent');
        const escalaBancoDetalhadaContent = document.getElementById('escalaBancoDetalhadaContent');
        const escalaSecaoTimelineTitulo = document.getElementById('escalaSecaoTimelineTitulo');
        const escalaSecaoDetalheTitulo = document.getElementById('escalaSecaoDetalheTitulo');
        const imprimirTimelineBancoBtn = document.getElementById('imprimirTimelineBancoBtn');
        const imprimirDetalheBancoBtn = document.getElementById('imprimirDetalheBancoBtn');
        const escalaFuncionarioPesquisa = document.getElementById('escalaFuncionarioPesquisa');
        const escalaFuncionarioLoja = document.getElementById('escalaFuncionarioLoja');
        const escalaFuncionarioMes = document.getElementById('escalaFuncionarioMes');
        const escalaFuncionarioAno = document.getElementById('escalaFuncionarioAno');
        const tabelaEscalaFuncionariosBody = document.getElementById('tabelaEscalaFuncionariosBody');
        const escalaFuncionarioListaResumo = document.getElementById('escalaFuncionarioListaResumo');
        const escalaFuncionarioEdicaoTitulo = document.getElementById('escalaFuncionarioEdicaoTitulo');
        const escalaFuncionarioEdicaoResumo = document.getElementById('escalaFuncionarioEdicaoResumo');
        const escalaFuncionarioDetalhadaContent = document.getElementById('escalaFuncionarioDetalhadaContent');
        const voltarEscalaFuncionariosBtn = document.getElementById('voltarEscalaFuncionariosBtn');
        const distribuirFolgasFuncionarioBtn = document.getElementById('distribuirFolgasFuncionarioBtn');
        const validarEscalaFuncionarioBtn = document.getElementById('validarEscalaFuncionarioBtn');
        const imprimirEscalaFuncionarioBtn = document.getElementById('imprimirEscalaFuncionarioBtn');
        const salvarEscalaFuncionarioBtn = document.getElementById('salvarEscalaFuncionarioBtn');
        const carregarAcessosBtn = document.getElementById('carregarAcessosBtn');
        const tabelaAcessosBody = document.getElementById('tabela-acessos-body');
        let novoUsuarioBtn = null;
        const currentPageTitle = document.getElementById('currentPageTitle');
        const currentPageParent = document.getElementById('currentPageParent');
        const loggedUserName = document.getElementById('loggedUserName');
        const loggedUserStores = document.getElementById('loggedUserStores');
        const loggedUserInitials = document.getElementById('loggedUserInitials');
        const loggedUserRole = document.getElementById('loggedUserRole');
        const logoutAppBtn = document.getElementById('logoutAppBtn');
        const abrirTurnoModalBtn = document.getElementById('abrirTurnoModalBtn');
        const turnoModal = document.getElementById('turnoModal');
        const closeTurnoModalBtn = document.getElementById('closeTurnoModalBtn');
        const homeLojaSelect = document.getElementById('homeLojaSelect');
        const funcionariosLojaCount = document.getElementById('funcionariosLojaCount');
        const turnosCriadosCount = document.getElementById('turnosCriadosCount');
        const turnosRestantesCount = document.getElementById('turnosRestantesCount');

        const pageTitles = {
            home: 'Home',
            escalasCriadas: 'Escalas Criadas',
            escalasGeradas: 'Escalas Geradas',
            funcionarios: 'Funcionarios',
            secoes: 'Secoes',
            secaoForm: 'Cadastro de Secao',
            turnosSecao: 'Turnos por Secao',
            turnoSecaoForm: 'Cadastro de Turno',
            escalaBanco: 'Detalhamento da Escala',
            escalasFuncionarios: 'Escalas por Funcionário',
            escalaFuncionarioEdicao: 'Editar Escala do Funcionário',
            acessos: 'Controle de Acesso',
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
            funcionarios: 'Funcionários',
            acessos: 'Configurações',
            roles: 'Configurações',
            configuracoes: 'Configurações'
        };

        const setCurrentPageTitle = (key) => {
            if (currentPageTitle) currentPageTitle.textContent = pageTitles[key] || pageTitles.home;
            if (currentPageParent) currentPageParent.textContent = pageParents[key] || pageParents.home;
        };

        function hideAllPages() {
            timelinePage.classList.add('hidden');
            registrosPage.classList.add('hidden');
            funcionariosPage.classList.add('hidden');
            escalaCriacaoPage?.classList.add('hidden');
            secoesPage.classList.add('hidden');
            secaoFormPage.classList.add('hidden');
            turnosSecaoPage.classList.add('hidden');
            turnoSecaoFormPage.classList.add('hidden');
            escalaDetalhePage.classList.add('hidden');
            escalasFuncionariosPage?.classList.add('hidden');
            escalaFuncionarioEdicaoPage?.classList.add('hidden');
            acessosPage.classList.add('hidden');
            rolesPage.classList.add('hidden');
            settingsPage.classList.add('hidden');
            navLinks.forEach(link => link.classList.remove('active'));
        }

        function expandActiveNavGroup(activeLink) {
            document.querySelectorAll('.nav-group').forEach(group => group.classList.remove('open'));
            const group = activeLink?.closest('.nav-group');
            if (group) group.classList.add('open');
        }

        function showTimelinePage() {
            hideAllPages();
            timelinePage.classList.remove('hidden');
            navTimeline?.classList.add('active');
            expandActiveNavGroup(navTimeline);
            setCurrentPageTitle('home');
        }

        function setRegistrosMode(mode) {
            const cards = registrosPage.querySelectorAll('.table-card');
            if (cards[0]) cards[0].classList.toggle('hidden', mode === 'geradas');
            if (cards[1]) cards[1].classList.toggle('hidden', mode === 'criadas');
        }

        function showEscalasCriadasPage() {
            hideAllPages();
            registrosPage.classList.remove('hidden');
            navEscalasCriadas.classList.add('active');
            expandActiveNavGroup(navEscalasCriadas);
            setCurrentPageTitle('escalasCriadas');
            setRegistrosMode('criadas');
            renderizarTabelaRegistros();
        }

        function showEscalasGeradasPage() {
            hideAllPages();
            registrosPage.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalasGeradas');
            setRegistrosMode('geradas');
            consultarEscalasBancoLocal().catch(() => {});
        }

        function showEscalasFuncionariosPage() {
            hideAllPages();
            escalasFuncionariosPage?.classList.remove('hidden');
            navEscalasFuncionarios?.classList.add('active');
            expandActiveNavGroup(navEscalasFuncionarios);
            setCurrentPageTitle('escalasFuncionarios');
            prepararFiltrosEscalaFuncionarios();
            carregarEscalasFuncionarios().catch(error => showInfoModal(error.message, 'error'));
        }

        function showEscalaFuncionarioEdicaoPage(escfuncId, lojaId, mesRef) {
            hideAllPages();
            escalaFuncionarioEdicaoPage?.classList.remove('hidden');
            navEscalasFuncionarios?.classList.add('active');
            expandActiveNavGroup(navEscalasFuncionarios);
            setCurrentPageTitle('escalaFuncionarioEdicao');
            carregarEscalaFuncionarioEdicao(escfuncId, lojaId, mesRef).catch(error => showInfoModal(error.message, 'error'));
        }

        function copiarOptionsSelect(origem, destino, selectedValue = '') {
            if (!origem || !destino) return;
            destino.innerHTML = Array.from(origem.options || []).map(option => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.textContent) + '</option>').join('');
            if (selectedValue !== '') destino.value = String(selectedValue);
        }

        function prepararPaginaCriacaoEscala(params = {}) {
            copiarOptionsSelect(lojaEscalaSelect, criacaoEscalaLoja, params.loja || escalasFiltroLoja?.value || lojaEscalaSelect.value);
            copiarOptionsSelect(mesSelect, criacaoEscalaMes, params.mes ?? escalasFiltroMes?.value ?? mesSelect.value);
            copiarOptionsSelect(anoSelect, criacaoEscalaAno, params.ano || escalasFiltroAno?.value || anoSelect.value);
            if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Informe os dados para carregar as secoes e montar a timeline.';
            criacaoSecoesCard?.classList.add('hidden');
            criacaoTimelineCard?.classList.add('hidden');
            if (criacaoSecoesLista) criacaoSecoesLista.innerHTML = '';
            const timeline = document.getElementById('criacaoTimelineContent');
            if (timeline) timeline.innerHTML = '';
        }

        function showEscalaCriacaoPage(params = {}) {
            hideAllPages();
            escalaCriacaoPage?.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalasGeradas');
            prepararPaineisCriacao();

            if (escalaRascunhoAtivo && escalaRascunhoContexto) {
                copiarOptionsSelect(lojaEscalaSelect, criacaoEscalaLoja, escalaRascunhoContexto.loja);
                copiarOptionsSelect(mesSelect, criacaoEscalaMes, String(new Date(escalaRascunhoContexto.mesRef + 'T00:00:00').getMonth()));
                copiarOptionsSelect(anoSelect, criacaoEscalaAno, String(new Date(escalaRascunhoContexto.mesRef + 'T00:00:00').getFullYear()));
                renderizarSecoesCriacao();
                criacaoSecoesCard?.classList.remove('hidden');
                criacaoTimelineCard?.classList.toggle('hidden', dadosEscala.length === 0);
                if (dadosEscala.length > 0) renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Loja ' + escalaRascunhoContexto.loja + ' | ' + formatarMesTabela(escalaRascunhoContexto.mesRef) + ' | rascunho não salvo';
                return;
            }

            prepararPaginaCriacaoEscala(params);
        }

        function showFuncionariosPage() {
            hideAllPages();
            funcionariosPage.classList.remove('hidden');
            navFuncionarios.classList.add('active');
            expandActiveNavGroup(navFuncionarios);
            setCurrentPageTitle('funcionarios');
            carregarFuncionariosTela(false).catch(error => showInfoModal(error.message, 'error'));
        }

        function showSecoesPage() {
            hideAllPages();
            secoesPage.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('secoes');
            carregarSecoesTela(false).catch(error => showInfoModal(error.message, 'error'));
        }

        function showSecaoFormPage(escsecaoId = '') {
            hideAllPages();
            secaoFormPage.classList.remove('hidden');
            navSecoes.classList.add('active');
            expandActiveNavGroup(navSecoes);
            setCurrentPageTitle('secaoForm');
            prepararFormularioSecao(escsecaoId);
        }

        function showTurnosSecaoPage() {
            hideAllPages();
            turnosSecaoPage.classList.remove('hidden');
            navTurnosSecao.classList.add('active');
            expandActiveNavGroup(navTurnosSecao);
            setCurrentPageTitle('turnosSecao');
            carregarTurnosSecaoTela(false).catch(error => showInfoModal(error.message, 'error'));
        }

        async function showTurnoSecaoFormPage(escsecaoturnoId = '') {
            hideAllPages();
            turnoSecaoFormPage.classList.remove('hidden');
            navTurnosSecao.classList.add('active');
            expandActiveNavGroup(navTurnosSecao);
            setCurrentPageTitle('turnoSecaoForm');

            const loja = turnosSecaoLojaSelect?.value && turnosSecaoLojaSelect.value !== 'all' ? turnosSecaoLojaSelect.value : lojaEscalaSelect.value;
            if (loja) {
                if (secoesLojaCache.length === 0 || String(secoesLojaCache[0]?.LOJA || '') !== String(loja)) {
                    await carregarSecoesDaLoja(true);
                }
                if (turnosSecaoCache.length === 0 || String(turnosSecaoCache[0]?.LOJA || '') !== String(loja) || !turnosSecaoCache.some(item => String(item.LOJA) === String(loja))) {
                    await carregarTurnosSecaoDaLoja(true);
                }
            }

            if (!escsecaoturnoId || escsecaoturnoId === 'novo') {
                turnoSecaoFormTitulo.textContent = 'Novo Turno';
                preencherFormularioTurnoSecao(null);
                return;
            }

            const turno = turnosSecaoCache.find(item => Number(item.ESCSECAOTURNO_ID) === Number(escsecaoturnoId));
            if (!turno) {
                showInfoModal('Turno não encontrado para edição.', 'error');
                window.location.hash = '/turnos-secao';
                return;
            }

            turnoSecaoFormTitulo.textContent = 'Editar Turno';
            preencherFormularioTurnoSecao(turno);
        }

        function abrirPaginaDetalheEscala() {
            hideAllPages();
            escalaDetalhePage.classList.remove('hidden');
            navRegistros.classList.add('active');
            expandActiveNavGroup(navRegistros);
            setCurrentPageTitle('escalaBanco');
        }

        function showEscalaDetalhePage(escprogId) {
            abrirPaginaDetalheEscala();
            carregarDetalheEscalaBanco(escprogId).catch(error => showInfoModal(error.message, 'error'));
        }

        function showEscalaDetalheMensalPage(lojaId, mesRef) {
            abrirPaginaDetalheEscala();
            carregarDetalheEscalaMensal(lojaId, mesRef).catch(error => showInfoModal(error.message, 'error'));
        }


        function showHistoricoPage(params = {}) {
            hideAllPages();
            historicoPage?.classList.remove('hidden');
            navHistorico?.classList.add('active');
            expandActiveNavGroup(navHistorico);
            setCurrentPageTitle('historico');
            prepararFiltrosHistorico(params);
            carregarHistoricoTela().catch(error => showInfoModal(error.message, 'error'));
        }

        function showTiposDescansoPage() {
            hideAllPages();
            tiposDescansoPage?.classList.remove('hidden');
            navTiposDescanso?.classList.add('active');
            expandActiveNavGroup(navTiposDescanso);
            setCurrentPageTitle('tiposDescanso');
            carregarTiposDescansoTela().catch(error => showInfoModal(error.message, 'error'));
        }
        function showAcessosPage() {
            hideAllPages();
            acessosPage.classList.remove('hidden');
            navAcessos.classList.add('active');
            expandActiveNavGroup(navAcessos);
            setCurrentPageTitle('acessos');
            carregarAcessosTela(false);
        }

        function showRolesPage() {
            hideAllPages();
            rolesPage.classList.remove('hidden');
            navRoles.classList.add('active');
            expandActiveNavGroup(navRoles);
            setCurrentPageTitle('roles');
            renderizarRolesSettings().catch(error => showInfoModal(error.message, 'error'));
        }

        function showSettingsPage() {
            hideAllPages();
            settingsPage.classList.remove('hidden');
            navSettings.classList.add('active');
            expandActiveNavGroup(navSettings);
            setCurrentPageTitle('configuracoes');
        }

        function navigateToPage(pageKey) {
            if (pageKey.startsWith('escalas/nova/')) {
                const [, , loja, mesRef] = pageKey.split('/');
                const dataRef = mesRef ? new Date(mesRef + 'T00:00:00') : null;
                if (escalaRascunhoAtivo && escalaRascunhoContexto) {
                    showEscalaCriacaoPage({ loja, mes: dataRef ? String(dataRef.getMonth()) : '', ano: dataRef ? String(dataRef.getFullYear()) : '' });
                } else {
                    showEscalasGeradasPage();
                    iniciarNovaEscalaRascunho({ loja, mesRef }).catch(error => showInfoModal(error.message, 'error'));
                }
                return;
            }
            if (pageKey === 'escalas/nova') {
                showEscalasGeradasPage();
                iniciarNovaEscalaRascunho().catch(error => showInfoModal(error.message, 'error'));
                return;
            }
            if (pageKey.startsWith('escala-funcionario/')) {
                const [, escfuncId, lojaId, mesRef] = pageKey.split('/');
                showEscalaFuncionarioEdicaoPage(escfuncId, lojaId, mesRef);
                return;
            }
            if (pageKey.startsWith('historico/')) {
                const [, lojaId, mesRef] = pageKey.split('/');
                showHistoricoPage({ lojaId, mesRef });
                return;
            }
            if (pageKey.startsWith('escala-banco-mensal/')) {
                const [, lojaId, mesRef] = pageKey.split('/');
                showEscalaDetalheMensalPage(lojaId, mesRef);
                return;
            }
            if (pageKey.startsWith('escala-banco/')) {
                showEscalaDetalhePage(pageKey.split('/')[1]);
                return;
            }
            if (pageKey.startsWith('secoes/')) {
                showSecaoFormPage(pageKey.split('/')[1]);
                return;
            }
            if (pageKey.startsWith('turnos-secao/')) {
                showTurnoSecaoFormPage(pageKey.split('/')[1]);
                return;
            }

            const routes = {
                home: showEscalasGeradasPage,
                escalas: showEscalasGeradasPage,
                'escalas-criadas': showEscalasGeradasPage,
                'escalas-geradas': showEscalasGeradasPage,
                'escalas-funcionarios': showEscalasFuncionariosPage,
                funcionarios: showFuncionariosPage,
                secoes: showSecoesPage,
                'turnos-secao': showTurnosSecaoPage,
                acessos: showAcessosPage,
                roles: showRolesPage,
                configuracoes: showSettingsPage
            };

            (routes[pageKey] || routes.home)();
        }

        let hashNavigationLock = false;
        let currentHashRoute = (window.location.hash || '#/home').replace(/^#\/?/, '') || 'home';

        async function handleHashNavigation() {
            const pageKey = (window.location.hash || '#/home').replace(/^#\/?/, '') || 'home';
            if (hashNavigationLock) {
                currentHashRoute = pageKey;
                navigateToPage(pageKey);
                hashNavigationLock = false;
                return;
            }

            if (escalaRascunhoAtivo && !pageKey.startsWith('escalas/nova')) {
                const confirmacao = await showInputModal({
                    title: 'Descartar rascunho?',
                    inputs: [{ type: 'message', text: 'Existe uma escala em rascunho. Se voce sair desta tela antes de salvar, o progresso sera perdido.' }],
                    confirmText: 'Sair mesmo assim'
                });

                if (!confirmacao) {
                    hashNavigationLock = true;
                    window.location.hash = '/' + currentHashRoute;
                    return;
                }

                escalaRascunhoAtivo = false;
                escalaRascunhoContexto = null;
            }

            currentHashRoute = pageKey;
            navigateToPage(pageKey);
        }
        navTimeline?.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navEscalasCriadas?.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navRegistros.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        navEscalasFuncionarios?.addEventListener('click', () => { window.location.hash = '/escalas-funcionarios'; });
        navFuncionarios.addEventListener('click', () => { window.location.hash = '/funcionarios'; });
        navSecoes.addEventListener('click', () => { window.location.hash = '/secoes'; });
        navTurnosSecao.addEventListener('click', () => { window.location.hash = '/turnos-secao'; });
        navAcessos.addEventListener('click', () => { window.location.hash = '/acessos'; });
        navRoles.addEventListener('click', () => { window.location.hash = '/roles'; });
        navSettings.addEventListener('click', () => { window.location.hash = '/configuracoes'; });
        document.querySelectorAll('.nav-parent').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.nav-group')?.classList.toggle('open');
            });
        });
        voltarEscalasBtn?.addEventListener('click', () => { window.location.hash = '/escalas'; });
        voltarEscalasCriacaoBtn?.addEventListener('click', () => { window.location.hash = '/escalas-geradas'; });
        voltarTurnosSecaoBtn?.addEventListener('click', () => { window.location.hash = '/turnos-secao'; });
        window.addEventListener('hashchange', handleHashNavigation);
        salvarSettingsBtn.addEventListener('click', (e) => { e.preventDefault(); salvarConfiguracoes(); });
        goToTimelineBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            iniciarNovaEscalaRascunho().catch(error => showInfoModal(error.message, 'error'));
        });
        iniciarCriacaoEscalaBtn?.addEventListener('click', async (e) => { e.preventDefault(); iniciarCriacaoEscalaPagina().catch(error => showInfoModal(error.message, 'error')); });
        gerarTimelineCriacaoBtn?.addEventListener('click', async (e) => { e.preventDefault(); gerarTimelineCriacaoPagina().catch(error => showInfoModal(error.message, 'error')); });
        carregarFuncionariosCriacaoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await carregarFuncionariosDaLoja(true, escalaRascunhoContexto?.loja || criacaoEscalaLoja?.value || '');
                prepararPaineisCriacao();
                resetSkeletonModalState();
                esqueletoModal.classList.remove('hidden');
                gerarTabelaEsqueleto();
                esqueletoModal.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        imprimirTimelineCriacaoBtn?.addEventListener('click', () => imprimirTimelineMelhorado(dadosEscala, 'Linha do Tempo de Turnos'));
        gerarDetalhadaCriacaoBtn?.addEventListener('click', (e) => { e.preventDefault(); gerarEscalaDetalhadaBtn.click(); });

        consultarBancoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await consultarEscalasBancoLocal();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        sincronizarBancoBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await sincronizarEscalasSalvasComBanco();
                await consultarEscalasBancoLocal();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        // --- LÓGICA DA ESCALA ---
        const formContainer = document.getElementById('form-container');
        const formTitle = document.getElementById('form-title');
        const horaInicioTimelineInput = document.getElementById('horaInicioTimeline');
        const horaFimTimelineInput = document.getElementById('horaFimTimeline');
        const intervaloMarcacaoInput = document.getElementById('intervaloMarcacao');
        const quantidadeInput = document.getElementById('quantidade');
        const secaoTurnoSelect = document.getElementById('secaoTurnoSelect');
        const inicioEscalaInput = document.getElementById('inicioEscala');
        const fimEscalaInput = document.getElementById('fimEscala');
        const inicioIntervaloInput = document.getElementById('inicioIntervalo');
        const fimIntervaloInput = document.getElementById('fimIntervalo');
        const addEscalaBtn = document.getElementById('addEscalaBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const printBtn = document.getElementById('printBtn');
        const abrirModalEscalaBtn = document.getElementById('abrirModalEscalaBtn');
        const esqueletoModal = document.getElementById('esqueletoModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const lojaEscalaSelect = document.getElementById('lojaEscalaSelect');
        const carregarFuncionariosBtn = document.getElementById('carregarFuncionariosBtn');
        const funcionariosStatus = document.getElementById('funcionariosStatus');
        const mesSelect = document.getElementById('mesSelect');
        const anoSelect = document.getElementById('anoSelect');
        const tabelaEsqueletoContainer = document.getElementById('tabela-esqueleto-container');
        const gerarEscalaDetalhadaBtn = document.getElementById('gerarEscalaDetalhadaBtn');
        const editarDistribuicaoBtn = document.getElementById('editarDistribuicaoBtn');
        const autoDistribuirFolgasBtn = document.getElementById('autoDistribuirFolgasBtn');
        const imprimirEsqueletoBtn = document.getElementById('imprimirEsqueletoBtn');
        const detalhadaModal = document.getElementById('detalhadaModal');
        const detalhadaModalBody = document.getElementById('detalhada-modal-body');
        const detalhadaMesAno = document.getElementById('detalhadaMesAno');
        const closeDetalhadaModalBtn = document.getElementById('closeDetalhadaModalBtn');
        const imprimirDetalhadaBtn = document.getElementById('imprimirDetalhadaBtn');
        const validarEscalaBtn = document.getElementById('validarEscalaBtn');
        const regraJornadaTrabalhoInput = document.getElementById('regraJornadaTrabalho');
        const regraMaxHoraExtraInput = document.getElementById('regraMaxHoraExtra');
        const regraMinIntervaloInput = document.getElementById('regraMinIntervalo');
        const regraMaxIntervaloInput = document.getElementById('regraMaxIntervalo');
        const regraMaxJornadaContinuaInput = document.getElementById('regraMaxJornadaContinua');
        const regraDescansoEntreTurnosInput = document.getElementById('regraDescansoEntreTurnos');
        const regraDescansoPosFolgaInput = document.getElementById('regraDescansoPosFolga');
        const regraMaxDiasConsecutivosInput = document.getElementById('regraMaxDiasConsecutivos');
        const infoModal = document.getElementById('infoModal');
        const infoModalHeader = document.getElementById('infoModalHeader');
        const infoModalTitle = document.getElementById('infoModalTitle');
        const infoMessagesList = document.getElementById('infoMessagesList');
        const closeInfoModalBtn = document.getElementById('closeInfoModalBtn');
        const visualizarTimelineBtn = document.getElementById('visualizarTimelineBtn');
        const timelineVisualizerModal = document.getElementById('timelineVisualizerModal');
        const closeTimelineVisualizerBtn = document.getElementById('closeTimelineVisualizerBtn');
        const printTimelineVisualizerBtn = document.getElementById('printTimelineVisualizerBtn');
        const printContainer = document.getElementById('print-container');
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const zoomResetBtn = document.getElementById('zoomResetBtn');
        const timelineZoomInBtn = document.getElementById('timelineZoomInBtn');
        const timelineZoomOutBtn = document.getElementById('timelineZoomOutBtn');
        const timelineZoomResetBtn = document.getElementById('timelineZoomResetBtn');

        const prepararPaineisCriacao = () => {
            if (!escalaCriacaoPage || !esqueletoModal || !detalhadaModal) return;
            if (esqueletoModal.parentElement !== escalaCriacaoPage) escalaCriacaoPage.appendChild(esqueletoModal);
            if (detalhadaModal.parentElement !== escalaCriacaoPage) escalaCriacaoPage.appendChild(detalhadaModal);
            esqueletoModal.classList.add('embedded-scale-panel', 'mt-6');
            detalhadaModal.classList.add('embedded-scale-panel', 'mt-6');
            const skeletonTitle = esqueletoModal.querySelector('#esqueleto-modal-header h3');
            const detailedTitle = detalhadaModal.querySelector('h3');
            if (skeletonTitle) skeletonTitle.textContent = 'Distribuição de Funcionários e Folgas';
            if (detailedTitle) detailedTitle.textContent = 'Escala de Trabalho Detalhada';
        };

        let esqueletoZoomLevel = 1.0;
        let mainTimelineZoomLevel = 1.0;
        let dadosEscala = [];
        let modoEdicao = { ativo: false, index: null };
        let colaboradorShifts = [];
        let escalaCarregadaId = null;
        let escalaCarregadaParaVisualizacao = null;
        let detailedScaleHasBeenGenerated = false;
        let distribuicaoFolgasBloqueada = false;
        let currentLoadedScale = null;
        let funcionariosLojaCache = [];
        let ausenciasLojaCache = [];
        let secoesLojaCache = [];
        let turnosSecaoCache = [];
        let escalaDetalheAtual = { escprogId: null, lojaId: null, mesRef: null, modo: 'individual', dias: [], secaoAtiva: null, secoes: [] };
        let lojasPermitidasCache = [];
        let usuarioSessaoCache = null;
        let usuariosAcessoCache = [];
        let secoesTelaCache = [];
        let turnosTelaCache = [];
        let funcionariosTelaCache = [];
        let escalasFuncionariosCache = [];
        let escalaFuncionarioEdicaoAtual = null;
        const getLojaCodigo = (loja) => loja?.LOJA ?? loja?.loja;
        
        // --- Variáveis para Copiar/Colar e Seleção ---
        let scheduleClipboard = null; 
        let isSelecting = false;
        let selectionRange = { startCell: null, endCell: null, colabContainer: null, cells: [] };

        const { timeToMinutes, minutesToTime, hoursToMinutes } = window.EscalaRulesCore;
        const showInfoModal = (messages, type = 'info') => { infoMessagesList.innerHTML = ''; if (type === 'error') { infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-red-500'; infoModalTitle.textContent = 'Atenção: Erros Encontrados'; } else if (type === 'success') { infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-green-500'; infoModalTitle.textContent = 'Sucesso'; } else { infoModalHeader.className = 'flex justify-between items-center p-4 text-white rounded-t-lg bg-blue-500'; infoModalTitle.textContent = 'Informação'; } if (Array.isArray(messages)) { messages.forEach(msg => { const li = document.createElement('li'); li.textContent = msg; infoMessagesList.appendChild(li); }); } else { const li = document.createElement('li'); li.textContent = messages; infoMessagesList.appendChild(li); } infoModal.classList.remove('hidden'); };
        
        const contarTurnosCriados = (ignorarIndex = null) => dadosEscala.reduce((total, escala, index) => {
            if (index === ignorarIndex) return total;
            return total + (parseInt(escala.quantidade, 10) || 0);
        }, 0);

        const atualizarContadoresHome = () => {
            const funcionariosNaLoja = funcionariosLojaCache.length;
            const turnosCriados = contarTurnosCriados();
            const turnosRestantes = Math.max(funcionariosNaLoja - turnosCriados, 0);

            if (funcionariosLojaCount) funcionariosLojaCount.textContent = funcionariosNaLoja;
            if (turnosCriadosCount) turnosCriadosCount.textContent = turnosCriados;
            if (turnosRestantesCount) turnosRestantesCount.textContent = turnosRestantes;
        };

        const abrirModalTurno = () => {
            if (turnoModal) turnoModal.classList.remove('hidden');
            quantidadeInput.focus();
        };

        const fecharModalTurno = () => {
            if (turnoModal) turnoModal.classList.add('hidden');
        };

        const escapeHtml = (value) => String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        const getSecaoTurnoPadrao = (secao) => (secao?.TURNOS || [])[0] || null;

        const getSecaoLabel = (secao) => {
            const codigo = secao?.COD_SECAO ? `${secao.COD_SECAO} - ` : '';
            return `${codigo}${secao?.DESCR || `Secao ${secao?.ESCSECAO_ID || ''}`}`;
        };

        const popularSelectSecaoFormulario = (selectedId = '') => {
            if (!turnoSecaoFormSecao) return;
            turnoSecaoFormSecao.innerHTML = '<option value="">Selecione uma seção</option>';
            secoesLojaCache.forEach((secao) => {
                const option = document.createElement('option');
                option.value = secao.ESCSECAO_ID || '';
                option.textContent = getSecaoLabel(secao);
                option.dataset.codigo = secao.COD_SECAO || '';
                option.dataset.descr = secao.DESCR || '';
                turnoSecaoFormSecao.appendChild(option);
            });
            turnoSecaoFormSecao.value = selectedId ? String(selectedId) : '';
        };

        const popularSelectSecoesTurno = () => {
            if (!secaoTurnoSelect) return;
            secaoTurnoSelect.innerHTML = '<option value="">Selecione uma secao com turno cadastrado</option>';
            turnosSecaoCache.forEach((turno) => {
                const option = document.createElement('option');
                option.value = turno.ESCSECAO_ID;
                option.textContent = `${turno.COD_SECAO ? `${turno.COD_SECAO} - ` : ''}${turno.DESCR || 'Seção'} | ${turno.HR_ENT1} - ${turno.HR_SAI1} / ${turno.HR_ENT2} - ${turno.HR_SAI2}`;
                option.dataset.turnoId = turno.ESCSECAOTURNO_ID || '';
                option.dataset.secaoDescr = turno.DESCR || '';
                option.dataset.hrEnt1 = turno.HR_ENT1 || '';
                option.dataset.hrSai1 = turno.HR_SAI1 || '';
                option.dataset.hrEnt2 = turno.HR_ENT2 || '';
                option.dataset.hrSai2 = turno.HR_SAI2 || '';
                option.dataset.qtde = turno.QTDE_COLABORADORES || '';
                secaoTurnoSelect.appendChild(option);
            });
        };

        const aplicarSecaoSelecionadaNoFormulario = () => {
            const option = secaoTurnoSelect?.selectedOptions?.[0];
            quantidadeInput.value = option?.dataset.qtde || '';
            inicioEscalaInput.value = option?.dataset.hrEnt1 || '';
            inicioIntervaloInput.value = option?.dataset.hrSai1 || '';
            fimIntervaloInput.value = option?.dataset.hrEnt2 || '';
            fimEscalaInput.value = option?.dataset.hrSai2 || '';
        };

        const getFuncionarioOptionValue = (funcionario) => String(funcionario?.ESCFUNC_ID || funcionario?.CHAPA || '');

        const atualizarOpcoesFuncionariosEsqueleto = () => {
            const selects = Array.from(tabelaEsqueletoContainer.querySelectorAll('.collaborator-select'));
            const selecionados = new Set(selects.map(select => select.value).filter(Boolean));

            selects.forEach(select => {
                Array.from(select.options).forEach(option => {
                    option.disabled = !!option.value && option.value !== select.value && selecionados.has(option.value);
                });
            });
        };

        const getFuncionarioSelecionadoPorLinha = (index) => {
            const row = tabelaEsqueletoContainer.querySelector(`tr[data-colab-index="${index}"]`);
            const escfuncId = row?.dataset.escfuncId;
            const chapa = row?.dataset.chapa;

            return funcionariosLojaCache.find(funcionario =>
                String(funcionario.ESCFUNC_ID || '') === String(escfuncId || '')
                || String(funcionario.CHAPA || '') === String(chapa || '')
            ) || null;
        };

        const limparAusenciasObrigatoriasDoEsqueleto = () => {
            tabelaEsqueletoContainer.querySelectorAll('.escala-cell[data-ausencia-obrigatoria="1"]').forEach(cell => {
                const dia = parseInt(cell.dataset.dia, 10);
                const isSunday = new Date(anoSelect.value, mesSelect.value, dia).getDay() === 0;
                cell.textContent = '';
                delete cell.dataset.ausenciaObrigatoria;
                cell.removeAttribute('title');
                cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold');
                if (isSunday) cell.classList.add('bg-yellow-100');
            });
        };

        const validarTurnoSimples = (turno) => {
            return window.EscalaRulesCore.validarTurnoSimples(turno, {
                minIntervalo: regraMinIntervaloInput.value,
                maxIntervalo: regraMaxIntervaloInput.value,
                maxJornadaContinua: regraMaxJornadaContinuaInput.value
            });
        };

        const hideInfoModal = () => { infoModal.classList.add('hidden'); };
        
        const renderizarTimelineCompleta = (targetElementId = 'timeline-content', customDadosEscala = dadosEscala) => {
            const timelineContent = document.getElementById(targetElementId);
            if (!timelineContent) return;
            timelineContent.style.position = 'relative';

            const intervalo = parseInt(intervaloMarcacaoInput.value) || 30;
            const config = {
                inicioTimeline: timeToMinutes(horaInicioTimelineInput.value),
                fimTimeline: timeToMinutes(horaFimTimelineInput.value),
                intervaloMarcacao: intervalo,
            };
            const duracaoTotalTimeline = config.fimTimeline - config.inicioTimeline;

            if (duracaoTotalTimeline <= 0) {
                timelineContent.innerHTML = '<p class="text-red-500">A hora de fim deve ser maior que a hora de início.</p>';
                return;
            }

            const numMarcacoes = duracaoTotalTimeline / config.intervaloMarcacao;
            const minWidth = Math.max(1200, numMarcacoes * 60);
            timelineContent.style.minWidth = `${minWidth}px`;
            
            // --- Constrói a grade de linhas de intervalo ---
            const breakTimesInMinutes = new Set();
            customDadosEscala.forEach(escala => {
                if (escala.inicioIntervalo) breakTimesInMinutes.add(timeToMinutes(escala.inicioIntervalo));
                if (escala.fimIntervalo) breakTimesInMinutes.add(timeToMinutes(escala.fimIntervalo));
            });

            // O contêiner da grade agora começa em 12rem (w-48) para alinhar com a área das barras
            let gridHtml = '<div style="position: absolute; top: 0; bottom: 0; left: 12rem; right: 0; pointer-events: none; z-index: 1;">';
            breakTimesInMinutes.forEach(min => {
                if (min >= config.inicioTimeline && min <= config.fimTimeline) {
                    // O percentual agora é calculado em relação à área da grade (que já exclui o label)
                    const percentLeft = ((min - config.inicioTimeline) / duracaoTotalTimeline) * 100;
                    gridHtml += `<div class="timeline-grid-line" style="position: absolute; top: 0; bottom: 0; left: ${percentLeft}%;"></div>`;
                }
            });
            gridHtml += '</div>';

            const headerHtml = renderizarCabecalho(config, duracaoTotalTimeline, customDadosEscala);
            const bodyHtml = renderizarCorpo(config, duracaoTotalTimeline, customDadosEscala, targetElementId);
            const summaryHtml = renderizarLinhaDeSoma(config, duracaoTotalTimeline, customDadosEscala);

            timelineContent.innerHTML = gridHtml + headerHtml + bodyHtml + summaryHtml;
        };


        const renderizarCabecalho = (config, duracaoTotalTimeline) => { let markersHtml = ''; for (let min = config.inicioTimeline; min <= config.fimTimeline; min += config.intervaloMarcacao) { const percentLeft = ((min - config.inicioTimeline) / duracaoTotalTimeline) * 100; markersHtml += `<div class="absolute text-xs text-gray-500" style="left: ${percentLeft}%;"><span class="transform -translate-x-1/2 inline-block">${minutesToTime(min)}</span></div>`; } return `<div class="relative z-10 mb-3"><div class="flex items-center h-10"><div class="w-48 flex-shrink-0 pr-4"></div><div class="flex-1 h-full relative border-b-2 border-gray-200">${markersHtml}</div></div></div>`; };
        const renderizarCorpo = (config, duracaoTotalTimeline, customDadosEscala, targetElementId) => { let bodyHtml = '<div>'; if (customDadosEscala.length === 0) { bodyHtml += `<p class="text-center text-gray-500 mt-4">Nenhum turno adicionado.</p>`; } else { customDadosEscala.forEach((escala, index) => { const inicioEscalaMin = timeToMinutes(escala.inicio); const fimEscalaMin = timeToMinutes(escala.fim); const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo); const fimIntervaloMin = timeToMinutes(escala.fimIntervalo); let barsHtml = ''; const createBar = (startMin, endMin, color) => { if (endMin <= startMin) return ''; const duration = endMin - startMin; const leftPercent = ((startMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (leftPercent < 0 || widthPercent <= 0) return ''; return `<div class="absolute h-full ${color} rounded" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>`; }; if (inicioIntervaloMin < fimIntervaloMin && inicioIntervaloMin > inicioEscalaMin && fimIntervaloMin < fimEscalaMin) { barsHtml += createBar(inicioEscalaMin, inicioIntervaloMin, 'bg-green-500'); barsHtml += createBar(inicioIntervaloMin, fimIntervaloMin, 'bg-yellow-500'); barsHtml += createBar(fimIntervaloMin, fimEscalaMin, 'bg-green-500'); } else { barsHtml += createBar(inicioEscalaMin, fimEscalaMin, 'bg-green-500'); } let tempoInfoHtml = `<span class="text-xs text-gray-500 block">${escala.inicio} -<span class="text-gray-400"> ${escala.inicioIntervalo} - ${escala.fimIntervalo}</span> - ${escala.fim}</span>`; let actionsHtml = ''; if (targetElementId === 'timeline-content') { actionsHtml = `<div class="row-actions hidden mt-2 space-x-2"><button class="action-btn edit-btn" data-index="${index}">Editar</button><button class="action-btn delete-btn" data-index="${index}">Excluir</button></div>`; } else if (targetElementId === 'criacaoTimelineContent') { actionsHtml = `<div class="row-actions creation-row-actions mt-2"><button class="action-btn delete-btn" data-index="${index}"><span class="material-symbols-outlined">remove_circle</span>Remover secao</button></div>`; } bodyHtml += `<div class="timeline-row flex items-center py-1 ${targetElementId === 'timeline-content' ? 'cursor-pointer' : ''}"><div class="w-48 flex-shrink-0 pr-4 flex flex-col justify-center"><div><span class="font-bold text-gray-700">${escala.quantidade} Colab.</span><span class="text-xs text-gray-600 block">${escapeHtml(escala.secaoNome || "Sem secao")}</span>${tempoInfoHtml}</div>${actionsHtml}</div><div class="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden" style="z-index: 2;">${barsHtml}</div></div>`; }); } bodyHtml += `</div>`; return bodyHtml; };
        const renderizarLinhaDeSoma = (config, duracaoTotalTimeline, customDadosEscala) => { if (customDadosEscala.length === 0) return ''; const perfilCarga = new Array(duracaoTotalTimeline + 1).fill(0); customDadosEscala.forEach(escala => { const quantidade = parseInt(escala.quantidade); const inicioEscalaMin = timeToMinutes(escala.inicio); const fimEscalaMin = timeToMinutes(escala.fim); const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo); const fimIntervaloMin = timeToMinutes(escala.fimIntervalo); for (let min = inicioEscalaMin; min < fimEscalaMin; min++) { const isBreak = (inicioIntervaloMin < fimIntervaloMin && min >= inicioIntervaloMin && min < fimIntervaloMin); if (!isBreak) { const index = min - config.inicioTimeline; if (index >= 0 && index < perfilCarga.length) perfilCarga[index] += quantidade; } } }); let summaryHtml = ''; let lastCount = -1; let blockStartMin = config.inicioTimeline; for (let i = 0; i <= duracaoTotalTimeline; i++) { const currentCount = perfilCarga[i] || 0; const currentMin = config.inicioTimeline + i; if (currentCount !== lastCount && i > 0) { const duration = currentMin - blockStartMin; const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (widthPercent > 0) { const color = lastCount > 0 ? 'bg-blue-600' : 'bg-transparent'; summaryHtml += `<div class="absolute h-full ${color} flex items-center justify-center" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount > 0 ? lastCount : ''}</span></div>`; } blockStartMin = currentMin; } lastCount = currentCount; } const duration = (config.inicioTimeline + duracaoTotalTimeline) - blockStartMin; const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100; const widthPercent = (duration / duracaoTotalTimeline) * 100; if (widthPercent > 0) { const color = lastCount > 0 ? 'bg-blue-600' : 'bg-transparent'; summaryHtml += `<div class="absolute h-full ${color} flex items-center justify-center" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount > 0 ? lastCount : ''}</span></div>`; } return `<div class="summary-row border-t-2 border-gray-300 mt-4 pt-4"><div class="flex items-center my-2 h-10"><div class="w-48 flex-shrink-0 text-center pr-4"><span class="font-bold text-lg text-gray-700">Total</span><span class="text-xs text-gray-500 block">Ativos</span></div><div class="flex-1 h-full bg-gray-200 rounded relative overflow-hidden" style="z-index: 2;">${summaryHtml}</div></div></div>`; };
        
        const manipularEnvioFormulario = () => { let errors = []; const secaoOption = secaoTurnoSelect?.selectedOptions?.[0]; const novaEscala = { secaoId: secaoTurnoSelect?.value || '', secaoNome: secaoOption?.textContent || '', quantidade: quantidadeInput.value, inicio: inicioEscalaInput.value, fim: fimEscalaInput.value, inicioIntervalo: inicioIntervaloInput.value, fimIntervalo: fimIntervaloInput.value }; if (!novaEscala.secaoId) errors.push("Selecione uma secao com turno cadastrado."); if (!novaEscala.quantidade || !novaEscala.inicio || !novaEscala.fim) errors.push("A secao selecionada precisa ter quantidade, entrada e saida cadastradas."); if (timeToMinutes(novaEscala.fim) <= timeToMinutes(novaEscala.inicio)) errors.push("A saida do turno deve ser maior que a entrada."); const quantidadeNova = parseInt(novaEscala.quantidade, 10) || 0; const totalProjetado = contarTurnosCriados(modoEdicao.ativo ? modoEdicao.index : null) + quantidadeNova; if (funcionariosLojaCache.length > 0 && totalProjetado > funcionariosLojaCache.length) errors.push(`A loja possui ${funcionariosLojaCache.length} funcionario(s) carregado(s). Reduza a quantidade para nao ultrapassar o total disponivel.`); errors = errors.concat(validarTurnoSimples(novaEscala)); if (errors.length > 0) { showInfoModal(errors, 'error'); return; } if(modoEdicao.ativo) { dadosEscala[modoEdicao.index] = novaEscala; } else { dadosEscala.push(novaEscala); } dadosEscala.sort((a, b) => timeToMinutes(a.inicio) - timeToMinutes(b.inicio)); cancelarModoEdicao(); renderizarTimelineCompleta('timeline-content'); atualizarContadoresHome(); fecharModalTurno(); };
        const entrarModoEdicao = (index) => { modoEdicao.ativo = true; modoEdicao.index = index; const escala = dadosEscala[index]; if (secaoTurnoSelect) secaoTurnoSelect.value = escala.secaoId || ''; quantidadeInput.value = escala.quantidade; inicioEscalaInput.value = escala.inicio; fimEscalaInput.value = escala.fim; inicioIntervaloInput.value = escala.inicioIntervalo; fimIntervaloInput.value = escala.fimIntervalo; formTitle.textContent = "Editando Turno"; addEscalaBtn.textContent = "Salvar Alteracoes"; cancelEditBtn.classList.remove('hidden'); abrirModalTurno(); };
        const cancelarModoEdicao = () => { modoEdicao.ativo = false; modoEdicao.index = null; formContainer.reset(); if (secaoTurnoSelect) secaoTurnoSelect.value = ''; aplicarSecaoSelecionadaNoFormulario(); formTitle.textContent = "Adicionar Turno"; addEscalaBtn.textContent = "Adicionar"; cancelEditBtn.classList.add('hidden'); };        const popularSeletoresData = () => { const hoje = new Date(); const anoAtual = hoje.getFullYear(); const mesAtual = hoje.getMonth(); anoSelect.innerHTML = ''; for (let i = anoAtual - 5; i <= anoAtual + 5; i++) { const option = document.createElement('option'); option.value = i; option.textContent = i; if (i === anoAtual) option.selected = true; anoSelect.appendChild(option); } const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']; mesSelect.innerHTML = ''; nomesMeses.forEach((nome, index) => { const option = document.createElement('option'); option.value = index; option.textContent = nome; if (index === mesAtual) option.selected = true; mesSelect.appendChild(option); }); };
        
        const atualizarContagemEsqueleto = () => {
            const skeletonTable = document.getElementById('tabela-esqueleto');
            if (!skeletonTable) return;
            const ano = parseInt(anoSelect.value);
            const mes = parseInt(mesSelect.value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const bodyRows = skeletonTable.querySelectorAll('tbody tr');
            if(bodyRows.length === 0) return;

            bodyRows.forEach(row => {
                const dayCells = row.querySelectorAll('.escala-cell');
                const folgas = Array.from(dayCells).filter(cell => cell.textContent.toUpperCase() === 'F').length;
                const diasTrabalhados = diasNoMes - folgas;
                row.querySelector('.dias-trabalhados-cell').textContent = diasTrabalhados;
                row.querySelector('.folgas-cell').textContent = folgas;
            });

            for (let dia = 1; dia <= diasNoMes; dia++) {
                let folgasNoDia = 0;
                bodyRows.forEach(row => {
                    const cell = row.cells[dia]; 
                    if (cell && cell.textContent.toUpperCase() === 'F') {
                        folgasNoDia++;
                    }
                });
                const trabalhandoNoDia = bodyRows.length - folgasNoDia;

                const folgaCell = skeletonTable.querySelector(`tfoot [data-day-count-folga="${dia}"]`);
                const trabalhandoCell = skeletonTable.querySelector(`tfoot [data-day-count-trabalhando="${dia}"]`);
                if (folgaCell) folgaCell.textContent = folgasNoDia;
                if (trabalhandoCell) trabalhandoCell.textContent = trabalhandoNoDia;
            }

            let grandTotalTrabalhados = 0;
            let grandTotalFolgas = 0;

            skeletonTable.querySelectorAll('tbody .dias-trabalhados-cell').forEach(cell => {
                grandTotalTrabalhados += parseInt(cell.textContent || '0', 10);
            });

            skeletonTable.querySelectorAll('tbody .folgas-cell').forEach(cell => {
                grandTotalFolgas += parseInt(cell.textContent || '0', 10);
            });

            const grandTotalTrabalhadosCell = skeletonTable.querySelector('#grandTotalDiasTrabalhados');
            const grandTotalFolgasCell = skeletonTable.querySelector('#grandTotalFolgas');

            if (grandTotalTrabalhadosCell) {
                grandTotalTrabalhadosCell.textContent = grandTotalTrabalhados;
            }
            if (grandTotalFolgasCell) {
                grandTotalFolgasCell.textContent = grandTotalFolgas;
            }
        };

        const atribuirFuncionariosAosTurnos = () => {
            const usados = new Set();
            return colaboradorShifts.map((escala) => {
                const secaoId = Number(escala.secaoId || 0);
                let index = funcionariosLojaCache.findIndex((funcionario, funcionarioIndex) => {
                    return !usados.has(funcionarioIndex) && Number(funcionario.ESCSECAO_ID || 0) === secaoId;
                });

                if (index < 0) {
                    index = funcionariosLojaCache.findIndex((funcionario, funcionarioIndex) => !usados.has(funcionarioIndex));
                }

                if (index >= 0) {
                    usados.add(index);
                    return funcionariosLojaCache[index];
                }

                return null;
            });
        };

        const gerarTabelaEsqueleto = () => {
            colaboradorShifts = [];
            dadosEscala.forEach(escala => {
                for (let i = 0; i < parseInt(escala.quantidade || 0); i++) {
                    colaboradorShifts.push(JSON.parse(JSON.stringify(escala)));
                }
            });
            if (colaboradorShifts.length === 0) {
                tabelaEsqueletoContainer.innerHTML = `<p class="text-center text-gray-600 p-8">Adicione pelo menos um turno com colaboradores na tela principal para gerar a escala.</p>`;
                return;
            }
            const funcionariosAtribuidos = atribuirFuncionariosAosTurnos();
            const ano = parseInt(anoSelect.value);
            const mes = parseInt(mesSelect.value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const nomesMesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
            let tableHtml = '<table id="tabela-esqueleto" class="w-full table-auto border-collapse"><thead><tr><th class="sticky left-0 bg-gray-100 z-10 w-48">Colaborador</th>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = new Date(ano, mes, dia);
                const diaSemana = data.getDay();
                tableHtml += `<th class="${diaSemana === 0 ? 'bg-yellow-200' : ''}"><div>${dia}-${nomesMesesAbrev[mes]}</div><div>${diasDaSemana[diaSemana]}</div></th>`;
            }
            tableHtml += '<th class="bg-gray-200">Dias Trab.</th><th class="bg-gray-200">Folgas</th></tr></thead><tbody>';
            colaboradorShifts.forEach((escala, index) => {
                const funcionario = funcionariosAtribuidos[index];
                const nomeBase = funcionario ? `${funcionario.NOME} (${funcionario.CHAPA})` : `Colaborador ${index + 1}`;
                const escfuncId = funcionario ? funcionario.ESCFUNC_ID : '';
                const chapa = funcionario ? funcionario.CHAPA : '';
                const escsecaoId = funcionario ? funcionario.ESCSECAO_ID : '';
                const escfuncaoId = funcionario ? funcionario.ESCFUNCAO_ID : '';
                const selectedFuncionarioValue = funcionario ? getFuncionarioOptionValue(funcionario) : '';
                const funcionarioOptions = funcionariosLojaCache.map(item => {
                    const value = getFuncionarioOptionValue(item);
                    const label = `${item.NOME} (${item.CHAPA})`;
                    const selected = value === selectedFuncionarioValue ? 'selected' : '';
                    return `<option value="${escapeHtml(value)}" data-escfunc-id="${escapeHtml(item.ESCFUNC_ID)}" data-chapa="${escapeHtml(item.CHAPA)}" data-escsecao-id="${escapeHtml(item.ESCSECAO_ID || '')}" data-escfuncao-id="${escapeHtml(item.ESCFUNCAO_ID || '')}" data-name="${escapeHtml(label)}" ${selected}>${escapeHtml(label)}</option>`;
                }).join('');
                const horarios = ` ${escala.inicio} - ${escala.inicioIntervalo} - ${escala.fimIntervalo} - ${escala.fim}`;
                tableHtml += `<tr data-colab-index="${index}" data-escfunc-id="${escapeHtml(escfuncId)}" data-chapa="${escapeHtml(chapa)}" data-escsecao-id="${escapeHtml(escsecaoId)}" data-escfuncao-id="${escapeHtml(escfuncaoId)}"><td data-name="${escapeHtml(nomeBase)}" class="sticky left-0 bg-white font-semibold z-10"><select class="collaborator-select" aria-label="Selecionar colaborador"><option value="">Colaborador ${index + 1}</option>${funcionarioOptions}</select><span class="collaborator-name-span hidden">${escapeHtml(nomeBase)}</span><span class="collaborator-time-span text-gray-500">${escapeHtml(horarios)}</span></td>`;
                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const data = new Date(ano, mes, dia);
                    tableHtml += `<td class="escala-cell ${data.getDay() === 0 ? 'bg-yellow-100' : ''}" data-dia="${dia}"></td>`;
                }
                tableHtml += '<td class="dias-trabalhados-cell"></td><td class="folgas-cell"></td></tr>';
            });
            tableHtml += '</tbody><tfoot>';
            let folgaRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Folgas</td>';
            let trabRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Trabalhando</td>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                folgaRow += `<td data-day-count-folga="${dia}">0</td>`;
                trabRow += `<td data-day-count-trabalhando="${dia}">0</td>`;
            }
            folgaRow += '<td></td><td></td></tr>';
            trabRow += '<td></td><td></td></tr>';
            
            let grandTotalRow = '<tr class="bg-gray-500 text-black font-bold"><td class="sticky left-0 bg-gray-500 z-10">TOTAL GERAL</td>';
            grandTotalRow += `<td colspan="${diasNoMes}"></td>`;
            grandTotalRow += '<td id="grandTotalDiasTrabalhados">0</td>';
            grandTotalRow += '<td id="grandTotalFolgas">0</td></tr>';

            tableHtml += folgaRow + trabRow + grandTotalRow + '</tfoot></table>';
            tabelaEsqueletoContainer.innerHTML = tableHtml;
            atualizarOpcoesFuncionariosEsqueleto();
            aplicarAusenciasNoEsqueleto();
            atualizarContagemEsqueleto();
        };
        
        const gerarEscalaDetalhada = () => { escalaCarregadaId = null; const skeletonRows = document.querySelectorAll('#tabela-esqueleto tbody tr'); if (skeletonRows.length === 0) { showInfoModal("Gere o esqueleto da escala primeiro.", "error"); return; } const ano = parseInt(anoSelect.value); const mes = parseInt(mesSelect.value); const diasNoMes = new Date(ano, mes + 1, 0).getDate(); const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']; let allDetailsHtml = ''; skeletonRows.forEach(row => { const colabIndex = parseInt(row.dataset.colabIndex); const escfuncId = row.dataset.escfuncId || ''; const chapa = row.dataset.chapa || ''; const escsecaoId = row.dataset.escsecaoId || ''; const escfuncaoId = row.dataset.escfuncaoId || ''; const colaboradorNome = row.querySelector('td[data-name]').dataset.name; const escala = colaboradorShifts[colabIndex]; if (!escala) return; const folgas = new Set(); row.querySelectorAll('.escala-cell').forEach(cell => { if (cell.textContent.toUpperCase() === 'F') { folgas.add(parseInt(cell.dataset.dia)); } }); const intervaloMin = timeToMinutes(escala.fimIntervalo) - timeToMinutes(escala.inicioIntervalo); const hIntervalo = minutesToTime(intervaloMin); const hTrabalhadasMin = (timeToMinutes(escala.fim) - timeToMinutes(escala.inicio)) - intervaloMin; const hTrabalhadas = minutesToTime(hTrabalhadasMin); let detailTable = `<div class="colaborador-escala-detalhada" data-colab-index="${colabIndex}" data-escfunc-id="${escfuncId}" data-chapa="${chapa}" data-escsecao-id="${escsecaoId}" data-escfuncao-id="${escfuncaoId}"><div class="header-info"><h3 class="font-bold text-lg" contenteditable="true">${colaboradorNome}</h3></div><table class="w-full"><thead><tr class="bg-gray-50"><th>D.SEM</th>${Array.from({length: diasNoMes}, (_, i) => `<th>${diasDaSemana[new Date(ano, mes, i + 1).getDay()]}</th>`).join('')}</tr><tr class="bg-gray-50"><th>DIA</th>${Array.from({length: diasNoMes}, (_, i) => `<th data-day-col="${i + 1}">${i + 1}</th>`).join('')}</tr></thead><tbody>`; const fields = [ { label: 'ENT.', value: escala.inicio, key: 'inicio', editable: true }, { label: 'SAÍ.INT.', value: escala.inicioIntervalo, key: 'inicioIntervalo', editable: true }, { label: 'INTER.', value: hIntervalo, key: 'intervalo', editable: false }, { label: 'RET.INT.', value: escala.fimIntervalo, key: 'fimIntervalo', editable: true }, { label: 'SAÍ.', value: escala.fim, key: 'fim', editable: true }, { label: 'H.TRAB', value: hTrabalhadas, key: 'trabalhadas', bold: true, editable: false }, ]; fields.forEach(field => { detailTable += `<tr class="${field.bold ? 'font-bold bg-gray-50' : ''}" data-key="${field.key}"><td>${field.label}</td>`; for (let dia = 1; dia <= diasNoMes; dia++) { const isDomingo = new Date(ano, mes, dia).getDay() === 0; const isFolga = folgas.has(dia); const cellContent = isFolga ? 'F' : field.value; const isEditable = field.editable && !isFolga; const editableAttribute = isEditable ? 'contenteditable="true"' : ''; let bgColor = ''; if (isFolga) { bgColor = isDomingo ? 'bg-orange-500 text-white' : 'bg-red-100'; } else if (isDomingo) { bgColor = 'bg-yellow-100'; } detailTable += `<td class="${bgColor}" ${editableAttribute}>${cellContent}</td>`; } detailTable += `</tr>`; }); detailTable += `</tbody></table></div>`; allDetailsHtml += detailTable; }); detalhadaModalBody.innerHTML = allDetailsHtml; detalhadaMesAno.textContent = `${mesSelect.options[mesSelect.selectedIndex].text} / ${ano}`; if (detalhadaModal.classList.contains('hidden')) { detalhadaModal.classList.remove('hidden'); } detailedScaleHasBeenGenerated = true; gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada'; };
        
        // =========================================================================
        // FUNÇÃO DE IMPRESSÃO DA TIMELINE (VERSÃO CORRIGIDA E MELHORADA)
        // =========================================================================
        const imprimirTimelineMelhorado = (dataSource = dadosEscala, title = 'Relatório de Linha do Tempo') => {
            const printContent = document.getElementById('print-container');
            if (!printContent) return;

            const config = {
                inicioTimeline: timeToMinutes(horaInicioTimelineInput.value),
                fimTimeline: timeToMinutes(horaFimTimelineInput.value),
                intervaloMarcacao: parseInt(intervaloMarcacaoInput.value) || 30,
            };
            const duracaoTotalTimeline = config.fimTimeline - config.inicioTimeline;

            if (duracaoTotalTimeline <= 0 || dataSource.length === 0) {
                showInfoModal('Não há dados suficientes na timeline para gerar um relatório.', 'info');
                return;
            }
            
            // --- 1. Calcular o número de colunas de tempo para o colspan ---
            const numMarcacoes = Math.floor(duracaoTotalTimeline / config.intervaloMarcacao) + 1;

            // --- 2. Construir Cabeçalho (Régua de Horários com células individuais) ---
            let headerHtml = '<tr><th class="col-info">Turno</th>';
            // Criamos uma célula para cada marcador de tempo
            for (let min = config.inicioTimeline; min <= config.fimTimeline; min += config.intervaloMarcacao) {
                headerHtml += `<th>${minutesToTime(min)}</th>`;
            }
            headerHtml += '</tr>';

            // --- 3. Construir Corpo (Linhas dos Turnos usando colspan) ---
            let bodyHtml = '';
            dataSource.forEach(escala => {
                const inicioEscalaMin = timeToMinutes(escala.inicio);
                const fimEscalaMin = timeToMinutes(escala.fim);
                const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo);
                const fimIntervaloMin = timeToMinutes(escala.fimIntervalo);

                let barsHtml = '';
                const createBar = (startMin, endMin, colorClass) => {
                    if (endMin <= startMin) return '';
                    const leftPercent = ((startMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
                    const widthPercent = ((endMin - startMin) / duracaoTotalTimeline) * 100;
                    return `<div class="timeline-bar ${colorClass}" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>`;
                };

                if (inicioIntervaloMin < fimIntervaloMin && inicioIntervaloMin > inicioEscalaMin && fimIntervaloMin < fimEscalaMin) {
                    barsHtml += createBar(inicioEscalaMin, inicioIntervaloMin, 'bg-green-500');
                    barsHtml += createBar(inicioIntervaloMin, fimIntervaloMin, 'bg-yellow-500');
                    barsHtml += createBar(fimIntervaloMin, fimEscalaMin, 'bg-green-500');
                } else {
                    barsHtml += createBar(inicioEscalaMin, fimEscalaMin, 'bg-green-500');
                }

                const infoTurno = `
                    <div class="font-bold">${escala.quantidade} Colaborador(es)</div>
                    <div class="text-xs text-gray-600">${escala.inicio} às ${escala.fim}</div>
                    <div class="text-xs text-gray-500">Intervalo: ${escala.inicioIntervalo} - ${escala.fimIntervalo}</div>
                `;
                // A célula da timeline agora usa colspan para se alinhar com o novo cabeçalho
                bodyHtml += `<tr><td class="col-info">${infoTurno}</td><td class="col-timeline" colspan="${numMarcacoes}"><div class="timeline-bar-container">${barsHtml}</div></td></tr>`;
            });

            // --- 4. Construir Rodapé (Linha de Soma usando colspan) ---
            const perfilCarga = new Array(duracaoTotalTimeline + 1).fill(0);
            dataSource.forEach(escala => {
                const quantidade = parseInt(escala.quantidade);
                const inicioEscalaMin = timeToMinutes(escala.inicio);
                const fimEscalaMin = timeToMinutes(escala.fim);
                const inicioIntervaloMin = timeToMinutes(escala.inicioIntervalo);
                const fimIntervaloMin = timeToMinutes(escala.fimIntervalo);
                for (let min = inicioEscalaMin; min < fimEscalaMin; min++) {
                    const isBreak = (inicioIntervaloMin < fimIntervaloMin && min >= inicioIntervaloMin && min < fimIntervaloMin);
                    if (!isBreak) {
                        const index = min - config.inicioTimeline;
                        if (index >= 0 && index < perfilCarga.length) perfilCarga[index] += quantidade;
                    }
                }
            });

            let summaryBarsHtml = '';
            let lastCount = -1;
            let blockStartMin = config.inicioTimeline;
            for (let i = 0; i <= duracaoTotalTimeline; i++) {
                const currentCount = perfilCarga[i] || 0;
                const currentMin = config.inicioTimeline + i;
                if (currentCount !== lastCount && i > 0) {
                    if (lastCount > 0) {
                        const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
                        const widthPercent = ((currentMin - blockStartMin) / duracaoTotalTimeline) * 100;
                        summaryBarsHtml += `<div class="summary-bar bg-blue-600" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount}</span></div>`;
                    }
                    blockStartMin = currentMin;
                }
                lastCount = currentCount;
            }
            if (lastCount > 0) {
                const leftPercent = ((blockStartMin - config.inicioTimeline) / duracaoTotalTimeline) * 100;
                const widthPercent = ((config.fimTimeline - blockStartMin) / duracaoTotalTimeline) * 100;
                summaryBarsHtml += `<div class="summary-bar bg-blue-600" style="left: ${leftPercent}%; width: ${widthPercent}%;"><span class="summary-bar-text">${lastCount}</span></div>`;
            }

            const footerHtml = `
                <tr>
                    <td class="col-info font-bold text-center">Total de Ativos</td>
                    <td class="col-timeline" colspan="${numMarcacoes}"><div class="summary-bar-container">${summaryBarsHtml}</div></td>
                </tr>
            `;
            
            // --- 5. Montar a Tabela Final ---
            const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            printContent.innerHTML = `
                <div class="print-title">${title}</div>
                <div class="print-subtitle">Gerado em: ${dataGeracao}</div>
                <table class="print-timeline-table">
                    <thead>${headerHtml}</thead>
                    <tbody>${bodyHtml}</tbody>
                    <tfoot>${footerHtml}</tfoot>
                </table>
            `;

            window.print();
        };

        const prepareSkeletonForPrint = () => { const tableElement = document.getElementById('tabela-esqueleto'); if (!tableElement) return; const clone = tableElement.cloneNode(true); clone.classList.add('print-skeleton-table'); clone.removeAttribute('id'); const month = mesSelect.options[mesSelect.selectedIndex].text; const year = anoSelect.value; printContainer.innerHTML = `<div class="print-title">Esqueleto da Escala</div><div class="print-subtitle">${month} / ${year}</div>`; printContainer.appendChild(clone); window.print(); };
        const prepareDetailedForPrint = () => { const detailedElements = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada'); if (detailedElements.length === 0) return; const month = mesSelect.options[mesSelect.selectedIndex].text; const year = anoSelect.value; printContainer.innerHTML = `<div class="print-title">Escala Detalhada</div><div class="print-subtitle">${month} / ${year}</div>`; detailedElements.forEach(el => { printContainer.appendChild(el.cloneNode(true)); }); window.print(); };
        
        // --- EVENTOS E AÇÕES PRINCIPAIS ---

        abrirModalEscalaBtn.addEventListener('click', () => {
            resetSkeletonModalState();
            esqueletoZoomLevel = 1.0;
            applyEsqueletoZoom();
            esqueletoModal.classList.remove('hidden');
            gerarTabelaEsqueleto();
        });

        const definirBloqueioDistribuicao = (bloqueada) => {
            distribuicaoFolgasBloqueada = !!bloqueada;
            const table = document.getElementById('tabela-esqueleto');
            table?.classList.toggle('is-readonly', distribuicaoFolgasBloqueada);
            table?.querySelectorAll('.collaborator-select').forEach(select => { select.disabled = distribuicaoFolgasBloqueada; });
            criacaoSecoesLista?.querySelectorAll('input[type="checkbox"]').forEach(input => { input.disabled = distribuicaoFolgasBloqueada; });
            document.querySelectorAll('#criacaoTimelineContent .delete-btn').forEach(button => { button.disabled = distribuicaoFolgasBloqueada; });
            if (gerarTimelineCriacaoBtn) gerarTimelineCriacaoBtn.disabled = distribuicaoFolgasBloqueada;
            if (autoDistribuirFolgasBtn) autoDistribuirFolgasBtn.disabled = distribuicaoFolgasBloqueada;
            gerarEscalaDetalhadaBtn?.classList.toggle('hidden', !distribuicaoFolgasBloqueada);
            editarDistribuicaoBtn?.classList.toggle('hidden', !distribuicaoFolgasBloqueada);
            esqueletoModal?.classList.toggle('distribution-locked', distribuicaoFolgasBloqueada);
        };

        const liberarEdicaoDistribuicao = () => {
            definirBloqueioDistribuicao(false);
            detailedScaleHasBeenGenerated = false;
            detalhadaModalBody.innerHTML = '';
            detalhadaModal.classList.add('hidden');
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            showInfoModal('Edição liberada. Distribua novamente as folgas 5x2 antes de gerar a escala detalhada.', 'info');
        };

        editarDistribuicaoBtn?.addEventListener('click', liberarEdicaoDistribuicao);

        const resetSkeletonModalState = () => {
            escalaCarregadaParaVisualizacao = null;
            definirBloqueioDistribuicao(false);
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            const skeletonTable = document.getElementById('tabela-esqueleto');
            if (skeletonTable) skeletonTable.classList.remove('is-readonly');
            esqueletoModal.classList.add('hidden');
        };

        closeModalBtn.addEventListener('click', resetSkeletonModalState);

        gerarEscalaDetalhadaBtn.addEventListener('click', () => {
            if (escalaCarregadaParaVisualizacao) {
                carregarEscalaDetalhada(escalaCarregadaParaVisualizacao);
                resetSkeletonModalState();
            } else if (detailedScaleHasBeenGenerated) {
                detalhadaModal.classList.remove('hidden');
            } else {
                gerarEscalaDetalhada();
            }
        });

        closeDetalhadaModalBtn.addEventListener('click', () => { 
            detalhadaModal.classList.add('hidden'); 
            escalaCarregadaId = null;
            currentLoadedScale = null;
        });

        mesSelect.addEventListener('change', async () => {
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            await carregarAusenciasDaLoja(getLojaContextoEscala());
            gerarTabelaEsqueleto();
        });
        anoSelect.addEventListener('change', async () => {
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            await carregarAusenciasDaLoja(getLojaContextoEscala());
            gerarTabelaEsqueleto();
        });

        printBtn.addEventListener('click', () => imprimirTimelineMelhorado(dadosEscala, 'Linha do Tempo de Turnos'));
        imprimirEsqueletoBtn.addEventListener('click', prepareSkeletonForPrint);
        imprimirDetalhadaBtn.addEventListener('click', prepareDetailedForPrint);
        printTimelineVisualizerBtn.addEventListener('click', () => {
            const visualizerContent = document.getElementById('timeline-visualizer-content');
            const visualizerTitle = document.getElementById('timelineVisualizerTitle').textContent;
            const tempDataSource = JSON.parse(visualizerContent.dataset.source || '[]');
            imprimirTimelineMelhorado(tempDataSource, visualizerTitle);
        });
        
        closeInfoModalBtn.addEventListener('click', hideInfoModal);
        infoModal.addEventListener('click', (e) => { if (e.target === infoModal) hideInfoModal(); });
        
        visualizarTimelineBtn.addEventListener('click', () => {
            const visualizerContent = document.getElementById('timeline-visualizer-content');
            document.getElementById('timelineVisualizerTitle').textContent = `Visualização da Linha do Tempo`;
            renderizarTimelineCompleta('timeline-visualizer-content', dadosEscala);
            visualizerContent.dataset.source = JSON.stringify(dadosEscala); // Salva os dados para impressão
            timelineVisualizerModal.classList.remove('hidden');
        });
        closeTimelineVisualizerBtn.addEventListener('click', () => {
            timelineVisualizerModal.classList.add('hidden');
        });
        
        // --- LÓGICA DE SINCRONIZAÇÃO E VALIDAÇÃO (ATUALIZADA) ---

        validarEscalaBtn.addEventListener('click', () => {
            let allErrors = [];
            const ausenciasAplicadas = aplicarAusenciasNaDetalhada();
            allErrors = allErrors.concat(validarDescansos());
            allErrors = allErrors.concat(validarDiasConsecutivos());
            allErrors = allErrors.concat(validarJornada());
            
            if (allErrors.length > 0) {
                showInfoModal(allErrors, 'error');
            } else if (ausenciasAplicadas.length > 0) {
                showInfoModal(['Ausências aplicadas como folga obrigatória.', ...ausenciasAplicadas], 'success');
            } else {
                showInfoModal("A escala foi validada com sucesso. Nenhuma inconsistência encontrada.", 'success');
            }
        });
        
        const validarSequenciaParaTraz = (row, folgaIndex) => {
            const maxDias = parseInt(regraMaxDiasConsecutivosInput.value);
            const nomeColab = row.querySelector('.collaborator-name-span').textContent;
            const dayCells = row.querySelectorAll('.escala-cell');
            let diasTrabalhadosConsecutivos = 0;

            for (let i = folgaIndex - 1; i >= 0; i--) {
                const cell = dayCells[i];
                if (cell.textContent.toUpperCase() !== 'F') {
                    diasTrabalhadosConsecutivos++;
                } else {
                    break;
                }
            }

            if (diasTrabalhadosConsecutivos > maxDias) {
                return `${nomeColab}: A sequência de ${diasTrabalhadosConsecutivos} dias de trabalho que termina antes desta folga excede o máximo de ${maxDias}.`;
            }

            return null;
        };
        
        const validarSequenciaDetalhadaParaTraz = (colabContainer, folgaIndex) => {
            const maxDias = parseInt(regraMaxDiasConsecutivosInput.value);
            const nomeColab = colabContainer.querySelector('h3').textContent;
            const inicioRow = colabContainer.querySelector('tbody tr[data-key="inicio"]');
            if (!inicioRow) return null;

            const dayCells = inicioRow.querySelectorAll('td:not(:first-child)');
            let diasTrabalhadosConsecutivos = 0;

            for (let i = folgaIndex - 1; i >= 0; i--) {
                const cell = dayCells[i];
                if (cell.textContent.toUpperCase() !== 'F') {
                    diasTrabalhadosConsecutivos++;
                } else {
                    break;
                }
            }

            if (diasTrabalhadosConsecutivos > maxDias) {
                return `${nomeColab}: A sequência de ${diasTrabalhadosConsecutivos} dias de trabalho que termina antes desta folga excede o máximo de ${maxDias}.`;
            }
            return null;
        };

        const validarDescansos = () => {
            let errors = [];
            const descansoEntreTurnosRegra = timeToMinutes(regraDescansoEntreTurnosInput.value);
            const descansoPosFolgaRegra = hoursToMinutes(regraDescansoPosFolgaInput.value);
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');

            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                let ultimoTurno = null;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const entCell = colabDiv.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${dia + 1})`);
                    if (!entCell) break; 
                    
                    if (entCell.textContent.toUpperCase() !== 'F') {
                        const turnoAtual = {
                            dia: dia,
                            inicio: timeToMinutes(entCell.textContent),
                            fim: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="fim"] td:nth-child(${dia + 1})`).textContent)
                        };

                        if (ultimoTurno) {
                            const diasDeDiferenca = turnoAtual.dia - ultimoTurno.dia;
                            const descansoEmMinutos = (24 * 60 - ultimoTurno.fim) + turnoAtual.inicio + ((diasDeDiferenca - 1) * 24 * 60);
                            
                            if (diasDeDiferenca === 1 && descansoEmMinutos < descansoEntreTurnosRegra) {
                                errors.push(`${nomeColab}: Descanso de ${minutesToTime(descansoEmMinutos)} entre dias ${ultimoTurno.dia} e ${turnoAtual.dia} é menor que o mínimo de ${regraDescansoEntreTurnosInput.value}.`);
                            } else if (diasDeDiferenca > 1 && descansoEmMinutos < descansoPosFolgaRegra) {
                                const descansoEmHoras = Math.floor(descansoEmMinutos / 60);
                                const restoMinutos = descansoEmMinutos % 60;
                                errors.push(`${nomeColab}: Descanso de ${descansoEmHoras}h${restoMinutos}m após folga(s) (dias ${ultimoTurno.dia}-${turnoAtual.dia}) é menor que ${regraDescansoPosFolgaInput.value}h.`);
                            }
                        }
                        ultimoTurno = turnoAtual;
                    }
                }
            });
            return errors;
        };
        
        const validarJornada = () => {
            let errors = [];
            const jornadaPadraoMin = timeToMinutes(regraJornadaTrabalhoInput.value);
            const maxHoraExtraMin = timeToMinutes(regraMaxHoraExtraInput.value);
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');

            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const entCell = colabDiv.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${dia + 1})`);
                    if (!entCell || entCell.textContent.toUpperCase() === 'F') {
                        continue;
                    }

                    const turnoDoDia = {
                        inicio: timeToMinutes(entCell.textContent),
                        fim: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="fim"] td:nth-child(${dia + 1})`).textContent),
                        inicioIntervalo: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="inicioIntervalo"] td:nth-child(${dia + 1})`).textContent),
                        fimIntervalo: timeToMinutes(colabDiv.querySelector(`tbody tr[data-key="fimIntervalo"] td:nth-child(${dia + 1})`).textContent),
                    };

                    const duracaoIntervalo = turnoDoDia.fimIntervalo - turnoDoDia.inicioIntervalo;
                    const horasTrabalhadas = (turnoDoDia.fim - turnoDoDia.inicio) - (duracaoIntervalo > 0 ? duracaoIntervalo : 0);
                    const horaExtra = horasTrabalhadas - jornadaPadraoMin;

                    if (horaExtra > maxHoraExtraMin) {
                        errors.push(`${nomeColab} no dia ${dia}: Excedeu o máximo de horas extras. Realizado: ${minutesToTime(horaExtra)}, Máximo permitido: ${regraMaxHoraExtraInput.value}.`);
                    }
                }
            });
            return errors;
        };

        const validarDiasConsecutivos = () => {
            let errors = [];
            const maxDias = parseInt(regraMaxDiasConsecutivosInput.value);
            const colaboradoresDivs = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');

            colaboradoresDivs.forEach(colabDiv => {
                const nomeColab = colabDiv.querySelector('h3').textContent;
                let diasTrabalhadosConsecutivos = 0;
                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const entCell = colabDiv.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${dia + 1})`);
                    if (entCell && entCell.textContent.toUpperCase() !== 'F') {
                        diasTrabalhadosConsecutivos++;
                    } else {
                        if (diasTrabalhadosConsecutivos > maxDias) {
                            errors.push(`${nomeColab}: Sequência de ${diasTrabalhadosConsecutivos} dias de trabalho (terminando no dia ${dia - 1}) excede o máximo de ${maxDias}.`);
                        }
                        diasTrabalhadosConsecutivos = 0;
                    }
                }

                if (diasTrabalhadosConsecutivos > maxDias) {
                     errors.push(`${nomeColab}: Sequência de ${diasTrabalhadosConsecutivos} dias de trabalho (no final do mês) excede o máximo de ${maxDias}.`);
                }
            });
            return errors;
        };


        // --- LÓGICA DE EDIÇÃO, SELEÇÃO E COPIAR/COLAR ---

        detalhadaModalBody.addEventListener('input', (e) => {
            const targetCell = e.target;
            if (targetCell.matches('td[contenteditable="true"]')) {
                const colabContainer = targetCell.closest('.colaborador-escala-detalhada');
                if (!colabContainer) return;
                const colIndex = targetCell.cellIndex;
                const colabDataIndex = colabContainer.dataset.colabIndex;
                if (colabDataIndex === undefined) return;

                const rows = colabContainer.querySelectorAll('tbody tr');
                const isNowFolga = targetCell.textContent.trim().toUpperCase() === 'F';
                const isSunday = new Date(anoSelect.value, mesSelect.value, colIndex).getDay() === 0;

                if (isNowFolga) {
                    rows.forEach(row => {
                        const cellToUpdate = row.cells[colIndex];
                        if (cellToUpdate) {
                            cellToUpdate.textContent = 'F';
                            cellToUpdate.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                            if (isSunday) cellToUpdate.classList.add('bg-orange-500', 'text-white');
                            else cellToUpdate.classList.add('bg-red-100');
                        }
                    });
                    const dayCellIndex = colIndex - 1;
                    const errorMessage = validarSequenciaDetalhadaParaTraz(colabContainer, dayCellIndex);
                    if (errorMessage) showInfoModal([errorMessage], 'error');
                } else {
                    rows.forEach(row => {
                        const cellToUpdate = row.cells[colIndex];
                        if(cellToUpdate) {
                            cellToUpdate.classList.remove('bg-red-100', 'bg-orange-500', 'text-white');
                            if (isSunday) cellToUpdate.classList.add('bg-yellow-100');
                        }
                    });
                }

                const skeletonRow = document.querySelector(`#tabela-esqueleto tbody tr[data-colab-index="${colabDataIndex}"]`);
                if(skeletonRow){
                    const skeletonCell = skeletonRow.cells[colIndex];
                    if(skeletonCell){
                        skeletonCell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');
                        if(isNowFolga){
                            skeletonCell.textContent = 'F';
                            if (isSunday) skeletonCell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                            else skeletonCell.classList.add('bg-red-300', 'text-white', 'font-bold');
                        } else {
                            skeletonCell.textContent = '';
                             if (isSunday) skeletonCell.classList.add('bg-yellow-100');
                        }
                    }
                }
                atualizarContagemEsqueleto();
            }
        });
        
        detalhadaModalBody.addEventListener('blur', (e) => {
            const target = e.target;
            const container = target.closest('.colaborador-escala-detalhada');
            if (!container) return;
            
            if (target.matches('h3[contenteditable="true"]')) {
                const newName = target.textContent.trim();
                const colabDataIndex = container.dataset.colabIndex;
                if(colabDataIndex === undefined) return;

                const skeletonRow = document.querySelector(`#tabela-esqueleto tbody tr[data-colab-index="${colabDataIndex}"]`);
                if(skeletonRow) {
                    const nameCell = skeletonRow.cells[0];
                    if(nameCell) {
                        const nameSpan = nameCell.querySelector('.collaborator-name-span');
                        if (nameSpan) nameSpan.textContent = newName;
                        nameCell.dataset.name = newName;
                    }
                }
            }
            else if (target.matches('td[contenteditable="true"]')) {
                const cellContent = target.textContent.trim().toUpperCase();
                if (cellContent === 'F' || !cellContent.match(/^\d{2}:\d{2}$/)) return;
                
                const colIndex = target.cellIndex; 
                const turnoDoDia = { 
                    inicio: container.querySelector(`tbody tr[data-key="inicio"] td:nth-child(${colIndex + 1})`).textContent, 
                    fim: container.querySelector(`tbody tr[data-key="fim"] td:nth-child(${colIndex + 1})`).textContent, 
                    inicioIntervalo: container.querySelector(`tbody tr[data-key="inicioIntervalo"] td:nth-child(${colIndex + 1})`).textContent, 
                    fimIntervalo: container.querySelector(`tbody tr[data-key="fimIntervalo"] td:nth-child(${colIndex + 1})`).textContent, 
                };
                
                const errors = validarTurnoSimples(turnoDoDia); 
                if (errors.length > 0) showInfoModal(errors, 'error'); 

                const intervaloCell = container.querySelector(`tbody tr[data-key="intervalo"] td:nth-child(${colIndex + 1})`); 
                const hTrabCell = container.querySelector(`tbody tr[data-key="trabalhadas"] td:nth-child(${colIndex + 1})`); 
                const intervaloMin = timeToMinutes(turnoDoDia.fimIntervalo) - timeToMinutes(turnoDoDia.inicioIntervalo); 
                if (intervaloCell) intervaloCell.textContent = minutesToTime(intervaloMin > 0 ? intervaloMin : 0);
                const hTrabalhadasMin = (timeToMinutes(turnoDoDia.fim) - timeToMinutes(turnoDoDia.inicio)) - intervaloMin; 
                if (hTrabCell) hTrabCell.textContent = minutesToTime(hTrabalhadasMin > 0 ? hTrabalhadasMin : 0);
            }
        }, true);
        
        function clearSelection() {
            document.querySelectorAll('.selection-highlight').forEach(c => c.classList.remove('selection-highlight'));
            selectionRange = { startCell: null, endCell: null, colabContainer: null, cells: [] };
        }

        function updateSelectionHighlight() {
            selectionRange.cells.forEach(c => c.classList.remove('selection-highlight'));
            selectionRange.cells = [];
            if (!selectionRange.startCell) return;
            const endCell = selectionRange.endCell || selectionRange.startCell;
            const row = selectionRange.startCell.parentElement;
            const allCellsInRow = Array.from(row.cells);
            const startIndex = allCellsInRow.indexOf(selectionRange.startCell);
            const endIndex = allCellsInRow.indexOf(endCell);
            const minIndex = Math.min(startIndex, endIndex);
            const maxIndex = Math.max(startIndex, endIndex);
            if (minIndex === 0) return;
            for (let i = minIndex; i <= maxIndex; i++) {
                const cellToHighlight = allCellsInRow[i];
                cellToHighlight.classList.add('selection-highlight');
                selectionRange.cells.push(cellToHighlight);
            }
        }

        function pasteDay(colabContainer, targetDayIndex, scheduleDay) {
            const rows = colabContainer.querySelectorAll('tbody tr[data-key]');
            const ano = parseInt(anoSelect.value);
            const mes = parseInt(mesSelect.value);
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            if (targetDayIndex > diasNoMes) return false;
            const isSunday = new Date(ano, mes, targetDayIndex).getDay() === 0;
            rows.forEach(row => {
                const cellToUpdate = row.cells[targetDayIndex];
                const key = row.dataset.key;
                const newValue = scheduleDay.data[key] || '';
                if (cellToUpdate) {
                    cellToUpdate.textContent = newValue;
                    cellToUpdate.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                    if (scheduleDay.isFolga) {
                        if (isSunday) cellToUpdate.classList.add('bg-orange-500', 'text-white');
                        else cellToUpdate.classList.add('bg-red-100');
                    } else if (isSunday) {
                        cellToUpdate.classList.add('bg-yellow-100');
                    }
                }
            });
            const colabDataIndex = colabContainer.dataset.colabIndex;
            const skeletonRow = document.querySelector(`#tabela-esqueleto tbody tr[data-colab-index="${colabDataIndex}"]`);
            if (skeletonRow) {
                const skeletonCell = skeletonRow.cells[targetDayIndex];
                if (skeletonCell) {
                    skeletonCell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');
                    if (scheduleDay.isFolga) {
                        skeletonCell.textContent = 'F';
                        if (isSunday) skeletonCell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                        else skeletonCell.classList.add('bg-red-300', 'text-white', 'font-bold');
                    } else {
                        skeletonCell.textContent = '';
                        if (isSunday) skeletonCell.classList.add('bg-yellow-100');
                    }
                }
            }
            return true;
        }

        detalhadaModalBody.addEventListener('mousedown', (e) => {
            clearSelection();
            const targetCell = e.target.closest('td');
            if (targetCell && targetCell.hasAttribute('contenteditable')) {
                isSelecting = true;
                selectionRange.startCell = targetCell;
                selectionRange.colabContainer = targetCell.closest('.colaborador-escala-detalhada');
            }
        });

        detalhadaModalBody.addEventListener('mouseover', (e) => {
            if (!isSelecting) return;
            const targetCell = e.target.closest('td');
            if (targetCell && targetCell.hasAttribute('contenteditable') && targetCell.closest('.colaborador-escala-detalhada') === selectionRange.colabContainer) {
                selectionRange.endCell = targetCell;
                updateSelectionHighlight();
            }
        });
        
        window.addEventListener('mouseup', () => { isSelecting = false; });
        
        detalhadaModalBody.addEventListener('keydown', async (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const isCopy = (e.key === 'c' && (isMac ? e.metaKey : e.ctrlKey));
            const isPaste = (e.key === 'v' && (isMac ? e.metaKey : e.ctrlKey));
            if (!isCopy && !isPaste) return;
            
            const targetCell = e.target.closest('td');
            if (!targetCell || !targetCell.hasAttribute('contenteditable') || targetCell.cellIndex === 0) return;
            
            e.preventDefault();
            
            const colabContainer = targetCell.closest('.colaborador-escala-detalhada');
            if (!colabContainer) return;

            if (isCopy) {
                if (selectionRange.cells.length > 1) {
                    const copiedData = [];
                    const allRows = selectionRange.colabContainer.querySelectorAll('tbody tr[data-key]');
                    const selectedIndices = [...new Set(selectionRange.cells.map(cell => cell.cellIndex))].sort((a,b) => a - b);
                    for(const dayIndex of selectedIndices) {
                        const dayData = {};
                        let isFolga = false;
                        allRows.forEach(row => {
                            const key = row.dataset.key;
                            const cell = row.cells[dayIndex];
                            if (cell) {
                                dayData[key] = cell.textContent;
                                if (key === 'inicio' && cell.textContent.toUpperCase() === 'F') isFolga = true;
                            }
                        });
                        copiedData.push({ isFolga, data: dayData });
                    }
                    scheduleClipboard = copiedData;
                    showInfoModal(`Padrão de ${copiedData.length} dias copiado!`, 'success');
                } else {
                    const colIndex = targetCell.cellIndex;
                    const dayData = {};
                    const rows = colabContainer.querySelectorAll('tbody tr[data-key]');
                    let isFolga = false;
                    rows.forEach(row => {
                        const key = row.dataset.key;
                        const cell = row.cells[colIndex];
                        if (cell) {
                            dayData[key] = cell.textContent;
                            if (key === 'inicio' && cell.textContent.toUpperCase() === 'F') isFolga = true;
                        }
                    });
                    scheduleClipboard = { isFolga, data: dayData };
                    showInfoModal('Horário do dia copiado!', 'success');
                }
                setTimeout(hideInfoModal, 1500);
            }

            if (isPaste) {
                if (!scheduleClipboard) {
                    showInfoModal('Nenhum horário na área de transferência.', 'info');
                    return;
                }

                const pattern = scheduleClipboard;
                const isPatternArray = Array.isArray(pattern);
                const patternLength = isPatternArray ? pattern.length : 1;
                const destinationCells = selectionRange.cells;

                if (destinationCells.length > 1) { // CASO 1: Colar com padrão (repetidamente)
                    const destinationIndices = [...new Set(destinationCells.map(cell => cell.cellIndex))].sort((a,b) => a - b);
                    destinationIndices.forEach((targetDayIndex, loopIndex) => {
                        const patternItem = isPatternArray ? pattern[loopIndex % patternLength] : pattern;
                        pasteDay(colabContainer, targetDayIndex, patternItem);
                    });
                    showInfoModal('Padrão colado na faixa de destino!', 'success');
                } 
                else { // CASO 2: Colar simples (uma vez)
                    const startPasteDay = targetCell.cellIndex;
                    if (isPatternArray) {
                        pattern.forEach((daySchedule, i) => {
                            const targetDay = startPasteDay + i;
                            pasteDay(colabContainer, targetDay, daySchedule);
                        });
                    } else {
                        pasteDay(colabContainer, startPasteDay, pattern);
                    }
                    showInfoModal('Conteúdo colado com sucesso!', 'success');
                }

                setTimeout(() => {
                    validarEscalaBtn.click();
                    atualizarContagemEsqueleto();
                }, 100);
                
                clearSelection();
            }
        });
        
        tabelaEsqueletoContainer.addEventListener('change', (e) => {
            if (!e.target.classList.contains('collaborator-select')) return;

            const select = e.target;
            const row = select.closest('tr[data-colab-index]');
            const nameCell = row?.querySelector('td[data-name]');
            const selectedOption = select.selectedOptions[0];
            const nomeSelecionado = selectedOption?.dataset.name || selectedOption?.textContent || `Colaborador ${Number(row?.dataset.colabIndex || 0) + 1}`;

            if (!row || !nameCell) return;

            row.dataset.escfuncId = selectedOption?.dataset.escfuncId || '';
            row.dataset.chapa = selectedOption?.dataset.chapa || '';
            row.dataset.escsecaoId = selectedOption?.dataset.escsecaoId || '';
            row.dataset.escfuncaoId = selectedOption?.dataset.escfuncaoId || '';
            nameCell.dataset.name = nomeSelecionado;
            const hiddenName = nameCell.querySelector('.collaborator-name-span');
            if (hiddenName) hiddenName.textContent = nomeSelecionado;

            const detailedH3 = document.querySelector(`.colaborador-escala-detalhada[data-colab-index="${row.dataset.colabIndex}"] h3`);
            if (detailedH3) {
                detailedH3.textContent = nomeSelecionado;
                const detailedContainer = detailedH3.closest('.colaborador-escala-detalhada');
                if (detailedContainer) {
                    detailedContainer.dataset.escfuncId = row.dataset.escfuncId;
                    detailedContainer.dataset.chapa = row.dataset.chapa;
                    detailedContainer.dataset.escsecaoId = row.dataset.escsecaoId;
                    detailedContainer.dataset.escfuncaoId = row.dataset.escfuncaoId;
                }
            }

            atualizarOpcoesFuncionariosEsqueleto();
            limparAusenciasObrigatoriasDoEsqueleto();
            aplicarAusenciasNoEsqueleto();
            detailedScaleHasBeenGenerated = false;
            gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
            detalhadaModalBody.innerHTML = '';
        });

        tabelaEsqueletoContainer.addEventListener('click', (e) => { 
            const table = e.target.closest('#tabela-esqueleto');
            if (table && table.classList.contains('is-readonly')) {
                return;
            }

            if (e.target.classList.contains('escala-cell')) {
                const cell = e.target;
                if (cell.dataset.ausenciaObrigatoria === '1') {
                    showInfoModal(cell.title || 'Este dia possui ausência cadastrada e deve permanecer como folga.', 'info');
                    return;
                }
                const row = cell.parentElement;
                const colabIndex = row.dataset.colabIndex;
                
                const dayCells = Array.from(row.querySelectorAll('.escala-cell'));
                const clickedCellIndex = dayCells.indexOf(cell);
                
                const isFolgaPrevia = cell.textContent.toUpperCase() === 'F';
                const isSunday = new Date(anoSelect.value, mesSelect.value, clickedCellIndex + 1).getDay() === 0;

                cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');

                if (isFolgaPrevia) {
                    cell.textContent = '';
                    if(isSunday) cell.classList.add('bg-yellow-100');
                } else {
                    cell.textContent = 'F';
                    if(isSunday) {
                        cell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                    } else {
                        cell.classList.add('bg-red-300', 'text-white', 'font-bold');
                    }
                }
                
                if (detailedScaleHasBeenGenerated) {
                    const detailedContainer = document.querySelector(`.colaborador-escala-detalhada[data-colab-index="${colabIndex}"]`);
                    if(detailedContainer) {
                        const detailedRows = detailedContainer.querySelectorAll('tbody tr');
                        const isAgoraFolga = cell.textContent.toUpperCase() === 'F';
                        const cellIndexInTable = cell.cellIndex;
                        
                        if(isAgoraFolga) {
                             detailedRows.forEach(dRow => {
                                const dCell = dRow.cells[cellIndexInTable];
                                if(dCell) {
                                    dCell.textContent = 'F';
                                    dCell.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                                    if(isSunday) {
                                        dCell.classList.add('bg-orange-500', 'text-white');
                                    } else {
                                        dCell.classList.add('bg-red-100');
                                    }
                                }
                            });
                        } else {
                            const originalShift = colaboradorShifts[colabIndex];
                             const hIntervaloMin = timeToMinutes(originalShift.fimIntervalo) - timeToMinutes(originalShift.inicioIntervalo);
                            const hTrabalhadasMin = (timeToMinutes(originalShift.fim) - timeToMinutes(originalShift.inicio)) - hIntervaloMin;

                            const restoredValues = {
                                'inicio': originalShift.inicio,
                                'inicioIntervalo': originalShift.inicioIntervalo,
                                'intervalo': minutesToTime(hIntervaloMin > 0 ? hIntervaloMin : 0),
                                'fimIntervalo': originalShift.fimIntervalo,
                                'fim': originalShift.fim,
                                'trabalhadas': minutesToTime(hTrabalhadasMin > 0 ? hTrabalhadasMin : 0)
                            };

                            detailedRows.forEach(dRow => {
                                const dCell = dRow.cells[cellIndexInTable];
                                const key = dRow.dataset.key;
                                if(dCell) {
                                    dCell.textContent = restoredValues[key];
                                    dCell.classList.remove('bg-red-100', 'bg-orange-500', 'text-white');
                                    if (isSunday) {
                                        dCell.classList.add('bg-yellow-100');
                                    }
                                }
                            });
                        }
                    }
                }
                atualizarContagemEsqueleto();
                
                if (!isFolgaPrevia) {
                    const errorMessage = validarSequenciaParaTraz(row, clickedCellIndex);
                    if (errorMessage) {
                        setTimeout(() => showInfoModal([errorMessage], 'error'), 100);
                    }
                }
            }
        });

        tabelaEsqueletoContainer.addEventListener('blur', (e) => {
            const table = e.target.closest('#tabela-esqueleto');
            if (table && table.classList.contains('is-readonly')) {
                return;
            }

            if (e.target.matches('.collaborator-name-span')) {
                const nameSpan = e.target;
                const nameCell = nameSpan.parentElement;
                const newName = nameSpan.textContent.trim();
                nameCell.dataset.name = newName;
                
                if (detailedScaleHasBeenGenerated) {
                    const colabIndex = nameCell.parentElement.dataset.colabIndex;
                    const detailedH3 = document.querySelector(`.colaborador-escala-detalhada[data-colab-index="${colabIndex}"] h3`);
                    if(detailedH3) {
                        detailedH3.textContent = newName;
                    }
                }
            }
        }, true);

        abrirTurnoModalBtn?.addEventListener('click', abrirModalTurno);
        closeTurnoModalBtn?.addEventListener('click', () => {
            cancelarModoEdicao();
            fecharModalTurno();
        });
        turnoModal?.addEventListener('click', (event) => {
            if (event.target === turnoModal) {
                cancelarModoEdicao();
                fecharModalTurno();
            }
        });
        addEscalaBtn.addEventListener('click', manipularEnvioFormulario);
        secaoTurnoSelect?.addEventListener('change', aplicarSecaoSelecionadaNoFormulario);
        const recarregarEscalasComFiltro = async () => {
            await consultarEscalasBancoLocal().catch(error => showInfoModal(error.message, 'error'));
        };
        escalasFiltroLoja?.addEventListener('change', recarregarEscalasComFiltro);
        escalasFiltroMes?.addEventListener('change', recarregarEscalasComFiltro);
        escalasFiltroAno?.addEventListener('change', recarregarEscalasComFiltro);
        escalasFiltroStatus?.addEventListener('change', recarregarEscalasComFiltro);
        escalasPesquisaInput?.addEventListener('input', () => {
            clearTimeout(escalasPesquisaInput._filterTimer);
            escalasPesquisaInput._filterTimer = setTimeout(() => consultarEscalasBancoLocal().catch(error => showInfoModal(error.message, 'error')), 180);
        });

        cancelEditBtn.addEventListener('click', () => {
            cancelarModoEdicao();
            fecharModalTurno();
        });
        carregarFuncionariosBtn.addEventListener('click', () => carregarFuncionariosDaLoja(false));
        lojaEscalaSelect.addEventListener('change', async () => {
            try {
                funcionariosLojaSelect.value = lojaEscalaSelect.value;
                if (homeLojaSelect) homeLojaSelect.value = lojaEscalaSelect.value;
                if (secoesLojaSelect) secoesLojaSelect.value = lojaEscalaSelect.value;
                if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = lojaEscalaSelect.value;
                await carregarSecoesDaLoja(true);
                await carregarTurnosSecaoDaLoja(true);
                await carregarFuncionariosDaLoja(true);
                if (!funcionariosPage.classList.contains('hidden')) {
                    await carregarFuncionariosTela();
                }
                if (!secoesPage.classList.contains('hidden')) {
                    await carregarSecoesTela(false);
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        funcionariosLojaSelect.addEventListener('change', async () => {
            try {
                await carregarFuncionariosTela(false);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        homeLojaSelect?.addEventListener('change', async () => {
            lojaEscalaSelect.value = homeLojaSelect.value;
            funcionariosLojaSelect.value = homeLojaSelect.value;
            if (secoesLojaSelect) secoesLojaSelect.value = homeLojaSelect.value;
            if (secaoFormLoja) secaoFormLoja.value = homeLojaSelect.value;
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = homeLojaSelect.value;
            await carregarSecoesDaLoja(true);
            await carregarTurnosSecaoDaLoja(true);
            await carregarFuncionariosDaLoja(true);
        });
        secoesLojaSelect?.addEventListener('change', async () => {
            await carregarSecoesTela(false);
        });
        secaoFormLoja?.addEventListener('change', async () => {
            const loja = secaoFormLoja.value;
            lojaEscalaSelect.value = loja;
            funcionariosLojaSelect.value = loja;
            if (homeLojaSelect) homeLojaSelect.value = loja;
            if (secoesLojaSelect) secoesLojaSelect.value = loja;
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = loja;
            secaoFormId.value = '';
            secaoFormCodigo.value = '';
            await carregarSecoesDaLoja(true);
            popularSelectSecaoFormulario('');
        });
        turnosSecaoLojaSelect?.addEventListener('change', async () => {
            await carregarTurnosSecaoTela(false);
        });
        secaoFormDescr?.addEventListener('change', () => aplicarSecaoSelecionadaNoCadastro());
        carregarFuncionariosTelaBtn?.addEventListener('click', async () => {
            try {
                await carregarFuncionariosTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        carregarSecoesBtn?.addEventListener('click', async () => {
            try {
                await carregarSecoesTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        carregarAcessosBtn.addEventListener('click', async () => {
            try {
                await carregarAcessosTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });
        const getPerfilAcessoOptions = async (selected = '') => {
            if (!perfisAcessoCache.length) await carregarPerfisAcesso();
            const ativos = perfisAcessoCache.filter(perfil => perfil.STATUS !== 'I' || String(perfil.NOME) === String(selected));
            return ativos.map(perfil => ({ value: perfil.NOME, label: perfil.NOME + (perfil.STATUS === 'I' ? ' (Inativo)' : '') }));
        };

        const getLojasPermitidasOptions = (selected = []) => {
            const selecionadas = new Set((selected || []).map(String));
            return lojasPermitidasCache.map(loja => ({ value: String(loja), label: 'Loja ' + loja, checked: selecionadas.has(String(loja)) }));
        };

        carregarAcessosBtn.parentElement.addEventListener('click', async (event) => {
            if (event.target.closest('#novoUsuarioBtn')) {
                try {
                    const perfilOptions = await getPerfilAcessoOptions('OPERADOR');
                    const lojaInicial = lojasPermitidasCache.length === 1 ? [String(lojasPermitidasCache[0])] : [];
                    const values = await showInputModal({
                        title: 'Novo Usuário',
                        inputs: [
                            { label: 'Login', type: 'text', id: 'LOGIN', required: true },
                            { label: 'Nome', type: 'text', id: 'NOME', required: true },
                            { label: 'Senha inicial', type: 'password', id: 'PASSWORD', required: true },
                            { label: 'Perfil de Acesso', type: 'select', id: 'PERFIL', value: perfilOptions[0]?.value || 'OPERADOR', options: perfilOptions, required: true },
                            { label: 'Lojas permitidas', type: 'checkbox-group', id: 'LOJAS', value: lojaInicial, options: getLojasPermitidasOptions(lojaInicial), required: true }
                        ],
                        confirmText: 'Criar'
                    });
                    if (!values) return;
                    await apiRequest('/api/acessos/usuarios', {
                        method: 'POST',
                        body: JSON.stringify({
                            LOGIN: values.LOGIN,
                            NOME: values.NOME,
                            PASSWORD: values.PASSWORD,
                            PERFIL: values.PERFIL,
                            LOJAS: (values.LOJAS || []).map(loja => Number(loja)).filter(Boolean)
                        })
                    });
                    await carregarAcessosTela(false);
                    showInfoModal('Usuário criado com sucesso.', 'success');
                } catch (error) {
                    showInfoModal(error.message, 'error');
                }
            }
        });
        
        // --- SISTEMA DE MODAL DE INPUT ---
        const inputModal = document.getElementById('inputModal');
        const inputModalTitle = document.getElementById('inputModalTitle');
        const inputModalBody = document.getElementById('inputModalBody');
        const inputModalConfirmBtn = document.getElementById('inputModalConfirmBtn');
        const inputModalCancelBtn = document.getElementById('inputModalCancelBtn');

        const showInputModal = (config) => {
            return new Promise((resolve) => {
                inputModalTitle.textContent = config.title;
                inputModalConfirmBtn.textContent = config.confirmText || 'Confirmar';
                
                if (config.cancelText === '') {
                    inputModalCancelBtn.classList.add('hidden');
                } else {
                    inputModalCancelBtn.classList.remove('hidden');
                    inputModalCancelBtn.textContent = config.cancelText || 'Cancelar';
                }

                inputModalBody.innerHTML = '';

                config.inputs.forEach(input => {
                    if (input.type === 'message') {
                        const p = document.createElement('p');
                        p.textContent = input.text;
                        p.className = 'text-gray-700';
                        inputModalBody.appendChild(p);
                        return;
                    }

                    if (input.type === 'html') {
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = input.html || '';
                        inputModalBody.appendChild(wrapper);
                        return;
                    }

                    const label = document.createElement('label');
                    label.className = 'block text-sm font-medium text-gray-700';
                    label.textContent = input.label;

                    if (input.type === 'select') {
                        const selectEl = document.createElement('select');
                        selectEl.id = input.id;
                        selectEl.required = input.required;
                        selectEl.className = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
                        (input.options || []).forEach(option => {
                            const optionEl = document.createElement('option');
                            optionEl.value = option.value;
                            optionEl.textContent = option.label;
                            if (String(option.value) === String(input.value || '')) optionEl.selected = true;
                            selectEl.appendChild(optionEl);
                        });
                        inputModalBody.appendChild(label);
                        inputModalBody.appendChild(selectEl);
                        return;
                    }

                    if (input.type === 'checkbox-group') {
                        const wrapper = document.createElement('div');
                        wrapper.id = input.id;
                        wrapper.dataset.inputType = 'checkbox-group';
                        wrapper.className = 'mt-2 max-h-64 overflow-auto rounded-md border border-gray-200 bg-white p-3 space-y-2';
                        (input.options || []).forEach(option => {
                            const row = document.createElement('label');
                            row.className = 'flex items-start gap-2 text-sm text-gray-700';
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.value = option.value;
                            checkbox.checked = input.value ? input.value.map(String).includes(String(option.value)) : option.checked !== false;
                            checkbox.className = 'mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500';
                            const span = document.createElement('span');
                            span.textContent = option.label;
                            row.appendChild(checkbox);
                            row.appendChild(span);
                            wrapper.appendChild(row);
                        });
                        inputModalBody.appendChild(label);
                        inputModalBody.appendChild(wrapper);
                        return;
                    }

                    const inputEl = document.createElement('input');
                    inputEl.type = input.type;
                    inputEl.id = input.id;
                    inputEl.required = input.required;
                    inputEl.value = input.value || '';
                    inputEl.className = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm';
                    inputModalBody.appendChild(label);
                    inputModalBody.appendChild(inputEl);
                });

                const hideModal = () => {
                    inputModal.classList.add('hidden');
                    inputModalConfirmBtn.onclick = null;
                    inputModalCancelBtn.onclick = null;
                };

                inputModalConfirmBtn.onclick = () => {
                    const values = {};
                    let allValid = true;
                    config.inputs.forEach(input => {
                        if (input.type === 'message') return;
                        const inputEl = document.getElementById(input.id);
                        if (!inputEl) return;
                        if (input.type === 'checkbox-group') {
                            const checked = Array.from(inputEl.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                            if (input.required && checked.length === 0) {
                                allValid = false;
                            }
                            values[input.id] = checked;
                            return;
                        }
                        if (inputEl.required && !inputEl.value) {
                            allValid = false;
                        }
                        values[input.id] = inputEl.value;
                    });

                    if (allValid) {
                        hideModal();
                        resolve(values);
                    } else {
                        showInfoModal('Por favor, preencha todos os campos obrigatórios.', 'error');
                    }
                };

                inputModalCancelBtn.onclick = () => {
                    hideModal();
                    resolve(null);
                };

                inputModal.classList.remove('hidden');
            });
        };
        
        // --- LÓGICA DE SALVAR/CARREGAR/DELETAR ---
        const salvarEscalaBtn = document.getElementById('salvarEscalaBtn');
        const tabelaRegistrosBody = document.getElementById('tabela-registros-body');
        let escalasSalvasCache = [];
        let escalaConfigCache = {};
        let escalaRascunhoAtivo = false;
        let escalaRascunhoContexto = null;
        const getLojaContextoEscala = () => String(escalaRascunhoContexto?.loja || lojaEscalaSelect?.value || '');

        const apiRequest = async (url, options = {}) => {
            const { timeoutMs = 20000, signal, ...fetchOptions } = options;
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(url, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...(fetchOptions.headers || {}) },
                ...fetchOptions,
                signal: signal || controller.signal
            }).catch((error) => {
                if (error.name === 'AbortError') {
                    throw new Error('Tempo limite excedido ao comunicar com o servidor.');
                }
                throw error;
            }).finally(() => clearTimeout(timeout));

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = new Error(data.error || 'Erro ao comunicar com o servidor.');
                error.details = data.errors || data.details || null;
                throw error;
            }
            return data;
        };

        const carregarUsuarioSessao = async () => {
            const data = await apiRequest('/api/auth/me');
            const user = data.user || {};
            usuarioSessaoCache = user;
            const lojas = Array.isArray(user.lojas) ? user.lojas : [];

            if (loggedUserName) {
                loggedUserName.textContent = user.nome || user.login || 'Usuário';
            }

            if (loggedUserInitials) {
                const nome = String(user.nome || user.login || 'Usuário').trim();
                const partes = nome.split(/\s+/).filter(Boolean);
                loggedUserInitials.textContent = ((partes[0]?.[0] || 'U') + (partes.length > 1 ? partes[partes.length - 1][0] : partes[0]?.[1] || 'S')).toUpperCase();
            }

            if (loggedUserRole) loggedUserRole.textContent = user.perfil === 'ADMIN' ? 'Admin' : (user.perfil || 'Usuário');

            if (loggedUserStores) {
                loggedUserStores.innerHTML = '<span class="material-symbols-outlined">storefront</span>' + (lojas.length === 1 ? '1 loja' : `${lojas.length} lojas`);
                loggedUserStores.title = lojas.length > 0 ? `Lojas permitidas: ${lojas.join(', ')}` : 'Sem loja vinculada';
            }
        };

        const configurarAcoesAdmin = () => {
            if (usuarioSessaoCache?.perfil !== 'ADMIN' || novoUsuarioBtn) return;

            novoUsuarioBtn = document.createElement('button');
            novoUsuarioBtn.type = 'button';
            novoUsuarioBtn.id = 'novoUsuarioBtn';
            novoUsuarioBtn.className = 'action-button';
            novoUsuarioBtn.innerHTML = '<span class="material-symbols-outlined">person_add</span>Novo Usuário';
            carregarAcessosBtn.parentElement.appendChild(novoUsuarioBtn);
        };

        logoutAppBtn?.addEventListener('click', async () => {
            try {
                await apiRequest('/api/auth/logout', { method: 'POST' });
            } finally {
                window.location.href = '/login.html';
            }
        });

        const carregarEstadoServidor = async () => {
            const state = await apiRequest('/api/state');
            escalasSalvasCache = Array.isArray(state.escalasSalvas) ? state.escalasSalvas : [];
            escalaConfigCache = state.escalaConfig || {};
        };

        const salvarConfigNoServidor = async (settings) => {
            escalaConfigCache = settings || {};
            await apiRequest('/api/state/config', {
                method: 'PUT',
                body: JSON.stringify({ escalaConfig: escalaConfigCache })
            });
        };

        const carregarLojasEscala = async () => {
            const data = await apiRequest('/api/catalog/lojas');
            const lojas = data.lojas || [];
            const lojaAtual = lojaEscalaSelect.value || funcionariosLojaSelect.value || escalasFiltroLoja?.value;
            lojasPermitidasCache = lojas.map(loja => Number(getLojaCodigo(loja))).filter(Boolean);
            lojaEscalaSelect.innerHTML = '';
            funcionariosLojaSelect.innerHTML = '';
            if (homeLojaSelect) homeLojaSelect.innerHTML = '';
            if (escalasFiltroLoja) escalasFiltroLoja.innerHTML = '';
            if (secoesLojaSelect) secoesLojaSelect.innerHTML = '';
            if (secaoFormLoja) secaoFormLoja.innerHTML = '';
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.innerHTML = '';
            if (escalaFuncionarioLoja) escalaFuncionarioLoja.innerHTML = '';
            if (historicoLojaSelect) historicoLojaSelect.innerHTML = '';

            if (lojas.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'Nenhuma loja permitida';
                lojaEscalaSelect.appendChild(option);
                funcionariosLojaSelect.appendChild(option.cloneNode(true));
                homeLojaSelect?.appendChild(option.cloneNode(true));
                escalasFiltroLoja?.appendChild(option.cloneNode(true));
                secoesLojaSelect?.appendChild(option.cloneNode(true));
                secaoFormLoja?.appendChild(option.cloneNode(true));
                turnosSecaoLojaSelect?.appendChild(option.cloneNode(true));
                lojaEscalaSelect.disabled = true;
                funcionariosLojaSelect.disabled = true;
                if (homeLojaSelect) homeLojaSelect.disabled = true;
                if (escalasFiltroLoja) escalasFiltroLoja.disabled = true;
                if (secoesLojaSelect) secoesLojaSelect.disabled = true;
                if (secaoFormLoja) secaoFormLoja.disabled = true;
                carregarFuncionariosBtn.disabled = true;
                if (carregarFuncionariosTelaBtn) carregarFuncionariosTelaBtn.disabled = true;
                funcionariosStatus.textContent = 'Usuario sem loja permitida';
                return [];
            }

            lojaEscalaSelect.disabled = false;
            funcionariosLojaSelect.disabled = false;
            if (homeLojaSelect) homeLojaSelect.disabled = false;
            if (escalasFiltroLoja) escalasFiltroLoja.disabled = false;
            if (secoesLojaSelect) secoesLojaSelect.disabled = false;
            if (secaoFormLoja) secaoFormLoja.disabled = false;
            if (historicoLojaSelect) historicoLojaSelect.disabled = false;
            carregarFuncionariosBtn.disabled = false;
            if (carregarFuncionariosTelaBtn) carregarFuncionariosTelaBtn.disabled = false;

            [funcionariosLojaSelect, secoesLojaSelect, turnosSecaoLojaSelect, escalaFuncionarioLoja, historicoLojaSelect].forEach(select => {
                if (!select) return;
                const option = document.createElement('option');
                option.value = 'all';
                option.textContent = 'Todas as lojas';
                select.appendChild(option);
            });

            if (escalasFiltroLoja) {
                const todasOption = document.createElement('option');
                todasOption.value = 'all';
                todasOption.textContent = 'Todas as lojas';
                escalasFiltroLoja.appendChild(todasOption);
            }

            lojas.forEach(loja => {
                const lojaCodigo = getLojaCodigo(loja);
                const option = document.createElement('option');
                option.value = lojaCodigo;
                option.textContent = `Loja ${lojaCodigo}`;
                lojaEscalaSelect.appendChild(option);
                funcionariosLojaSelect.appendChild(option.cloneNode(true));
                homeLojaSelect?.appendChild(option.cloneNode(true));
                escalasFiltroLoja?.appendChild(option.cloneNode(true));
                secoesLojaSelect?.appendChild(option.cloneNode(true));
                secaoFormLoja?.appendChild(option.cloneNode(true));
                turnosSecaoLojaSelect?.appendChild(option.cloneNode(true));
                escalaFuncionarioLoja?.appendChild(option.cloneNode(true));
                historicoLojaSelect?.appendChild(option.cloneNode(true));
            });

            const lojaSelecionada = lojasPermitidasCache.includes(Number(lojaAtual))
                ? String(lojaAtual)
                : String(getLojaCodigo(lojas[0]));
            lojaEscalaSelect.value = lojaSelecionada;
            funcionariosLojaSelect.value = 'all';
            if (homeLojaSelect) homeLojaSelect.value = lojaSelecionada;
            if (escalasFiltroLoja) escalasFiltroLoja.value = lojasPermitidasCache.length > 1 ? 'all' : lojaSelecionada;
            if (secoesLojaSelect) secoesLojaSelect.value = 'all';
            if (secaoFormLoja) secaoFormLoja.value = lojaSelecionada;
            if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = 'all';
            if (escalaFuncionarioLoja) escalaFuncionarioLoja.value = lojasPermitidasCache.length > 1 ? 'all' : lojaSelecionada;
            if (historicoLojaSelect) historicoLojaSelect.value = lojasPermitidasCache.length > 1 ? 'all' : lojaSelecionada;
            return lojas;
        };

        const carregarSecoesDaLoja = async (silent = false, lojaInformada = '') => {
            const loja = lojaInformada || (secoesLojaSelect?.value && secoesLojaSelect.value !== 'all' ? secoesLojaSelect.value : lojaEscalaSelect.value);
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                secoesLojaCache = [];
                popularSelectSecaoFormulario('');
                return [];
            }

            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`);
                secoesLojaCache = data.secoes || [];
                popularSelectSecaoFormulario(secaoFormId?.value || '');
                if (!silent && secoesLojaCache.length === 0) {
                    showInfoModal('Nenhuma secao encontrada para a loja selecionada.', 'info');
                }
                return secoesLojaCache;
            } catch (error) {
                secoesLojaCache = [];
                popularSelectSecaoFormulario('');
                if (!silent) showInfoModal(error.message, 'error');
                return [];
            }
        };

        const carregarTurnosSecaoDaLoja = async (silent = false, lojaInformada = '') => {
            const lojaFiltro = turnosSecaoLojaSelect?.value;
            const loja = lojaInformada || (lojaFiltro && lojaFiltro !== 'all' ? lojaFiltro : lojaEscalaSelect.value);
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                turnosSecaoCache = [];
                popularSelectSecoesTurno();
                return [];
            }

            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao`);
                turnosSecaoCache = data.turnos || [];
                popularSelectSecoesTurno();
                if (!silent && turnosSecaoCache.length === 0) {
                    showInfoModal('Nenhum turno encontrado para a loja selecionada.', 'info');
                }
                return turnosSecaoCache;
            } catch (error) {
                turnosSecaoCache = [];
                popularSelectSecoesTurno();
                if (!silent) showInfoModal(error.message, 'error');
                return [];
            }
        };

        const preencherFormularioSecao = (secao = null) => {
            secaoFormId.value = secao?.ESCSECAO_ID || '';
            secaoFormLoja.value = secao?.CODFILIAL || secao?.LOJA || (secoesLojaSelect?.value !== 'all' ? secoesLojaSelect?.value : lojaEscalaSelect.value) || '';
            secaoFormCodigo.value = secao?.COD_SECAO || '';
            secaoFormDescr.value = secao?.DESCR || '';
        };

        // esconderFormularioTurnoSecao and mostrarFormularioTurnoSecao removed as form is on a separate page

        const preencherFormularioTurnoSecao = (turno = null) => {
            turnoSecaoFormId.value = turno?.ESCSECAOTURNO_ID || '';
            popularSelectSecaoFormulario(turno?.ESCSECAO_ID || '');
            turnoSecaoFormQtde.value = turno?.QTDE_COLABORADORES || 1;
            turnoSecaoFormHrEnt1.value = turno?.HR_ENT1 || '';
            turnoSecaoFormHrSai1.value = turno?.HR_SAI1 || '';
            turnoSecaoFormHrEnt2.value = turno?.HR_ENT2 || '';
            turnoSecaoFormHrSai2.value = turno?.HR_SAI2 || '';
            turnoSecaoFormTitulo.textContent = turno ? 'Editar Turno' : 'Novo Turno';
        };

        const aplicarSecaoSelecionadaNoCadastro = () => {
            const escsecaoId = turnoSecaoFormSecao?.value || '';
            const secao = secaoTela || secoesLojaCache.find(item => Number(item.ESCSECAO_ID) === Number(escsecaoId));
            if (!secao) {
                turnoSecaoFormSecao.value = '';
                return;
            }
        };

        const prepararFormularioSecao = async (escsecaoId = '') => {
            const loja = secoesLojaSelect?.value || lojaEscalaSelect.value;
            if (secaoFormLoja && loja) secaoFormLoja.value = loja;
            if (loja && (secoesLojaCache.length === 0 || String(secoesLojaCache[0]?.LOJA || '') !== String(loja))) {
                await carregarSecoesDaLoja(true);
            }

            if (!escsecaoId || escsecaoId === 'nova') {
                secaoFormTitulo.textContent = 'Nova Seção';
                preencherFormularioSecao(null);
                return;
            }

            const secao = secoesLojaCache.find(item => Number(item.ESCSECAO_ID) === Number(escsecaoId));
            if (!secao) {
                showInfoModal('Seção não encontrada para edição.', 'error');
                window.location.hash = '/secoes';
                return;
            }

            secaoFormTitulo.textContent = `Editar Seção - ${secao.DESCR || secao.COD_SECAO}`;
            preencherFormularioSecao(secao);
        };

        const aplicarFiltrosSecoesTela = () => {
            const termo = normalizarTextoFiltro(secoesPesquisaInput?.value);
            const loja = secoesLojaSelect?.value || 'all';
            const filtradas = secoesTelaCache.filter(secao => {
                if (loja !== 'all' && String(secao.CODFILIAL || secao.LOJA) !== String(loja)) return false;
                return !termo || normalizarTextoFiltro((secao.COD_SECAO || '') + ' ' + (secao.DESCR || '')).includes(termo);
            });
            secoesTitulo.textContent = filtradas.length + ' seção(ões) encontrada(s)';
            tabelaSecoesBody.innerHTML = filtradas.length ? filtradas.map(secao => '<tr data-escsecao-id="' + escapeHtml(secao.ESCSECAO_ID || '') + '">' +
                '<td data-label="Código">' + escapeHtml(secao.COD_SECAO || '') + '</td>' +
                '<td data-label="Descrição">' + escapeHtml(secao.DESCR || '') + '</td>' +
                '<td data-label="Loja">Loja ' + escapeHtml(secao.CODFILIAL || secao.LOJA || '') + '</td>' +
                '<td data-label="Codcoligada">' + escapeHtml(secao.CODCOLIGADA || '') + '</td>' +
                '<td data-label="Ações" class="actions-cell"><button class="action-btn-table banco-action edit-secao" data-id="' + escapeHtml(secao.ESCSECAO_ID || '') + '" data-loja="' + escapeHtml(secao.CODFILIAL || secao.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button></td></tr>').join('') : '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhuma seção encontrada.</td></tr>';
        };

        const carregarSecoesTela = async () => {
            const lojas = secoesLojaSelect?.value && secoesLojaSelect.value !== 'all' ? [Number(secoesLojaSelect.value)] : [...lojasPermitidasCache];
            const resultados = await Promise.all(lojas.map(async loja => {
                const data = await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/secoes');
                return (data.secoes || []).map(secao => ({ ...secao, CODFILIAL: secao.CODFILIAL || loja }));
            }));
            secoesTelaCache = resultados.flat();
            aplicarFiltrosSecoesTela();
        };

        secoesPesquisaInput?.addEventListener('input', aplicarFiltrosSecoesTela);
        secoesLojaSelect?.addEventListener('change', () => carregarSecoesTela().catch(error => showInfoModal(error.message, 'error')));

        tabelaSecoesBody?.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-secao');
            if (!editButton) return;

            if (editButton.dataset.loja) secoesLojaSelect.value = editButton.dataset.loja;
            window.location.hash = `/secoes/${editButton.dataset.id}`;
        });

        novaSecaoBtn?.addEventListener('click', () => {
            window.location.hash = '/secoes/nova';
        });

        voltarSecoesBtn?.addEventListener('click', () => {
            window.location.hash = '/secoes';
        });

        secaoForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const loja = secaoFormLoja.value;
            const escsecaoId = secaoFormId.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                showInfoModal('Selecione uma loja permitida para salvar a seção.', 'error');
                return;
            }

            try {
                const payload = {
                    COD_SECAO: secaoFormCodigo.value.trim(),
                    DESCR: secaoFormDescr.value.trim()
                };
                const url = escsecaoId
                    ? `/api/catalog/lojas/${encodeURIComponent(loja)}/secoes/${encodeURIComponent(escsecaoId)}`
                    : `/api/catalog/lojas/${encodeURIComponent(loja)}/secoes`;
                await apiRequest(url, {
                    method: escsecaoId ? 'PUT' : 'POST',
                    body: JSON.stringify(payload)
                });
                lojaEscalaSelect.value = loja;
                funcionariosLojaSelect.value = loja;
                if (homeLojaSelect) homeLojaSelect.value = loja;
                if (secoesLojaSelect) secoesLojaSelect.value = loja;
                await carregarSecoesTela(false);
                showInfoModal('Seção salva com sucesso.', 'success');
                window.location.hash = '/secoes';
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const popularFiltroSecoesTurnos = () => {
            if (!turnosSecaoFiltro) return;
            const atual = turnosSecaoFiltro.value || 'all';
            const map = new Map(turnosTelaCache.map(turno => [String(turno.ESCSECAO_ID), (turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '') + (turno.DESCR || 'Seção')]));
            turnosSecaoFiltro.innerHTML = '<option value="all">Todas as seções</option>' + [...map.entries()].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,nome]) => '<option value="' + escapeHtml(id) + '">' + escapeHtml(nome) + '</option>').join('');
            if (map.has(atual)) turnosSecaoFiltro.value = atual;
        };

        const aplicarFiltrosTurnosTela = () => {
            const termo = normalizarTextoFiltro(turnosPesquisaInput?.value);
            const loja = turnosSecaoLojaSelect?.value || 'all';
            const secao = turnosSecaoFiltro?.value || 'all';
            const filtrados = turnosTelaCache.filter(turno => {
                if (loja !== 'all' && String(turno.LOJA) !== String(loja)) return false;
                if (secao !== 'all' && String(turno.ESCSECAO_ID) !== String(secao)) return false;
                return !termo || normalizarTextoFiltro((turno.COD_SECAO || '') + ' ' + (turno.DESCR || '')).includes(termo);
            });
            turnosSecaoTitulo.textContent = filtrados.length + ' turno(s) encontrado(s)';
            tabelaTurnosSecaoBody.innerHTML = filtrados.length ? filtrados.map(turno => '<tr data-turno-id="' + escapeHtml(turno.ESCSECAOTURNO_ID || '') + '">' +
                '<td data-label="Seção">' + escapeHtml((turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '') + (turno.DESCR || '')) + '</td>' +
                '<td data-label="Colaboradores">' + escapeHtml(turno.QTDE_COLABORADORES || '') + '</td><td data-label="Entrada 1">' + escapeHtml(turno.HR_ENT1 || '') + '</td><td data-label="Saída 1">' + escapeHtml(turno.HR_SAI1 || '') + '</td><td data-label="Entrada 2">' + escapeHtml(turno.HR_ENT2 || '') + '</td><td data-label="Saída 2">' + escapeHtml(turno.HR_SAI2 || '') + '</td>' +
                '<td data-label="Ações" class="actions-cell"><button class="action-btn-table banco-action edit-turno-secao" data-id="' + escapeHtml(turno.ESCSECAOTURNO_ID || '') + '" data-loja="' + escapeHtml(turno.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button></td></tr>').join('') : '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhum turno encontrado.</td></tr>';
        };

        const carregarTurnosSecaoTela = async () => {
            const lojas = turnosSecaoLojaSelect?.value && turnosSecaoLojaSelect.value !== 'all' ? [Number(turnosSecaoLojaSelect.value)] : [...lojasPermitidasCache];
            const resultados = await Promise.all(lojas.map(async loja => {
                const data = await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/turnos-secao');
                return (data.turnos || []).map(turno => ({ ...turno, LOJA: loja }));
            }));
            turnosTelaCache = resultados.flat();
            popularFiltroSecoesTurnos();
            aplicarFiltrosTurnosTela();
        };

        turnosPesquisaInput?.addEventListener('input', aplicarFiltrosTurnosTela);
        turnosSecaoFiltro?.addEventListener('change', aplicarFiltrosTurnosTela);
        turnosSecaoLojaSelect?.addEventListener('change', () => carregarTurnosSecaoTela().catch(error => showInfoModal(error.message, 'error')));

        tabelaTurnosSecaoBody?.addEventListener('click', (event) => {
            const editButton = event.target.closest('.edit-turno-secao');
            if (!editButton) return;
            if (editButton.dataset.loja) turnosSecaoLojaSelect.value = editButton.dataset.loja;
            window.location.hash = `/turnos-secao/${editButton.dataset.id}`;
        });

        novoTurnoSecaoBtn?.addEventListener('click', () => {
            window.location.hash = '/turnos-secao/novo';
        });

        carregarTurnosSecaoBtn?.addEventListener('click', async () => {
            try {
                await carregarTurnosSecaoTela(true);
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        turnoSecaoForm?.addEventListener('submit', async (event) => {
            event.preventDefault();
            const loja = turnosSecaoLojaSelect?.value || lojaEscalaSelect.value;
            const turnoId = turnoSecaoFormId.value;
            const escsecaoId = turnoSecaoFormSecao.value;
            if (!loja || !lojasPermitidasCache.includes(Number(loja))) {
                showInfoModal('Selecione uma loja permitida para salvar o turno.', 'error');
                return;
            }
            if (!escsecaoId) {
                showInfoModal('Selecione uma seção para salvar o turno.', 'error');
                return;
            }

            try {
                const payload = {
                    ESCSECAO_ID: Number(escsecaoId),
                    QTDE_COLABORADORES: Number(turnoSecaoFormQtde.value),
                    HR_ENT1: turnoSecaoFormHrEnt1.value,
                    HR_SAI1: turnoSecaoFormHrSai1.value,
                    HR_ENT2: turnoSecaoFormHrEnt2.value,
                    HR_SAI2: turnoSecaoFormHrSai2.value
                };
                const url = turnoId
                    ? `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao/${encodeURIComponent(turnoId)}`
                    : `/api/catalog/lojas/${encodeURIComponent(loja)}/turnos-secao`;
                await apiRequest(url, {
                    method: turnoId ? 'PUT' : 'POST',
                    body: JSON.stringify(payload)
                });
                await carregarTurnosSecaoTela(false);
                showInfoModal('Turno salvo com sucesso.', 'success');
                window.location.hash = '/turnos-secao';
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const popularFiltrosFuncionarios = () => {
            const preencher = (select, values, label) => {
                if (!select) return;
                const atual = select.value || 'all';
                select.innerHTML = '<option value="all">Todas as ' + label + '</option>' + [...values].filter(Boolean).sort().map(value => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
                if ([...values].includes(atual)) select.value = atual;
            };
            preencher(funcionariosSecaoFiltro, new Set(funcionariosTelaCache.map(f => f.SECAO_DESCR || String(f.ESCSECAO_ID || ''))), 'seções');
            preencher(funcionariosFuncaoFiltro, new Set(funcionariosTelaCache.map(f => f.FUNCAO_DESCR || String(f.ESCFUNCAO_ID || ''))), 'funções');
        };

        const aplicarFiltrosFuncionariosTela = () => {
            const termo = normalizarTextoFiltro(funcionariosPesquisaInput?.value);
            const loja = funcionariosLojaSelect?.value || 'all';
            const secao = funcionariosSecaoFiltro?.value || 'all';
            const funcao = funcionariosFuncaoFiltro?.value || 'all';
            const filtrados = funcionariosTelaCache.filter(f => {
                const secaoNome = f.SECAO_DESCR || String(f.ESCSECAO_ID || '');
                const funcaoNome = f.FUNCAO_DESCR || String(f.ESCFUNCAO_ID || '');
                if (loja !== 'all' && String(f.LOJA) !== String(loja)) return false;
                if (secao !== 'all' && secaoNome !== secao) return false;
                if (funcao !== 'all' && funcaoNome !== funcao) return false;
                return !termo || normalizarTextoFiltro([f.NOME, f.CHAPA, secaoNome, funcaoNome].join(' ')).includes(termo);
            });
            funcionariosTitulo.textContent = filtrados.length + ' funcionário(s) encontrado(s)';
            tabelaFuncionariosBody.innerHTML = filtrados.length ? filtrados.map(f => '<tr data-escfunc-id="' + escapeHtml(f.ESCFUNC_ID || '') + '">' +
                '<td data-label="Chapa">' + escapeHtml(f.CHAPA || '') + '</td><td data-label="Nome">' + escapeHtml(f.NOME || '') + '</td><td data-label="Loja">' + escapeHtml(f.LOJA || '') + '</td><td data-label="Seção">' + escapeHtml(f.SECAO_DESCR || f.ESCSECAO_ID || '') + '</td><td data-label="Função">' + escapeHtml(f.FUNCAO_DESCR || f.ESCFUNCAO_ID || '') + '</td><td data-label="Brigadista">' + escapeHtml(f.BRIGADISTA || '') + '</td><td data-label="Entrada 1">' + escapeHtml(f.HR_ENT1 || '') + '</td><td data-label="Saída 1">' + escapeHtml(f.HR_SAI1 || '') + '</td><td data-label="Entrada 2">' + escapeHtml(f.HR_ENT2 || '') + '</td><td data-label="Saída 2">' + escapeHtml(f.HR_SAI2 || '') + '</td>' +
                '<td data-label="Ações" class="actions-cell"><button class="action-btn-table banco-action edit-funcionario" data-id="' + escapeHtml(f.ESCFUNC_ID || '') + '" data-loja="' + escapeHtml(f.LOJA || '') + '"><span class="material-symbols-outlined">edit</span>Editar</button></td></tr>').join('') : '<tr><td colspan="11" class="text-center text-gray-500 py-8">Nenhum funcionário encontrado.</td></tr>';
        };

        const carregarFuncionariosTela = async () => {
            const lojas = funcionariosLojaSelect?.value && funcionariosLojaSelect.value !== 'all' ? [Number(funcionariosLojaSelect.value)] : [...lojasPermitidasCache];
            const resultados = await Promise.all(lojas.map(async loja => {
                const data = await apiRequest('/api/catalog/lojas/' + encodeURIComponent(loja) + '/funcionarios');
                return data.funcionarios || [];
            }));
            funcionariosTelaCache = resultados.flat();
            funcionariosLojaCache = funcionariosTelaCache;
            popularFiltrosFuncionarios();
            aplicarFiltrosFuncionariosTela();
        };

        funcionariosPesquisaInput?.addEventListener('input', aplicarFiltrosFuncionariosTela);
        funcionariosSecaoFiltro?.addEventListener('change', aplicarFiltrosFuncionariosTela);
        funcionariosFuncaoFiltro?.addEventListener('change', aplicarFiltrosFuncionariosTela);
        funcionariosLojaSelect?.addEventListener('change', () => carregarFuncionariosTela().catch(error => showInfoModal(error.message, 'error')));

        tabelaFuncionariosBody.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-funcionario');
            if (!editButton) return;

            const funcionario = funcionariosTelaCache.find(item => Number(item.ESCFUNC_ID) === Number(editButton.dataset.id));
            const loja = funcionario?.LOJA;
            if (!loja || !funcionario) {
                showInfoModal('Funcionário não encontrado para edição.', 'error');
                return;
            }

            const values = await showInputModal({
                title: `Editar escala - ${funcionario.NOME}`,
                inputs: [
                    { label: 'Brigadista (S/N)', type: 'text', id: 'BRIGADISTA', value: funcionario.BRIGADISTA || '' },
                    { label: 'Entrada 1', type: 'time', id: 'HR_ENT1', value: funcionario.HR_ENT1 || '' },
                    { label: 'Saída 1', type: 'time', id: 'HR_SAI1', value: funcionario.HR_SAI1 || '' },
                    { label: 'Entrada 2', type: 'time', id: 'HR_ENT2', value: funcionario.HR_ENT2 || '' },
                    { label: 'Saída 2', type: 'time', id: 'HR_SAI2', value: funcionario.HR_SAI2 || '' }
                ],
                confirmText: 'Salvar'
            });

            if (!values) return;

            try {
                const payload = {
                    BRIGADISTA: String(values.BRIGADISTA || '').trim().toUpperCase().slice(0, 1),
                    HR_ENT1: values.HR_ENT1 || null,
                    HR_SAI1: values.HR_SAI1 || null,
                    HR_ENT2: values.HR_ENT2 || null,
                    HR_SAI2: values.HR_SAI2 || null
                };
                await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios/${encodeURIComponent(funcionario.ESCFUNC_ID)}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload)
                });
                await carregarFuncionariosDaLoja(true);
                await carregarFuncionariosTela(false);
                showInfoModal('Funcionário atualizado com sucesso.', 'success');
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });


        const carregarTiposDescansoCache = async (includeInactive = false) => {
            const data = await apiRequest('/api/catalog/tipos-descanso' + (includeInactive ? '?includeInactive=1' : ''));
            tiposDescansoCache = data.tipos || [];
            return tiposDescansoCache;
        };

        const renderizarTiposDescansoTela = () => {
            if (!tabelaTiposDescansoBody) return;
            const termo = normalizarTextoFiltro(tiposDescansoPesquisaInput?.value);
            const status = tiposDescansoStatusFiltro?.value || 'all';
            const rows = tiposDescansoCache.filter((tipo) => {
                const matchTermo = !termo || normalizarTextoFiltro((tipo.DESCR || "") + " " + (tipo.SIGLA || "")).includes(termo);
                const matchStatus = status === 'all' || String(tipo.STATUS) === status;
                return matchTermo && matchStatus;
            });
            tabelaTiposDescansoBody.innerHTML = rows.length ? rows.map((tipo) => `
                <tr>
                    <td data-label="ID">${escapeHtml(tipo.ESCTIPODESC_ID)}</td>
                    <td data-label="Descrição">${escapeHtml(tipo.DESCR || "")}</td>
                    <td data-label="Sigla"><span class="escala-status-chip pending-chip">${escapeHtml(tipo.SIGLA || "")}</span></td>
                    <td data-label="Status">${tipo.STATUS === "A" ? "Ativo" : "Inativo"}</td>
                    <td data-label="Ações" class="actions-cell">
                        <button class="action-btn-table banco-action editar-tipo-descanso" data-id="${escapeHtml(tipo.ESCTIPODESC_ID)}"><span class="material-symbols-outlined">edit</span>Editar</button>
                        <button class="action-btn-table banco-action danger-action toggle-tipo-descanso" data-id="${escapeHtml(tipo.ESCTIPODESC_ID)}" data-status="${escapeHtml(tipo.STATUS)}"><span class="material-symbols-outlined">block</span>${tipo.STATUS === "A" ? "Inativar" : "Reativar"}</button>
                    </td>
                </tr>`).join("") : '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhum tipo de descanso encontrado.</td></tr>';
        };

        const carregarTiposDescansoTela = async () => {
            await carregarTiposDescansoCache(true);
            renderizarTiposDescansoTela();
        };

        const abrirModalTipoDescanso = async (tipo = null) => {
            const values = await showInputModal({
                title: tipo ? "Editar Tipo de Descanso" : "Novo Tipo de Descanso",
                inputs: [
                    { label: "Descrição", type: "text", id: "TIPO_DESCR", value: tipo?.DESCR || "", required: true },
                    { label: "Sigla", type: "text", id: "TIPO_SIGLA", value: tipo?.SIGLA || "", required: true },
                    { label: "Status", type: "select", id: "TIPO_STATUS", value: tipo?.STATUS || "A", options: [{ value: "A", label: "Ativo" }, { value: "I", label: "Inativo" }], required: true }
                ],
                confirmText: "Salvar"
            });
            if (!values) return;
            const payload = { DESCR: values.TIPO_DESCR, SIGLA: String(values.TIPO_SIGLA || "").toUpperCase().slice(0, 3), STATUS: values.TIPO_STATUS };
            if (tipo) {
                await apiRequest(`/api/catalog/tipos-descanso/${encodeURIComponent(tipo.ESCTIPODESC_ID)}`, { method: "PATCH", body: JSON.stringify(payload) });
            } else {
                await apiRequest("/api/catalog/tipos-descanso", { method: "POST", body: JSON.stringify(payload) });
            }
            await carregarTiposDescansoTela();
            showInfoModal("Tipo de descanso salvo com sucesso.", "success");
        };

        const prepararFiltrosHistorico = (params = {}) => {
            if (historicoLojaSelect && historicoLojaSelect.options.length === 0) copiarOptionsSelect(escalasFiltroLoja || lojaEscalaSelect, historicoLojaSelect);
            if (historicoLojaSelect) historicoLojaSelect.value = params.lojaId || escalasFiltroLoja?.value || historicoLojaSelect.value || lojaEscalaSelect?.value;
            copiarOptionsSelect(mesSelect, historicoMesSelect, params.mesRef ? String(new Date(params.mesRef + "T00:00:00").getMonth()) : (escalasFiltroMes?.value || mesSelect?.value));
            copiarOptionsSelect(anoSelect, historicoAnoSelect, params.mesRef ? String(new Date(params.mesRef + "T00:00:00").getFullYear()) : (escalasFiltroAno?.value || anoSelect?.value));
        };

        const aplicarFiltroHistoricoTela = () => {
            if (!tabelaHistoricoBody) return;
            const termo = normalizarTextoFiltro(historicoPesquisaInput?.value);
            const rows = historicoCache.filter((item) => !termo || normalizarTextoFiltro([item.ACAO, item.NOME_USUARIO, item.LOGIN, item.DETALHE].join(" ")).includes(termo));
            if (historicoResumo) historicoResumo.textContent = rows.length + " registro(s) encontrado(s).";
            tabelaHistoricoBody.innerHTML = rows.length ? rows.map((item) => `
                <tr>
                    <td data-label="Data">${formatarDataTabela(item.DT_HR_INCL)}</td>
                    <td data-label="Ação">${escapeHtml(item.ACAO || "-")}</td>
                    <td data-label="Loja">${item.LOJA ? "Loja " + escapeHtml(item.LOJA) : "-"}</td>
                    <td data-label="Mês">${item.MES_REF ? getNomeMesTabela(item.MES_REF) + " " + String(item.MES_REF).slice(0,4) : "-"}</td>
                    <td data-label="Revisão">${escapeHtml(item.REVISAO ?? "-")}</td>
                    <td data-label="Usuário">${escapeHtml(item.NOME_USUARIO || item.LOGIN || "Sistema")}</td>
                    <td data-label="Detalhe">${escapeHtml(item.DETALHE || "-")}</td>
                </tr>`).join("") : '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhum histórico encontrado.</td></tr>';
        };

        const carregarHistoricoTela = async () => {
            if (!historicoLojaSelect || !historicoMesSelect || !historicoAnoSelect) return;
            const loja = historicoLojaSelect.value && historicoLojaSelect.value !== "all" ? historicoLojaSelect.value : "";
            const mesRef = historicoMesSelect.value !== "all" && historicoAnoSelect.value !== "all" ? formatDateForDb(Number(historicoAnoSelect.value), Number(historicoMesSelect.value), 1) : "";
            const params = new URLSearchParams();
            if (loja) params.set("lojaId", loja);
            if (mesRef) params.set("mesRef", mesRef);
            const data = await apiRequest("/api/escalas/historico" + (params.toString() ? "?" + params.toString() : ""));
            historicoCache = data.historico || [];
            aplicarFiltroHistoricoTela();
        };
        const prepararFiltrosEscalaFuncionarios = () => {
            if (!escalaFuncionarioMes || !escalaFuncionarioAno) return;
            if (!escalaFuncionarioMes.options.length) copiarOptionsSelect(mesSelect, escalaFuncionarioMes, String(new Date().getMonth()));
            if (!escalaFuncionarioAno.options.length) copiarOptionsSelect(anoSelect, escalaFuncionarioAno, String(new Date().getFullYear()));
        };

        const getMesRefEscalaFuncionario = () => formatDateForDb(Number(escalaFuncionarioAno.value), Number(escalaFuncionarioMes.value), 1);

        const aplicarFiltroListaEscalaFuncionarios = () => {
            const termo = normalizarTextoFiltro(escalaFuncionarioPesquisa?.value);
            const rows = escalasFuncionariosCache.filter(item => !termo || normalizarTextoFiltro(item.nome + ' ' + item.chapa).includes(termo));
            escalaFuncionarioListaResumo.textContent = rows.length + ' funcionário(s) com escala no período.';
            tabelaEscalaFuncionariosBody.innerHTML = rows.length ? rows.map(item => '<tr><td>' + escapeHtml(item.chapa) + '</td><td>' + escapeHtml(item.nome) + '</td><td>Loja ' + escapeHtml(item.loja) + '</td><td>' + escapeHtml(item.secao) + '</td><td>' + escapeHtml(item.funcao) + '</td><td><span class="escala-status-chip ' + getStatusClassEscala(item.status) + '">' + escapeHtml(item.status) + '</span></td><td class="actions-cell"><button class="action-btn-table banco-action editar-escala-funcionario" data-escfunc-id="' + escapeHtml(item.escfuncId) + '" data-loja="' + escapeHtml(item.loja) + '" data-mes-ref="' + escapeHtml(item.mesRef) + '"><span class="material-symbols-outlined">edit_calendar</span>Editar</button></td></tr>').join('') : '<tr><td colspan="7" class="text-center text-gray-500 py-8">Nenhum funcionário com escala encontrado.</td></tr>';
        };

        const carregarEscalasFuncionarios = async () => {
            prepararFiltrosEscalaFuncionarios();
            const mesRef = getMesRefEscalaFuncionario();
            const lojas = escalaFuncionarioLoja?.value && escalaFuncionarioLoja.value !== 'all' ? [Number(escalaFuncionarioLoja.value)] : [...lojasPermitidasCache];
            tabelaEscalaFuncionariosBody.innerHTML = '<tr><td colspan="8" class="text-center text-gray-500 py-8">Carregando...</td></tr>';
            const resultados = await Promise.all(lojas.map(async loja => {
                const data = await apiRequest('/api/escalas/mensal?lojaId=' + encodeURIComponent(loja) + '&mesRef=' + encodeURIComponent(mesRef));
                const escala = data.escala || {};
                const grupos = new Map();
                (escala.dias || []).forEach(dia => {
                    const key = String(dia.ESCFUNC_ID || dia.CHAPA || '');
                    if (!grupos.has(key)) grupos.set(key, { escfuncId: dia.ESCFUNC_ID, chapa: dia.CHAPA, nome: dia.NOME || dia.CHAPA, loja, secao: dia.SECAO_DESCR || dia.COD_SECAO || '', funcao: dia.FUNCAO_DESCR || '', status: escala.status || '-', revisao: dia.REVISAO ?? escala.revisao ?? '-', mesRef });
                });
                return [...grupos.values()];
            }));
            escalasFuncionariosCache = resultados.flat().sort((a,b)=>a.nome.localeCompare(b.nome));
            aplicarFiltroListaEscalaFuncionarios();
        };

        [escalaFuncionarioLoja, escalaFuncionarioMes, escalaFuncionarioAno].forEach(select => select?.addEventListener('change', () => carregarEscalasFuncionarios().catch(error => showInfoModal(error.message, 'error'))));
        escalaFuncionarioPesquisa?.addEventListener('input', aplicarFiltroListaEscalaFuncionarios);
        tabelaEscalaFuncionariosBody?.addEventListener('click', event => {
            const button = event.target.closest('.editar-escala-funcionario');
            if (button) window.location.hash = '/escala-funcionario/' + button.dataset.escfuncId + '/' + button.dataset.loja + '/' + button.dataset.mesRef;
        });
        voltarEscalaFuncionariosBtn?.addEventListener('click', () => { window.location.hash = '/escalas-funcionarios'; });


        const isProgramacaoDescanso = (programacao) => String(programacao || 'TRB').toUpperCase() !== 'TRB';
        const getValorDescanso = (dia) => String(dia?.PROGRAMACAO || 'F').toUpperCase();

        const getTurnosFuncionarioAtual = () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return [];
            return (turnosSecaoCache || []).filter(turno => Number(turno.ESCSECAO_ID) === Number(atual.escsecaoId));
        };

        const renderizarEscalaFuncionarioEdicao = () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const ref = new Date(atual.mesRef + 'T00:00:00');
            const diasNoMes = new Date(ref.getFullYear(), ref.getMonth() + 1, 0).getDate();
            const diasSemana = ['D','S','T','Q','Q','S','S'];
            const map = new Map(atual.dias.map(dia => [Number(String(dia.DT).slice(8,10)), dia]));
            const fields = [{key:'HR_ENT1',label:'ENT.'},{key:'HR_SAI1',label:'SAI.INT.'},{key:'INTERVALO',label:'INTER.'},{key:'HR_ENT2',label:'RET.INT.'},{key:'HR_SAI2',label:'SAI.'},{key:'TRABALHADAS',label:'H.TRAB'}];
            let table = '<article class="bank-employee-scale"><header><div><h3>' + escapeHtml(atual.nome) + '</h3><p>' + escapeHtml(atual.chapa + ' | ' + atual.secao + ' | ' + atual.funcao) + '</p></div></header><div class="bank-scale-scroll"><table><thead><tr><th>D.SEM</th>';
            for(let d=1;d<=diasNoMes;d++) table += '<th>' + diasSemana[new Date(ref.getFullYear(),ref.getMonth(),d).getDay()] + '</th>';
            table += '</tr><tr><th>DIA</th>'; for(let d=1;d<=diasNoMes;d++) table += '<th>' + d + '</th>'; table += '</tr></thead><tbody>';
            fields.forEach(field => {
                table += '<tr><th>' + field.label + '</th>';
                for(let d=1;d<=diasNoMes;d++){
                    const dia=map.get(d);
                    if(!dia){table+='<td>-</td>';continue;}
                    const descanso=isProgramacaoDescanso(dia.PROGRAMACAO);
                    let value=getValorDescanso(dia);
                    if(!descanso){
                        if(field.key==='INTERVALO') value=minutesToTime(Math.max(0,timeToMinutes(dia.HR_ENT2)-timeToMinutes(dia.HR_SAI1)));
                        else if(field.key==='TRABALHADAS') value=minutesToTime(Math.max(0,(timeToMinutes(dia.HR_SAI2)-timeToMinutes(dia.HR_ENT1))-(timeToMinutes(dia.HR_ENT2)-timeToMinutes(dia.HR_SAI1))));
                        else value=dia[field.key]||'--';
                    }
                    const domingo=new Date(ref.getFullYear(),ref.getMonth(),d).getDay()===0;
                    const cls=descanso?(domingo?'day-off sunday':'day-off'):(domingo?'sunday':'');
                    const editable=!['INTERVALO','TRABALHADAS'].includes(field.key);
                    table+='<td class="'+cls+'">'+(editable?'<button class="bank-day-edit funcionario-dia-edit" data-dia="'+d+'">'+escapeHtml(value)+'</button>':escapeHtml(value))+'</td>';
                }
                table+='</tr>';
            });
            escalaFuncionarioDetalhadaContent.innerHTML = table + '</tbody></table></div></article>';
        };

        const sincronizarFiltrosEdicaoFuncionario = (mesRef) => {
            if (!escalaFuncionarioEdicaoMes || !escalaFuncionarioEdicaoAno) return;
            if (!escalaFuncionarioEdicaoMes.options.length) copiarOptionsSelect(mesSelect, escalaFuncionarioEdicaoMes);
            if (!escalaFuncionarioEdicaoAno.options.length) copiarOptionsSelect(anoSelect, escalaFuncionarioEdicaoAno);
            const data = new Date(mesRef + 'T00:00:00');
            escalaFuncionarioEdicaoMes.value = String(data.getMonth());
            escalaFuncionarioEdicaoAno.value = String(data.getFullYear());
        };

        const carregarEscalaFuncionarioEdicao = async (escfuncId, lojaId, mesRef) => {
            sincronizarFiltrosEdicaoFuncionario(mesRef);
            const data = await apiRequest('/api/escalas/mensal?lojaId=' + encodeURIComponent(lojaId) + '&mesRef=' + encodeURIComponent(mesRef));
            const escala = data.escala || {};
            const dias = (escala.dias || []).filter(dia => String(dia.ESCFUNC_ID) === String(escfuncId)).map(dia => ({...dia}));
            if (!dias.length) throw new Error('Escala do funcionário não encontrada.');
            const base=dias[0];
            escalaFuncionarioEdicaoAtual={escfuncId:Number(escfuncId),lojaId:Number(lojaId),mesRef,status:escala.status,revisao:escala.revisao,chapa:base.CHAPA,nome:base.NOME||base.CHAPA,secao:base.SECAO_DESCR||base.COD_SECAO||'',funcao:base.FUNCAO_DESCR||'',escsecaoId:base.ESCSECAO_ID,escfuncaoId:base.ESCFUNCAO_ID,dias};
            escalaFuncionarioEdicaoTitulo.textContent='Escala - '+escalaFuncionarioEdicaoAtual.nome;
            escalaFuncionarioEdicaoResumo.textContent='Loja '+lojaId+' | '+getNomeMesTabela(mesRef)+' '+mesRef.slice(0,4)+' | Revisão '+escala.revisao+' | '+escala.status;
            const finalizada=escala.status==='FINALIZADA';
            [distribuirFolgasFuncionarioBtn,salvarEscalaFuncionarioBtn].forEach(btn=>{if(btn)btn.disabled=finalizada;});
            await carregarTiposDescansoCache(false);
            const lojaTurnoAtual = turnosSecaoLojaSelect?.value;
            if (!turnosSecaoCache.length || String(lojaTurnoAtual || '') !== String(lojaId)) {
                if (turnosSecaoLojaSelect) turnosSecaoLojaSelect.value = String(lojaId);
                await carregarTurnosSecaoDaLoja(true);
            }
            renderizarEscalaFuncionarioEdicao();
        };

        [escalaFuncionarioEdicaoMes, escalaFuncionarioEdicaoAno].forEach(select => select?.addEventListener('change', () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual || !escalaFuncionarioEdicaoMes || !escalaFuncionarioEdicaoAno) return;
            const novoMesRef = formatDateForDb(Number(escalaFuncionarioEdicaoAno.value), Number(escalaFuncionarioEdicaoMes.value), 1);
            window.location.hash = '/escala-funcionario/' + atual.escfuncId + '/' + atual.lojaId + '/' + novoMesRef;
        }));

        const aplicarEdicaoDiasFuncionario = (inicio, fim, values) => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const diaInicio = Math.min(Number(inicio), Number(fim));
            const diaFim = Math.max(Number(inicio), Number(fim));
            const tipoDia = values.IND_TIPO_DIA || 'TRABALHO';
            const descansoSigla = String(values.IND_TIPO_DESCANSO || 'F').toUpperCase();
            const turnoSelecionado = getTurnosFuncionarioAtual().find(turno => String(turno.ESCSECAOTURNO_ID) === String(values.IND_TURNO_ID));
            atual.dias.forEach((dia) => {
                const numeroDia = Number(String(dia.DT).slice(8,10));
                if (numeroDia < diaInicio || numeroDia > diaFim) return;
                if (tipoDia === 'DESCANSO') {
                    dia.PROGRAMACAO = descansoSigla;
                    dia.HR_ENT1 = descansoSigla;
                    dia.HR_SAI1 = descansoSigla;
                    dia.HR_ENT2 = descansoSigla;
                    dia.HR_SAI2 = descansoSigla;
                    return;
                }
                dia.PROGRAMACAO = 'TRB';
                if (values.IND_MODO_TRABALHO === 'TURNO' && turnoSelecionado) {
                    dia.HR_ENT1 = turnoSelecionado.HR_ENT1;
                    dia.HR_SAI1 = turnoSelecionado.HR_SAI1;
                    dia.HR_ENT2 = turnoSelecionado.HR_ENT2;
                    dia.HR_SAI2 = turnoSelecionado.HR_SAI2;
                } else {
                    dia.HR_ENT1 = values.IND_HR_ENT1;
                    dia.HR_SAI1 = values.IND_HR_SAI1;
                    dia.HR_ENT2 = values.IND_HR_ENT2;
                    dia.HR_SAI2 = values.IND_HR_SAI2;
                }
            });
            renderizarEscalaFuncionarioEdicao();
        };

        escalaFuncionarioDetalhadaContent?.addEventListener('click', async event => {
            const button=event.target.closest('.funcionario-dia-edit');
            if(!button||!escalaFuncionarioEdicaoAtual)return;
            const dia=escalaFuncionarioEdicaoAtual.dias.find(item=>Number(String(item.DT).slice(8,10))===Number(button.dataset.dia));
            if(!dia)return;
            const numeroDia = Number(button.dataset.dia);
            if (!tiposDescansoCache.length) await carregarTiposDescansoCache(false);
            const turnos = getTurnosFuncionarioAtual();
            const tipoOptions = tiposDescansoCache.filter(tipo => tipo.STATUS !== 'I').map(tipo => ({ value: tipo.SIGLA, label: tipo.DESCR + ' (' + tipo.SIGLA + ')' }));
            const turnoOptions = turnos.map(turno => ({ value: turno.ESCSECAOTURNO_ID, label: (turno.DESCR || 'Turno') + ' | ' + turno.HR_ENT1 + '-' + turno.HR_SAI1 + ' / ' + turno.HR_ENT2 + '-' + turno.HR_SAI2 }));
            const values=await showInputModal({
                title:'Editar dia '+formatarDataTabela(dia.DT),
                inputs:[
                    {label:'Aplicar do dia',type:'number',id:'IND_DIA_INICIO',value:String(numeroDia),required:true},
                    {label:'Aplicar at? o dia',type:'number',id:'IND_DIA_FIM',value:String(numeroDia),required:true},
                    {label:'Tipo do dia',type:'select',id:'IND_TIPO_DIA',value:isProgramacaoDescanso(dia.PROGRAMACAO)?'DESCANSO':'TRABALHO',options:[{value:'TRABALHO',label:'Trabalho'},{value:'DESCANSO',label:'Descanso'}],required:true},
                    {label:'Tipo de descanso',type:'select',id:'IND_TIPO_DESCANSO',value:isProgramacaoDescanso(dia.PROGRAMACAO)?getValorDescanso(dia):'F',options:tipoOptions.length?tipoOptions:[{value:'F',label:'Folga (F)'}]},
                    {label:'Modo de trabalho',type:'select',id:'IND_MODO_TRABALHO',value:'MANUAL',options:[{value:'TURNO',label:'Selecionar turno'},{value:'MANUAL',label:'Inserir manual'}]},
                    {label:'Turno da seção',type:'select',id:'IND_TURNO_ID',value:turnoOptions[0]?.value || '',options:turnoOptions.length?turnoOptions:[{value:'',label:'Nenhum turno cadastrado'}]},
                    {label:'Entrada 1',type:'time',id:'IND_HR_ENT1',value:isProgramacaoDescanso(dia.PROGRAMACAO)?'':dia.HR_ENT1||''},
                    {label:'Saída 1',type:'time',id:'IND_HR_SAI1',value:isProgramacaoDescanso(dia.PROGRAMACAO)?'':dia.HR_SAI1||''},
                    {label:'Entrada 2',type:'time',id:'IND_HR_ENT2',value:isProgramacaoDescanso(dia.PROGRAMACAO)?'':dia.HR_ENT2||''},
                    {label:'Saída 2',type:'time',id:'IND_HR_SAI2',value:isProgramacaoDescanso(dia.PROGRAMACAO)?'':dia.HR_SAI2||''}
                ],
                confirmText:'Aplicar'
            });
            if(!values)return;
            aplicarEdicaoDiasFuncionario(values.IND_DIA_INICIO, values.IND_DIA_FIM, values);
        });

        const distribuirFolgasFuncionario = () => {
            const atual = escalaFuncionarioEdicaoAtual;
            if (!atual) return;
            const dias = [...atual.dias].sort((a,b) => String(a.DT).localeCompare(String(b.DT)));
            const horarioBase = dias.find(d => !isProgramacaoDescanso(d.PROGRAMACAO) && d.HR_ENT1 !== 'F') || { HR_ENT1:'08:00', HR_SAI1:'12:00', HR_ENT2:'13:00', HR_SAI2:'16:20' };
            dias.forEach(d => { d.PROGRAMACAO='TRB'; d.HR_ENT1=horarioBase.HR_ENT1; d.HR_SAI1=horarioBase.HR_SAI1; d.HR_ENT2=horarioBase.HR_ENT2; d.HR_SAI2=horarioBase.HR_SAI2; });
            const semanas = new Map();
            dias.forEach(dia => {
                const data = new Date(String(dia.DT).slice(0,10) + 'T00:00:00');
                const segunda = new Date(data); segunda.setDate(data.getDate() - ((data.getDay()+6)%7));
                const key = segunda.toISOString().slice(0,10);
                if (!semanas.has(key)) semanas.set(key, []);
                semanas.get(key).push({dia,data});
            });
            [...semanas.values()].forEach((semana,index) => {
                const disponiveis = semana.sort((a,b)=>a.data-b.data);
                if (!disponiveis.length) return;
                const domingo = disponiveis.find(item => item.data.getDay()===0);
                const folgas = [];
                if (domingo && index % 3 === Number(atual.escfuncId) % 3) folgas.push(domingo);
                const weekdays = disponiveis.filter(item => item.data.getDay()!==0);
                const candidatos = [Number(atual.escfuncId)+index, Number(atual.escfuncId)+index+3, Number(atual.escfuncId)+index+1];
                candidatos.forEach(seed => { if (folgas.length>=2 || !weekdays.length) return; const item=weekdays[seed%weekdays.length]; if (!folgas.includes(item)) folgas.push(item); });
                if (folgas.length<2) disponiveis.forEach(item=>{if(folgas.length<2&&!folgas.includes(item))folgas.push(item);});
                folgas.forEach(({dia}) => { dia.PROGRAMACAO='F'; dia.HR_ENT1=dia.HR_SAI1=dia.HR_ENT2=dia.HR_SAI2='F'; });
            });
            let consecutivos=0;
            dias.forEach(dia => { if(isProgramacaoDescanso(dia.PROGRAMACAO)){consecutivos=0;return;} consecutivos++; if(consecutivos>5){dia.PROGRAMACAO='F';dia.HR_ENT1=dia.HR_SAI1=dia.HR_ENT2=dia.HR_SAI2='F';consecutivos=0;} });
            renderizarEscalaFuncionarioEdicao();
            showInfoModal('Folgas 5x2 distribu?das. Revise e valide antes de salvar.','success');
        };
        distribuirFolgasFuncionarioBtn?.addEventListener('click',distribuirFolgasFuncionario);

        const validarEscalaFuncionarioAtual = () => {
            const atual=escalaFuncionarioEdicaoAtual;if(!atual)return false; const errors=[]; let consecutivos=0;
            [...atual.dias].sort((a,b)=>String(a.DT).localeCompare(String(b.DT))).forEach(dia=>{if(isProgramacaoDescanso(dia.PROGRAMACAO)){consecutivos=0;return;} consecutivos++; if(consecutivos>Number(regraMaxDiasConsecutivosInput.value||7))errors.push('Mais de '+regraMaxDiasConsecutivosInput.value+' dias consecutivos em '+formatarDataTabela(dia.DT)+'.'); errors.push(...validarTurnoSimples({inicio:dia.HR_ENT1,inicioIntervalo:dia.HR_SAI1,fimIntervalo:dia.HR_ENT2,fim:dia.HR_SAI2}).map(e=>formatarDataTabela(dia.DT)+': '+e));});
            showInfoModal(errors.length?errors:'A escala do funcionário foi validada com sucesso.',errors.length?'error':'success'); return errors.length===0;
        };
        validarEscalaFuncionarioBtn?.addEventListener('click',validarEscalaFuncionarioAtual);
        imprimirEscalaFuncionarioBtn?.addEventListener('click',()=>{if(!escalaFuncionarioEdicaoAtual)return;printContainer.innerHTML='<div class="print-title">Escala - '+escapeHtml(escalaFuncionarioEdicaoAtual.nome)+'</div>'+escalaFuncionarioDetalhadaContent.innerHTML+'<div class="print-aware-line">Ciente: ___________________________________________ &nbsp;&nbsp; Data: ____/____/________</div>';window.print();});

        salvarEscalaFuncionarioBtn?.addEventListener('click',async()=>{const atual=escalaFuncionarioEdicaoAtual;if(!atual||!validarEscalaFuncionarioAtual())return; const funcionario={escfuncId:atual.escfuncId,chapa:atual.chapa,escsecaoId:atual.escsecaoId,escfuncaoId:atual.escfuncaoId,dias:atual.dias.map(d=>{const descanso=isProgramacaoDescanso(d.PROGRAMACAO);const sigla=getValorDescanso(d);return{data:String(d.DT).slice(0,10),hrEnt1:descanso?null:d.HR_ENT1,hrSai1:descanso?null:d.HR_SAI1,hrEnt2:descanso?null:d.HR_ENT2,hrSai2:descanso?null:d.HR_SAI2,programacao:descanso?sigla:'TRB'};})}; salvarEscalaFuncionarioBtn.disabled=true;try{await apiRequest('/api/escalas/funcionario/revisao',{method:'POST',body:JSON.stringify({lojaId:atual.lojaId,mesRef:atual.mesRef,funcionarios:[funcionario],oficializada:0})});showInfoModal('Escala do funcionário salva em uma nova revisão.','success');await carregarEscalaFuncionarioEdicao(atual.escfuncId,atual.lojaId,atual.mesRef);}catch(error){showInfoModal(error.details?error.details.join(' '):error.message,'error');}finally{salvarEscalaFuncionarioBtn.disabled=false;}});

        const renderizarAcessosTela = (usuarios) => {
            tabelaAcessosBody.innerHTML = '';

            if (!usuarios || usuarios.length === 0) {
                tabelaAcessosBody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhum usuário encontrado.</td></tr>';
                return;
            }

            usuarios.forEach(usuario => {
                const statusLabel = usuario.STATUS === 'A' ? 'Ativo' : 'Inativo';
                const lojas = Array.isArray(usuario.LOJAS) ? usuario.LOJAS.join(', ') : '';
                const isAdmin = usuarioSessaoCache?.perfil === 'ADMIN';
                const row = `
                    <tr data-usuario-id="${usuario.USUARIO_ID}">
                        <td data-label="Login">${usuario.LOGIN || ''}</td>
                        <td data-label="Nome">${usuario.NOME || ''}</td>
                        <td data-label="Perfil de Acesso">${usuario.PERFIL || ''}</td>
                        <td data-label="Status">${statusLabel}</td>
                        <td data-label="Lojas Permitidas">
                            <span>${lojas}</span>
                            ${isAdmin ? `<div class="actions-cell mt-2">
                                <button class="action-btn-table edit-usuario" data-id="${usuario.USUARIO_ID}" title="Editar usuário">
                                    <span class="material-symbols-outlined">edit</span>
                                    Editar
                                </button>
                                <button class="action-btn-table toggle-usuario" data-id="${usuario.USUARIO_ID}" data-status="${usuario.STATUS}" title="Alterar status">
                                    <span class="material-symbols-outlined">block</span>
                                    ${usuario.STATUS === 'A' ? 'Inativar' : 'Reativar'}
                                </button>
                            </div>` : ''}
                        </td>
                    </tr>
                `;
                tabelaAcessosBody.innerHTML += row;
            });
        };

        const carregarAcessosTela = async (showSuccess = true) => {
            const data = await apiRequest('/api/acessos/usuarios');
            usuariosAcessoCache = data.usuarios || [];
            renderizarAcessosTela(usuariosAcessoCache);
            if (showSuccess) {
                showInfoModal(`${(data.usuarios || []).length} usuário(s) carregado(s).`, 'success');
            }
        };

        tabelaAcessosBody.addEventListener('click', async (event) => {
            const editButton = event.target.closest('.edit-usuario');
            const toggleButton = event.target.closest('.toggle-usuario');
            const actionButton = editButton || toggleButton;
            if (!actionButton) return;

            const usuario = usuariosAcessoCache.find(item => Number(item.USUARIO_ID) === Number(actionButton.dataset.id));
            if (!usuario) {
                showInfoModal('Usuário não encontrado.', 'error');
                return;
            }

            try {
                if (toggleButton) {
                    const novoStatus = usuario.STATUS === 'A' ? 'I' : 'A';
                    await apiRequest(`/api/acessos/usuarios/${encodeURIComponent(usuario.USUARIO_ID)}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ STATUS: novoStatus })
                    });
                    await carregarAcessosTela(false);
                    showInfoModal(novoStatus === 'A' ? 'Usuário reativado.' : 'Usuário inativado.', 'success');
                    return;
                }

                const perfilOptions = await getPerfilAcessoOptions(usuario.PERFIL || 'OPERADOR');
                const values = await showInputModal({
                    title: `Editar usuário - ${usuario.LOGIN}`,
                    inputs: [
                        { label: 'Nome', type: 'text', id: 'NOME', value: usuario.NOME || '', required: true },
                        { label: 'Perfil de Acesso', type: 'select', id: 'PERFIL', value: usuario.PERFIL || perfilOptions[0]?.value || 'OPERADOR', options: perfilOptions, required: true },
                        { label: 'Status', type: 'select', id: 'STATUS', value: usuario.STATUS || 'A', options: [{ value: 'A', label: 'Ativo' }, { value: 'I', label: 'Inativo' }], required: true },
                        { label: 'Lojas permitidas', type: 'checkbox-group', id: 'LOJAS', value: (usuario.LOJAS || []).map(String), options: getLojasPermitidasOptions(usuario.LOJAS || []), required: true }
                    ],
                    confirmText: 'Salvar'
                });
                if (!values) return;

                await apiRequest(`/api/acessos/usuarios/${encodeURIComponent(usuario.USUARIO_ID)}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        NOME: values.NOME,
                        PERFIL: values.PERFIL,
                        STATUS: values.STATUS,
                        LOJAS: (values.LOJAS || []).map(loja => Number(loja)).filter(Boolean)
                    })
                });
                if (String(usuario.USUARIO_ID) === String(usuarioSessaoCache?.sub)) {
                    await carregarUsuarioSessao();
                    await carregarLojasEscala();
                    await carregarFuncionariosDaLoja(false);
                }
                await carregarAcessosTela(false);
                showInfoModal('Usuário atualizado com sucesso.', 'success');
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const carregarAusenciasDaLoja = async (lojaInformada = '') => {
            const loja = lojaInformada || lojaEscalaSelect.value;
            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);
            if (!loja || Number.isNaN(ano) || Number.isNaN(mes)) {
                ausenciasLojaCache = [];
                return [];
            }

            const inicio = formatDateForDb(ano, mes, 1);
            const fim = formatDateForDb(ano, mes, new Date(ano, mes + 1, 0).getDate());
            const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/ausencias?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`);
            ausenciasLojaCache = data.ausencias || [];
            return ausenciasLojaCache;
        };

        const ausenciaCobreDia = (ausencia, dataIso) => {
            const inicio = String(ausencia.DT_INIC || '').slice(0, 10);
            const fim = String(ausencia.DT_FIM || ausencia.DT_INIC || '').slice(0, 10);
            return inicio <= dataIso && fim >= dataIso;
        };

        const encontrarAusenciaFuncionario = (escfuncId, chapa, dataIso) => {
            return ausenciasLojaCache.find(ausencia => {
                const mesmoFuncionario = Number(ausencia.ESCFUNC_ID) === Number(escfuncId) || String(ausencia.CHAPA) === String(chapa);
                return mesmoFuncionario && ausenciaCobreDia(ausencia, dataIso);
            });
        };

        const marcarCelulaFolgaAusencia = (cell, isSunday, motivo) => {
            cell.textContent = 'F';
            cell.dataset.ausenciaObrigatoria = '1';
            cell.title = `Ausência: ${motivo || 'ausência'}`;
            cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');
            if (isSunday) {
                cell.classList.add('bg-orange-600', 'text-white', 'font-bold');
            } else {
                cell.classList.add('bg-red-300', 'text-white', 'font-bold');
            }
        };

        const aplicarAusenciasNoEsqueleto = () => {
            const table = document.getElementById('tabela-esqueleto');
            if (!table || ausenciasLojaCache.length === 0) return [];

            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);
            const mensagens = [];

            table.querySelectorAll('tbody tr').forEach(row => {
                const escfuncId = row.dataset.escfuncId;
                const chapa = row.dataset.chapa;
                const nome = row.querySelector('.collaborator-name-span')?.textContent || chapa;
                if (!escfuncId && !chapa) return;

                row.querySelectorAll('.escala-cell').forEach(cell => {
                    const dia = parseInt(cell.dataset.dia, 10);
                    const dataIso = formatDateForDb(ano, mes, dia);
                    const ausencia = encontrarAusenciaFuncionario(escfuncId, chapa, dataIso);
                    if (!ausencia) return;

                    const isSunday = new Date(ano, mes, dia).getDay() === 0;
                    marcarCelulaFolgaAusencia(cell, isSunday, ausencia.MOTIVO);
                    mensagens.push(`${nome}: folga obrigatória em ${dataIso} (${ausencia.MOTIVO || 'ausência'}).`);
                });
            });

            atualizarContagemEsqueleto();
            return mensagens;
        };

        const aplicarAusenciasNaDetalhada = () => {
            if (ausenciasLojaCache.length === 0) return [];

            const ano = parseInt(anoSelect.value, 10);
            const mes = parseInt(mesSelect.value, 10);
            const mensagens = [];

            detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada').forEach(colabDiv => {
                const escfuncId = colabDiv.dataset.escfuncId;
                const chapa = colabDiv.dataset.chapa;
                const nome = colabDiv.querySelector('h3')?.textContent || chapa;
                if (!escfuncId && !chapa) return;

                const diasNoMes = colabDiv.querySelector('thead tr:last-child').children.length - 1;
                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const dataIso = formatDateForDb(ano, mes, dia);
                    const ausencia = encontrarAusenciaFuncionario(escfuncId, chapa, dataIso);
                    if (!ausencia) continue;

                    const isSunday = new Date(ano, mes, dia).getDay() === 0;
                    colabDiv.querySelectorAll('tbody tr').forEach(row => {
                        const cell = row.cells[dia];
                        if (!cell) return;
                        cell.textContent = 'F';
                        cell.removeAttribute('contenteditable');
                        cell.dataset.ausenciaObrigatoria = '1';
                        cell.title = `Ausência: ${ausencia.MOTIVO || 'ausência'}`;
                        cell.classList.remove('bg-yellow-100', 'bg-red-100', 'bg-orange-500', 'text-white');
                        if (isSunday) {
                            cell.classList.add('bg-orange-500', 'text-white');
                        } else {
                            cell.classList.add('bg-red-100');
                        }
                    });
                    mensagens.push(`${nome}: folga obrigatória em ${dataIso} (${ausencia.MOTIVO || 'ausência'}).`);
                }
            });

            return mensagens;
        };

        const carregarFuncionariosDaLoja = async (silent = false, lojaInformada = '') => {
            const loja = lojaInformada || lojaEscalaSelect.value;
            if (!loja) {
                funcionariosLojaCache = [];
                ausenciasLojaCache = [];
                funcionariosStatus.textContent = 'Nenhuma loja selecionada';
                atualizarContadoresHome();
                return [];
            }

            funcionariosStatus.textContent = 'Carregando...';
            try {
                const data = await apiRequest(`/api/catalog/lojas/${encodeURIComponent(loja)}/funcionarios`);
                funcionariosLojaCache = data.funcionarios || [];
                await carregarAusenciasDaLoja(loja);
                aplicarAusenciasNoEsqueleto();
                atualizarContadoresHome();
                funcionariosStatus.textContent = `${funcionariosLojaCache.length} funcionário(s), ${ausenciasLojaCache.length} ausência(s)`;
                if (!silent) {
                    showInfoModal(`${funcionariosLojaCache.length} funcionário(s) carregado(s) da loja ${loja}.`, 'success');
                }
                return funcionariosLojaCache;
            } catch (error) {
                funcionariosLojaCache = [];
                funcionariosStatus.textContent = 'Erro ao carregar';
                atualizarContadoresHome();
                if (!silent) {
                    showInfoModal(error.message, 'error');
                }
                return [];
            }
        };

        const getEscalasSalvas = () => {
            return escalasSalvasCache;
        };

        const salvarEscalasNoStorage = async (escalas) => {
            escalasSalvasCache = Array.isArray(escalas) ? escalas : [];
            await apiRequest('/api/state/escalas', {
                method: 'PUT',
                body: JSON.stringify({ escalasSalvas: escalasSalvasCache })
            });
        };

        const contarFuncionariosEscalaSalva = (escala) => {
            return (escala.dados || []).filter(colaborador => colaborador.escfuncId && colaborador.chapa).length;
        };

        const criarResumoEscalaSalva = (escala) => {
            const loja = escala.lojaId || '-';
            const mes = escala.mesAno || (Number.isInteger(escala.mes) && escala.ano ? `${String(escala.mes + 1).padStart(2, '0')}/${escala.ano}` : '-');
            const funcionarios = contarFuncionariosEscalaSalva(escala);
            const criadoPor = escala.criadoPorNome || escala.criadoPorLogin || '-';

            return `
                <span class="record-meta-line">Setor: ${escala.setor || '-'}</span>
                <span class="record-meta-line">Loja ${loja} | ${mes} | ${funcionarios} funcionário(s)</span>
                <span class="record-meta-line">Criado por: ${criadoPor}</span>
            `;
        };

        const carregarPerfisAcesso = async () => {
            const data = await apiRequest('/api/acessos/perfis');
            perfisAcessoCache = data.perfis || [];
            perfilPaginasCache = data.paginas || [];
            return data;
        };

        const montarPermissoesPerfil = (perfil = null) => {
            const existentes = new Map((perfil?.PERMISSOES || []).map(p => [String(p.PAGINA), p]));
            return perfilPaginasCache.map((pagina) => {
                const atual = existentes.get(String(pagina.key)) || {};
                return {
                    PAGINA: pagina.key,
                    LABEL: pagina.label,
                    PODE_VISUALIZAR: Number(atual.PODE_VISUALIZAR ?? 1),
                    PODE_EDITAR: Number(atual.PODE_EDITAR ?? 0),
                    PODE_EXCLUIR: Number(atual.PODE_EXCLUIR ?? 0)
                };
            });
        };

        const abrirModalPerfilAcesso = async (perfil = null) => {
            const permissoes = montarPermissoesPerfil(perfil);
            const html = '<div class="permissions-grid">' + permissoes.map((permissao) => `
                <div class="permission-row" data-page="${escapeHtml(permissao.PAGINA)}">
                    <strong>${escapeHtml(permissao.LABEL)}</strong>
                    <label><input type="checkbox" data-perm="PODE_VISUALIZAR" ${permissao.PODE_VISUALIZAR ? 'checked' : ''}> Visualizar</label>
                    <label><input type="checkbox" data-perm="PODE_EDITAR" ${permissao.PODE_EDITAR ? 'checked' : ''}> Editar</label>
                    <label><input type="checkbox" data-perm="PODE_EXCLUIR" ${permissao.PODE_EXCLUIR ? 'checked' : ''}> Inativar</label>
                </div>`).join('') + '</div>';
            const values = await showInputModal({
                title: perfil ? 'Editar Perfil de Acesso' : 'Novo Perfil de Acesso',
                inputs: [
                    { label: 'Nome do perfil', type: 'text', id: 'PERFIL_NOME', value: perfil?.NOME || '', required: true },
                    { label: 'Descrição', type: 'text', id: 'PERFIL_DESCR', value: perfil?.DESCR || '' },
                    { label: 'Status', type: 'select', id: 'PERFIL_STATUS', value: perfil?.STATUS || 'A', options: [{ value: 'A', label: 'Ativo' }, { value: 'I', label: 'Inativo' }], required: true },
                    { type: 'html', html }
                ],
                confirmText: 'Salvar'
            });
            if (!values) return;
            const rows = Array.from(document.querySelectorAll('#inputModalBody .permission-row'));
            const payload = {
                NOME: String(values.PERFIL_NOME || '').trim().toUpperCase(),
                DESCR: values.PERFIL_DESCR || null,
                STATUS: values.PERFIL_STATUS,
                PERMISSOES: rows.map(row => ({
                    PAGINA: row.dataset.page,
                    PODE_VISUALIZAR: row.querySelector('[data-perm="PODE_VISUALIZAR"]')?.checked ? 1 : 0,
                    PODE_EDITAR: row.querySelector('[data-perm="PODE_EDITAR"]')?.checked ? 1 : 0,
                    PODE_EXCLUIR: row.querySelector('[data-perm="PODE_EXCLUIR"]')?.checked ? 1 : 0
                }))
            };
            if (perfil) {
                await apiRequest('/api/acessos/perfis/' + encodeURIComponent(perfil.PERFIL_ID), { method: 'PATCH', body: JSON.stringify(payload) });
            } else {
                await apiRequest('/api/acessos/perfis', { method: 'POST', body: JSON.stringify(payload) });
            }
            await renderizarRolesSettings();
            showInfoModal('Perfil de acesso salvo com sucesso.', 'success');
        };

        const renderizarRolesSettings = async () => {
            if (usuarioSessaoCache?.perfil !== 'ADMIN') return;
            const container = document.getElementById('rolesSettingsContainer');
            if (!container) return;
            await carregarPerfisAcesso();
            const rows = perfisAcessoCache.map((perfil) => {
                const permissoesAtivas = (perfil.PERMISSOES || []).filter(p => Number(p.PODE_VISUALIZAR) || Number(p.PODE_EDITAR) || Number(p.PODE_EXCLUIR)).length;
                return `
                    <tr>
                        <td data-label="Perfil de Acesso">${escapeHtml(perfil.NOME || '')}</td>
                        <td data-label="Descrição">${escapeHtml(perfil.DESCR || '-')}</td>
                        <td data-label="Status">${perfil.STATUS === 'A' ? 'Ativo' : 'Inativo'}</td>
                        <td data-label="Permissões">${permissoesAtivas} página(s)</td>
                        <td data-label="Ações" class="actions-cell">
                            <button class="action-btn-table banco-action editar-perfil-acesso" data-id="${escapeHtml(perfil.PERFIL_ID)}"><span class="material-symbols-outlined">edit</span>Editar</button>
                            <button class="action-btn-table banco-action danger-action toggle-perfil-acesso" data-id="${escapeHtml(perfil.PERFIL_ID)}" data-status="${escapeHtml(perfil.STATUS)}"><span class="material-symbols-outlined">block</span>${perfil.STATUS === 'A' ? 'Inativar' : 'Reativar'}</button>
                        </td>
                    </tr>`;
            }).join('');
            container.innerHTML = `
                <div class="table-card-header creation-card-header inner-card-header">
                    <div><h2>Perfis cadastrados</h2><p class="table-card-subtitle">Defina visualização, edição e inativação por página.</p></div>
                    <button type="button" class="action-button" id="novoPerfilAcessoBtn"><span class="material-symbols-outlined">add</span>Novo Perfil</button>
                </div>
                <table class="data-table">
                    <thead><tr><th>Perfil de Acesso</th><th>Descrição</th><th>Status</th><th>Permissões</th><th>Ações</th></tr></thead>
                    <tbody>${rows || '<tr><td colspan="5" class="text-center text-gray-500 py-8">Nenhum perfil encontrado.</td></tr>'}</tbody>
                </table>`;
        };

        document.getElementById('rolesSettingsContainer')?.addEventListener('click', async (event) => {
            const novo = event.target.closest('#novoPerfilAcessoBtn');
            const edit = event.target.closest('.editar-perfil-acesso');
            const toggle = event.target.closest('.toggle-perfil-acesso');
            try {
                if (novo) return abrirModalPerfilAcesso();
                const button = edit || toggle;
                if (!button) return;
                const perfil = perfisAcessoCache.find(item => Number(item.PERFIL_ID) === Number(button.dataset.id));
                if (!perfil) return;
                if (edit) return abrirModalPerfilAcesso(perfil);
                await apiRequest('/api/acessos/perfis/' + encodeURIComponent(perfil.PERFIL_ID), { method: 'PATCH', body: JSON.stringify({ STATUS: perfil.STATUS === 'A' ? 'I' : 'A' }) });
                await renderizarRolesSettings();
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const renderizarTabelaRegistros = () => {
            const escalas = getEscalasSalvas();
            tabelaRegistrosBody.innerHTML = '';

            if (escalas.length === 0) {
                tabelaRegistrosBody.innerHTML = `<tr><td colspan="4" class="text-center text-gray-500 py-8">Nenhuma escala salva.</td></tr>`;
                return;
            }

            escalas.forEach(escala => {
                const row = `
                    <tr>
                        <td data-label="Data">${escala.dataSalva}</td>
                        <td data-label="Nome">${escala.nome}</td>
                        <td data-label="Setor">${criarResumoEscalaSalva(escala)}</td>
                        <td data-label="Ações" class="actions-cell">
                            <button class="action-btn-table load" data-id="${escala.id}" title="Carregar e Editar Escala Detalhada">
                                <span class="material-symbols-outlined">edit_calendar</span>
                                Ver escala
                            </button>
                            <button class="action-btn-table view-skeleton" data-id="${escala.id}" title="Visualizar Esqueleto da Escala">
                                <span class="material-symbols-outlined">calendar_view_month</span>
                                Ver Esqueleto
                            </button>
                             <button class="action-btn-table view-timeline" data-id="${escala.id}" title="Visualizar Linha do Tempo">
                                <span class="material-symbols-outlined">timeline</span>
                                Ver Timeline
                            </button>
                            <button class="action-btn-table delete" data-id="${escala.id}" title="Excluir Escala">
                                <span class="material-symbols-outlined">delete</span>
                                Excluir
                            </button>
                        </td>
                    </tr>
                `;
                tabelaRegistrosBody.innerHTML += row;
            });
        };

        const carregarEscalaDetalhada = (escalaSalva, isNew = false) => {
            const { ano, mes, dados, mesAno, id } = escalaSalva;
            
            if (isNew) {
                escalaCarregadaId = null;
                currentLoadedScale = null;
            } else {
                escalaCarregadaId = id;
                currentLoadedScale = escalaSalva;
            }

            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const diasDaSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            let allDetailsHtml = '';

            dados.forEach((colaborador, index) => {
                let detailTable = `<div class="colaborador-escala-detalhada" data-colab-index="${index}" data-escfunc-id="${colaborador.escfuncId || ''}" data-chapa="${colaborador.chapa || ''}" data-escsecao-id="${colaborador.escsecaoId || ''}" data-escfuncao-id="${colaborador.escfuncaoId || ''}"><div class="header-info"><h3 class="font-bold text-lg" contenteditable="true">${colaborador.nome}</h3></div><table><thead><tr class="bg-gray-50"><th>D.SEM</th>${Array.from({length: diasNoMes}, (_, i) => `<th>${diasDaSemana[new Date(ano, mes, i + 1).getDay()]}</th>`).join('')}</tr><tr class="bg-gray-50"><th>DIA</th>${Array.from({length: diasNoMes}, (_, i) => `<th data-day-col="${i + 1}">${i + 1}</th>`).join('')}</tr></thead><tbody>`;
                const fields = [ 'inicio', 'inicioIntervalo', 'intervalo', 'fimIntervalo', 'fim', 'trabalhadas' ];
                const labels = { inicio: 'ENT.', inicioIntervalo: 'SAÍ.INT.', intervalo: 'INTER.', fimIntervalo: 'RET.INT.', fim: 'SAÍ.', trabalhadas: 'H.TRAB' };
                const isBold = { trabalhadas: true };

                fields.forEach(key => {
                    const boldClass = isBold[key] ? 'font-bold bg-gray-50' : '';
                    detailTable += `<tr class="${boldClass}" data-key="${key}"><td>${labels[key]}</td>`;
                    for(let dia = 1; dia <= diasNoMes; dia++) {
                        const cellContent = colaborador.turnos[dia]?.[key] || '';
                        const isDomingo = new Date(ano, mes, dia).getDay() === 0;
                        const isFolga = cellContent.toUpperCase() === 'F';
                        let bgColor = '';
                        if (isFolga) {
                            bgColor = isDomingo ? 'bg-orange-500 text-white' : 'bg-red-100';
                        } else if (isDomingo) {
                            bgColor = 'bg-yellow-100';
                        }
                        const editableAttr = (key !== 'intervalo' && key !== 'trabalhadas') ? 'contenteditable="true"' : '';
                        detailTable += `<td class="${bgColor}" ${editableAttr}>${cellContent}</td>`;
                    }
                    detailTable += `</tr>`;
                });
                detailTable += `</tbody></table></div>`;
                allDetailsHtml += detailTable;
            });

            detalhadaModalBody.innerHTML = allDetailsHtml;
            detalhadaMesAno.textContent = mesAno;
            detailedScaleHasBeenGenerated = true;
            gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada';
            detalhadaModal.classList.remove('hidden');
        }
        
        const carregarEsqueletoSalvo = (escalaSalva) => {
            escalaCarregadaParaVisualizacao = escalaSalva;
            gerarEscalaDetalhadaBtn.textContent = 'Ver Escala Detalhada';
            detailedScaleHasBeenGenerated = true;

            const { ano, mes, dados } = escalaSalva;
            mesSelect.value = mes;
            anoSelect.value = ano;

            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const nomesMesesAbrev = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            const diasDaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

            let tableHtml = '<table id="tabela-esqueleto" class="w-full table-auto border-collapse is-readonly"><thead><tr><th class="sticky left-0 bg-gray-100 z-10 w-48">Colaborador</th>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                const data = new Date(ano, mes, dia);
                const diaSemana = data.getDay();
                tableHtml += `<th class="${diaSemana === 0 ? 'bg-yellow-200' : ''}"><div>${dia}-${nomesMesesAbrev[mes]}</div><div>${diasDaSemana[diaSemana]}</div></th>`;
            }
            tableHtml += '<th class="bg-gray-200">Dias Trab.</th><th class="bg-gray-200">Folgas</th></tr></thead><tbody>';

            colaboradorShifts = [];
            dados.forEach((colaborador, index) => {
                let shiftInfo = '';
                let shiftData = {};
                for(let dia = 1; dia <= diasNoMes; dia++) {
                    const turnoDia = colaborador.turnos[dia];
                    if (turnoDia && turnoDia.inicio && turnoDia.inicio.toUpperCase() !== 'F') {
                        shiftInfo = ` ${turnoDia.inicio || ''} - ${turnoDia.inicioIntervalo || ''} - ${turnoDia.fimIntervalo || ''} - ${turnoDia.fim || ''}`;
                        shiftData = {inicio: turnoDia.inicio, inicioIntervalo: turnoDia.inicioIntervalo, fimIntervalo: turnoDia.fimIntervalo, fim: turnoDia.fim};
                        break;
                    }
                }
                colaboradorShifts.push(shiftData);
                
                tableHtml += `<tr data-colab-index="${index}"><td data-name="${colaborador.nome}" class="collaborator-name sticky left-0 bg-white font-semibold"><span class="collaborator-name-span">${colaborador.nome}</span><span class="collaborator-time-span text-gray-500">${shiftInfo}</span></td>`;

                for (let dia = 1; dia <= diasNoMes; dia++) {
                    const data = new Date(ano, mes, dia);
                    const turnoDoDia = colaborador.turnos[dia];
                    let cellContent = '';
                    let cellClass = `escala-cell ${data.getDay() === 0 ? 'bg-yellow-100' : ''}`;
                    if (turnoDoDia && turnoDoDia.inicio && turnoDoDia.inicio.toUpperCase() === 'F') {
                        cellContent = 'F';
                        if(data.getDay() === 0) {
                           cellClass = 'escala-cell bg-orange-600 text-white font-bold';
                        } else {
                           cellClass += ' bg-red-300 text-white font-bold';
                        }
                    }
                    tableHtml += `<td class="${cellClass}" data-dia="${dia}">${cellContent}</td>`;
                }
                tableHtml += '<td class="dias-trabalhados-cell"></td><td class="folgas-cell"></td></tr>';
            });

            tableHtml += '</tbody><tfoot>';
            let folgaRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Folgas</td>';
            let trabRow = '<tr class="bg-gray-200 font-bold"><td class="sticky left-0 bg-gray-200 z-10">Total Trabalhando</td>';
            for (let dia = 1; dia <= diasNoMes; dia++) {
                folgaRow += `<td data-day-count-folga="${dia}">0</td>`;
                trabRow += `<td data-day-count-trabalhando="${dia}">0</td>`;
            }
            folgaRow += '<td></td><td></td></tr>';
            trabRow += '<td></td><td></td></tr>';

            let grandTotalRow = '<tr class="bg-gray-500 text-black font-bold"><td class="sticky left-0 bg-gray-500 z-10">TOTAL GERAL</td>';
            grandTotalRow += `<td colspan="${diasNoMes}"></td>`;
            grandTotalRow += '<td id="grandTotalDiasTrabalhados">0</td>';
            grandTotalRow += '<td id="grandTotalFolgas">0</td></tr>';

            tableHtml += folgaRow + trabRow + grandTotalRow + '</tfoot></table>';
            
            esqueletoZoomLevel = 1.0;
            applyEsqueletoZoom();
            tabelaEsqueletoContainer.innerHTML = tableHtml;
            atualizarContagemEsqueleto();
            esqueletoModal.classList.remove('hidden');
        };

        const parseEscalaFromModal = () => {
             const divsColaboradores = detalhadaModalBody.querySelectorAll('.colaborador-escala-detalhada');
            let escalaDetalhada = [];
            divsColaboradores.forEach(div => {
                let colabData = {
                    nome: div.querySelector('h3').textContent,
                    escfuncId: div.dataset.escfuncId ? parseInt(div.dataset.escfuncId, 10) : null,
                    chapa: div.dataset.chapa || '',
                    escsecaoId: div.dataset.escsecaoId ? parseInt(div.dataset.escsecaoId, 10) : null,
                    escfuncaoId: div.dataset.escfuncaoId ? parseInt(div.dataset.escfuncaoId, 10) : null,
                    turnos: {}
                };
                div.querySelectorAll('tbody tr').forEach(row => {
                    const key = row.dataset.key;
                    row.querySelectorAll('td:not(:first-child)').forEach((cell, index) => {
                        const dia = index + 1;
                        if (!colabData.turnos[dia]) colabData.turnos[dia] = {};
                        colabData.turnos[dia][key] = cell.textContent;
                    });
                });
                escalaDetalhada.push(colabData);
            });
            return escalaDetalhada;
        }

        const formatDateForDb = (ano, mes, dia) => {
            return `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        };

        const montarPayloadBancoEscala = (escalaSalva) => {
            const lojaId = parseInt(escalaSalva.lojaId || lojaEscalaSelect.value, 10);
            const mesRef = formatDateForDb(escalaSalva.ano, escalaSalva.mes, 1);
            const funcionarios = (escalaSalva.dados || [])
                .filter(colaborador => colaborador.escfuncId && colaborador.chapa)
                .map(colaborador => ({
                    escfuncId: colaborador.escfuncId,
                    chapa: colaborador.chapa,
                    escsecaoId: colaborador.escsecaoId || null,
                    escfuncaoId: colaborador.escfuncaoId || null,
                    dias: Object.keys(colaborador.turnos || {}).map(dia => {
                        const turno = colaborador.turnos[dia] || {};
                        const isFolga = String(turno.inicio || '').trim().toUpperCase() === 'F';
                        return {
                            data: formatDateForDb(escalaSalva.ano, escalaSalva.mes, parseInt(dia, 10)),
                            hrEnt1: isFolga ? null : (turno.inicio || null),
                            hrSai1: isFolga ? null : (turno.inicioIntervalo || null),
                            hrEnt2: isFolga ? null : (turno.fimIntervalo || null),
                            hrSai2: isFolga ? null : (turno.fim || null),
                            programacao: isFolga ? 'F' : 'TRB'
                        };
                    })
                }));

            return { lojaId, mesRef, escalaOrigemId: escalaSalva.id, funcionarios, oficializada: 0 };
        };

        const aplicarLojaDaEscalaSalva = async (escalaSalva) => {
            if (!escalaSalva.lojaId || !lojasPermitidasCache.includes(Number(escalaSalva.lojaId))) return;

            lojaEscalaSelect.value = String(escalaSalva.lojaId);
            funcionariosLojaSelect.value = String(escalaSalva.lojaId);
            await carregarFuncionariosDaLoja(true);
        };

        const sincronizarEscalaComBanco = async (escalaSalva) => {
            const payload = montarPayloadBancoEscala(escalaSalva);
            if (!payload.lojaId || payload.funcionarios.length === 0) {
                return { saved: [] };
            }

            return apiRequest('/api/escalas', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        };

        const tentarSincronizarEscalaComBanco = async (escalaSalva) => {
            try {
                const result = await sincronizarEscalaComBanco(escalaSalva);
                return {
                    ok: true,
                    nome: escalaSalva.nome,
                    count: result.saved ? result.saved.length : 0
                };
            } catch (error) {
                return {
                    ok: false,
                    nome: escalaSalva.nome,
                    message: error.details ? error.details.join(' ') : error.message
                };
            }
        };

        const sincronizarEscalasSalvasComBanco = async () => {
            const escalas = getEscalasSalvas();
            if (escalas.length === 0) {
                showInfoModal('Nenhuma escala salva para sincronizar.', 'info');
                return;
            }

            const resultados = [];
            for (const escala of escalas) {
                resultados.push(await tentarSincronizarEscalaComBanco(escala));
            }

            const mensagens = resultados.map(resultado => {
                if (resultado.ok && resultado.count > 0) {
                    return `${resultado.nome}: sincronizada (${resultado.count} funcionário(s)).`;
                }
                if (resultado.ok) {
                    return `${resultado.nome}: sem funcionários vinculados para sincronizar.`;
                }
                return `${resultado.nome}: não sincronizada - ${resultado.message}`;
            });

            const hasError = resultados.some(resultado => !resultado.ok);
            showInfoModal(mensagens, hasError ? 'error' : 'success');
        };

        const formatarDataTabela = (value) => {
            const iso = String(value || '').slice(0, 10);
            if (!iso) return '-';
            const partes = iso.split('-');
            return partes.length >= 3 ? partes[2] + '/' + partes[1] + '/' + partes[0] : iso;
        };

        const formatarMesTabela = (value) => {
            const iso = String(value || '').slice(0, 10);
            if (!iso) return '-';
            const partes = iso.split('-');
            return partes.length >= 2 ? partes[1] + '/' + partes[0] : iso;
        };

        const popularFiltrosEscalas = () => {
            if (!escalasFiltroMes || !escalasFiltroAno) return;
            const mesAtual = escalasFiltroMes.value || 'all';
            const anoAtual = escalasFiltroAno.value || String(anoSelect.value || new Date().getFullYear());
            const mesOptions = ['<option value="all">Todos os meses</option>'].concat(
                Array.from(mesSelect.options || []).map(option => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.textContent) + '</option>')
            );
            escalasFiltroMes.innerHTML = mesOptions.join('');
            escalasFiltroMes.value = Array.from(escalasFiltroMes.options).some(option => option.value === mesAtual) ? mesAtual : 'all';

            const anoOptions = ['<option value="all">Todos os anos</option>'].concat(
                Array.from(anoSelect.options || []).map(option => '<option value="' + escapeHtml(option.value) + '">' + escapeHtml(option.textContent) + '</option>')
            );
            escalasFiltroAno.innerHTML = anoOptions.join('');
            escalasFiltroAno.value = Array.from(escalasFiltroAno.options).some(option => option.value === anoAtual) ? anoAtual : 'all';
        };

        const getEscalasFiltroLojasSelecionadas = () => {
            const filtro = escalasFiltroLoja?.value || 'all';
            if (filtro !== 'all') return [Number(filtro)].filter(Boolean);
            return lojasPermitidasCache.length ? [...lojasPermitidasCache] : Array.from(lojaEscalaSelect.options || []).map(option => Number(option.value)).filter(Boolean);
        };

        const normalizarTextoFiltro = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

        const getNomeMesTabela = (value) => {
            const iso = String(value || '').slice(0, 10);
            const partes = iso.split('-');
            if (partes.length < 2) return '';
            const data = new Date(Number(partes[0]), Number(partes[1]) - 1, 1);
            const nome = data.toLocaleDateString('pt-BR', { month: 'long' });
            return nome.charAt(0).toUpperCase() + nome.slice(1);
        };

        const aplicarFiltrosEscalasBanco = (escalas) => {
            const termo = normalizarTextoFiltro(escalasPesquisaInput?.value);
            const statusFiltro = String(escalasFiltroStatus?.value || 'all').toUpperCase();
            const anoFiltro = String(escalasFiltroAno?.value || 'all');
            const mesFiltro = String(escalasFiltroMes?.value || 'all');
            return (escalas || []).filter((escala) => {
                const mesRef = String(escala.MES_REF || '').slice(0, 10);
                const [ano, mesNumero] = mesRef.split('-');
                const status = String(escala.STATUS || '').toUpperCase();
                if (statusFiltro !== 'ALL' && status !== statusFiltro) return false;
                if (anoFiltro !== 'all' && ano !== anoFiltro) return false;
                if (mesFiltro !== 'all' && String(Number(mesNumero) - 1) !== mesFiltro) return false;
                if (!termo) return true;
                const busca = normalizarTextoFiltro([
                    escala.LOJA ? 'Loja ' + escala.LOJA : '',
                    escala.LOJA,
                    formatarMesTabela(escala.MES_REF),
                    getNomeMesTabela(escala.MES_REF),
                    status
                ].join(' '));
                return busca.includes(termo);
            });
        };


        const getStatusClassEscala = (status) => {
            const normalized = String(status || '').toUpperCase();
            if (normalized === 'FINALIZADA') return 'status-finalizada';
            if (normalized === 'AGENDADA') return 'status-agendada';
            if (normalized === 'MODIFICADA') return 'status-modificada';
            if (normalized === 'ATIVA') return 'status-ativa';
            return 'status-neutro';
        };

        const renderizarTabelaBanco = (escalas) => {
            tabelaBancoBody.innerHTML = '';

            if (!escalas || escalas.length === 0) {
                tabelaBancoBody.innerHTML = '<tr><td colspan="10" class="text-center text-gray-500 py-8">Nenhuma escala encontrada para os filtros selecionados.</td></tr>';
                return;
            }

            escalas.forEach(escala => {
                const mesRef = String(escala.MES_REF || '').slice(0, 10);
                const loja = escala.LOJA || '';
                const status = String(escala.STATUS || '-').toUpperCase();
                const finalizada = status === 'FINALIZADA';
                const oficializada = Number(escala.OFICIALIZADA || 0) === 1;
                const oficializarAction = finalizada
                    ? '<button class="action-btn-table banco-action" disabled title="Escala finalizada"><span class="material-symbols-outlined">lock</span>Finalizada</button>'
                    : oficializada
                        ? '<button class="action-btn-table banco-action officialize-action" disabled title="Escala oficializada"><span class="material-symbols-outlined">verified</span>Oficializada</button>'
                        : '<button class="action-btn-table banco-action officialize-action banco-oficializar" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Oficializar escala"><span class="material-symbols-outlined">verified</span>Oficializar</button>';
                const inativarAction = finalizada
                    ? ''
                    : '<button class="action-btn-table banco-action danger-action banco-inativar" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Inativar escala"><span class="material-symbols-outlined">delete</span>Inativar</button>';
                const row = [
                    '<tr>',
                    '<td data-label="Data Inicial">' + formatarDataTabela(escala.MES_REF) + '</td>',
                    '<td data-label="Mês">' + getNomeMesTabela(escala.MES_REF) + '</td>',
                    '<td data-label="Loja">Loja ' + escapeHtml(loja) + '</td>',
                    '<td data-label="Status"><span class="escala-status-chip ' + getStatusClassEscala(status) + '">' + escapeHtml(status || '-') + '</span></td>',
                    '<td data-label="Oficializada"><span class="escala-status-chip ' + (oficializada ? 'official-chip' : 'pending-chip') + '">' + (oficializada ? 'Sim' : 'Não') + '</span></td>',
                    '<td data-label="Secoes">' + escapeHtml(escala.SECOES || 0) + '</td>',
                    '<td data-label="Funcionarios">' + escapeHtml(escala.FUNCIONARIOS || 0) + '</td>',
                    '<td data-label="Modificada em">' + formatarDataTabela(escala.MODIFICADA_EM) + '</td>',
                    '<td data-label="Modificada por">' + escapeHtml(escala.MODIFICADO_POR || 'Sistema') + '</td>',
                    '<td data-label="Acoes" class="actions-cell">',
                    '<button class="action-btn-table banco-action banco-abrir" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Abrir escala mais recente"><span class="material-symbols-outlined">open_in_new</span>Abrir Escala</button>',
                    oficializarAction,
                    inativarAction,
                    '<button class="action-btn-table banco-action banco-historico" data-loja="' + escapeHtml(loja) + '" data-mes-ref="' + escapeHtml(mesRef) + '" title="Ver histórico de revisões"><span class="material-symbols-outlined">history</span>Histórico</button>',
                    '</td>',
                    '</tr>'
                ].join('');
                tabelaBancoBody.innerHTML += row;
            });
        };

        const carregarHistoricoRevisoesBanco = async (loja, mesRef) => {
            const data = await apiRequest('/api/escalas/revisoes?lojaId=' + encodeURIComponent(loja) + '&mesRef=' + encodeURIComponent(mesRef));
            const revisoes = data.revisoes || [];
            if (!revisoes.length) {
                showInfoModal('Nenhuma revisao encontrada para esta escala.', 'info');
                return;
            }

            const rows = revisoes.map(revisao => [
                '<tr>',
                '<td>' + escapeHtml(revisao.REVISAO || '-') + '</td>',
                '<td>' + escapeHtml(revisao.STATUS || '-') + '</td>',
                '<td>' + escapeHtml(revisao.SECOES || 0) + '</td>',
                '<td>' + escapeHtml(revisao.FUNCIONARIOS || 0) + '</td>',
                '<td>' + formatarDataTabela(revisao.CRIADA_EM) + '</td>',
                '<td>' + formatarDataTabela(revisao.MODIFICADA_EM) + '</td>',
                '<td>' + escapeHtml(revisao.MODIFICADO_POR || 'Sistema') + '</td>',
                '</tr>'
            ].join('')).join('');

            await showInputModal({
                title: 'Histórico de revisões - Loja ' + loja + ' - ' + formatarMesTabela(mesRef),
                inputs: [{
                    type: 'html',
                    html: '<div class="revision-history-modal"><table class="data-table compact-table"><thead><tr><th>Revisão</th><th>Status</th><th>Seções</th><th>Funcionários</th><th>Criada em</th><th>Modificada em</th><th>Modificada por</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
                }],
                confirmText: 'Fechar',
                cancelText: ''
            });
        };

        const montarResumoEscalasFallback = (escalas, lojaId, mesRef) => {
            const rows = escalas || [];
            if (!rows.length) return [];

            const revisao = Math.max(...rows.map(row => Number(row.REVISAO || 0)));
            const rowsRevisao = rows.filter(row => Number(row.REVISAO || 0) === revisao);
            const base = rowsRevisao[0] || rows[0] || {};
            const secoes = new Set(rowsRevisao.map(row => row.ESCSECAO_ID || row.COD_SECAO).filter(Boolean));
            const funcionarios = new Set(rowsRevisao.map(row => row.ESCFUNC_ID || row.CHAPA).filter(Boolean));

            return [{
                MES_REF: base.MES_REF || mesRef,
                LOJA: base.LOJA || lojaId,
                STATUS: base.STATUS || (revisao > 0 ? 'MODIFICADA' : 'ATIVA'),
                REVISAO: revisao ?? base.REVISAO ?? 0,
                SECOES: secoes.size,
                FUNCIONARIOS: funcionarios.size || rowsRevisao.length,
                MODIFICADA_EM: base.DT_HR_INCL || base.MES_REF || mesRef,
                MODIFICADO_POR: base.MODIFICADO_POR || 'Sistema'
            }];
        };

        const carregarResumoEscalas = async (lojaId, mesRef) => {
            const params = new URLSearchParams({ lojaId: String(lojaId) });
            if (mesRef) params.set('mesRef', mesRef);
            try {
                const data = await apiRequest('/api/escalas/resumo?' + params.toString());
                return data.escalas || [];
            } catch (error) {
                const notFound = error.status === 404 || /nao encontrado|not found|recurso/i.test(error.message || '');
                if (!notFound || !mesRef) throw error;

                const fallbackParams = new URLSearchParams({ lojaId: String(lojaId), mesRef });
                const data = await apiRequest('/api/escalas?' + fallbackParams.toString());
                return montarResumoEscalasFallback(data.escalas || [], lojaId, mesRef);
            }
        };

        const consultarEscalasBancoLocal = async () => {
            const lojasSelecionadas = getEscalasFiltroLojasSelecionadas();
            if (!lojasSelecionadas.length) {
                tabelaBancoBody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-500 py-8">Nenhuma loja permitida para consulta.</td></tr>';
                return;
            }

            tabelaBancoBody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-500 py-8">Carregando escalas do banco...</td></tr>';
            const ano = String(escalasFiltroAno?.value || 'all');
            const mes = String(escalasFiltroMes?.value || 'all');
            const mesRef = ano !== 'all' && mes !== 'all' ? formatDateForDb(Number(ano), Number(mes), 1) : null;
            const resultados = [];
            for (const lojaId of lojasSelecionadas) {
                const escalas = await carregarResumoEscalas(lojaId, mesRef);
                resultados.push(...escalas);
            }
            const dedup = new Map();
            resultados.forEach((escala) => {
                const key = [escala.LOJA, String(escala.MES_REF || '').slice(0, 10)].join('|');
                dedup.set(key, escala);
            });
            renderizarTabelaBanco(aplicarFiltrosEscalasBanco(Array.from(dedup.values())));
        };

        const getFuncionarioDetalheKey = (dia) => String(dia.ESCFUNC_ID || dia.CHAPA || dia.NOME || '');
        const getSecaoDetalheKey = (dia) => String(dia.ESCSECAO_ID || dia.COD_SECAO || dia.SECAO_DESCR || 'SEM_SECAO');
        const getSecaoDetalheNome = (dia) => {
            const codigo = dia.COD_SECAO ? dia.COD_SECAO + ' - ' : '';
            return codigo + (dia.SECAO_DESCR || 'Sem seção');
        };

        const agruparDiasPorFuncionario = (dias) => {
            const grupos = new Map();
            (dias || []).forEach((dia) => {
                const key = getFuncionarioDetalheKey(dia);
                if (!grupos.has(key)) {
                    grupos.set(key, {
                        key,
                        nome: dia.NOME || dia.CHAPA || key,
                        chapa: dia.CHAPA || '',
                        funcao: dia.FUNCAO_DESCR || '',
                        escfuncId: dia.ESCFUNC_ID || '',
                        dias: new Map()
                    });
                }
                const numeroDia = Number(String(dia.DT || '').slice(8, 10));
                if (numeroDia) grupos.get(key).dias.set(numeroDia, dia);
            });
            return [...grupos.values()].sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
        };

        const criarTimelineSecaoBanco = (dias) => {
            const turnos = new Map();
            agruparDiasPorFuncionario(dias).forEach((funcionario) => {
                const frequencias = new Map();
                funcionario.dias.forEach((dia) => {
                    if (String(dia.PROGRAMACAO || '').toUpperCase() === 'F') return;
                    const turno = [dia.HR_ENT1 || '', dia.HR_SAI1 || '', dia.HR_ENT2 || '', dia.HR_SAI2 || ''];
                    if (!turno[0] || !turno[3]) return;
                    const signature = turno.join('|');
                    frequencias.set(signature, (frequencias.get(signature) || 0) + 1);
                });
                const principal = [...frequencias.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
                if (!principal) return;
                if (!turnos.has(principal)) turnos.set(principal, 0);
                turnos.set(principal, turnos.get(principal) + 1);
            });
            const exemplo = dias[0] || {};
            return [...turnos.entries()].map(([signature, quantidade]) => {
                const [inicio, inicioIntervalo, fimIntervalo, fim] = signature.split('|');
                return {
                    secaoId: getSecaoDetalheKey(exemplo),
                    secaoNome: getSecaoDetalheNome(exemplo),
                    quantidade: String(quantidade),
                    inicio,
                    inicioIntervalo,
                    fimIntervalo,
                    fim
                };
            });
        };

        const renderizarTabsSecoesEscala = () => {
            if (!escalaSecaoTabs) return;
            escalaSecaoTabs.innerHTML = escalaDetalheAtual.secoes.map((secao) => {
                const ativa = String(secao.key) === String(escalaDetalheAtual.secaoAtiva);
                return '<button type="button" class="section-tab' + (ativa ? ' active' : '') + '" role="tab" aria-selected="' + ativa + '" data-secao-key="' + escapeHtml(secao.key) + '">' + escapeHtml(secao.nome) + '<span>' + secao.funcionarios + '</span></button>';
            }).join('');
        };

        const renderizarDetalhadaSecaoBanco = (dias) => {
            if (!escalaBancoDetalhadaContent) return;
            const dataRef = escalaDetalheAtual.mesRef ? new Date(escalaDetalheAtual.mesRef + 'T00:00:00') : null;
            const ano = dataRef?.getFullYear() || new Date().getFullYear();
            const mes = dataRef?.getMonth() || 0;
            const diasNoMes = new Date(ano, mes + 1, 0).getDate();
            const diasSemana = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
            const somenteLeitura = escalaDetalheAtual.status === 'FINALIZADA';
            const fields = [
                { key: 'HR_ENT1', label: 'ENT.' },
                { key: 'HR_SAI1', label: 'SAÍ.INT.' },
                { key: 'INTERVALO', label: 'INTER.' },
                { key: 'HR_ENT2', label: 'RET.INT.' },
                { key: 'HR_SAI2', label: 'SAÍ.' },
                { key: 'TRABALHADAS', label: 'H.TRAB', bold: true }
            ];
            const html = agruparDiasPorFuncionario(dias).map((funcionario) => {
                let table = '<article class="bank-employee-scale"><header><div><h3>' + escapeHtml(funcionario.nome) + '</h3><p>' + escapeHtml(funcionario.chapa) + (funcionario.funcao ? ' | ' + escapeHtml(funcionario.funcao) : '') + '</p></div></header><div class="bank-scale-scroll"><table><thead><tr><th>D.SEM</th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) table += '<th>' + diasSemana[new Date(ano, mes, dia).getDay()] + '</th>';
                table += '</tr><tr><th>DIA</th>';
                for (let dia = 1; dia <= diasNoMes; dia += 1) table += '<th>' + dia + '</th>';
                table += '</tr></thead><tbody>';
                fields.forEach((field) => {
                    table += '<tr' + (field.bold ? ' class="font-bold"' : '') + '><th>' + field.label + '</th>';
                    for (let numeroDia = 1; numeroDia <= diasNoMes; numeroDia += 1) {
                        const registro = funcionario.dias.get(numeroDia);
                        if (!registro) { table += '<td class="empty">-</td>'; continue; }
                        const folga = String(registro.PROGRAMACAO || '').toUpperCase() === 'F';
                        let value = 'F';
                        if (!folga) {
                            if (field.key === 'INTERVALO') value = minutesToTime(Math.max(0, timeToMinutes(registro.HR_ENT2) - timeToMinutes(registro.HR_SAI1)));
                            else if (field.key === 'TRABALHADAS') value = minutesToTime(Math.max(0, (timeToMinutes(registro.HR_SAI2) - timeToMinutes(registro.HR_ENT1)) - (timeToMinutes(registro.HR_ENT2) - timeToMinutes(registro.HR_SAI1))));
                            else value = registro[field.key] || '--';
                        }
                        const domingo = new Date(ano, mes, numeroDia).getDay() === 0;
                        const cellClass = folga ? (domingo ? 'day-off sunday' : 'day-off') : (domingo ? 'sunday' : '');
                        const editable = !somenteLeitura && !field.bold && field.key !== 'INTERVALO';
                        table += '<td class="' + cellClass + '">' + (editable ? '<button type="button" class="bank-day-edit" data-escprog-id="' + escapeHtml(registro.ESCPROG_ID || '') + '" data-escprogdia-id="' + escapeHtml(registro.ESCPROGDIA_ID || '') + '" title="Editar dia ' + numeroDia + '">' + escapeHtml(value) + '</button>' : escapeHtml(value)) + '</td>';
                    }
                    table += '</tr>';
                });
                return table + '</tbody></table></div></article>';
            }).join('');
            escalaBancoDetalhadaContent.innerHTML = html || '<p class="text-center text-gray-500 py-8">Nenhum colaborador encontrado nesta seção.</p>';
        };

        const renderizarSecaoAtivaEscala = () => {
            const secao = escalaDetalheAtual.secoes.find(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva));
            const dias = (escalaDetalheAtual.dias || []).filter(dia => getSecaoDetalheKey(dia) === String(escalaDetalheAtual.secaoAtiva));
            const nome = secao?.nome || 'Seção';
            if (escalaSecaoTimelineTitulo) escalaSecaoTimelineTitulo.textContent = 'Timeline - ' + nome;
            if (escalaSecaoDetalheTitulo) escalaSecaoDetalheTitulo.textContent = 'Escala detalhada - ' + nome;
            renderizarTabsSecoesEscala();
            renderizarTimelineCompleta('escalaBancoTimelineContent', criarTimelineSecaoBanco(dias));
            renderizarDetalhadaSecaoBanco(dias);
        };

        const prepararSecoesDetalheEscala = () => {
            const map = new Map();
            (escalaDetalheAtual.dias || []).forEach((dia) => {
                const key = getSecaoDetalheKey(dia);
                if (!map.has(key)) map.set(key, { key, nome: getSecaoDetalheNome(dia), funcionarios: new Set() });
                map.get(key).funcionarios.add(getFuncionarioDetalheKey(dia));
            });
            escalaDetalheAtual.secoes = [...map.values()].map(item => ({ ...item, funcionarios: item.funcionarios.size })).sort((a, b) => a.nome.localeCompare(b.nome));
            if (!escalaDetalheAtual.secoes.some(item => String(item.key) === String(escalaDetalheAtual.secaoAtiva))) escalaDetalheAtual.secaoAtiva = escalaDetalheAtual.secoes[0]?.key || null;
            renderizarSecaoAtivaEscala();
        };

        const carregarDetalheEscalaBanco = async (escprogId) => {
            escalaDetalheAtual = { escprogId, lojaId: null, mesRef: null, modo: 'individual', status: null, dias: [], secoes: [], secaoAtiva: null };
            escalaDetalheTitulo.textContent = 'Escala ' + escprogId;
            escalaDetalheResumo.textContent = 'Carregando dias da escala...';
            const data = await apiRequest('/api/escalas/' + encodeURIComponent(escprogId) + '/dias');
            escalaDetalheAtual.dias = data.dias || [];
            escalaDetalheAtual.mesRef = String(escalaDetalheAtual.dias[0]?.DT || '').slice(0, 7) + '-01';
            escalaDetalheResumo.textContent = escalaDetalheAtual.dias.length + ' dia(s) encontrado(s).';
            prepararSecoesDetalheEscala();
        };

        const carregarDetalheEscalaMensal = async (lojaId, mesRef) => {
            escalaDetalheAtual = { escprogId: null, lojaId, mesRef, modo: 'mensal', status: null, dias: [], secoes: [], secaoAtiva: null };
            escalaDetalheTitulo.textContent = 'Escala Loja ' + lojaId + ' - ' + formatarMesTabela(mesRef);
            escalaDetalheResumo.textContent = 'Carregando escala mensal...';
            const data = await apiRequest('/api/escalas/mensal?lojaId=' + encodeURIComponent(lojaId) + '&mesRef=' + encodeURIComponent(mesRef));
            const escala = data.escala || {};
            escalaDetalheAtual.dias = escala.dias || [];
            escalaDetalheAtual.status = escala.status || null;
            escalaDetalheResumo.textContent = escalaDetalheAtual.dias.length + ' dia(s), revisão ' + (escala.revisao || '-') + ', status ' + (escala.status || '-');
            prepararSecoesDetalheEscala();
        };

        escalaSecaoTabs?.addEventListener('click', (event) => {
            const tab = event.target.closest('.section-tab');
            if (!tab) return;
            escalaDetalheAtual.secaoAtiva = tab.dataset.secaoKey;
            renderizarSecaoAtivaEscala();
        });

        imprimirTimelineBancoBtn?.addEventListener('click', () => {
            const dias = (escalaDetalheAtual.dias || []).filter(dia => getSecaoDetalheKey(dia) === String(escalaDetalheAtual.secaoAtiva));
            imprimirTimelineMelhorado(criarTimelineSecaoBanco(dias), escalaSecaoTimelineTitulo?.textContent || 'Timeline da seção');
        });

        imprimirDetalheBancoBtn?.addEventListener('click', () => {
            if (!escalaBancoDetalhadaContent) return;
            printContainer.innerHTML = '<div class="print-title">' + escapeHtml(escalaSecaoDetalheTitulo?.textContent || 'Escala detalhada') + '</div>' + escalaBancoDetalhadaContent.innerHTML;
            window.print();
        });

        const editarDiaEscalaPorId = async (escprogId, escprogdiaId) => {
            if (escalaDetalheAtual.status === 'FINALIZADA') {
                showInfoModal('Escala finalizada não pode ser editada.', 'info');
                return;
            }
            const dia = (escalaDetalheAtual.dias || []).find(item => String(item.ESCPROGDIA_ID || '') === String(escprogdiaId));
            if (!escprogId || !escprogdiaId || !dia) return;
            const values = await showInputModal({
                title: 'Editar dia ' + formatarDataTabela(dia.DT),
                inputs: [
                    { label: 'Programação', type: 'select', id: 'PROGRAMACAO_TAB', value: dia.PROGRAMACAO || 'TRB', options: [
                        { value: 'TRB', label: 'Trabalho' },
                        { value: 'F', label: 'Folga' }
                    ], required: true },
                    { label: 'Entrada 1', type: 'time', id: 'HR_ENT1_TAB', value: dia.HR_ENT1 === 'F' ? '' : dia.HR_ENT1 || '' },
                    { label: 'Saída 1', type: 'time', id: 'HR_SAI1_TAB', value: dia.HR_SAI1 === 'F' ? '' : dia.HR_SAI1 || '' },
                    { label: 'Entrada 2', type: 'time', id: 'HR_ENT2_TAB', value: dia.HR_ENT2 === 'F' ? '' : dia.HR_ENT2 || '' },
                    { label: 'Saída 2', type: 'time', id: 'HR_SAI2_TAB', value: dia.HR_SAI2 === 'F' ? '' : dia.HR_SAI2 || '' }
                ],
                confirmText: 'Salvar dia'
            });
            if (!values) return;
            try {
                const programacao = String(values.PROGRAMACAO_TAB || 'TRB').trim().toUpperCase();
                const folga = programacao === 'F';
                await apiRequest('/api/escalas/' + encodeURIComponent(escprogId) + '/dias/' + encodeURIComponent(escprogdiaId), {
                    method: 'PATCH',
                    body: JSON.stringify({
                        PROGRAMACAO: programacao,
                        HR_ENT1: folga ? 'F' : values.HR_ENT1_TAB || dia.HR_ENT1 || '00:00',
                        HR_SAI1: folga ? 'F' : values.HR_SAI1_TAB || dia.HR_SAI1 || '00:00',
                        HR_ENT2: folga ? 'F' : values.HR_ENT2_TAB || dia.HR_ENT2 || '00:00',
                        HR_SAI2: folga ? 'F' : values.HR_SAI2_TAB || dia.HR_SAI2 || '00:00'
                    })
                });
                const secaoAtiva = escalaDetalheAtual.secaoAtiva;
                showInfoModal('Dia atualizado no banco.', 'success');
                await carregarDetalheEscalaMensal(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef);
                if (escalaDetalheAtual.secoes.some(item => String(item.key) === String(secaoAtiva))) {
                    escalaDetalheAtual.secaoAtiva = secaoAtiva;
                    renderizarSecaoAtivaEscala();
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        };

        escalaBancoDetalhadaContent?.addEventListener('click', (event) => {
            const button = event.target.closest('.bank-day-edit');
            if (!button) return;
            editarDiaEscalaPorId(button.dataset.escprogId, button.dataset.escprogdiaId);
        });

        tabelaEscalaDetalheBody?.addEventListener('click', async (event) => {
            const editDayButton = event.target.closest('.edit-dia-banco');
            if (editDayButton) {
                if (escalaDetalheAtual.status === 'FINALIZADA') {
                    showInfoModal('Escala finalizada nao pode ser editada.', 'info');
                    return;
                }

                const escprogId = editDayButton.dataset.escprogId || escalaDetalheAtual.escprogId;
                const escprogdiaId = editDayButton.dataset.escprogdiaId;
                const dia = (escalaDetalheAtual.dias || []).find(item => String(item.ESCPROGDIA_ID || '') === String(escprogdiaId));
                if (!escprogId || !escprogdiaId || !dia) return;

                const values = await showInputModal({
                    title: 'Editar dia ' + formatarDataTabela(dia.DT),
                    inputs: [
                        { label: 'Programacao', type: 'select', id: 'PROGRAMACAO', value: dia.PROGRAMACAO || 'TRB', options: [
                            { value: 'TRB', label: 'Trabalho' },
                            { value: 'F', label: 'Folga' }
                        ], required: true },
                        { label: 'Entrada 1', type: 'time', id: 'HR_ENT1', value: dia.HR_ENT1 === 'F' ? '' : dia.HR_ENT1 || '' },
                        { label: 'Saida 1', type: 'time', id: 'HR_SAI1', value: dia.HR_SAI1 === 'F' ? '' : dia.HR_SAI1 || '' },
                        { label: 'Entrada 2', type: 'time', id: 'HR_ENT2', value: dia.HR_ENT2 === 'F' ? '' : dia.HR_ENT2 || '' },
                        { label: 'Saida 2', type: 'time', id: 'HR_SAI2', value: dia.HR_SAI2 === 'F' ? '' : dia.HR_SAI2 || '' }
                    ],
                    confirmText: 'Salvar dia'
                });
                if (!values) return;

                try {
                    const programacao = String(values.PROGRAMACAO || 'TRB').trim().toUpperCase();
                    const folga = programacao === 'F';
                    await apiRequest('/api/escalas/' + encodeURIComponent(escprogId) + '/dias/' + encodeURIComponent(escprogdiaId), {
                        method: 'PATCH',
                        body: JSON.stringify({
                            PROGRAMACAO: programacao,
                            HR_ENT1: folga ? 'F' : values.HR_ENT1 || dia.HR_ENT1 || '00:00',
                            HR_SAI1: folga ? 'F' : values.HR_SAI1 || dia.HR_SAI1 || '00:00',
                            HR_ENT2: folga ? 'F' : values.HR_ENT2 || dia.HR_ENT2 || '00:00',
                            HR_SAI2: folga ? 'F' : values.HR_SAI2 || dia.HR_SAI2 || '00:00'
                        })
                    });
                    showInfoModal('Dia atualizado no banco.', 'success');
                    if (escalaDetalheAtual.modo === 'mensal') {
                        await carregarDetalheEscalaMensal(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef);
                    } else {
                        await carregarDetalheEscalaBanco(escprogId);
                    }
                } catch (error) {
                    showInfoModal(error.message, 'error');
                }
                return;
            }

            const saveButton = event.target.closest('.save-dia-banco');
            if (!saveButton) return;

            if (escalaDetalheAtual.status === 'FINALIZADA') {
                showInfoModal('Escala finalizada nao pode ser editada.', 'info');
                return;
            }

            const row = saveButton.closest('tr');
            const escprogdiaId = row?.dataset.escprogdiaId;
            const escprogId = row?.dataset.escprogId || escalaDetalheAtual.escprogId;
            if (!escprogId || !escprogdiaId) return;

            try {
                const programacao = row.querySelector('.detail-programacao').value.trim().toUpperCase() || 'TRB';
                const folga = programacao === 'F';
                await apiRequest('/api/escalas/' + encodeURIComponent(escprogId) + '/dias/' + encodeURIComponent(escprogdiaId), {
                    method: 'PATCH',
                    body: JSON.stringify({
                        PROGRAMACAO: programacao,
                        HR_ENT1: folga ? 'F' : row.querySelector('.detail-hr-ent1').value,
                        HR_SAI1: folga ? 'F' : row.querySelector('.detail-hr-sai1').value,
                        HR_ENT2: folga ? 'F' : row.querySelector('.detail-hr-ent2').value,
                        HR_SAI2: folga ? 'F' : row.querySelector('.detail-hr-sai2').value
                    })
                });
                showInfoModal('Dia atualizado no banco.', 'success');
                if (escalaDetalheAtual.modo === 'mensal') {
                    await carregarDetalheEscalaMensal(escalaDetalheAtual.lojaId, escalaDetalheAtual.mesRef);
                } else {
                    await carregarDetalheEscalaBanco(escprogId);
                }
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        const criarTimelineTurnosSelecionados = (turnosSelecionados) => {
            return turnosSelecionados.map(turno => {
                const codigo = turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '';
                return {
                    turnoId: String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID || ''),
                    secaoId: String(turno.ESCSECAO_ID || ''),
                    secaoNome: codigo + (turno.DESCR || 'Secao'),
                    quantidade: String(turno.QTDE_COLABORADORES || 1),
                    inicio: turno.HR_ENT1 || '',
                    fim: turno.HR_SAI2 || turno.HR_SAI1 || '',
                    inicioIntervalo: turno.HR_SAI1 || '',
                    fimIntervalo: turno.HR_ENT2 || ''
                };
            }).filter(turno => turno.secaoId && turno.quantidade && turno.inicio && turno.fim);
        };

        const selecionarTurnosRascunhoEscala = async () => {
            if (!turnosSecaoCache || turnosSecaoCache.length === 0) {
                showInfoModal('Nenhum turno por secao cadastrado para esta loja. Cadastre os turnos antes de gerar a timeline.', 'info');
                return [];
            }

            const options = turnosSecaoCache.map(turno => {
                const codigo = turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '';
                const periodo = (turno.HR_ENT1 || '') + ' - ' + (turno.HR_SAI1 || '') + ' / ' + (turno.HR_ENT2 || '') + ' - ' + (turno.HR_SAI2 || '');
                return {
                    value: String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID),
                    label: codigo + (turno.DESCR || 'Secao') + ' | ' + periodo + ' | ' + (turno.QTDE_COLABORADORES || 1) + ' colaborador(es)',
                    checked: true
                };
            });

            const values = await showInputModal({
                title: 'Gerar Timeline',
                inputs: [
                    { type: 'message', text: 'Selecione os turnos por secao que entrarao nesta escala.' },
                    { label: 'Turnos cadastrados', type: 'checkbox-group', id: 'turnos-rascunho', options, required: true }
                ],
                confirmText: 'Gerar Timeline'
            });
            if (!values) return null;

            const selecionados = new Set((values['turnos-rascunho'] || []).map(String));
            return turnosSecaoCache.filter(turno => selecionados.has(String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID)));
        };
        const renderizarSecoesCriacao = () => {
            if (!criacaoSecoesLista) return;
            criacaoSecoesLista.innerHTML = '';
            if (!turnosSecaoCache.length) {
                criacaoSecoesLista.innerHTML = '<p class="table-card-subtitle">Nenhum turno por secao cadastrado para esta loja.</p>';
                return;
            }
            turnosSecaoCache.forEach((turno) => {
                const id = String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID || '');
                const codigo = turno.COD_SECAO ? turno.COD_SECAO + ' - ' : '';
                const periodo = (turno.HR_ENT1 || '') + ' - ' + (turno.HR_SAI1 || '') + ' / ' + (turno.HR_ENT2 || '') + ' - ' + (turno.HR_SAI2 || '');
                const label = document.createElement('label');
                label.className = 'section-choice-card';
                label.innerHTML = '<input type="checkbox" value="' + escapeHtml(id) + '" checked><strong>' + escapeHtml(codigo + (turno.DESCR || 'Secao')) + '</strong><span>' + escapeHtml(periodo) + '</span><small>' + escapeHtml(turno.QTDE_COLABORADORES || 1) + ' colaborador(es)</small>';
                criacaoSecoesLista.appendChild(label);
            });
        };

        const iniciarCriacaoEscalaPagina = async () => {
            const loja = criacaoEscalaLoja?.value;
            const mes = Number(criacaoEscalaMes?.value);
            const ano = Number(criacaoEscalaAno?.value);
            if (!loja || Number.isNaN(mes) || Number.isNaN(ano)) {
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Selecione loja, mes e ano para iniciar a criacao.';
                return;
            }
            const mesRef = formatDateForDb(ano, mes, 1);
            lojaEscalaSelect.value = loja;
            funcionariosLojaSelect.value = loja;
            if (homeLojaSelect) homeLojaSelect.value = loja;
            if (escalasFiltroLoja) escalasFiltroLoja.value = loja;
            mesSelect.value = String(mes);
            anoSelect.value = String(ano);
            if (escalasFiltroMes) escalasFiltroMes.value = String(mes);
            if (escalasFiltroAno) escalasFiltroAno.value = String(ano);

            const existentes = await carregarResumoEscalas(loja, mesRef);
            if (existentes.length > 0) {
                criacaoSecoesCard?.classList.add('hidden');
                criacaoTimelineCard?.classList.add('hidden');
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Ja existe uma escala para esta loja e mes. Abra a escala existente; nao sera criada outra escala.';
                return;
            }

            dadosEscala = [];
            escalaCarregadaId = null;
            currentLoadedScale = null;
            escalaRascunhoAtivo = true;
            escalaRascunhoContexto = { loja, mesRef, criadoEm: new Date().toISOString() };
            await carregarSecoesDaLoja(true, loja);
            await carregarTurnosSecaoDaLoja(true, loja);
            renderizarSecoesCriacao();
            criacaoSecoesCard?.classList.remove('hidden');
            criacaoTimelineCard?.classList.add('hidden');
            if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Selecione as secoes e gere a timeline.';
        };

        const gerarTimelineCriacaoPagina = async () => {
            const selecionados = new Set(Array.from(criacaoSecoesLista?.querySelectorAll('input[type="checkbox"]:checked') || []).map(input => input.value));
            const turnosSelecionados = turnosSecaoCache.filter(turno => selecionados.has(String(turno.ESCSECAOTURNO_ID || turno.ESCSECAO_ID)));
            if (!turnosSelecionados.length) {
                if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Selecione ao menos uma seção para gerar a timeline.';
                return;
            }
            dadosEscala = criarTimelineTurnosSelecionados(turnosSelecionados);
            renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
            renderizarTimelineCompleta('timeline-content', dadosEscala);
            atualizarContadoresHome();
            criacaoTimelineCard?.classList.remove('hidden');
            esqueletoModal?.classList.add('hidden');
            detalhadaModal?.classList.add('hidden');
            detailedScaleHasBeenGenerated = false;
            if (criacaoEscalaStatus) criacaoEscalaStatus.textContent = 'Timeline atualizada. Revise as seções e distribua os funcionários.';
        };

        const iniciarNovaEscalaRascunho = async (opcoes = {}) => {
            const dataPadrao = opcoes.mesRef ? new Date(opcoes.mesRef + 'T00:00:00') : null;
            let valoresPadrao = {
                loja: String(opcoes.loja || (escalasFiltroLoja?.value !== 'all' ? escalasFiltroLoja?.value : '') || lojaEscalaSelect.value || ''),
                mes: dataPadrao ? String(dataPadrao.getMonth()) : String(escalasFiltroMes?.value !== 'all' ? escalasFiltroMes?.value : mesSelect.value),
                ano: dataPadrao ? String(dataPadrao.getFullYear()) : String(escalasFiltroAno?.value !== 'all' ? escalasFiltroAno?.value : anoSelect.value)
            };

            const lojaOptions = Array.from(lojaEscalaSelect.options || []).filter(option => option.value).map(option => ({ value: option.value, label: option.textContent }));
            const mesOptions = Array.from(mesSelect.options || []).map(option => ({ value: option.value, label: option.textContent }));
            const anoOptions = Array.from(anoSelect.options || []).map(option => ({ value: option.value, label: option.textContent }));

            while (true) {
                const values = await showInputModal({
                    title: 'Criar Nova Escala',
                    inputs: [
                        { type: 'message', text: 'Selecione a loja e o período da nova escala.' },
                        { label: 'Loja', type: 'select', id: 'nova-escala-loja', value: valoresPadrao.loja, options: lojaOptions, required: true },
                        { label: 'Mês', type: 'select', id: 'nova-escala-mes', value: valoresPadrao.mes, options: mesOptions, required: true },
                        { label: 'Ano', type: 'select', id: 'nova-escala-ano', value: valoresPadrao.ano, options: anoOptions, required: true }
                    ],
                    cancelText: 'Cancelar',
                    confirmText: 'Iniciar Criação'
                });
                if (!values) return;

                const loja = values['nova-escala-loja'];
                const mes = Number(values['nova-escala-mes']);
                const ano = Number(values['nova-escala-ano']);
                const mesRef = formatDateForDb(ano, mes, 1);
                valoresPadrao = { loja, mes: String(mes), ano: String(ano) };

                let existentes = [];
                try {
                    existentes = await carregarResumoEscalas(loja, mesRef);
                } catch (error) {
                    showInfoModal('Não foi possível validar a escala existente: ' + error.message, 'error');
                    return;
                }

                if (existentes.length > 0) {
                    const abrirEscala = await showInputModal({
                        title: 'Escala já existente',
                        inputs: [{ type: 'message', text: 'Já existe uma escala para esta loja e mês. Selecione um novo mês ou Modifique a Escala criada.' }],
                        cancelText: 'Voltar',
                        confirmText: 'Abrir Escala'
                    });
                    if (abrirEscala) {
                        window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
                        return;
                    }
                    continue;
                }

                lojaEscalaSelect.value = loja;
                funcionariosLojaSelect.value = loja;
                if (homeLojaSelect) homeLojaSelect.value = loja;
                mesSelect.value = String(mes);
                anoSelect.value = String(ano);
                dadosEscala = [];
                colaboradorShifts = [];
                escalaCarregadaId = null;
                currentLoadedScale = null;
                detailedScaleHasBeenGenerated = false;
                escalaRascunhoAtivo = true;
                escalaRascunhoContexto = { loja, mesRef, criadoEm: new Date().toISOString() };
                await carregarSecoesDaLoja(true, loja);
                await carregarTurnosSecaoDaLoja(true, loja);
                renderizarSecoesCriacao();
                prepararPaineisCriacao();
                esqueletoModal.classList.add('hidden');
                detalhadaModal.classList.add('hidden');
                window.location.hash = '/escalas/nova/' + loja + '/' + mesRef;
                return;
            }
        };

        window.addEventListener('beforeunload', (event) => {
            if (!escalaRascunhoAtivo) return;
            event.preventDefault();
            event.returnValue = '';
        });

        salvarEscalaBtn.addEventListener('click', async () => {
            const dados = parseEscalaFromModal();
            if (!dados.length) {
                showInfoModal('Gere a escala detalhada antes de salvar.', 'error');
                return;
            }

            const semFuncionario = dados.filter(colaborador => !colaborador.escfuncId || !colaborador.chapa);
            if (semFuncionario.length > 0) {
                showInfoModal('Distribua todos os funcionários antes de salvar a escala.', 'error');
                return;
            }

            const lojaId = Number(escalaRascunhoContexto?.loja || lojaEscalaSelect.value);
            const mes = Number(mesSelect.value);
            const ano = Number(anoSelect.value);
            const escalaParaSalvar = {
                id: Date.now(),
                lojaId,
                mes,
                ano,
                dados,
                timelineData: JSON.parse(JSON.stringify(dadosEscala)),
                mesAno: detalhadaMesAno.textContent,
                criadoEm: new Date().toISOString(),
                criadoPorLogin: usuarioSessaoCache?.login || '',
                criadoPorNome: usuarioSessaoCache?.nome || usuarioSessaoCache?.login || ''
            };

            salvarEscalaBtn.disabled = true;
            salvarEscalaBtn.textContent = 'Salvando...';
            try {
                const result = await sincronizarEscalaComBanco(escalaParaSalvar);
                const total = result.saved ? result.saved.length : 0;
                if (!total) throw new Error('Nenhum funcionário foi gravado no banco.');
                escalaRascunhoAtivo = false;
                escalaRascunhoContexto = null;
                escalaCarregadaId = null;
                currentLoadedScale = null;
                showInfoModal('Escala salva no banco com sucesso para ' + total + ' funcionário(s).', 'success');
                await consultarEscalasBancoLocal().catch(() => {});
                setTimeout(() => { window.location.hash = '/escalas-geradas'; }, 700);
            } catch (error) {
                showInfoModal(error.details ? error.details.join(' ') : error.message, 'error');
            } finally {
                salvarEscalaBtn.disabled = false;
                salvarEscalaBtn.textContent = 'Salvar Escala';
            }
        });

        tabelaRegistrosBody.addEventListener('click', async (e) => {
            const targetButton = e.target.closest('.action-btn-table');
            if (!targetButton) return;
            
            const escalaId = targetButton.dataset.id;
            const escalas = getEscalasSalvas();
            const escalaAlvo = escalas.find(e => e.id == escalaId);
            if (!escalaAlvo) return;

            if (targetButton.classList.contains('load')) {
                await aplicarLojaDaEscalaSalva(escalaAlvo);
                dadosEscala = JSON.parse(JSON.stringify(escalaAlvo.timelineData || []));
                renderizarTimelineCompleta('timeline-content');
                atualizarContadoresHome();
                carregarEscalaDetalhada(escalaAlvo);
            } 
            else if (targetButton.classList.contains('view-skeleton')) {
                await aplicarLojaDaEscalaSalva(escalaAlvo);
                dadosEscala = JSON.parse(JSON.stringify(escalaAlvo.timelineData || []));
                renderizarTimelineCompleta('timeline-content');
                atualizarContadoresHome();
                carregarEsqueletoSalvo(escalaAlvo);
            }
            else if (targetButton.classList.contains('view-timeline')) {
                if (escalaAlvo.timelineData) {
                    const visualizerContent = document.getElementById('timeline-visualizer-content');
                    document.getElementById('timelineVisualizerTitle').textContent = `Linha do Tempo - ${escalaAlvo.nome}`;
                    renderizarTimelineCompleta('timeline-visualizer-content', escalaAlvo.timelineData);
                    visualizerContent.dataset.source = JSON.stringify(escalaAlvo.timelineData); // Salva os dados para impressão
                    timelineVisualizerModal.classList.remove('hidden');
                } else {
                    showInfoModal('Esta escala não possui uma Linha do Tempo salva.', 'info');
                }
            }
            else if (targetButton.classList.contains('delete')) {
                const values = await showInputModal({
                    title: `Excluir Escala "${escalaAlvo.nome}"`,
                    inputs: [{ label: 'Digite a senha para confirmar a exclusão:', type: 'password', id: 'escala-senha', required: true }],
                    confirmText: 'Excluir Permanentemente'
                });

                if (values && values['escala-senha'] === escalaAlvo.senha) {
                    const novasEscalas = escalas.filter(e => e.id != escalaId);
                    await salvarEscalasNoStorage(novasEscalas);
                    renderizarTabelaRegistros();
                    showInfoModal("Escala excluída com sucesso.", "success");
                } else if (values) {
                    showInfoModal("Senha incorreta. A exclusão foi cancelada.", "error");
                }
            }
        });

        tabelaBancoBody.addEventListener('click', async (e) => {
            const abrirButton = e.target.closest('.banco-abrir');
            const criarButton = e.target.closest('.banco-criar');
            const oficializarButton = e.target.closest('.banco-oficializar');
            const inativarButton = e.target.closest('.banco-inativar');
            const historicoButton = e.target.closest('.banco-historico');
            if (!abrirButton && !criarButton && !oficializarButton && !inativarButton && !historicoButton) return;

            const button = abrirButton || criarButton || oficializarButton || inativarButton || historicoButton;
            const loja = button.dataset.loja;
            const mesRef = button.dataset.mesRef;
            if (loja) {
                lojaEscalaSelect.value = loja;
                if (homeLojaSelect) homeLojaSelect.value = loja;
                if (escalasFiltroLoja) escalasFiltroLoja.value = loja;
            }
            if (mesRef) {
                const dataRef = new Date(mesRef + 'T00:00:00');
                mesSelect.value = String(dataRef.getMonth());
                anoSelect.value = String(dataRef.getFullYear());
                if (escalasFiltroMes) escalasFiltroMes.value = String(dataRef.getMonth());
                if (escalasFiltroAno) escalasFiltroAno.value = String(dataRef.getFullYear());
            }
            if (criarButton) {
                window.location.hash = '/escalas/nova/' + loja + '/' + mesRef;
                return;
            }

            if (oficializarButton) {
                const confirmacao = await showInputModal({
                    title: 'Oficializar escala',
                    inputs: [{ type: 'message', text: 'A escala sera marcada como oficial. Qualquer alteracao futura criara uma nova revisao nao oficializada.' }],
                    confirmText: 'Oficializar'
                });
                if (!confirmacao) return;
                await apiRequest('/api/escalas/oficializar', { method: 'POST', body: JSON.stringify({ lojaId: Number(loja), mesRef }) });
                showInfoModal('Escala oficializada com sucesso.', 'success');
                await consultarEscalasBancoLocal();
                return;
            }

            if (inativarButton) {
                const confirmacao = await showInputModal({
                    title: 'Inativar escala',
                    inputs: [{ type: 'message', text: 'A escala sera inativada e nao aparecera nos relatorios nem bloqueara nova escala para o mesmo mes.' }],
                    confirmText: 'Inativar'
                });
                if (!confirmacao) return;
                await apiRequest('/api/escalas/inativar', { method: 'POST', body: JSON.stringify({ lojaId: Number(loja), mesRef }) });
                showInfoModal('Escala inativada com sucesso.', 'success');
                await consultarEscalasBancoLocal();
                return;
            }

            if (historicoButton) {
                await carregarHistoricoRevisoesBanco(loja, mesRef);
                return;
            }

            try {
                const data = await apiRequest('/api/escalas?lojaId=' + encodeURIComponent(loja) + '&mesRef=' + encodeURIComponent(mesRef));
                const primeiraEscala = (data.escalas || [])[0];
                if (!primeiraEscala?.ESCPROG_ID) {
                    showInfoModal('Nenhum detalhamento encontrado para esta escala.', 'info');
                    return;
                }
                window.location.hash = '/escala-banco-mensal/' + loja + '/' + mesRef;
            } catch (error) {
                showInfoModal(error.message, 'error');
            }
        });

        document.getElementById('timeline-content').addEventListener('click', async (e) => {
            const clickedRow = e.target.closest('.timeline-row');
            if (!clickedRow) return;

            const editBtn = e.target.closest('.edit-btn');
            const deleteBtn = e.target.closest('.delete-btn');
            
            if (editBtn) {
                 e.stopPropagation(); 
                 entrarModoEdicao(parseInt(editBtn.dataset.index));
                 return;
            }
            
            if (deleteBtn) {
                e.stopPropagation();
                const result = await showInputModal({
                    title: 'Confirmar Exclusão',
                    inputs: [{ type: 'message', text: 'Tem certeza que deseja excluir este turno da linha do tempo?' }],
                    confirmText: 'Excluir',
                });
                if(result) {
                    dadosEscala.splice(parseInt(deleteBtn.dataset.index), 1); 
                    renderizarTimelineCompleta('timeline-content'); 
                    atualizarContadoresHome();
                }
                return;
            }

            const actionsContainer = clickedRow.querySelector('.row-actions');
            if (actionsContainer) {
                 document.querySelectorAll('#timeline-content .row-actions').forEach(actions => { 
                    if(actions !== actionsContainer) actions.classList.add('hidden'); 
                }); 
                actionsContainer.classList.toggle('hidden');
            }
        });


        document.getElementById('criacaoTimelineContent')?.addEventListener('click', async (event) => {
            const deleteButton = event.target.closest('.delete-btn');
            if (!deleteButton || distribuicaoFolgasBloqueada) return;
            event.preventDefault();
            const index = Number(deleteButton.dataset.index);
            const turnoRemovido = dadosEscala[index];
            const confirmacao = await showInputModal({
                title: 'Remover seção da escala',
                inputs: [{ type: 'message', text: 'A seção será removida da timeline antes da escala ser salva.' }],
                cancelText: 'Cancelar',
                confirmText: 'Remover'
            });
            if (!confirmacao) return;
            dadosEscala.splice(index, 1);
            if (turnoRemovido?.turnoId) {
                const checkbox = criacaoSecoesLista?.querySelector('input[value="' + CSS.escape(String(turnoRemovido.turnoId)) + '"]');
                if (checkbox) checkbox.checked = false;
            }
            renderizarTimelineCompleta('criacaoTimelineContent', dadosEscala);
            renderizarTimelineCompleta('timeline-content', dadosEscala);
            esqueletoModal?.classList.add('hidden');
            detalhadaModal?.classList.add('hidden');
            detailedScaleHasBeenGenerated = false;
            atualizarContadoresHome();
        });
        const applyEsqueletoZoom = () => {
            const container = document.getElementById('tabela-esqueleto-container');
            if(container) {
                container.style.transform = `scale(${esqueletoZoomLevel})`;
            }
        };

        const applyMainTimelineZoom = () => {
            const container = document.getElementById('timeline-content');
            if (container) {
                container.style.transform = `scale(${mainTimelineZoomLevel})`;
            }
        };

        zoomInBtn.addEventListener('click', () => { if (esqueletoZoomLevel < 2.0) { esqueletoZoomLevel = parseFloat((esqueletoZoomLevel + 0.1).toFixed(2)); applyEsqueletoZoom(); } });
        zoomOutBtn.addEventListener('click', () => { if (esqueletoZoomLevel > 0.5) { esqueletoZoomLevel = parseFloat((esqueletoZoomLevel - 0.1).toFixed(2)); applyEsqueletoZoom(); } });
        zoomResetBtn.addEventListener('click', () => { esqueletoZoomLevel = 1.0; applyEsqueletoZoom(); });
        
        timelineZoomInBtn.addEventListener('click', () => { if (mainTimelineZoomLevel < 2.0) { mainTimelineZoomLevel = parseFloat((mainTimelineZoomLevel + 0.1).toFixed(2)); applyMainTimelineZoom(); } });
        timelineZoomOutBtn.addEventListener('click', () => { if (mainTimelineZoomLevel > 0.5) { mainTimelineZoomLevel = parseFloat((mainTimelineZoomLevel - 0.1).toFixed(2)); applyMainTimelineZoom(); } });
        timelineZoomResetBtn.addEventListener('click', () => { mainTimelineZoomLevel = 1.0; applyMainTimelineZoom(); });


        // --- LÓGICA DE CONFIGURAÇÕES ---
        const salvarConfiguracoes = async () => {
            const settingsForm = document.getElementById('settings-form');
            const inputs = settingsForm.querySelectorAll('input');
            let settings = {};
            inputs.forEach(input => {
                settings[input.id] = input.value;
            });
            await salvarConfigNoServidor(settings);
            
            await showInputModal({
                title: 'Sucesso',
                inputs: [{ type: 'message', text: 'Configurações salvas. A página será recarregada para aplicar as mudanças.' }],
                confirmText: 'OK',
                cancelText: ''
            });
            location.reload();
        };

        const carregarConfiguracoes = () => {
            const settings = escalaConfigCache;
            if (settings) {
                Object.keys(settings).forEach(key => {
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = settings[key];
                    }
                });
            }
        };

        const ocultarBackupConfiguracoes = () => {
            const salvarBackupBtn = document.getElementById('salvarBackupBtn');
            const carregarBackupBtn = document.getElementById('carregarBackupBtn');
            const backupBlock = salvarBackupBtn?.closest('.space-y-3');
            const backupTitle = backupBlock?.previousElementSibling;
            const backupSeparator = backupTitle?.previousElementSibling;

            backupBlock?.classList.add('hidden');
            backupTitle?.classList.add('hidden');
            backupSeparator?.classList.add('hidden');
            salvarBackupBtn?.classList.add('hidden');
            carregarBackupBtn?.classList.add('hidden');
            document.getElementById('backupFileInput')?.classList.add('hidden');
        };

       

        // --- INICIALIZAÇÃO ---
        window.onload = async () => { 
            try {
                popularSeletoresData();
                popularFiltrosEscalas();
                await carregarUsuarioSessao();
                configurarAcoesAdmin();
                await carregarEstadoServidor();
                await carregarLojasEscala();
                await carregarSecoesDaLoja(true);
                await carregarTurnosSecaoDaLoja(true);
                await carregarFuncionariosDaLoja(true);
            } catch (error) {
                showInfoModal(`Erro ao carregar dados salvos: ${error.message}`, 'error');
            }
           
            carregarConfiguracoes();
            ocultarBackupConfiguracoes();
            
            if (getEscalasSalvas().length === 0) {
                 dadosEscala = []; 
            }
            mainTimelineZoomLevel = 1.0;
            applyMainTimelineZoom();
            renderizarTimelineCompleta('timeline-content'); 
            atualizarContadoresHome();
            handleHashNavigation(); 
            renderizarTabelaRegistros();
            // Fluxos de importacao/backup local ficam desativados: o banco e a origem oficial.
            return;

            // ==========================================================
            // =========== LÓGICA DE BACKUP E RESTAURAÇÃO ================
            // ==========================================================
            const salvarBackupBtn = document.getElementById('salvarBackupBtn');
            const carregarBackupBtn = document.getElementById('carregarBackupBtn');
            const backupFileInput = document.getElementById('backupFileInput');

            // --- Lógica para Salvar o Backup (Exportar) ---
            salvarBackupBtn?.addEventListener('click', () => {
                try {
                    const escalas = getEscalasSalvas();
                    const config = escalaConfigCache || {};
                    const backupData = {
                        version: '1.0-total',
                        createdAt: new Date().toISOString(),
                        data: {
                            escalasSalvas: escalas,
                            escalaConfig: config
                        }
                    };
                    const jsonString = JSON.stringify(backupData, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backup_total_escalas_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showInfoModal('Arquivo de backup total gerado com sucesso!', 'success');
                } catch (error) {
                    console.error("Erro ao gerar backup:", error);
                    showInfoModal('Ocorreu um erro ao tentar gerar o arquivo de backup total.', 'error');
                }
            });

            // --- Gatilho para abrir o seletor de arquivo ---
            carregarBackupBtn?.addEventListener('click', () => {
                backupFileInput?.click();
            });

            // --- Lógica para Carregar o Backup (Importar) ---
            backupFileInput?.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const content = e.target.result;
                        const backupData = JSON.parse(content);

                        if (!backupData || backupData.version !== '1.0-total' || !backupData.data || !backupData.data.escalasSalvas) {
                           throw new Error("Formato de arquivo de backup total inválido ou incompatível.");
                        }

                        const escalasImportadas = backupData.data.escalasSalvas;
                        const configImportada = backupData.data.escalaConfig || {};
                        
                        const userChoice = await showInputModal({
                            title: 'Confirmar Restauração Total',
                            inputs: [{
                                type: 'message',
                                text: `Você está prestes a carregar ${escalasImportadas.length} escala(s) do arquivo. Isso irá substituir TODAS as escalas e configurações atuais. Deseja continuar?`
                            }],
                            confirmText: 'Sim, Sobrescrever Tudo',
                            cancelText: 'Cancelar'
                        });

                        if (userChoice) {
                            await salvarEscalasNoStorage(escalasImportadas);
                            await salvarConfigNoServidor(configImportada);
                            await showInputModal({
                                title: 'Sucesso!',
                                inputs: [{ type: 'message', text: 'Backup total restaurado. A página será recarregada.' }],
                                confirmText: 'OK',
                                cancelText: ''
                            });
                            location.reload();
                        }
                    } catch (error) {
                        console.error("Erro ao carregar backup total:", error);
                        showInfoModal(`Erro ao ler o arquivo de backup: ${error.message}`, 'error');
                    } finally {
                        event.target.value = '';
                    }
                };
                reader.readAsText(file);
            });

            // =================================================================
            // === NOVA LÓGICA: IMPORTAÇÃO DE BACKUP INDIVIDUAL DE ESCALA ======
            // =================================================================
            const importarEscalaBtn = document.getElementById('importarEscalaBtn');
            const importarEscalaInput = document.getElementById('importarEscalaInput');

            importarEscalaBtn.addEventListener('click', () => {
                importarEscalaInput.click();
            });

            importarEscalaInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const content = e.target.result;
                        const backupData = JSON.parse(content);

                        if (!backupData || backupData.version !== '1.0-individual' || !backupData.data || !backupData.data.id) {
                           throw new Error("Arquivo de backup de escala individual inválido ou corrompido.");
                        }

                        const escalaImportada = backupData.data;
                        const escalasAtuais = getEscalasSalvas();

                        if (escalasAtuais.some(escala => escala.id === escalaImportada.id)) {
                             const userChoice = await showInputModal({
                                title: 'Escala Duplicada',
                                inputs: [{ type: 'message', text: `A escala "${escalaImportada.nome}" já existe. Deseja substituí-la pela versão do arquivo?` }],
                                confirmText: 'Sim, Substituir',
                                cancelText: 'Não, Manter Atual'
                            });
                             if (userChoice) {
                                const index = escalasAtuais.findIndex(escala => escala.id === escalaImportada.id);
                                escalasAtuais[index] = escalaImportada;
                             } else {
                                 event.target.value = '';
                                 return;
                             }
                        } else {
                            escalasAtuais.push(escalaImportada);
                        }
                        
                        await salvarEscalasNoStorage(escalasAtuais);
                        renderizarTabelaRegistros();
                        showInfoModal(`Escala "${escalaImportada.nome}" importada com sucesso!`, 'success');

                    } catch (error) {
                        console.error("Erro ao importar escala:", error);
                        showInfoModal(`Erro ao processar o arquivo de backup: ${error.message}`, 'error');
                    } finally {
                        event.target.value = '';
                    }
                };
                reader.readAsText(file);
            });
        };
// --- LÓGICA 5X2 - 100% CLT + EQUILÍBRIO DE EQUIPE + SEM FOLGAS CASADAS ---
const EPOCH_MON = new Date(2024, 0, 1); 

const distribuirFolgas5x2Auto = async () => {
    const total = colaboradorShifts.length;
    if (total === 0) {
        showInfoModal("Gere a tabela com colaboradores primeiro.", "error");
        return;
    }

    const rule = parseInt(document.getElementById('regraDomingoSelect').value);
    const month = parseInt(mesSelect.value);
    const year = parseInt(anoSelect.value);
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startScale = new Date(firstDay); startScale.setDate(startScale.getDate() - 14);
    let endScale = new Date(lastDay); endScale.setDate(endScale.getDate() + 7);

    let scheduleMap = Array.from({ length: total }, () => ({}));
    let offCountPerDay = {};

    await carregarAusenciasDaLoja(getLojaContextoEscala());

    const marcarFolgaNoMapa = (colabIdx, date) => {
        const key = date.toDateString();
        if (scheduleMap[colabIdx][key] === 'F') return;
        scheduleMap[colabIdx][key] = 'F';
        offCountPerDay[key] = (offCountPerDay[key] || 0) + 1;
    };

    const aplicarAusenciasObrigatoriasNaSemana = (weekDays) => {
        for (let i = 0; i < total; i++) {
            const funcionario = getFuncionarioSelecionadoPorLinha(i);
            if (!funcionario) continue;

            weekDays.forEach((date) => {
                const dataIso = formatDateForDb(date.getFullYear(), date.getMonth(), date.getDate());
                const ausencia = encontrarAusenciaFuncionario(funcionario.ESCFUNC_ID, funcionario.CHAPA, dataIso);
                if (ausencia) {
                    marcarFolgaNoMapa(i, date);
                }
            });
        }
    };

    let current = new Date(startScale);
    
    while (current <= endScale) {
        if (current.getDay() === 1) { // Processa bloco de Segunda a Domingo
            let weekDays = [];
            for(let i=0; i<7; i++) {
                let d = new Date(current); d.setDate(d.getDate() + i);
                weekDays.push(d);
            }
            const sunday = weekDays[6];
            const weeksSinceEpoch = Math.floor((sunday - EPOCH_MON) / (1000 * 60 * 60 * 24 * 7));
            aplicarAusenciasObrigatoriasNaSemana(weekDays);

            // PASSO 1: ATRIBUIR DOMINGOS (Regra de Rodízio)
            for (let i = 0; i < total; i++) {
                const isSundayOff = ((weeksSinceEpoch % rule + rule) % rule) === (i % rule);
                if(isSundayOff && scheduleMap[i][sunday.toDateString()] !== 'F') {
                    marcarFolgaNoMapa(i, sunday);
                }
            }

            // PASSO 2: ATRIBUIR FOLGAS OBRIGATÓRIAS (TRAVA DOS 6 DIAS)
            for (let i = 0; i < total; i++) {
                for (let dIdx = 0; dIdx < 6; dIdx++) {
                    const diaAtual = weekDays[dIdx];
                    let streak = 0;
                    let checkDate = new Date(diaAtual);
                    for (let s = 1; s <= 7; s++) {
                        checkDate.setDate(checkDate.getDate() - 1);
                        if (scheduleMap[i][checkDate.toDateString()] === 'T') streak++;
                        else if (scheduleMap[i][checkDate.toDateString()] === 'F') break;
                    }
                    if (streak >= 6 && scheduleMap[i][diaAtual.toDateString()] !== 'F') {
                        marcarFolgaNoMapa(i, diaAtual);
                    }
                }
            }

            // PASSO 3: COMPLETAR QUOTA 5X2 EVITANDO FOLGAS CONSECUTIVAS
            for (let i = 0; i < total; i++) {
                let currentOffs = weekDays.filter(d => scheduleMap[i][d.toDateString()] === 'F').length;
                let offsNeeded = 2 - currentOffs;

                if (offsNeeded > 0) {
                    for (let n = 0; n < offsNeeded; n++) {
                        let bestDay = null;
                        let minScore = Infinity;

                        for (let dIdx = 0; dIdx < 6; dIdx++) { // Tenta de Segunda a Sábado
                            const diaCandidato = weekDays[dIdx];
                            if (!scheduleMap[i][diaCandidato.toDateString()]) {
                                
                                // Cálculo de penalidade (Score)
                                let peopleOffHoje = offCountPerDay[diaCandidato.toDateString()] || 0;
                                let score = peopleOffHoje * 100; // Peso base pelo equilíbrio da equipe

                                // VERIFICAÇÃO DE VIZINHANÇA (EVITAR FOLGA CASADA)
                                const ontem = new Date(diaCandidato); ontem.setDate(diaCandidato.getDate() - 1);
                                const amanha = new Date(diaCandidato); amanha.setDate(diaCandidato.getDate() + 1);
                                
                                if (scheduleMap[i][ontem.toDateString()] === 'F' || scheduleMap[i][amanha.toDateString()] === 'F') {
                                    score += 500; // Penalidade alta por ser folga consecutiva
                                }

                                if (score < minScore) {
                                    minScore = score;
                                    bestDay = diaCandidato;
                                }
                            }
                        }

                        if (bestDay) {
                            marcarFolgaNoMapa(i, bestDay);
                        }
                    }
                }

                // PASSO 4: FINALIZAR DIAS DE TRABALHO
                weekDays.forEach(d => {
                    if (!scheduleMap[i][d.toDateString()]) scheduleMap[i][d.toDateString()] = 'T';
                });
            }
        }
        current.setDate(current.getDate() + 1);
    }

    // --- RENDERIZAÇÃO FINAL ---
    const rows = document.querySelectorAll('#tabela-esqueleto tbody tr');
    rows.forEach((row, colabIdx) => {
        const dayCells = row.querySelectorAll('.escala-cell');
        dayCells.forEach((cell, cellIdx) => {
            const day = cellIdx + 1;
            const date = new Date(year, month, day);
            const status = scheduleMap[colabIdx][date.toDateString()];
            const isSunday = date.getDay() === 0;

            cell.textContent = '';
            delete cell.dataset.ausenciaObrigatoria;
            cell.removeAttribute('title');
            cell.classList.remove('bg-red-300', 'bg-orange-600', 'text-white', 'font-bold', 'bg-yellow-100');

            if (status === 'F') {
                cell.textContent = 'F';
                if (isSunday) cell.classList.add('bg-orange-600', 'text-white', 'font-bold');
                else cell.classList.add('bg-red-300', 'text-white', 'font-bold');
            } else if (isSunday) {
                cell.classList.add('bg-yellow-100');
            }
        });
    });

    const ausenciasAplicadas = aplicarAusenciasNoEsqueleto();
    atualizarContagemEsqueleto();
    detailedScaleHasBeenGenerated = false;
    detalhadaModalBody.innerHTML = '';
    detalhadaModal.classList.add('hidden');
    gerarEscalaDetalhadaBtn.textContent = 'Gerar Escala Detalhada';
    definirBloqueioDistribuicao(true);
    if (ausenciasAplicadas.length > 0) {
        showInfoModal([
            "Distribuição concluída. Ausências cadastradas foram aplicadas como folga obrigatória.",
            ...ausenciasAplicadas
        ], "success");
    } else {
        showInfoModal("Distribuição Concluída: 5x2 equilibrada, sem folgas casadas (exceto se necessário por lei).", "success");
    }
};

// Adicionar o Event Listener para o novo botão (coloque dentro do window.onload ou junto aos outros botões)
autoDistribuirFolgasBtn.addEventListener('click', distribuirFolgas5x2Auto);
