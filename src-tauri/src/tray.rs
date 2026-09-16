use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, PhysicalPosition, Position, WebviewWindow,
};

const POPOVER_LABEL: &str = "popover";

pub fn setup(app: &AppHandle) -> tauri::Result<()> {
    let icon = app
        .default_window_icon()
        .cloned()
        .expect("falta el icono de la app (tauri.conf.json > bundle.icon)");

    // `icon_as_template` se deja en `false` a propósito: el icono actual es
    // un placeholder a color, no un template monocromo. Antes de publicar
    // la app conviene sustituirlo por un icono de plantilla real (negro
    // sobre transparente) y activar `icon_as_template(true)` para que
    // macOS lo adapte automáticamente a modo claro/oscuro.
    TrayIconBuilder::with_id("main")
        .icon(icon)
        .icon_as_template(false)
        .tooltip("Enfoque")
        .show_menu_on_left_click(false)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                rect,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(popover) = app.get_webview_window(POPOVER_LABEL) {
                    // El rect que entrega tray-icon siempre es físico; el
                    // patrón exhaustivo es solo para satisfacer el tipo.
                    let (tray_x, tray_y) = match rect.position {
                        Position::Physical(p) => (p.x as f64, p.y as f64),
                        Position::Logical(p) => (p.x, p.y),
                    };
                    let tray_width = match rect.size {
                        tauri::Size::Physical(s) => s.width as f64,
                        tauri::Size::Logical(s) => s.width,
                    };
                    toggle_popover(&popover, tray_x, tray_y, tray_width);
                }
            }
        })
        .build(app)?;

    if let Some(popover) = app.get_webview_window(POPOVER_LABEL) {
        let popover_for_blur = popover.clone();
        popover.on_window_event(move |event| {
            if let tauri::WindowEvent::Focused(false) = event {
                let _ = popover_for_blur.hide();
            }
        });
    }

    Ok(())
}

fn toggle_popover(popover: &WebviewWindow, tray_x: f64, tray_y: f64, tray_width: f64) {
    let is_visible = popover.is_visible().unwrap_or(false);
    if is_visible {
        let _ = popover.hide();
        return;
    }

    // Centra el popover bajo el icono de la barra de menús (todo en píxeles
    // físicos, igual que el `rect` que entrega el evento del tray).
    if let Ok(size) = popover.outer_size() {
        let popover_width = size.width as f64;
        let x = tray_x + tray_width / 2.0 - popover_width / 2.0;
        let y = tray_y;
        let _ = popover.set_position(PhysicalPosition::new(x, y));
    }

    let _ = popover.show();
    let _ = popover.set_focus();
}
