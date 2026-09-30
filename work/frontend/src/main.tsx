import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { ArrowLeft, CalendarDays, GraduationCap, List, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getJson, type User } from './api';
import { EscalasLiberadas } from './pages/EscalasLiberadas';
import { Treinamento } from './pages/Treinamento';
import './styles.css';
import './responsive.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ user: User }>('/api/auth/me', controller.signal)
      .then(({ user: current }) => setUser(current))
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError(reason.message);
      });
    return () => controller.abort();
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.assign('/');
  }

  if (error)
    return (
      <main className="bootstrap-message" role="alert">
        {error} <a href="/">Entrar</a>
      </main>
    );
  if (!user)
    return (
      <main className="bootstrap-message" role="status">
        Carregando sessao...
      </main>
    );

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/assets/escala-inteligente-logo.png" alt="Escala Inteligente" />
        </div>
        <nav aria-label="Menu principal">
          <NavLink to="/escalas-liberadas">
            <List size={18} /> Escalas liberadas
          </NavLink>
          <NavLink to="/treinamento">
            <GraduationCap size={18} /> Treinamento
          </NavLink>
          <a href="/app#/escalas-geradas">
            <ArrowLeft size={18} /> Interface anterior
          </a>
        </nav>
        <div className="sidebar-user">
          <span>{user.nome || user.login}</span>
          <small>{user.perfil}</small>
          <button type="button" onClick={logout}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <CalendarDays size={18} />
          <span>Escala Inteligente</span>
          <span className="topbar-user">{user.nome || user.login}</span>
        </header>
        <Routes>
          <Route path="/escalas-liberadas" element={<EscalasLiberadas user={user} />} />
          <Route path="/treinamento" element={<Treinamento user={user} />} />
          <Route path="*" element={<Navigate to="/escalas-liberadas" replace />} />
        </Routes>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/nova">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
