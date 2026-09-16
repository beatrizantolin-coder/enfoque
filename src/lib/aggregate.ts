import { entrySeconds } from './time';
import type { TimeEntry } from './types';

export interface NamedSeconds {
  name: string;
  seconds: number;
}

/** Segundos totales por proyecto, a partir de un conjunto de entradas (p. ej. las de hoy). */
export function sumSecondsByProject(entries: TimeEntry[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    totals.set(entry.projectId, (totals.get(entry.projectId) ?? 0) + entrySeconds(entry));
  }
  return totals;
}

/**
 * Agrupa las entradas de un proyecto por su texto de app/descripción,
 * ordenado de mayor a menor tiempo. Sirve como desglose "reglas/apps"
 * dentro de Tiempo → Resumen: cada entrada ya lleva el texto de ventana
 * que la generó, así que no hace falta reconstruir qué regla concreta
 * disparó la clasificación.
 */
export function groupEntriesByApp(entries: TimeEntry[]): NamedSeconds[] {
  const totals = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.app.trim() || 'Sin descripción';
    totals.set(key, (totals.get(key) ?? 0) + entrySeconds(entry));
  }
  return [...totals.entries()]
    .map(([name, seconds]) => ({ name, seconds }))
    .sort((a, b) => b.seconds - a.seconds);
}
