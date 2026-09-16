// Oculta la consola de Windows en release; en macOS (nuestra plataforma
// objetivo) no tiene efecto.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod accessibility;
mod commands;
mod db;
mod tracker;
mod tray;

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(db::DB_CONNECTION, db::migrations())
                .build(),
        )
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::accessibility_status,
            commands::request_accessibility,
        ])
        .setup(|app| {
            let handle = app.handle().clone();
            tray::setup(&handle)?;
            tracker::spawn(handle);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error al ejecutar la aplicación Enfoque");
}
