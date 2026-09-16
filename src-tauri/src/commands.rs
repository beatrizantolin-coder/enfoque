use crate::accessibility;

/// Estado real del permiso de Accesibilidad, consultado en macOS vía
/// `AXIsProcessTrusted`. En cualquier otra plataforma devuelve `false`
/// (ver `accessibility.rs`).
///
/// Se expone a JS como "accessibility-status" (con guion): los
/// identificadores de permisos de Tauri solo admiten minúsculas y
/// guiones, así que el nombre del comando IPC se renombra aquí sin tocar
/// el nombre de la función en Rust.
#[tauri::command(rename = "accessibility-status")]
pub fn accessibility_status() -> bool {
    accessibility::is_trusted()
}

/// Fuerza el diálogo del sistema para conceder el permiso si aún no se ha
/// concedido (macOS lo muestra una sola vez por app).
#[tauri::command(rename = "request-accessibility")]
pub fn request_accessibility() -> bool {
    accessibility::prompt_if_needed()
}
