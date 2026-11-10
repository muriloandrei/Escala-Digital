export function isDutyDay12x36(anchor: string, date: string): boolean {
  const first = Date.parse(`${anchor.slice(0, 10)}T00:00:00Z`);
  const current = Date.parse(`${date.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(first) || !Number.isFinite(current)) return false;
  return Math.round((current - first) / 86400000) % 2 === 0;
}
