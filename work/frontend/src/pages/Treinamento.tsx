import { useEffect, useState } from 'react';
import { Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { deleteJson, getJson, putJson, type User } from '../api';

const VERSION = 1;
const stageTitles = [
  'Escolher loja',
  'Escolher periodo',
  'Selecionar secao',
  'Gerar escala',
  'Corrigir critica',
  'Salvar rascunho',
  'Concluir',
];
type Progress = { version: number; stage: number };
type ServerProgress = Progress & { found: boolean; persisted: boolean };

function readProgress(key: string): Progress {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}') as Partial<Progress>;
    if (
      saved.version === VERSION &&
      Number.isInteger(saved.stage) &&
      saved.stage! >= 0 &&
      saved.stage! <= stageTitles.length
    ) {
      return saved as Progress;
    }
  } catch {
    /* A falha do armazenamento nao impede o treinamento. */
  }
  return { version: VERSION, stage: 0 };
}

const days = ['Seg 05', 'Ter 06', 'Qua 07', 'Qui 08', 'Sex 09', 'Sab 10', 'Dom 11'];
const people = [
  {
    name: 'Maria Souza',
    chapa: '010.1001',
    shifts: ['08:00', '08:00', '08:00', '08:00', '08:00', '08:00', 'F'],
  },
  {
    name: 'Carlos Prado',
    chapa: '010.1002',
    shifts: ['F', '12:00', '12:00', '12:00', '12:00', '12:00', 'F'],
  },
  { name: 'Ana Lima', chapa: '010.1003', shifts: ['09:00', '09:00', 'F', '09:00', '09:00', '09:00', 'F'] },
];

