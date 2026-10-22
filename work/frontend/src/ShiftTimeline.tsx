import type { DiaEscala } from './api';

function position(value?: string | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const minutes = Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5));
  return Math.max(0, Math.min(100, (minutes - 300) / 1140 * 100));
}

export function ShiftTimeline({ day }: { day: DiaEscala }) {
  const points = [day.HR_ENT1, day.HR_SAI1, day.HR_ENT2, day.HR_SAI2].map(position);
  const segments = [
    { start: points[0], end: points[1], kind: 'first' },
    { start: points[1], end: points[2], kind: 'break' },
    { start: points[2], end: points[3], kind: 'second' },
  ];
  return <div className="shift-timeline">
    <div className="shift-timeline-track" aria-hidden="true">
      {segments.map((segment) => segment.start !== null && segment.end !== null && segment.end > segment.start
        ? <span key={segment.kind} className={segment.kind} style={{ left: `${segment.start}%`, width: `${segment.end - segment.start}%` }} /> : null)}
    </div>
    <div className="shift-timeline-times">
      {[day.HR_ENT1, day.HR_SAI1, day.HR_ENT2, day.HR_SAI2].map((value, index) => points[index] !== null
        ? <span key={index} style={{ left: `clamp(19px, ${points[index]}%, calc(100% - 19px))` }}>{value}</span> : null)}
    </div>
  </div>;
}
