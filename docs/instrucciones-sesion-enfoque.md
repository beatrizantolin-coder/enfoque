# Enfoque — Instrucciones de construcción para Claude Code

Documento de traspaso del prototipo de interfaz (validado pantalla a pantalla en chat) a la app real en Tauri. Sigue el mismo patrón de trabajo que Conta-Nice: este documento + el archivo de referencia son la fuente de verdad visual; Claude Code construye sobre el repo real.

**Archivo de referencia (pixel-accurate):** `app-window-timenice.jsx` — componente React único con TODAS las pantallas ya maquetadas y con datos de ejemplo. Úsalo como `ledger.jsx` se usó en Conta-Nice: para copiar estructura, estilos inline, paleta y comportamiento exactos, no como inspiración aproximada.

---

## 0. Antes de tocar nada

- **Confirmar con Beatriz antes de escribir código:**
  - Nombre y URL del repo (propuesta: `beatrizantolin-coder/enfoque`, a confirmar)
  - Rama de trabajo explícita para esta sesión (propuesta: `claude/tauri-enfoque-time-tracking`, a confirmar) — **especificar la rama en cada sesión**, es un problema recurrente que Claude Code abra ramas nuevas en vez de continuar en la existente
  - Estrategia de permisos macOS: Accesibilidad (AXUIElement) vs Grabación de pantalla, para leer título de ventana/pestaña activa
  - Estrategia de persistencia local (sin sync externo, igual que Conta-Nice): SQLite vía `tauri-plugin-sql`, o ficheros JSON locales — a decidir, no asumir
- Aplicar los cambios al repo real (`app/src` o equivalente), **no solo** al archivo de referencia
- Testear con ejecución real (jsdom + Node, como en Conta-Nice), no solo compilación
- Nada de mejoras, reordenaciones o "mientras estamos aquí" no pedidas — cambios exactos a lo especificado aquí

---

## 1. Stack y naturaleza de la app

- Tauri + React/TypeScript, build con Vite
- App de **barra de menús** de macOS (sin icono en el Dock — `LSUIElement`), corre en segundo plano
- UI enteramente en español
- Monitoriza el título de ventana/pestaña activa de macOS y clasifica el tiempo por proyecto según reglas de palabras clave definidas por la usuaria
- macOS pedirá permiso de Accesibilidad la primera vez (una sola vez)

---

## 2. Design tokens

### Paleta de color (proyectos y clientes — 9 círculos seleccionables)
```
#E2725B  rojo
#E8A33D  naranja
#7FB35C  verde
#5B8DBF  azul
#9080C4  morado
#9A9D93  gris
#D97FA6  rosa
#4FAFA8  cian
#D9B23D  amarillo
```
(Comparte base con la paleta de Conta-Nice, que además incluye `#A97C50`.)

### Colores base de interfaz
| Uso | Hex |
|---|---|
| Verde de acento (botones, marca) | `#7FB35C` |
| Verde texto en pestaña/pill activa | `#5C8A3C` |
| Fondo de pestaña/pill activa | `#F1F6EC` |
| Texto principal | `#20231F` |
| Texto secundario | `#9A9D93` |
| Texto terciario | `#5A5D55` |
| Bordes | `#E5E5E0` / `#EBEBE6` |
| Fondo fila hover / inputs | `#FAFAF8` |
| Fondo sidebar | `#FBFBF9` |
| Fondo item sidebar activo | `#EDEEE8` |
| Rojo error/eliminar | `#E2725B` |
| Fondo principal | `#FFFFFF` |

### Tipografía
- **Quicksand** (500/600/700) — marca, títulos de sección (`h1`, "Editar Proyecto", etc.)
- **Inter** (400/500/600) — UI general, cuerpo de texto
- **JetBrains Mono** — todos los valores de tiempo (duraciones, horas), palabras clave de reglas