export function Treinamento({ user }: { user: User }) {
  const key = `escala:treinamento:v${VERSION}:${user.sub}`;
  const [stage, setStage] = useState(() => readProgress(key).stage);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [persisted, setPersisted] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [store, setStore] = useState('');
  const [period, setPeriod] = useState('');
  const [section, setSection] = useState('');
  const completed = stage >= stageTitles.length;

  useEffect(() => {
    const controller = new AbortController();
    getJson<ServerProgress>('/api/auth/treinamento', controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      const local = readProgress(key).stage;
      if (!result.persisted) {
        setStage(local);
        setPersisted(false);
        setProgressError('Progresso apenas neste navegador até aplicar a migração do treinamento.');
      } else if (!result.found && local > 0) {
        try {
          const imported = await putJson<ServerProgress>('/api/auth/treinamento', { stage: local });
          if (!controller.signal.aborted) { setStage(imported.stage); setPersisted(true); }
        } catch {
          if (!controller.signal.aborted) { setStage(local); setPersisted(false); setProgressError('Progresso apenas neste navegador; a sincronização falhou.'); }
        }
      } else {
        setStage(result.stage);
        setPersisted(true);
        try { localStorage.setItem(key, JSON.stringify({ version: VERSION, stage: result.stage })); } catch { /* Cache opcional. */ }
      }
      if (!controller.signal.aborted) setLoading(false);
    }).catch((reason) => {
      if (reason.name !== 'AbortError') { setPersisted(false); setProgressError('Não foi possível consultar o progresso no servidor. Este navegador continuará o exercício.'); setLoading(false); }
    });
    return () => controller.abort();
  }, [key]);

  async function advance() {
    if (busy) return;
    const next = Math.min(stage + 1, stageTitles.length);
    setBusy(true);
    setProgressError('');
    try {
      const confirmed = persisted ? await putJson<ServerProgress>('/api/auth/treinamento', { stage: next }) : null;
      const current = confirmed?.stage ?? next;
      setStage(current);
      try { localStorage.setItem(key, JSON.stringify({ version: VERSION, stage: current })); } catch { /* Cache opcional. */ }
    } catch (reason) {
      setProgressError(reason instanceof Error ? reason.message : 'Não foi possível salvar o progresso.');
    } finally { setBusy(false); }
  }

  async function restart() {
    if (busy) return;
    setBusy(true);
    setProgressError('');
    try {
      if (persisted) await deleteJson<ServerProgress>('/api/auth/treinamento');
      setStage(0);
      setStore('');
      setPeriod('');
      setSection('');
      try { localStorage.removeItem(key); } catch { /* Cache opcional. */ }
    } catch (reason) {
      setProgressError(reason instanceof Error ? reason.message : 'Não foi possível reiniciar o treinamento.');
    } finally { setBusy(false); }
  }

  if (loading) return <main className="content training"><div className="empty-state" role="status">Carregando treinamento...</div></main>;

  return (
    <main className="content training">
      <div className="page-heading">
        <div>
          <h1>Treinamento de escala</h1>
          <p>Exercicio pratico com dados ficticios para {user.perfil.toLocaleLowerCase('pt-BR')}.</p>
        </div>
        <button type="button" className="button secondary" disabled={busy} onClick={restart}>
          <RotateCcw size={16} /> Reiniciar
        </button>
      </div>
      <div className="simulation-banner">
        <ShieldCheck size={18} />
        <span>
          <strong>Ambiente simulado</strong> · Nenhuma ação altera escalas reais ou o RM. Somente o progresso do exercício pode ser registrado.
        </span>
      </div>
      {progressError && <div className="notice warning" role="status">{progressError}</div>}
      <div className="training-layout">
        <aside className="training-steps" aria-label="Etapas do treinamento">
          <h2>Etapas</h2>
          <ol>
            {stageTitles.map((title, index) => (
              <li key={title} className={index === stage ? 'current' : index < stage ? 'done' : ''}>
                <span className="step-number">{index < stage ? <Check size={14} /> : index + 1}</span>
                <span>{title}</span>
              </li>
            ))}
          </ol>
        </aside>
        <section className="training-main" aria-live="polite">
          {completed ? (
            <div className="training-complete">
              <ShieldCheck size={32} />
              <h2>Treinamento concluido</h2>
              <p>
                Voce percorreu a liberacao simulada, a correcao de uma critica e o salvamento de rascunho.
                Pode repetir o exercicio ou voltar as escalas reais.
              </p>
              <div className="training-actions">
                <a className="button primary" href="/nova/escalas-liberadas">
                  Escalas liberadas
                </a>
                <button className="button secondary" disabled={busy} onClick={restart}>
                  Repetir exercicio
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="training-header">
                <span className="eyebrow">
                  Etapa {stage + 1} de {stageTitles.length}
                </span>
                <h2>{stageTitles[stage]}</h2>
              </div>
              {stage === 0 && (
                <div className="training-task">
                  <p>Selecione a loja ficticia do exercicio.</p>
                  <label>
                    Loja
                    <select data-tour="loja" value={store} onChange={(event) => setStore(event.target.value)}>
                      <option value="">Selecione</option>
                      <option value="10">Loja Escola 10</option>
                    </select>
                  </label>
                  <button className="button primary" disabled={busy || store !== '10'} onClick={advance}>
                    Confirmar loja
                  </button>
                </div>
              )}
              {stage === 1 && (
                <div className="training-task">
                  <p>Abra o periodo operacional de outubro. Ele usa semanas completas.</p>
                  <label>
                    Periodo
                    <select
                      data-tour="periodo"
                      value={period}
                      onChange={(event) => setPeriod(event.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="2026-10">05/10/2026 a 01/11/2026</option>
                    </select>
                  </label>
                  <button className="button primary" disabled={busy || period !== '2026-10'} onClick={advance}>
                    Abrir periodo
                  </button>
                </div>
              )}
              {stage === 2 && (
                <div className="training-task">
                  <p>Escolha a secao para este exercicio. As outras secoes nao serao alteradas.</p>
                  <label>
                    Secao
                    <select
                      data-tour="secao"
                      value={section}
                      onChange={(event) => setSection(event.target.value)}
                    >
                      <option value="">Selecione</option>
                      <option value="caixa">Frente de Caixa</option>
                      <option value="deposito">Deposito</option>
                    </select>
                  </label>
                  <button className="button primary" disabled={busy || section !== 'caixa'} onClick={advance}>
                    Abrir Frente de Caixa
                  </button>
                </div>
              )}
              {stage >= 3 && (
                <div className="training-schedule">
                  <div className="training-schedule-heading">
                    <div>
                      <h3>Frente de Caixa · Loja Escola 10</h3>
                      <p>
                        Semana 05/10 a 11/10 ·{' '}
                        {stage === 3 ? 'Liberada' : stage >= 6 ? 'Rascunho salvo' : 'Rascunho simulado'}
                      </p>
                    </div>
                    {stage === 3 && (
                      <button className="button primary" data-tour="gerar" disabled={busy} onClick={advance}>
                        Gerar escala simulada
                      </button>
                    )}
                  </div>
                  {stage >= 4 && (
                    <>
                      <div className="training-table-scroll">
                        <table className="schedule-table">
                          <thead>
                            <tr>
                              <th>Funcionario</th>
                              {days.map((day) => (
                                <th key={day}>{day}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {people.map((person, personIndex) => (
                              <tr key={person.chapa}>
                                <th>
                                  <strong>{person.name}</strong>
                                  <small>{person.chapa}</small>
                                </th>
                                {person.shifts.map((shift, dayIndex) => {
                                  const repaired = personIndex === 0 && dayIndex === 4 && stage >= 5;
                                  const target = personIndex === 0 && dayIndex === 4 && stage === 4;
                                  const value = repaired ? 'F' : shift;
                                  return (
                                    <td key={dayIndex} className={value === 'F' ? 'day-off' : ''}>
                                      {target ? (
                                        <button
                                          className="day-target"
                                          data-tour="corrigir"
                                          title="Adicionar folga a Maria na sexta-feira"
                                          disabled={busy}
                                          onClick={advance}
                                        >
                                          {value}
                                        </button>
                                      ) : (
                                        value
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {stage === 4 && (
                        <div className="notice warning" role="status">
                          <strong>Critica simulada:</strong> Maria trabalharia seis dias seguidos. Clique no
                          horario de sexta-feira, dia 09, para colocar uma folga.
                        </div>
                      )}
                      {stage === 5 && (
                        <div className="training-task inline-task">
                          <p>
                            <Check size={16} /> Critica corrigida. Salve o rascunho para preservar a
                            alteracao.
                          </p>
                          <button className="button primary" data-tour="salvar" disabled={busy} onClick={advance}>
                            Salvar rascunho simulado
                          </button>
                        </div>
                      )}
                      {stage === 6 && (
                        <div className="training-task inline-task">
                          <p>
                            <Check size={16} /> Rascunho simulado salvo. A escala real nao foi modificada.
                          </p>
                          <button className="button primary" disabled={busy} onClick={advance}>
                            Concluir treinamento
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
