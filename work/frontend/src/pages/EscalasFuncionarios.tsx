import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { getJson, preferredStore, type EscalaMensal, type Loja, type User } from '../api';

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function EscalasFuncionarios({ user }: { user: User }) {
  const [params, setParams] = useSearchParams();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [escala, setEscala] = useState<EscalaMensal | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const loja = params.get('loja') || preferredStore(user, lojas);
  const month = /^\d{4}-\d{2}$/.test(params.get('mes') || '') ? params.get('mes')! : currentMonth();
  const mesRef = `${month}-01`;

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ lojas: Loja[] }>('/api/catalog/lojas', controller.signal)
      .then((result) => setLojas(result.lojas || []))
      .catch((reason) => { if (reason.name !== 'AbortError') setError(reason.message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!loja) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getJson<{ escala: EscalaMensal }>(`/api/escalas/mensal?${new URLSearchParams({ lojaId: loja, mesRef })}`, controller.signal)
      .then((result) => { setEscala(result.escala); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [loja, mesRef, reload]);

  const byEmployee = useMemo(() => {
    const count = new Map<number, { days: number; official: boolean; revision: number }>();
    (escala?.dias || []).forEach((day) => {
      const id = Number(day.ESCFUNC_ID);
      const current = count.get(id) || { days: 0, official: true, revision: 0 };
      count.set(id, {
        days: current.days + 1,
        official: current.official && Number(day.OFICIALIZADA) === 1,
        revision: Math.max(current.revision, Number(day.REVISAO) || 0),
      });
    });
    return count;
  }, [escala]);
  const visible = (escala?.funcionarios || []).filter((person) => byEmployee.has(Number(person.ESCFUNC_ID)) &&
    `${person.CHAPA} ${person.NOME} ${person.SECAO_DESCR || ''} ${person.FUNCAO_DESCR || ''}`
      .toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR').trim()))
    .sort((a, b) => a.NOME.localeCompare(b.NOME, 'pt-BR'));

  function updateFilter(key: 'loja' | 'mes', value: string) {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next);
  }

  return <main className="content directory-page">
    <div className="page-heading"><div><h1>Escalas por funcionário</h1><p>Programações gravadas no período da loja selecionada.</p></div>
      <button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
    </div>
    <section className="list-surface" aria-label="Escalas por funcionário">
      <div className="filters">
        <label>Loja<select value={loja} onChange={(event) => updateFilter('loja', event.target.value)}>
          {!loja && <option value="">Selecione</option>}
          {lojas.map((item) => <option key={item.LOJA} value={item.LOJA}>Loja {item.LOJA}{item.NOME ? ` · ${item.NOME}` : ''}</option>)}
        </select></label>
        <label>Mês<input type="month" value={month} onChange={(event) => updateFilter('mes', event.target.value)} /></label>
        <label className="search-field"><Search size={16} /><span className="sr-only">Buscar funcionário</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar funcionário" /></label>
      </div>
      <div className="list-meta">{loading ? 'Carregando...' : `${visible.length} funcionário(s) com escala`}</div>
      {error && <div className="notice error" role="alert">{error}</div>}
      {!loading && !error && !visible.length && <div className="empty-state">Nenhuma escala encontrada para este período.</div>}
      {!loading && !error && !!visible.length && <div className="table-scroll"><table><thead><tr><th>Funcionário</th><th>Matrícula</th><th>Seção</th><th>Cargo</th><th>Dias</th><th>Revisão</th><th>Oficializada</th><th><span className="sr-only">Ações</span></th></tr></thead><tbody>
        {visible.map((person) => {
          const summary = byEmployee.get(Number(person.ESCFUNC_ID))!;
          return <tr key={person.ESCFUNC_ID}>
            <td><strong>{person.NOME}</strong></td><td>{person.CHAPA}</td><td>{person.SECAO_DESCR || '–'}</td><td>{person.FUNCAO_DESCR || '–'}</td>
            <td>{summary.days}</td><td>{summary.revision}</td><td>{summary.official ? 'Sim' : 'Não'}</td>
            <td><Link className="open-link" to={`/escalas/${loja}/${mesRef}?secao=${person.ESCSECAO_ID}&funcionario=${person.ESCFUNC_ID}`}><ArrowUpRight size={16} /> Abrir</Link></td>
          </tr>;
        })}
      </tbody></table></div>}
    </section>
  </main>;
}
