import { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardCopy, Download, RefreshCw } from 'lucide-react';
import { getJson } from '../api';

type Estagio = 'CONCLUIDA' | 'EM_OFICIALIZACAO' | 'EM_PREENCHIMENTO' | 'NAO_INICIADA';
type Secao = {
  escsecaoId: number;
  codSecao: string;
  secao: string;
  funcionarios: number;
  funcionariosOficializados: number;
  diasGravados: number;
  diasOficializados: number;
  percentualDiasOficializados: number;
  folgasNormais: number;
  maiorRevisao: number;
  status: 'SEM_DIAS' | 'OFICIALIZADA' | 'PARCIAL' | 'NAO_OFICIALIZADA';
};
type LojaAdesao = {
  loja: number;
  mesEscala: string;
  secoes: Secao[];
  estagio: Estagio;
  funcionarios: number;
  funcionariosOficializados: number;
  diasGravados: number;
  diasOficializados: number;
  folgasNormais: number;
  secoesOficializadas: number;
  totalSecoes: number;
  coberturaDias: number;
  percentualOficializado: number;
};
type LojaComparada = LojaAdesao & { anterior?: LojaAdesao };

const stages: { key: Estagio; label: string }[] = [
  { key: 'NAO_INICIADA', label: 'Não iniciadas / paradas' },
  { key: 'EM_PREENCHIMENTO', label: 'Em preenchimento' },
  { key: 'EM_OFICIALIZACAO', label: 'Em oficialização' },
  { key: 'CONCLUIDA', label: 'Concluídas' },
];
const stageLabel = Object.fromEntries(stages.map((item) => [item.key, item.label])) as Record<Estagio, string>;
const sectionLabel: Record<Secao['status'], string> = {
  SEM_DIAS: 'Sem dias', OFICIALIZADA: 'Oficializada', PARCIAL: 'Parcial', NAO_OFICIALIZADA: 'Não oficializada',
};

function previousMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(year, monthNumber - 2, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function emptyMonth(loja: number, month: string): LojaAdesao {
  return {
    loja, mesEscala: month, secoes: [], estagio: 'NAO_INICIADA', funcionarios: 0, funcionariosOficializados: 0,
    diasGravados: 0, diasOficializados: 0, folgasNormais: 0, secoesOficializadas: 0, totalSecoes: 0,
    coberturaDias: 0, percentualOficializado: 0,
  };
}

function segmentMatches(loja: number, segment: string) {
  if (segment === '1-99') return loja >= 1 && loja <= 99;
  if (segment === '300-399') return loja >= 300 && loja <= 399;
  if (segment === '400-499') return loja >= 400 && loja <= 499;
  if (segment === '700-799') return loja >= 700 && loja <= 799;
  if (segment === '900+') return loja >= 900;
  return true;
}

function csvCell(value: string | number) {
  const text = String(value);
  const safe = /^[=+@\-]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

function exportCsv(rows: LojaComparada[], month: string) {
  const header = ['Mês', 'Loja', 'Situação', 'Seções oficializadas', 'Seções', 'Colaboradores oficializados',
    'Colaboradores', 'Dias gravados', 'Dias oficializados', '% dias oficializados', 'Mês anterior',
    '% anterior', 'Seções pendentes'];
  const lines = [header, ...rows.map((row) => [month, row.loja, stageLabel[row.estagio], row.secoesOficializadas,
    row.totalSecoes, row.funcionariosOficializados, row.funcionarios, row.diasGravados, row.diasOficializados,
    row.percentualOficializado, previousMonth(month), row.anterior?.percentualOficializado ?? 0,
    row.secoes.filter((secao) => secao.status !== 'OFICIALIZADA').map((secao) => secao.secao).join(', ')])];
  const blob = new Blob([`\uFEFF${lines.map((line) => line.map(csvCell).join(';')).join('\r\n')}\r\n`],
    { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `adesao-escalas-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const field = document.createElement('textarea');
  field.value = value;
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('Não foi possível copiar a mensagem.');
}

export function AdesaoEscalas() {
  const [month, setMonth] = useState(() => new Date().toLocaleDateString('sv-SE').slice(0, 7));
  const [segment, setSegment] = useState('all');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<Estagio | 'all'>('all');
  const [selected, setSelected] = useState<number | null>(null);
  const [data, setData] = useState<LojaAdesao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return;
    const controller = new AbortController();
    setLoading(true);
    setData([]);
    setError('');
    setMessage('');
    const query = new URLSearchParams({ mes_inicial: previousMonth(month), mes_final: month });
    getJson<{ lojas: LojaAdesao[] }>(`/api/relatorios/adesao-escalas?${query}`, controller.signal)
      .then((response) => { setData(response.lojas || []); setLoading(false); })
      .catch((reason) => { if (reason.name !== 'AbortError') { setError(reason.message); setLoading(false); } });
    return () => controller.abort();
  }, [month, reload]);

  const compared = useMemo(() => {
    const previous = new Map(data.filter((item) => item.mesEscala === previousMonth(month))
      .map((item) => [item.loja, item]));
    const current = new Map(data.filter((item) => item.mesEscala === month).map((item) => [item.loja, item]));
    return [...new Set([...previous.keys(), ...current.keys()])].map((loja): LojaComparada => ({
      ...(current.get(loja) || emptyMonth(loja, month)), anterior: previous.get(loja),
    }));
  }, [data, month]);

  const scoped = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return compared.filter((item) => segmentMatches(item.loja, segment) && (!term
      || String(item.loja).includes(term)
      || item.secoes.some((secao) => `${secao.codSecao} ${secao.secao}`.toLocaleLowerCase('pt-BR').includes(term))));
  }, [compared, search, segment]);
  const counts = useMemo(() => Object.fromEntries(stages.map((item) => [item.key,
    scoped.filter((row) => row.estagio === item.key).length])) as Record<Estagio, number>, [scoped]);
  const visible = useMemo(() => scoped.filter((item) => stage === 'all' || item.estagio === stage)
    .sort((a, b) => stages.findIndex((item) => item.key === a.estagio)
      - stages.findIndex((item) => item.key === b.estagio)
      || a.percentualOficializado - b.percentualOficializado || a.loja - b.loja), [scoped, stage]);
  const detail = visible.find((item) => item.loja === selected) || visible[0];

  async function copyCharge(row: LojaComparada) {
    const pending = row.secoes.filter((secao) => secao.status !== 'OFICIALIZADA');
    const sections = pending.length ? pending.map((secao) => `• ${secao.codSecao} · ${secao.secao}`).join('\n')
      : row.totalSecoes ? '• Oficialização da loja ainda pendente' : '• Escala do mês ainda não iniciada';
    const text = `Olá! Poderiam verificar a escala de ${month} da loja ${row.loja}? As seções pendentes são:\n${sections}\nObrigado!`;
    try { await copyText(text); setMessage(`Cobrança da loja ${row.loja} copiada.`); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : 'Não foi possível copiar.'); }
  }

  return <section className="adesao-panel" aria-label="Painel de adesão de escalas">
    <div className="page-heading adesao-heading"><div><h1>Painel de adesão de escalas</h1><p>Acompanhamento mensal das lojas e seções.</p></div>
      <div className="heading-actions"><button className="button secondary" type="button" onClick={() => setReload((value) => value + 1)}><RefreshCw size={16} /> Atualizar</button>
        <button className="button secondary" type="button" disabled={loading || !visible.length} onClick={() => exportCsv(visible, month)}><Download size={16} /> Exportar CSV</button></div></div>
    <div className="adesao-filters">
      <label>Mês da escala<input type="month" value={month} onChange={(event) => { setMonth(event.target.value); setStage('all'); setSelected(null); }} /></label>
      <label>Segmento<select value={segment} onChange={(event) => { setSegment(event.target.value); setSelected(null); }}>
        <option value="all">Todas as lojas</option><option value="1-99">Lojas 1–99</option><option value="300-399">Atacarejo 300–399</option>
        <option value="400-499">Práticos 400–499</option><option value="700-799">Postos 700–799</option><option value="900+">Corporativo 900+</option>
      </select></label>
      <label>Buscar<input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setSelected(null); }} placeholder="Loja ou seção" /></label>
    </div>
    {error && <div className="notice error" role="alert">{error} <button type="button" onClick={() => setReload((value) => value + 1)}>Tentar novamente</button></div>}
    {message && <div className="notice success" role="status">{message}</div>}
    <div className="adesao-kpis" aria-label="Filtrar por situação">{stages.slice().reverse().map((item) =>
      <button type="button" key={item.key} className={`adesao-kpi ${item.key} ${stage === item.key ? 'active' : ''}`}
        aria-pressed={stage === item.key} onClick={() => { setStage(stage === item.key ? 'all' : item.key); setSelected(null); }}>
        <span>{item.label}</span><strong>{counts[item.key]}</strong></button>)}</div>
    <div className="adesao-distribution" role="img" aria-label={stages.map((item) => `${item.label}: ${counts[item.key]}`).join(', ')}>
      {stages.slice().reverse().map((item) => <span key={item.key} className={item.key} style={{ width: `${scoped.length ? 100 * counts[item.key] / scoped.length : 0}%` }} />)}
    </div>
    <div className="adesao-meta">{loading ? 'Carregando adesão...' : `${visible.length} de ${scoped.length} loja(s)`}</div>
    {!loading && !error && !visible.length ? <div className="empty-state">Nenhuma loja encontrada para os filtros.</div> : null}
    {!loading && !error && !!visible.length && <div className="adesao-master-detail">
      <div className="adesao-table-wrap"><table className="adesao-table"><thead><tr><th>Loja</th><th>Situação</th><th>Progresso</th><th>Seções</th><th>Colaboradores</th><th>Comparativo mensal</th></tr></thead>
        <tbody>{visible.map((row) => {
          const estimated = row.funcionarios * 30;
          const official = estimated ? Math.min(100, 100 * row.diasOficializados / estimated) : 0;
          const filled = estimated ? Math.min(100 - official, 100 * Math.max(0, row.diasGravados - row.diasOficializados) / estimated) : 0;
          return <tr key={row.loja} className={detail?.loja === row.loja ? 'selected' : ''}>
            <th scope="row"><button type="button" onClick={() => setSelected(row.loja)}>Loja {row.loja}</button></th>
            <td><span className={`adesao-badge ${row.estagio}`}>{stageLabel[row.estagio]}</span></td>
            <td><div className="adesao-progress" role="img" aria-label={`${official.toFixed(0)}% oficializado, ${filled.toFixed(0)}% preenchido sem oficializar`}>
              <span className="official" style={{ width: `${official}%` }} /><span className="filled" style={{ width: `${filled}%` }} /></div>
              <small>{row.percentualOficializado}% dos dias gravados oficializados</small></td>
            <td>{row.secoesOficializadas} / {row.totalSecoes} ofic.</td>
            <td>{row.funcionariosOficializados} / {row.funcionarios}</td>
            <td><div className="adesao-compare"><span title={`Mês anterior: ${row.anterior?.percentualOficializado ?? 0}%`} style={{ height: `${Math.max(3, row.anterior?.percentualOficializado ?? 0)}%` }} />
              <span title={`Mês atual: ${row.percentualOficializado}%`} style={{ height: `${Math.max(3, row.percentualOficializado)}%` }} /></div><small>{row.anterior?.percentualOficializado ?? 0}% → {row.percentualOficializado}%</small></td>
          </tr>;
        })}</tbody></table></div>
      {detail && <aside className="adesao-detail" aria-label={`Detalhe da loja ${detail.loja}`}>
        <div className="adesao-detail-heading"><div><h2>Loja {detail.loja}</h2><span>{month} · {detail.totalSecoes} seção(ões)</span></div>
          <button className="button secondary" type="button" disabled={detail.estagio === 'CONCLUIDA'} onClick={() => copyCharge(detail)}><ClipboardCopy size={15} /> Copiar cobrança</button></div>
        <div className="adesao-detail-summary"><span className={`adesao-badge ${detail.estagio}`}>{stageLabel[detail.estagio]}</span>
          <span>{detail.funcionariosOficializados} / {detail.funcionarios} colaboradores oficializados</span></div>
        {detail.secoes.length ? <div className="adesao-section-list">{detail.secoes.map((secao) =>
          <div className={`adesao-section ${secao.status}`} key={secao.escsecaoId}>
            <div><strong>{secao.codSecao} · {secao.secao}</strong><span className={`adesao-badge ${secao.status}`}>{sectionLabel[secao.status]}</span></div>
            <dl><div><dt>Colaboradores</dt><dd>{secao.funcionariosOficializados} / {secao.funcionarios}</dd></div>
              <div><dt>Dias gravados</dt><dd>{secao.diasGravados}</dd></div><div><dt>Folgas normais</dt><dd>{secao.folgasNormais}</dd></div>
              <div><dt>Oficializado</dt><dd>{secao.percentualDiasOficializados}%</dd></div><div><dt>Revisão</dt><dd>{secao.maiorRevisao}</dd></div></dl>
          </div>)}</div> : <div className="empty-state">Nenhuma seção registrada neste mês.</div>}
      </aside>}
    </div>}
  </section>;
}
