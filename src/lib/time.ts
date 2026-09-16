export function formatHM(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m`;
}

export function timeToMinutes(t: string | null | undefined): number | null {
  if (!t || !/^\d{1,2}:\d{2}$/.test(t)) return null;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export interface TimeRange {
  start: string;
  end: string;
}

export function entrySeconds(entry: TimeRange): number {
  const startMin = timeToMinutes(entry.start);
  const endMin = timeToMinutes(entry.end);
  if (startMin === null || endMin === null || endMin <= startMin) return 0;
  return (endMin - startMin) * 60;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Últimas `n` fechas ISO, en orden ascendente, terminando en `endISO` (por defecto hoy). */
export function lastNDates(n: number, endISO: string = todayISO()): string[] {
  const [y, m, d] = endISO.split('-').map(Number);
  const end = new Date(y, m - 1, d);
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const day = new Date(end);
    day.setDate(day.getDate() - i);
    dates.push(toISO(day));
  }
  return dates;
}
