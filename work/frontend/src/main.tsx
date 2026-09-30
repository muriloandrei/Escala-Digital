import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  GraduationCap,
  List,
  LogOut,
  Users,
  LayoutGrid,
  History,
  ClipboardList,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { canView, getJson, type User } from './api';
import { EscalasLiberadas } from './pages/EscalasLiberadas';
import { EscalaMensal } from './pages/EscalaMensal';
import { ImprimirEscala } from './pages/ImprimirEscala';
import { Funcionarios } from './pages/Funcionarios';
import { Secoes } from './pages/Secoes';
import { Subsecoes } from './pages/Subsecoes';
import { Alteracoes } from './pages/Alteracoes';
import { Treinamento } from './pages/Treinamento';
import { EscalasFuncionarios } from './pages/EscalasFuncionarios';
import './styles.css';
import './responsive.css';
import './schedule.css';
import './directory.css';
import './print.css';

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

  const canSeeEscalas = canView(user, 'escalas');
  const canSeeFuncionarios = canView(user, 'funcionarios');
  const canSeeSecoes = canView(user, 'secoes');
  const start = canSeeEscalas
    ? '/escalas-liberadas'
    : canSeeFuncionarios
      ? '/funcionarios'
      : canSeeSecoes
        ? '/secoes'
        : '/sem-acesso';

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <img src="/assets/escala-inteligente-logo.png" alt="Escala Inteligente" />
        </div>
        <nav aria-label="Menu principal">
          {canSeeEscalas && (
            <NavLink to="/escalas-liberadas">
              <List size={18} /> Escalas liberadas
            </NavLink>
          )}
          {canSeeEscalas && (
            <NavLink to="/escalas-funcionarios">
              <ClipboardList size={18} /> Por funcionário
            </NavLink>
          )}
          {canSeeEscalas && (
            <NavLink to="/alteracoes">
              <History size={18} /> Alterações
            </NavLink>
          )}
          {canSeeFuncionarios && (
            <NavLink to="/funcionarios">
              <Users size={18} /> Funcionários
            </NavLink>
          )}
          {canSeeSecoes && (
            <NavLink to="/secoes">
              <LayoutGrid size={18} /> Seções
            </NavLink>
          )}
          {canSeeEscalas && (
            <NavLink to="/treinamento">
              <GraduationCap size={18} /> Treinamento
            </NavLink>
          )}
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
          {canSeeEscalas && <Route path="/escalas-liberadas" element={<EscalasLiberadas user={user} />} />}
          {canSeeEscalas && <Route path="/escalas/:lojaId/:mesRef" element={<EscalaMensal user={user} />} />}
          {canSeeEscalas && <Route path="/escalas-funcionarios" element={<EscalasFuncionarios user={user} />} />}
          {canSeeEscalas && (
            <Route path="/escalas/:lojaId/:mesRef/imprimir" element={<ImprimirEscala user={user} />} />
          )}
          {canSeeEscalas && <Route path="/alteracoes" element={<Alteracoes user={user} />} />}
          {canSeeFuncionarios && <Route path="/funcionarios" element={<Funcionarios user={user} />} />}
          {canSeeSecoes && <Route path="/secoes" element={<Secoes user={user} />} />}
          {canSeeSecoes && (
            <Route path="/secoes/:lojaId/:secaoId/subsecoes" element={<Subsecoes user={user} />} />
          )}
          {canSeeEscalas && <Route path="/treinamento" element={<Treinamento user={user} />} />}
          <Route
            path="/sem-acesso"
            element={
              <main className="content">
                <h1>Sem acesso</h1>
                <p>Seu perfil não possui páginas disponíveis nesta interface.</p>
              </main>
            }
          />
          <Route path="*" element={<Navigate to={start} replace />} />
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
