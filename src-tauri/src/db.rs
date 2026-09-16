use tauri_plugin_sql::{Migration, MigrationKind};

/// Esquema compartido con el frontend (ver `src/lib/db.ts`).
///
/// Cascadas de borrado: no dependemos de `ON DELETE CASCADE` porque SQLite
/// no lo aplica salvo `PRAGMA foreign_keys = ON` en cada conexión, y esta
/// base la abren dos conexiones distintas (el frontend vía este plugin y,
/// en macOS, el proceso de seguimiento en segundo plano). El borrado en
/// cascada se hace explícitamente en el código de la app (ver `db.ts`).
const SCHEMA_V1: &str = r#"
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    owner TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    phases_json TEXT NOT NULL DEFAULT '[]',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS rules (
    id TEXT PRIMARY KEY,
    keyword TEXT NOT NULL,
    project_id TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rules_project_id ON rules(project_id);

CREATE TABLE IF NOT EXISTS time_entries (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    app TEXT NOT NULL DEFAULT '',
    date TEXT NOT NULL,
    start TEXT NOT NULL,
    end TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);

CREATE TABLE IF NOT EXISTS rates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    value REAL NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'ingresos',
    role TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    contact TEXT NOT NULL DEFAULT '',
    linked_projects_json TEXT NOT NULL DEFAULT '[]',
    nif TEXT NOT NULL DEFAULT '',
    tipo TEXT NOT NULL DEFAULT 'pequeno',
    porcentaje REAL NOT NULL DEFAULT 0,
    owner TEXT NOT NULL DEFAULT '',
    calle TEXT NOT NULL DEFAULT '',
    cp TEXT NOT NULL DEFAULT '',
    ciudad TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS project_recency (
    project_id TEXT PRIMARY KEY,
    last_used_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
"#;

/// Nombre de conexión usado tanto por el frontend (`Database.load("sqlite:enfoque.db")`)
/// como, en macOS, por el proceso de seguimiento en segundo plano.
pub const DB_CONNECTION: &str = "sqlite:enfoque.db";
// Solo lo consume el tracker de macOS; en otras plataformas ese módulo es
// un stub vacío y esta constante queda sin usar.
#[cfg_attr(not(target_os = "macos"), allow(dead_code))]
pub const DB_FILE_NAME: &str = "enfoque.db";

pub fn migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "esquema inicial",
        sql: SCHEMA_V1,
        kind: MigrationKind::Up,
    }]
}
