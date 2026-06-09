const api = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || 'Erro na comunicacao com o servidor.');
      error.details = data.details || data.errors;
      throw error;
    }

    return data;
  },

  login(login, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
  },

  logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
  },

  me() {
    return this.request('/api/auth/me');
  },

  lojas() {
    return this.request('/api/catalog/lojas');
  },

  funcionarios(lojaId) {
    return this.request(`/api/catalog/lojas/${encodeURIComponent(lojaId)}/funcionarios`);
  },

  ausencias(lojaId, inicio, fim) {
    const params = new URLSearchParams({ inicio, fim });
    return this.request(`/api/catalog/lojas/${encodeURIComponent(lojaId)}/ausencias?${params}`);
  },

  escalas(lojaId, mesRef) {
    const params = new URLSearchParams({ lojaId, mesRef });
    return this.request(`/api/escalas?${params}`);
  },

  salvarEscala(payload) {
    return this.request('/api/escalas', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
