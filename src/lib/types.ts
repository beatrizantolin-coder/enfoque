export type ClientTier = 'gran' | 'medio' | 'pequeno';

export type RateType = 'ingresos' | 'costo';

export type TrackingMode = 'automatico' | 'manual';

// 'Project Manager', 'Diseñador', 'Desarrollador', 'Colaborador' — pero se
// guarda como string libre para no romper si en el futuro se añaden roles.
export type Role = string;

export const ROLE_OPTIONS: Role[] = [
  'Project Manager',
  'Diseñador',
  'Desarrollador',
  'Colaborador',
];

export const TIER_OPTIONS: { id: ClientTier; label: string; pct: number }[] = [
  { id: 'gran', label: 'Gran Cliente', pct: 30 },
  { id: 'medio', label: 'Cliente medio', pct: 15 },
  { id: 'pequeno', label: 'Cliente pequeño', pct: 0 },
];

export interface Project {
  id: string;
  name: string;
  color: string;
  owner: string;
  role: Role;
  description: string;
  phases: string[];
}

export interface Rule {
  id: string;
  keyword: string;
  projectId: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  app: string;
  /** Fecha de la entrada en formato ISO "YYYY-MM-DD". */
  date: string;
  /** "HH:MM" */
  start: string;
  /** "HH:MM" */
  end: string;
}

export interface Rate {
  id: string;
  name: string;
  value: number;
  type: RateType;
  role: Role;
}

export interface Client {
  id: string;
  name: string;
  color: string;
  contact: string;
  linkedProjects: string[];
  nif: string;
  tipo: ClientTier;
  porcentaje: number;
  owner: string;
  calle: string;
  cp: string;
  ciudad: string;
}
