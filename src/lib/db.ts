import Database from '@tauri-apps/plugin-sql';
import { nextPaletteColor } from './colors';
import type { Client, Project, Rate, Rule, TimeEntry } from './types';

const DB_PATH = 'sqlite:enfoque.db';

let dbPromise: Promise<Database> | null = null;

function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = Database.load(DB_PATH);
  return dbPromise;
}

interface ProjectRow {
  id: string;
  name: string;
  color: string;
  owner: string;
  role: string;
  description: string;
  phases_json: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    owner: row.owner,
    role: row.role,
    description: row.description,
    phases: JSON.parse(row.phases_json || '[]'),
  };
}

export async function listProjects(): Promise<Project[]> {
  const db = await getDb();
  const rows = await db.select<ProjectRow[]>('SELECT * FROM projects ORDER BY created_at ASC');
  return rows.map(rowToProject);
}

export async function createProject(input: {
  id: string;
  name: string;
  color?: string;
  owner?: string;
  role?: string;
  description?: string;
  phases?: string[];
}): Promise<void> {
  const db = await getDb();
  const existing = await db.select<{ n: number }[]>('SELECT COUNT(*) as n FROM projects');
  const color = input.color ?? nextPaletteColor(existing[0]?.n ?? 0);
  await db.execute(
    `INSERT INTO projects (id, name, color, owner, role, description, phases_json, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      input.id,
      input.name,
      color,
      input.owner ?? 'Tú',
      input.role ?? 'Project Manager',
      input.description ?? '',
      JSON.stringify(input.phases ?? ['Fase 1']),
      Date.now(),
    ],
  );
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'color' | 'owner' | 'role' | 'description' | 'phases'>>,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (patch.name !== undefined) { fields.push(`name = $${i++}`); values.push(patch.name); }
  if (patch.color !== undefined) { fields.push(`color = $${i++}`); values.push(patch.color); }
  if (patch.owner !== undefined) { fields.push(`owner = $${i++}`); values.push(patch.owner); }
  if (patch.role !== undefined) { fields.push(`role = $${i++}`); values.push(patch.role); }
  if (patch.description !== undefined) { fields.push(`description = $${i++}`); values.push(patch.description); }
  if (patch.phases !== undefined) { fields.push(`phases_json = $${i++}`); values.push(JSON.stringify(patch.phases)); }
  if (fields.length === 0) return;
  values.push(id);
  await db.execute(`UPDATE projects SET ${fields.join(', ')} WHERE id = $${i}`, values);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDb();
  // Cascada manual: SQLite no aplica ON DELETE CASCADE sin PRAGMA foreign_keys,
  // y esta misma base la toca también el proceso de fondo en Rust.
  await db.execute('DELETE FROM rules WHERE project_id = $1', [id]);
  await db.execute('DELETE FROM time_entries WHERE project_id = $1', [id]);
  await db.execute('DELETE FROM project_recency WHERE project_id = $1', [id]);
  await db.execute('DELETE FROM projects WHERE id = $1', [id]);
}

export async function touchProjectRecency(projectId: string, when: number = Date.now()): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO project_recency (project_id, last_used_at) VALUES ($1, $2)
     ON CONFLICT(project_id) DO UPDATE SET last_used_at = excluded.last_used_at`,
    [projectId, when],
  );
}

export async function listProjectRecency(): Promise<Map<string, number>> {
  const db = await getDb();
  const rows = await db.select<{ project_id: string; last_used_at: number }[]>(
    'SELECT project_id, last_used_at FROM project_recency',
  );
  return new Map(rows.map((r) => [r.project_id, r.last_used_at]));
}

export async function listRules(): Promise<Rule[]> {
  const db = await getDb();
  const rows = await db.select<{ id: string; keyword: string; project_id: string }[]>(
    'SELECT id, keyword, project_id FROM rules ORDER BY rowid ASC',
  );
  return rows.map((r) => ({ id: r.id, keyword: r.keyword, projectId: r.project_id }));
}

export async function createRule(input: { id: string; keyword: string; projectId: string }): Promise<void> {
  const db = await getDb();
  await db.execute('INSERT INTO rules (id, keyword, project_id) VALUES ($1, $2, $3)', [
    input.id,
    input.keyword,
    input.projectId,
  ]);
}

export async function deleteRule(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM rules WHERE id = $1', [id]);
}

/** Reemplaza todas las reglas de un proyecto (usado por el panel "Palabras clave"). */
export async function replaceProjectRules(projectId: string, keywords: string[]): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM rules WHERE project_id = $1', [projectId]);
  for (const [i, keyword] of keywords.entries()) {
    await db.execute('INSERT INTO rules (id, keyword, project_id) VALUES ($1, $2, $3)', [
      `r_${projectId}_${Date.now()}_${i}`,
      keyword,
      projectId,
    ]);
  }
}

interface TimeEntryRow {
  id: string;
  project_id: string;
  app: string;
  date: string;
  start: string;
  end: string;
}

function rowToEntry(row: TimeEntryRow): TimeEntry {
  return { id: row.id, projectId: row.project_id, app: row.app, date: row.date, start: row.start, end: row.end };
}

export async function listEntriesForDate(date: string): Promise<TimeEntry[]> {
  const db = await getDb();
  const rows = await db.select<TimeEntryRow[]>(
    'SELECT * FROM time_entries WHERE date = $1 ORDER BY start ASC',
    [date],
  );
  return rows.map(rowToEntry);
}

export async function listEntriesForProject(projectId: string): Promise<TimeEntry[]> {
  const db = await getDb();
  const rows = await db.select<TimeEntryRow[]>(
    'SELECT * FROM time_entries WHERE project_id = $1 ORDER BY date ASC, start ASC',
    [projectId],
  );
  return rows.map(rowToEntry);
}

