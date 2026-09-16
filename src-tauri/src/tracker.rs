//! Seguimiento automático en segundo plano (solo macOS): sondea el título
//! de la ventana/pestaña activa, lo compara contra las reglas y escribe
//! entradas de tiempo directamente en la misma base SQLite que usa el
//! frontend (a través de `tauri-plugin-sql`).
//!
//! No se ha podido ejecutar este módulo en este entorno de desarrollo
//! (Linux): la lógica de coincidencia está portada 1:1 desde
//! `src/lib/matching.ts` (ya cubierta por tests en el frontend), pero la
//! integración real con SQLite en macOS debe verificarse a mano.

#[cfg(target_os = "macos")]
mod imp {
    use crate::accessibility;
    use sqlx::sqlite::SqlitePoolOptions;
    use sqlx::{Row, SqlitePool};
    use std::collections::HashMap;
    use std::time::Duration;
    use tauri::{AppHandle, Manager};

    /// Intervalo de sondeo. Un par de llamadas AX cada pocos segundos es
    /// barato; no hace falta nada más agresivo y así se cuida la batería.
    const POLL_INTERVAL: Duration = Duration::from_secs(3);

    struct Rule {
        keyword: String,
        project_id: String,
    }

    #[derive(Default)]
    struct CurrentSession {
        entry_id: Option<String>,
        project_id: Option<String>,
        app_title: Option<String>,
        date: Option<String>,
    }

    pub fn spawn(app: AppHandle) {
        tauri::async_runtime::spawn(async move {
            let db_path = match app.path().app_config_dir() {
                Ok(dir) => dir.join(crate::db::DB_FILE_NAME),
                Err(err) => {
                    eprintln!("[enfoque] no se pudo resolver app_config_dir: {err}");
                    return;
                }
            };
            let conn_str = format!("sqlite:{}", db_path.display());

            let pool = match SqlitePoolOptions::new().max_connections(2).connect(&conn_str).await
            {
                Ok(pool) => pool,
                Err(err) => {
                    eprintln!("[enfoque] no se pudo abrir la base de datos para el tracker: {err}");
                    return;
                }
            };

            let mut session = CurrentSession::default();
            let mut ticker = tokio::time::interval(POLL_INTERVAL);
            loop {
                ticker.tick().await;
                if let Err(err) = tick(&pool, &mut session).await {
                    eprintln!("[enfoque] error en el ciclo de seguimiento: {err}");
                }
            }
        });
    }

    async fn tick(pool: &SqlitePool, session: &mut CurrentSession) -> Result<(), sqlx::Error> {
        let mode: Option<String> =
            sqlx::query("SELECT value FROM settings WHERE key = 'tracking_mode'")
                .fetch_optional(pool)
                .await?
                .map(|row| row.get::<String, _>(0));
        if mode.as_deref() != Some("automatico") {
            return Ok(());
        }

        let Some(title) = accessibility::frontmost_window_title() else {
            return Ok(());
        };

        let rules = load_rules(pool).await?;
        let recency = load_recency(pool).await?;
        let matched = resolve_project(&title, &rules, &recency);

        let Some(project_id) = matched else {
            return Ok(());
        };

        let today = today_iso();
        let now = now_hhmm();

        let same_session = session.project_id.as_deref() == Some(project_id.as_str())
            && session.app_title.as_deref() == Some(title.as_str())
            && session.date.as_deref() == Some(today.as_str());

        if same_session {
            if let Some(entry_id) = &session.entry_id {
                sqlx::query("UPDATE time_entries SET end = $1 WHERE id = $2")
                    .bind(&now)
                    .bind(entry_id)
                    .execute(pool)
                    .await?;
            }
        } else {
            let entry_id = format!("e_{}", chrono_now_millis());
            sqlx::query(
                "INSERT INTO time_entries (id, project_id, app, date, start, end) VALUES ($1, $2, $3, $4, $5, $5)",
            )
            .bind(&entry_id)
            .bind(&project_id)
            .bind(&title)
            .bind(&today)
            .bind(&now)
            .execute(pool)
            .await?;

            *session = CurrentSession {
                entry_id: Some(entry_id),
                project_id: Some(project_id.clone()),
                app_title: Some(title),
                date: Some(today),
            };
        }

        touch_recency(pool, &project_id).await?;
        Ok(())
    }

    async fn load_rules(pool: &SqlitePool) -> Result<Vec<Rule>, sqlx::Error> {
        let rows = sqlx::query("SELECT keyword, project_id FROM rules")
            .fetch_all(pool)
            .await?;
        Ok(rows
            .into_iter()
            .map(|row| Rule {
                keyword: row.get(0),
                project_id: row.get(1),
            })
            .collect())
    }

    async fn load_recency(pool: &SqlitePool) -> Result<HashMap<String, i64>, sqlx::Error> {
        let rows = sqlx::query("SELECT project_id, last_used_at FROM project_recency")
            .fetch_all(pool)
            .await?;
        Ok(rows.into_iter().map(|row| (row.get(0), row.get(1))).collect())
    }

    async fn touch_recency(pool: &SqlitePool, project_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT INTO project_recency (project_id, last_used_at) VALUES ($1, $2)
             ON CONFLICT(project_id) DO UPDATE SET last_used_at = excluded.last_used_at",
        )
        .bind(project_id)
        .bind(chrono_now_millis())
        .execute(pool)
        .await?;
        Ok(())
    }

    /// Port directo de `resolveProjectForTitle` (src/lib/matching.ts):
    /// substring case-insensitive; en empate entre proyectos, gana el
    /// usado más recientemente; sin recencia, gana la primera regla en
    /// orden estable.
    fn resolve_project(title: &str, rules: &[Rule], recency: &HashMap<String, i64>) -> Option<String> {
        let title_lower = title.to_lowercase();
        let mut best: Option<(&str, i64)> = None;

        for rule in rules {
            let keyword = rule.keyword.trim().to_lowercase();
            if keyword.is_empty() || !title_lower.contains(&keyword) {
                continue;
            }
            let score = *recency.get(&rule.project_id).unwrap_or(&i64::MIN);
            match best {
                None => best = Some((&rule.project_id, score)),
                Some((_, best_score)) if score > best_score => {
                    best = Some((&rule.project_id, score))
                }
                _ => {}
            }
        }

        best.map(|(id, _)| id.to_string())
    }

    fn today_iso() -> String {
        let now = std::time::SystemTime::now();
        let datetime: chrono::DateTime<chrono::Local> = now.into();
        datetime.format("%Y-%m-%d").to_string()
    }

    fn now_hhmm() -> String {
        let now = std::time::SystemTime::now();
        let datetime: chrono::DateTime<chrono::Local> = now.into();
        datetime.format("%H:%M").to_string()
    }

    fn chrono_now_millis() -> i64 {
        chrono::Utc::now().timestamp_millis()
    }
}

#[cfg(not(target_os = "macos"))]
mod imp {
    pub fn spawn(_app: tauri::AppHandle) {}
}

pub use imp::spawn;
