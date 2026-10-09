(function initLogin() {
  const form = document.getElementById('loginForm');
  const message = document.getElementById('loginMessage');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = '';

    const formData = new FormData(form);
    const login = String(formData.get('login') || '').trim();
    const password = String(formData.get('password') || '');

    try {
      const result = await api.login(login, password);
      window.location.href = result.startPath || '/nova';
    } catch (error) {
      message.textContent = error.status === 401 ? 'Usuário ou senha incorretos.' : error.message;
    }
  });
})();
