import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
  Clock3,
  ShieldCheck,
  Settings2,
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
import { Historico } from './pages/Historico';
import { TurnosSecao } from './pages/TurnosSecao';
import { Acessos } from './pages/Acessos';
import { PerfisAcesso } from './pages/PerfisAcesso';
import { LiberacaoSecoes } from './pages/LiberacaoSecoes';
import { RegrasEscala, HorariosPadrao, TiposDescanso } from './pages/ConfiguracoesEscala';
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
          {user.perfil === 'ADMIN' && (
            <NavLink to="/historico">
              <History size={18} /> Histórico administrativo
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
          {canView(user, 'turnos-secao') && (
            <NavLink to="/turnos-secao">
              <Clock3 size={18} /> Turnos por seção
            </NavLink>
          )}
          {canView(user, 'regras') && <NavLink to="/regras"><Settings2 size={18} /> Regras da escala</NavLink>}
          {canView(user, 'tipos-descanso') && <NavLink to="/tipos-descanso"><CalendarDays size={18} /> Tipos de descanso</NavLink>}
          {canView(user, 'horarios-padrao') && <NavLink to="/horarios-padrao"><Clock3 size={18} /> Horários padrão</NavLink>}
          {user.perfil === 'ADMIN' && (
            <NavLink to="/acessos">
              <ShieldCheck size={18} /> Usuários e acessos
            </NavLink>
          )}
          {user.perfil === 'ADMIN' && (
            <NavLink to="/perfis">
              <ShieldCheck size={18} /> Perfis de acesso
            </NavLink>
          )}
          {canView(user, 'liberacao-secoes') && !['LIDER', 'OPERADOR'].includes(user.perfil) && (
            <NavLink to="/liberacao-secoes">
              <LayoutGrid size={18} /> Liberação de seções
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
        {canSeeEscalas && <TrainingPrompt user={user} />}
        <Routes>
          {canSeeEscalas && <Route path="/escalas-liberadas" element={<EscalasLiberadas user={user} />} />}
          {canSeeEscalas && <Route path="/escalas/:lojaId/:mesRef" element={<EscalaMensal user={user} />} />}
          {canSeeEscalas && <Route path="/escalas-funcionarios" element={<EscalasFuncionarios user={user} />} />}
          {canSeeEscalas && (
            <Route path="/escalas/:lojaId/:mesRef/imprimir" element={<ImprimirEscala user={user} />} />
          )}
          {canSeeEscalas && <Route path="/alteracoes" element={<Alteracoes user={user} />} />}
          {user.perfil === 'ADMIN' && <Route path="/historico" element={<Historico user={user} />} />}
          {canSeeFuncionarios && <Route path="/funcionarios" element={<Funcionarios user={user} />} />}
          {canSeeSecoes && <Route path="/secoes" element={<Secoes user={user} />} />}
          {canView(user, 'turnos-secao') && <Route path="/turnos-secao" element={<TurnosSecao user={user} />} />}
          {canView(user, 'regras') && <Route path="/regras" element={<RegrasEscala />} />}
          {canView(user, 'tipos-descanso') && <Route path="/tipos-descanso" element={<TiposDescanso user={user} />} />}
          {canView(user, 'horarios-padrao') && <Route path="/horarios-padrao" element={<HorariosPadrao user={user} />} />}
          {user.perfil === 'ADMIN' && <Route path="/acessos" element={<Acessos user={user} />} />}
          {user.perfil === 'ADMIN' && <Route path="/perfis" element={<PerfisAcesso />} />}
          {canView(user, 'liberacao-secoes') && !['LIDER', 'OPERADOR'].includes(user.perfil) && <Route path="/liberacao-secoes" element={<LiberacaoSecoes user={user} />} />}
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

function TrainingPrompt({ user }: { user: User }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [stage, setStage] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStage(null);
    getJson<{ stage: number; persisted: boolean }>('/api/auth/treinamento', controller.signal)
      .then((progress) => {
        if (progress.persisted) {
          setStage(progress.stage);
          if (progress.stage === 0 && location.pathname !== '/treinamento') {
            navigate('/treinamento', { replace: true });
          }
          return;
        }
        try {
          const cached = JSON.parse(localStorage.getItem(`escala:treinamento:v1:${user.sub}`) || '{}');
          setStage(cached.version === 1 && Number.isInteger(cached.stage) && cached.stage >= 0 && cached.stage <= 7 ? cached.stage : 0);
        } catch { setStage(0); }
      })
      .catch((reason) => { if (reason.name !== 'AbortError') setStage(null); });
    return () => controller.abort();
  }, [location.pathname, navigate, user.sub]);

  if (location.pathname === '/treinamento' || stage === null || stage >= 7) return null;
  return (
    <div className="training-prompt" role="status">
      <GraduationCap size={20} aria-hidden="true" />
      <span>{stage === 0 ? 'Comece pelo treinamento de escala.' : 'Seu treinamento está em andamento.'}</span>
      <NavLink to="/treinamento">{stage === 0 ? 'Iniciar treinamento' : 'Continuar treinamento'}</NavLink>
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
