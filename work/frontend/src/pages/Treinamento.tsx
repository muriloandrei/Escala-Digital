import { useState } from 'react';
import { Check, RotateCcw, ShieldCheck } from 'lucide-react';
import type { User } from '../api';

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
  const [store, setStore] = useState('');
  const [period, setPeriod] = useState('');
  const [section, setSection] = useState('');
  const completed = stage >= stageTitles.length;

  function advance() {
    const next = Math.min(stage + 1, stageTitles.length);
    setStage(next);
    try {
      localStorage.setItem(key, JSON.stringify({ version: VERSION, stage: next }));
    } catch {
      /* Sem armazenamento, a sessao atual continua. */
    }
  }

  function restart() {
    setStage(0);
    setStore('');
    setPeriod('');
    setSection('');
    try {
      localStorage.removeItem(key);
    } catch {
      /* Opcional. */
    }
  }

  return (
    <main className="content training">
      <div className="page-heading">
        <div>
          <h1>Treinamento de escala</h1>
          <p>Exercicio pratico com dados ficticios para {user.perfil.toLocaleLowerCase('pt-BR')}.</p>
        </div>
        <button type="button" className="button secondary" onClick={restart}>
          <RotateCcw size={16} /> Reiniciar
        </button>
      </div>
      <div className="simulation-banner">
        <ShieldCheck size={18} />
        <span>
          <strong>Ambiente simulado</strong> · Nenhuma acao aqui altera a escala, o banco de dados ou o RM.
        </span>
      </div>
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
                <button className="button secondary" onClick={restart}>
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
                  <button className="button primary" disabled={store !== '10'} onClick={advance}>
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
                  <button className="button primary" disabled={period !== '2026-10'} onClick={advance}>
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
                  <button className="button primary" disabled={section !== 'caixa'} onClick={advance}>
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
                      <button className="button primary" data-tour="gerar" onClick={advance}>
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
                          <button className="button primary" data-tour="salvar" onClick={advance}>
                            Salvar rascunho simulado
                          </button>
                        </div>
                      )}
                      {stage === 6 && (
                        <div className="training-task inline-task">
                          <p>
                            <Check size={16} /> Rascunho salvo apenas neste navegador. A escala real nao foi
                            modificada.
                          </p>
                          <button className="button primary" onClick={advance}>
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
