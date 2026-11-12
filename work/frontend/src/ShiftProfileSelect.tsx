import { useEffect, useState } from 'react';
import { getJson } from './api';
export type ShiftProfile = {
  ESCHORPAD_ID: number;
  DESCR: string;
  JORNADA_MINUTOS: number;
  INTERVALO_MINUTOS: number;
};

const allowed = new Set(['528:70', '360:70', '300:15']);
const postAllowed = new Set(['528:100', '504:70', '504:100']);
const baseProfile: ShiftProfile = { ESCHORPAD_ID: 0, DESCR: 'Jornada padrão', JORNADA_MINUTOS: 528, INTERVALO_MINUTOS: 70 };

function duration(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function ShiftProfileSelect({ onSelect, disabled = false, sundayOnly = false, postStore = false, value }: {
  onSelect: (profile: ShiftProfile) => void;
  disabled?: boolean;
  sundayOnly?: boolean;
  postStore?: boolean;
  value?: { work: number; interval: number };
}) {
  const [profiles, setProfiles] = useState<ShiftProfile[]>([]);
  const [selected, setSelected] = useState('528:70');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ horarios: ShiftProfile[] }>('/api/catalog/horarios-padrao', controller.signal)
      .then(({ horarios }) => setProfiles((horarios || []).filter((item) =>
        allowed.has(`${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`)
          || postAllowed.has(`${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`))))
      .catch((reason) => { if (reason.name !== 'AbortError') setError('Horários cadastrados indisponíveis.'); });
    return () => controller.abort();
  }, []);

  const available = [baseProfile, ...profiles].filter((item, index, all) =>
    all.findIndex((other) => other.JORNADA_MINUTOS === item.JORNADA_MINUTOS && other.INTERVALO_MINUTOS === item.INTERVALO_MINUTOS) === index)
    .filter((item) => (postStore || !postAllowed.has(`${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`))
      && (!sundayOnly || item.JORNADA_MINUTOS === 360));
  const active = value ? `${value.work}:${value.interval}` : selected;
  return <div className="shift-profiles" role="group" aria-label="Jornada">
    <span className="shift-profiles-label">Jornada</span>
    <div className="shift-profile-options">{available.map((item) => {
      const key = `${item.JORNADA_MINUTOS}:${item.INTERVALO_MINUTOS}`;
      return <button key={key} type="button" className={active === key ? 'selected' : ''}
        aria-pressed={active === key} disabled={disabled} title={item.DESCR}
        onClick={() => { setSelected(key); onSelect(item); }}>
        {duration(item.JORNADA_MINUTOS)}{item.INTERVALO_MINUTOS ? ` (${duration(item.INTERVALO_MINUTOS)} almoço)` : ''}
      </button>;
    })}</div>
    {error && <small role="alert">{error}</small>}
  </div>;
}
