//! Integración con la API de Accesibilidad de macOS (AXUIElement), la
//! estrategia de permisos que Beatriz eligió (no Grabación de pantalla).
//!
//! Nota para quien retome esto: este módulo solo se compila con
//! `target_os = "macos"` y no se ha podido compilar ni ejecutar en este
//! entorno de desarrollo (Linux). Las firmas FFI están tomadas del código
//! fuente real de `accessibility-sys` 0.2.0 y `core-foundation` 0.10.1
//! (revisado en el registro de cargo), pero el comportamiento en tiempo de
//! ejecución —sobre todo el diálogo de permiso y el volcado del título de
//! ventana— solo se puede verificar en un Mac real con `cargo tauri dev`.

#[cfg(target_os = "macos")]
mod imp {
    use accessibility_sys::{
        kAXFocusedWindowAttribute, kAXTitleAttribute, kAXTrustedCheckOptionPrompt,
        AXIsProcessTrusted, AXIsProcessTrustedWithOptions, AXUIElementCopyAttributeValue,
        AXUIElementCreateApplication, AXUIElementRef,
    };
    use core_foundation::base::{CFType, TCFType};
    use core_foundation::boolean::CFBoolean;
    use core_foundation::dictionary::CFDictionary;
    use core_foundation::string::CFString;
    use objc2::rc::Retained;
    use objc2_app_kit::{NSRunningApplication, NSWorkspace};

    /// true si la app ya tiene permiso de Accesibilidad concedido.
    pub fn is_trusted() -> bool {
        unsafe { AXIsProcessTrusted() }
    }

    /// Fuerza el diálogo del sistema ("¿Permitir que Enfoque controle tu
    /// Mac?") si todavía no se ha concedido el permiso. macOS solo lo
    /// muestra una vez por app, tal y como pide el documento de producto.
    pub fn prompt_if_needed() -> bool {
        unsafe {
            let key = CFString::wrap_under_get_rule(kAXTrustedCheckOptionPrompt);
            let options = CFDictionary::from_CFType_pairs(&[(key, CFBoolean::true_value())]);
            AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef())
        }
    }

    fn frontmost_app_pid() -> Option<i32> {
        unsafe {
            let workspace = NSWorkspace::sharedWorkspace();
            let app: Option<Retained<NSRunningApplication>> = workspace.frontmostApplication();
            app.map(|a| a.processIdentifier())
        }
    }

    /// Título de la ventana enfocada de la app en primer plano, leído vía
    /// AXUIElement (no vía Screen Recording / CGWindowList).
    pub fn frontmost_window_title() -> Option<String> {
        if !is_trusted() {
            return None;
        }
        let pid = frontmost_app_pid()?;

        unsafe {
            let app_element: AXUIElementRef = AXUIElementCreateApplication(pid);
            if app_element.is_null() {
                return None;
            }

            let focused_window_attr = CFString::new(kAXFocusedWindowAttribute);
            let mut window_ref: core_foundation::base::CFTypeRef = std::ptr::null_mut();
            let err = AXUIElementCopyAttributeValue(
                app_element,
                focused_window_attr.as_concrete_TypeRef(),
                &mut window_ref,
            );
            if err != 0 || window_ref.is_null() {
                return None;
            }
            let window_element = window_ref as AXUIElementRef;

            let title_attr = CFString::new(kAXTitleAttribute);
            let mut title_ref: core_foundation::base::CFTypeRef = std::ptr::null_mut();
            let err = AXUIElementCopyAttributeValue(
                window_element,
                title_attr.as_concrete_TypeRef(),
                &mut title_ref,
            );
            // Liberamos las referencias "Copy" (regla create) antes de salir.
            let _owned_window = CFType::wrap_under_create_rule(window_ref);
            if err != 0 || title_ref.is_null() {
                return None;
            }
            let title = CFType::wrap_under_create_rule(title_ref)
                .downcast::<CFString>()
                .map(|s| s.to_string());
            title
        }
    }
}

#[cfg(not(target_os = "macos"))]
mod imp {
    pub fn is_trusted() -> bool {
        false
    }
    pub fn prompt_if_needed() -> bool {
        false
    }
    #[allow(dead_code)]
    pub fn frontmost_window_title() -> Option<String> {
        None
    }
}

// `frontmost_window_title` solo lo consume `tracker.rs`, y ese módulo entero
// se compila a un stub vacío fuera de macOS.
#[allow(unused_imports)]
pub use imp::{frontmost_window_title, is_trusted, prompt_if_needed};
