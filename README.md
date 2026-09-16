# Enfoque

App de seguimiento de tiempo para macOS (Tauri + React + TypeScript), construida a partir de:
- `docs/instrucciones-sesion-enfoque.md` — especificación funcional y de producto
- `docs/app-window-timenice.jsx` — referencia visual pixel-accurate (paleta, layout, comportamiento)

## Decisiones confirmadas con Beatriz en esta sesión

- Repo: `beatrizantolin-coder/enfoque` (creado manualmente por permisos de la GitHub App)
- Rama: `claude/tauri-enfoque-time-tracking`
- Permiso macOS: **Accesibilidad** (AXUIElement), no Grabación de pantalla
- Persistencia: **SQLite** vía `tauri-plugin-sql`
- Conflicto de reglas entre proyectos: gana el **proyecto usado más recientemente**

## Estado del código

### Frontend (React + TypeScript + Vite) — verificado en este entorno

- Todas las pantallas marcadas ✅ en el documento de producto están construidas:
  Registro de hoy, Tiempo → Resumen, Actividades de apps, Proyectos (+ panel editar
  + vista de detalle con gráfico), Reglas, Tarifas de facturación, Clientes
  (+ panel editar), Calendario, Configuración, y el popover de la barra de menús.
- Las secciones 🚧 (Finanzas, Informes personalizados, Horas de trabajo, resto de
  Asistencia) quedan como placeholder, tal y como pide el documento.
- Lógica pura (formato de horas, matching de reglas, agregados) portada del
  prototipo y cubierta con tests: `npm test` (20 tests, vitest + jsdom).
- `npm run build` genera `dist/index.html` (app completa) y `dist/popover.html`
  (ventana de la barra de menús) — verificado.
- `npx tsc --noEmit` sin errores.

### Backend Rust / Tauri (`src-tauri/`) — verificado parcialmente

Este entorno de desarrollo es **Linux**, así que se ha podido verificar con
`cargo check` y `cargo clippy` (ambos limpios) todo el código multiplataforma:
configuración de Tauri, capabilities/ACL, esquema y migraciones SQLite, tray
icon, ventanas, comandos IPC. **No se ha podido compilar ni ejecutar la parte
específica de macOS** (Accesibilidad vía AXUIElement y el sondeo de la ventana
activa en `accessibility.rs` / `tracker.rs`), porque requiere el SDK de macOS.
Las firmas FFI están verificadas contra el código fuente real de
`accessibility-sys`, `core-foundation` y `objc2-app-kit` (no adivinadas), pero
el comportamiento en tiempo de ejecución solo se puede confirmar en un Mac real
con `npm run tauri dev`.

**Antes de dar por buena la app, en un Mac real hay que comprobar en particular:**
1. Que aparece el diálogo de permiso de Accesibilidad la primera vez.
2. Que `accessibility.rs` lee correctamente el título de la ventana/pestaña
   activa (usa AXUIElement, no Screen Recording, según lo decidido).
3. Que el tracker en segundo plano (`tracker.rs`) escribe entradas en
   `time_entries` y que aparecen en "Registro de hoy" sin reiniciar la app.
4. Que el popover se posiciona bien bajo el icono de la barra de menús y se
   cierra al perder el foco.
5. El icono de la app y de la barra de menús son un placeholder (círculo verde
   con manecillas) — sustituir antes de publicar. El icono del tray está en
   `icon_as_template(false)`; si se sube un icono de plantilla monocromo,
   cambiar a `true` para que macOS lo adapte a modo claro/oscuro.

### Modelo de datos

Esquema SQLite en `src-tauri/src/db.rs` (única fuente de verdad, migran vía
`tauri-plugin-sql`): `projects`, `rules`, `time_entries` (con `date` explícito
para poder navegar días distintos en "Registro de hoy"), `rates`, `clients`,
`project_recency` (para el desempate de reglas) y `settings` (modo de
seguimiento, etc.).

## Desarrollo

```bash
npm install
npm run dev          # solo frontend, en un navegador (sin funciones nativas)
npm test             # tests de lógica pura
npm run build        # build de producción del frontend

# En un Mac, con Rust + Xcode Command Line Tools instalados:
npm run tauri dev    # app completa con backend nativo
```

## Pendiente / notas técnicas abiertas

- El matching de palabras clave es substring simple, insensible a mayúsculas
  (confirmado en `src/lib/matching.ts`, portado a `tracker.rs`).
- El polling de la ventana activa es cada 3 segundos (`tracker.rs`,
  `POLL_INTERVAL`) — ajustable si en el uso real pesa en batería.
- Migración/estrategia de backup de datos: no definida todavía, a decidir en
  una próxima sesión.