### Componentes recurrentes
- **Panel lateral de edición**: fijo a la derecha, ocupa el 100% de la altura, ancho 440px (máx. 90vw), `box-shadow` hacia la izquierda, animación de entrada por deslizamiento (~180ms)
- **Popover de barra de menús**: panel translúcido (vibrancy, blur+saturate), ~300-320px de ancho, anclado bajo el icono con una pequeña flecha triangular

---

## 3. Modelo de datos

```
Project { id, name, color, owner, role, description, phases: string[] }
// today/total (segundos) se calculan a partir de TimeEntry, no se almacenan

Rule { id, keyword, projectId }

TimeEntry { id, projectId, app, start: "HH:MM", end: "HH:MM" }
// duración = diferencia entre start y end del mismo día

Rate { id, name, value: number (€/h), type: 'ingresos' | 'costo', role }

Client {
  id, name, color, contact, linkedProjects: string[],
  nif, tipo: 'gran' | 'medio' | 'pequeno', porcentaje: number,
  owner, calle, cp, ciudad
}
```

**Tipos de cliente y recargo** (se define en la ficha de Cliente, no en Tarifas):
- Gran Cliente → +30%
- Cliente medio → +15%
- Cliente pequeño → sin recargo (el `porcentaje` es editable manualmente por si se quiere un valor distinto al de la tabla)

**Roles disponibles** (para Tarifas y Persona encargada): `Project Manager`, `Diseñador`, `Desarrollador`, `Colaborador`

---

## 4. Navegación (sidebar)

```
SEGUIMIENTO
  Registro de hoy

INFORMES
  Tiempo (expandible)
    Tiempo: Resumen ✅ | Detallado 🚧 | Por días 🚧
    Persona: Por tareas 🚧 | Por días y tareas 🚧 | Por días 🚧 | Por proyectos 🚧
    Otro: Informe de localización 🚧
  Finanzas 🚧
  Actividades de apps ✅
  Informes personalizados 🚧

GESTIONAR
  Proyectos ✅
  Reglas ✅
  Tarifas de facturación ✅
  Clientes ✅

ASISTENCIA
  Calendario ✅
  Horas de trabajo 🚧

EQUIPO
  Configuración ✅
```
✅ = diseño cerrado, construir tal cual. 🚧 = **sin diseñar** — dejar como entrada de menú con placeholder ("todavía no hemos diseñado esta sección"), no inventar contenido.

---

## 5. Especificación pantalla por pantalla

### 5.1 Popover de la barra de menús
- **Resumen de hoy** visible al instante (sin clic): total del día, selector Proyectos/Aplicaciones, barra de reparto por color, lista con tiempos
- **Configuración: [modo actual]** — el modo (Automático/Manual) aparece tras los dos puntos; por defecto **siempre Automático**; clic despliega inline las dos opciones con check de selección
- **Abrir aplicación**
- **Salir** — cierra la app por completo

### 5.2 Registro de hoy
- Navegación de fecha (flechas + "Hoy, [fecha]") y pestañas Día/Semana
- Barra de entrada manual ("¿En qué proyecto estás trabajando?" + selector de proyecto + botón play) — relevante en modo Manual
- Cabecera "Día laboral" con: tiempo total del día, botón **+** (añadir entrada manual), botón **duplicar** (copia la última entrada), botón **lápiz** (activa modo edición permanente — muestra editar/borrar en todas las filas sin depender del hover, para pantallas táctiles)
- Cada fila: punto de color del proyecto, nombre del proyecto + app/descripción, rango horario, duración; hover revela editar/borrar
- Formulario de edición/alta inline: proyecto (select), descripción (texto libre), hora inicio/fin; valida que haya proyecto y que fin > inicio
- **Estado vacío**: si no hay entradas, ilustración de reloj + "No hay tiempo registrado hoy"

### 5.3 Tiempo → Resumen
- Selector **Por proyecto** / **Por app**
- Filtros decorativos por ahora: Rango de fechas, Proyectos, Estado, Buscar
- Tabla: fila de proyecto (o app) + filas anidadas de sus reglas/apps asociadas, fila Total al final

