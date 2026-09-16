import type { Rule } from './types';

/**
 * Coincidencia de palabra clave contra el título de ventana/pestaña activa:
 * substring simple, insensible a mayúsculas/minúsculas.
 */
export function keywordMatches(keyword: string, windowTitle: string): boolean {
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;
  return windowTitle.toLowerCase().includes(kw);
}

/**
 * Recencia de uso por proyecto: projectId -> timestamp (ms) de la última vez
 * que se le asignó tiempo. Se usa para desempatar cuando el título activo
 * coincide con reglas de más de un proyecto a la vez: gana el proyecto usado
 * más recientemente.
 */
export type ProjectRecency = Map<string, number>;

export interface ResolvedMatch {
  projectId: string;
  rule: Rule;
}

/**
 * Resuelve a qué proyecto pertenece el título de ventana activo dado el
 * conjunto de reglas. Si varias reglas de proyectos distintos coinciden,
 * gana el proyecto usado más recientemente (según `recency`); si ninguno
 * de los proyectos en conflicto tiene recencia registrada, gana el primero
 * en el orden en que aparecen las reglas (orden estable, sin aleatoriedad).
 */
export function resolveProjectForTitle(
  windowTitle: string,
  rules: Rule[],
  recency: ProjectRecency = new Map(),
): ResolvedMatch | null {
  const matches = rules.filter((r) => keywordMatches(r.keyword, windowTitle));
  if (matches.length === 0) return null;

  let best = matches[0];
  let bestScore = recency.get(best.projectId) ?? -Infinity;

  for (const candidate of matches.slice(1)) {
    if (candidate.projectId === best.projectId) continue;
    const score = recency.get(candidate.projectId) ?? -Infinity;
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return { projectId: best.projectId, rule: best };
}
