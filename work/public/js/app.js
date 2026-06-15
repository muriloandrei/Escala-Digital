(function initApp() {
  const userName = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  const lojaSelect = document.getElementById('lojaSelect');
  const mesRefInput = document.getElementById('mesRefInput');
  const loadDataBtn = document.getElementById('loadDataBtn');
  const saveSampleBtn = document.getElementById('saveSampleBtn');
  const lojasCount = document.getElementById('lojasCount');
  const funcionariosCount = document.getElementById('funcionariosCount');
  const ausenciasCount = document.getElementById('ausenciasCount');
  const escalasCount = document.getElementById('escalasCount');
  const funcionariosTable = document.getElementById('funcionariosTable');
  const statusMessage = document.getElementById('statusMessage');
  let funcionariosCarregados = [];

  const today = new Date();
  mesRefInput.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  function formatDateBounds(monthValue) {
    const [year, month] = monthValue.split('-').map(Number);
    const first = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const last = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    return { first, last };
  }

  function renderFuncionarios(funcionarios) {
    funcionariosTable.innerHTML = '';

    for (const funcionario of funcionarios) {
      const row = document.createElement('tr');
      const values = [
        funcionario.CHAPA,
        funcionario.NOME,
        funcionario.LOJA,
        funcionario.BRIGADISTA,
        funcionario.HR_ENT1,
        funcionario.HR_SAI1
      ];

      for (const value of values) {
        const cell = document.createElement('td');
        cell.textContent = value ?? '';
        row.appendChild(cell);
      }

      funcionariosTable.appendChild(row);
    }
  }

  async function loadInitialData() {
    try {
      const me = await api.me();
      userName.textContent = me.user.nome || me.user.login;

      const lojasData = await api.lojas();
      lojaSelect.innerHTML = '';
      for (const loja of lojasData.lojas) {
        const option = document.createElement('option');
        option.value = loja.LOJA;
        option.textContent = `Loja ${loja.LOJA}`;
        lojaSelect.appendChild(option);
      }
      lojasCount.textContent = lojasData.lojas.length;
    } catch (error) {
      window.location.href = '/login.html';
    }
  }

  async function loadStoreData() {
    const lojaId = lojaSelect.value;
    const mesRef = mesRefInput.value;
    if (!lojaId || !mesRef) return;

    statusMessage.textContent = 'Carregando...';
    try {
      const { first, last } = formatDateBounds(mesRef);
      const [funcionariosData, ausenciasData] = await Promise.all([
        api.funcionarios(lojaId),
        api.ausencias(lojaId, first, last)
      ]);
      const escalasData = await api.escalas(lojaId, first);

      funcionariosCarregados = funcionariosData.funcionarios;
      renderFuncionarios(funcionariosData.funcionarios);
      funcionariosCount.textContent = funcionariosData.funcionarios.length;
      ausenciasCount.textContent = ausenciasData.ausencias.length;
      escalasCount.textContent = escalasData.escalas.length;
      statusMessage.textContent = 'Dados carregados.';
    } catch (error) {
      statusMessage.textContent = error.message;
    }
  }

  function criarDiasTeste(first) {
    const [year, month, day] = first.split('-').map(Number);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(year, month - 1, day + index);
      const data = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0')
      ].join('-');

      return {
        data,
        hrEnt1: '08:00',
        hrSai1: '12:00',
        hrEnt2: '13:00',
        hrSai2: '17:20',
        programacao: 'TRB'
      };
    });
  }

  async function saveSampleScale() {
    const lojaId = Number(lojaSelect.value);
    const mesRef = mesRefInput.value;
    if (!lojaId || !mesRef) return;

    if (funcionariosCarregados.length === 0) {
      await loadStoreData();
    }

    const { first } = formatDateBounds(mesRef);
    const funcionarios = funcionariosCarregados.slice(0, 2).map((funcionario) => ({
      escfuncId: Number(funcionario.ESCFUNC_ID),
      chapa: funcionario.CHAPA,
      dias: criarDiasTeste(first)
    }));

    if (funcionarios.length === 0) {
      statusMessage.textContent = 'Nenhum funcionario carregado para salvar.';
      return;
    }

    try {
      await api.salvarEscala({ lojaId, mesRef: first, funcionarios, oficializada: 0 });
      statusMessage.textContent = 'Escala teste salva no banco.';
      await loadStoreData();
    } catch (error) {
      statusMessage.textContent = error.message;
    }
  }

  logoutBtn.addEventListener('click', async () => {
    await api.logout().catch(() => {});
    window.location.href = '/login.html';
  });

  loadDataBtn.addEventListener('click', loadStoreData);
  saveSampleBtn.addEventListener('click', saveSampleScale);
  loadInitialData();
})();
