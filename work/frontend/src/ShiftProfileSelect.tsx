import { useEffect, useState } from 'react';
import { getJson } from './api';
export type ShiftProfile = {
  ESCHORPAD_ID: number;
  DESCR: string;
  JORNADA_MINUTOS: number;
  INTERVALO_MINUTOS: number;
  LIBERAR_HORARIO_APRENDIZ?: boolean;
};

function duration(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

export function ShiftProfileSelect({ onSelect, disabled = false, sundayOnly = false, apprentice = false, lojaId, value }: {
  onSelect: (profile: ShiftProfile) => void;
  disabled?: boolean;
  sundayOnly?: boolean;
  apprentice?: boolean;
  lojaId: string | number;
  value?: { work: number; interval: number };
}) {
  const [profiles, setProfiles] = useState<ShiftProfile[]>([]);
  const [selected, setSelected] = useState('528:70');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    getJson<{ horarios: ShiftProfile[] }>(`/api/catalog/horarios-padrao?lojaId=${encodeURIComponent(String(lojaId))}`, controller.signal)
      .then(({ horarios }) => setProfiles(horarios || []))
      .catch((reason) => { if (reason.name !== 'AbortError') setError('Horários cadastrados indisponíveis.'); });
    return () => controller.abort();
  }, [lojaId]);

  const available = profiles.filter((item) => !apprentice || item.LIBERAR_HORARIO_APRENDIZ).filter((item, index, all) =>
    all.findIndex((other) => other.JORNADA_MINUTOS === item.JORNADA_MINUTOS && other.INTERVALO_MINUTOS === item.INTERVALO_MINUTOS) === index)
    .filter((item) => !sundayOnly || item.JORNADA_MINUTOS === 360);
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
