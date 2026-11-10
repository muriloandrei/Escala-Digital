export function permiteEscala(status?: string | null) {
  return ['A', 'F', 'P', 'Z'].includes(String(status || 'A').trim().toUpperCase());
}