### 5.4 Proyectos
- Buscador + botón "Nuevo proyecto"; escribir el nombre en el buscador y pulsar **Ctrl+Enter** también crea el proyecto (color siguiente de la paleta, asignado automáticamente)
- Filas: flecha solo si el proyecto tiene más de una fase, punto de color redondo, nombre en negrita, persona encargada debajo
- Clic en la fila → abre panel **Editar Proyecto**; icono de gráfico aparte → abre la vista de detalle con métricas; papelera → elimina (y sus reglas asociadas en cascada)
- **Panel Editar Proyecto**: Cliente (nombre), selector de Color (9 círculos, 15px), Persona encargada (avatar con inicial + nombre + rol + quitar), Descripción, Presupuesto (fases de texto, añadir/quitar), **Palabras clave (reglas)** — textarea separado por comas que lee y escribe directamente sobre las Reglas globales de ese proyecto; Guardar/Cancela
- **Vista de detalle** (icono de gráfico): enlace de vuelta, título "PROYECTO: NOMBRE", filtros (rango de fechas, desde/hasta, botón Mostrar — decorativos), tabla de reglas/apps con horas y días activos + Total, gráfico de líneas "Horas dedicadas por día" (SVG, últimos 10 días), 4 tarjetas: Fecha de inicio, Última actividad, Tiempo total, Media diaria

### 5.5 Reglas
- Selector **Regla → Proyecto** / **Proyecto → Regla**
- Regla → Proyecto: fila con palabra clave (chip mono), flecha, punto redondo del color del proyecto + nombre
- Proyecto → Regla: agrupado por proyecto (cabecera con punto de color) con sus reglas anidadas debajo
- Alta: palabra clave + selector de proyecto

### 5.6 Tarifas de facturación
- Selector de **Rol** a ancho completo (igual al ancho del encabezado de la tabla), filtra la tabla por rol
- Tabla: Nombre, Valor predeterminado €/h, Tipo (Ingresos/Costo), Elimina
- "Nueva tarifa de facturación" crea una fila dentro del rol seleccionado
- El recargo por tipo de cliente **no** vive aquí — vive en la ficha de cada Cliente (ver 5.7)

### 5.7 Clientes
- Mismo patrón que Proyectos: buscador + Ctrl+Enter, filas con flecha (si tiene más de un proyecto vinculado), punto de color redondo, nombre + contacto
- **Panel Editar Cliente**: Cliente (nombre), selector de Color (9 círculos, 15px), NIF + quitar, Tipo (Gran/Medio/Pequeño Cliente) + Porcentaje (autorrelleno según tipo, editable), Persona encargada + quitar, Dirección (Calle, Código Postal, Ciudad), Guardar/Cancela

### 5.8 Calendario
- Vista mensual, cabecera L-D, navegación de mes (decorativa por ahora)
- Cada día: pequeños cuadrados de color por cada proyecto trabajado ese día
- Día actual resaltado con borde verde
- Leyenda de proyectos debajo

### 5.9 Configuración
- Modo de registro: segmentado Automático (por defecto) / Manual, con texto explicativo
- Interruptor "Abrir al iniciar sesión" (por defecto activado) — usar `tauri-plugin-autostart`
- Tarjeta de estado "Permiso de accesibilidad: Concedido" — **debe reflejar el estado real** consultado desde Rust/macOS, no un valor fijo

---

## 6. Pendiente de diseñar (no construir todavía)

Finanzas, Informes personalizados, Horas de trabajo, y el resto del grupo Asistencia (más allá de Calendario). Dejarlos como entradas de menú con placeholder hasta que se diseñen en una próxima sesión.

---

## 7. Notas técnicas abiertas para Claude Code

- Definir cómo se hace el matching de palabras clave contra el título de ventana (substring simple, case-insensitive, se asume)
- Definir qué ocurre si el título activo coincide con reglas de más de un proyecto (prioridad / orden / primera coincidencia) — **no asumir, preguntar**
- El polling de ventana activa en segundo plano debe ser ligero (evitar consumo de batería alto)
- Persistencia y migración de datos: a decidir antes de escribir el esquema definitivo
