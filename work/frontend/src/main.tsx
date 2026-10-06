import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
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

const LAST_TRAINING_STAGE = 16;

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [trainingStage, setTrainingStage] = useState<number | null>(null);
  const [reactUiAllowed, setReactUiAllowed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ user: User; reactUiAllowed: boolean }>('/api/auth/me', controller.signal).then(async (auth) => {
      if (!auth.reactUiAllowed) {
        window.location.replace('/app#/escalas-geradas');
        return;
      }
      const progress = await getJson<{ stage: number; persisted: boolean }>('/api/auth/treinamento', controller.signal);
      if (!progress.persisted) throw new Error('A migration do treinamento precisa ser aplicada antes de liberar o acesso.');
      setUser(auth.user);
      setReactUiAllowed(auth.reactUiAllowed);
      setTrainingStage(progress.stage);
    })
      .catch((reason) => {
        if (reason.name !== 'AbortError') setError(reason.message);
      });
    return () => controller.abort();
  }, []);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    window.location.assign('/');
  }

  useEffect(() => {
    if (user && trainingStage === LAST_TRAINING_STAGE && !reactUiAllowed) window.location.replace('/app#/escalas-geradas');
  }, [user, trainingStage, reactUiAllowed]);

  if (error)
    return (
      <main className="bootstrap-message" role="alert">
        {error} <a href="/">Entrar</a>
      </main>
    );
  if (!user || trainingStage === null)
    return (
      <main className="bootstrap-message" role="status">
        Carregando sessao...
      </main>
    );

  if (trainingStage < LAST_TRAINING_STAGE) return (
    <div className="shell training-required-shell">
      <aside className="sidebar"><div className="brand"><img src="/assets/escala-inteligente-logo-transparent.png" alt="Escala Inteligente" /></div><nav aria-label="Menu principal"><NavLink to="/treinamento"><GraduationCap size={18} /> Treinamento obrigatório</NavLink></nav><div className="sidebar-user"><span>{user.nome || user.login}</span><button type="button" onClick={logout}><LogOut size={16} /> Sair</button></div></aside>
      <div className="workspace"><Routes><Route path="/treinamento" element={<Treinamento user={user} onComplete={() => { setTrainingStage(LAST_TRAINING_STAGE); if (reactUiAllowed) navigate('/escalas-liberadas', { replace: true }); else window.location.assign('/app#/escalas-geradas'); }} />} /><Route path="*" element={<Navigate to="/treinamento" replace />} /></Routes></div>
    </div>
  );

  if (!reactUiAllowed) return <main className="bootstrap-message" role="status">Abrindo suas escalas...</main>;

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
          <img src="/assets/escala-inteligente-logo-transparent.png" alt="Escala Inteligente" />
        </div>
        <nav aria-label="Menu principal">
          <div className="sidebar-nav-group"><span className="sidebar-nav-heading">Escalas</span>
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
          </div>
          <div className="sidebar-nav-group"><span className="sidebar-nav-heading">Equipe</span>
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
          </div>
          <div className="sidebar-nav-group"><span className="sidebar-nav-heading">Configuração</span>
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
          </div>
          <div className="sidebar-nav-group"><span className="sidebar-nav-heading">Ajuda</span>
          {canSeeEscalas && (
            <NavLink to="/treinamento">
              <GraduationCap size={18} /> Treinamento
            </NavLink>
          )}
          <a href="/app#/escalas-geradas">
            <ArrowLeft size={18} /> Interface anterior
          </a>
          </div>
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

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/nova">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
