const api = {
  async request(path, options = {}) {
    const { timeoutMs = 20000, signal, ...fetchOptions } = options;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(path, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {})
      },
      ...fetchOptions,
      signal: signal || controller.signal
    }).catch((error) => {
      if (error.name === 'AbortError') {
        throw new Error('Tempo limite excedido ao comunicar com o servidor.');
      }
      throw error;
    }).finally(() => clearTimeout(timeout));

    if (response.status === 204) return null;

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const baseMessage = data.error || 'Erro na comunicação com o servidor.';
      const error = new Error(data.requestId ? `${baseMessage} (requestId: ${data.requestId})` : baseMessage);
      error.status = response.status;
      error.details = data.details || data.errors;
      error.requestId = data.requestId || null;
      if (response.status === 401 && !String(path || '').includes('/api/auth/login') && typeof window !== 'undefined') {
        window.localStorage?.removeItem?.('escala-app-version');
        if (window.location.pathname !== '/') window.location.href = '/';
      }
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

window.EscalaApi = api;