export async function listEntriesBetween(startDate: string, endDate: string): Promise<TimeEntry[]> {
  const db = await getDb();
  const rows = await db.select<TimeEntryRow[]>(
    'SELECT * FROM time_entries WHERE date >= $1 AND date <= $2 ORDER BY date ASC, start ASC',
    [startDate, endDate],
  );
  return rows.map(rowToEntry);
}

export async function createEntry(input: {
  id: string;
  projectId: string;
  app: string;
  date: string;
  start: string;
  end: string;
}): Promise<void> {
  const db = await getDb();
  await db.execute(
    'INSERT INTO time_entries (id, project_id, app, date, start, end) VALUES ($1, $2, $3, $4, $5, $6)',
    [input.id, input.projectId, input.app, input.date, input.start, input.end],
  );
  await touchProjectRecency(input.projectId);
}

export async function updateEntry(
  id: string,
  patch: Partial<Pick<TimeEntry, 'projectId' | 'app' | 'start' | 'end'>>,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (patch.projectId !== undefined) { fields.push(`project_id = $${i++}`); values.push(patch.projectId); }
  if (patch.app !== undefined) { fields.push(`app = $${i++}`); values.push(patch.app); }
  if (patch.start !== undefined) { fields.push(`start = $${i++}`); values.push(patch.start); }
  if (patch.end !== undefined) { fields.push(`end = $${i++}`); values.push(patch.end); }
  if (fields.length === 0) return;
  values.push(id);
  await db.execute(`UPDATE time_entries SET ${fields.join(', ')} WHERE id = $${i}`, values);
  if (patch.projectId) await touchProjectRecency(patch.projectId);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM time_entries WHERE id = $1', [id]);
}

export async function listRates(): Promise<Rate[]> {
  const db = await getDb();
  const rows = await db.select<{ id: string; name: string; value: number; type: string; role: string }[]>(
    'SELECT * FROM rates ORDER BY rowid ASC',
  );
  return rows.map((r) => ({ id: r.id, name: r.name, value: r.value, type: r.type as Rate['type'], role: r.role }));
}

export async function createRate(input: { id: string; role: string }): Promise<void> {
  const db = await getDb();
  await db.execute('INSERT INTO rates (id, name, value, type, role) VALUES ($1, $2, $3, $4, $5)', [
    input.id,
    '',
    0,
    'ingresos',
    input.role,
  ]);
}

export async function updateRate(id: string, patch: Partial<Pick<Rate, 'name' | 'value' | 'type'>>): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (patch.name !== undefined) { fields.push(`name = $${i++}`); values.push(patch.name); }
  if (patch.value !== undefined) { fields.push(`value = $${i++}`); values.push(patch.value); }
  if (patch.type !== undefined) { fields.push(`type = $${i++}`); values.push(patch.type); }
  if (fields.length === 0) return;
  values.push(id);
  await db.execute(`UPDATE rates SET ${fields.join(', ')} WHERE id = $${i}`, values);
}

export async function deleteRate(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM rates WHERE id = $1', [id]);
}

interface ClientRow {
  id: string;
  name: string;
  color: string;
  contact: string;
  linked_projects_json: string;
  nif: string;
  tipo: string;
  porcentaje: number;
  owner: string;
  calle: string;
  cp: string;
  ciudad: string;
}

function rowToClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    contact: row.contact,
    linkedProjects: JSON.parse(row.linked_projects_json || '[]'),
    nif: row.nif,
    tipo: row.tipo as Client['tipo'],
    porcentaje: row.porcentaje,
    owner: row.owner,
    calle: row.calle,
    cp: row.cp,
    ciudad: row.ciudad,
  };
}

export async function listClients(): Promise<Client[]> {
  const db = await getDb();
  const rows = await db.select<ClientRow[]>('SELECT * FROM clients ORDER BY created_at ASC');
  return rows.map(rowToClient);
}

export async function createClient(input: { id: string; name: string; color?: string }): Promise<void> {
  const db = await getDb();
  const existing = await db.select<{ n: number }[]>('SELECT COUNT(*) as n FROM clients');
  const color = input.color ?? nextPaletteColor(existing[0]?.n ?? 0);
  await db.execute(
    `INSERT INTO clients (id, name, color, contact, linked_projects_json, nif, tipo, porcentaje, owner, calle, cp, ciudad, created_at)
     VALUES ($1, $2, $3, '—', '[]', '', 'pequeno', 0, '', '', '', '', $4)`,
    [input.id, input.name, color, Date.now()],
  );
}

export async function updateClient(
  id: string,
  patch: Partial<
    Pick<Client, 'name' | 'color' | 'nif' | 'tipo' | 'porcentaje' | 'owner' | 'contact' | 'calle' | 'cp' | 'ciudad'>
  >,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  for (const [key, column] of [
    ['name', 'name'],
    ['color', 'color'],
    ['nif', 'nif'],
    ['tipo', 'tipo'],
    ['porcentaje', 'porcentaje'],
    ['owner', 'owner'],
    ['contact', 'contact'],
    ['calle', 'calle'],
    ['cp', 'cp'],
    ['ciudad', 'ciudad'],
  ] as const) {
    const value = patch[key];
    if (value !== undefined) {
      fields.push(`${column} = $${i++}`);
      values.push(value);
    }
  }
  if (fields.length === 0) return;
  values.push(id);
  await db.execute(`UPDATE clients SET ${fields.join(', ')} WHERE id = $${i}`, values);
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM clients WHERE id = $1', [id]);
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const rows = await db.select<{ value: string }[]>('SELECT value FROM settings WHERE key = $1', [key]);
  return rows[0]?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}
