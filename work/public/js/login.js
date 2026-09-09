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
      await api.login(login, password);
      window.location.href = '/app#/escalas-geradas';
    } catch (error) {
      message.textContent = error.message;
    }
  });
})();
