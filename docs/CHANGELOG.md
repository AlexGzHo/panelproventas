# CHANGELOG — PANEL PROVENTAS

Registro de cambios y avances por cada fase del proyecto.

---

## [Fase 1] — Base del proyecto, navegación, identidad visual y formato (2026-11-11)

### Completado
- **Limpieza de base y dependencias**:
  - Eliminación total de dependencias y código de demostración de Clerk (`@clerk/*`), removiendo su exclusión en `pnpm-workspace.yaml`.
  - Depuración de rutas de ejemplo (`tasks`, `apps`, `chats`, `users`, `/settings`).
- **Navegación e interfaz de usuario**:
  - Creación de rutas y pantallas principales de acuerdo con `docs/PRD.md`:
    - `Inicio` (`/`) con 4 tarjetas KPI en estado inicial, estado vacío orientado a la acción y secciones de vencimientos y tendencia.
    - `Ventas` (`/ventas`) con estado vacío y preparación para filtros del lado del servidor.
    - `Clientes` (`/clientes`) con estado vacío y buscador.
    - `Catálogo` (`/catalogo`) con pestañas para Productos y Plataformas.
    - `Reportes` (`/reportes`) con estado vacío para comparativas mensuales y distribución por plataforma.
  - Implementación del botón primario **"+ Nueva venta"** en cabecera de escritorio con atajo de teclado global <kbd>N</kbd> que abre el Sheet lateral.
  - Barra de navegación inferior móvil (`BottomNav`) fija con 4 accesos rápidos y botón central elevado para registro rápido de ventas.
- **Estructura y formateadores**:
  - Creación de `src/lib/formato.ts` con `formatoMoneda` (`es-PE`, `PEN`, `S/`) y `formatoFecha` (`dd/mm/aaaa`, zona horaria `America/Lima`).
  - Suite de pruebas unitarias en `src/lib/formato.test.ts` con 8 casos cubiertos al 100%.
- **Identidad visual (skill frontend-design)**:
  - Adopción de la **Opción A refinada**:
    - Tipografía: `Plus Jakarta Sans` para encabezados y cifras tabulares; `Inter` para texto de cuerpo.
    - Color de acento: Índigo profundo (`#3730A3` en modo claro con contraste 9.49:1 vs fondo, `#818CF8` en modo oscuro con contraste 6.43:1 vs fondo).
    - Colores semánticos reservados estrictamente para estados y variaciones (verde = Vigente / ▲, ámbar = Por vencer, rojo = Vencida / ▼, gris = Renovada / Anulada), acompañados siempre de texto o ícono.
    - Interfaz neutra: fondos y tarjetas en grises fríos slate (`#F8FAFC` claro, `#0B0F17` oscuro), esquinas estructuradas con radio de 8 px (`rounded-lg`).
    - Cifras formateadas con `font-variant-numeric: tabular-nums` nativo en `Plus Jakarta Sans`.
- **Accesibilidad e idioma**:
  - Interfaz 100 % en español (Perú).
  - Componentes de tablas, diálogos de confirmación, menús y errores completamente traducidos.
  - Verificación de contraste WCAG 2.2 AA superada ampliamente en modo claro y modo oscuro.
- **Validación de calidad**:
  - `npm run typecheck` (`tsc -b`) sin errores.
  - `npm run lint` (`eslint .`) sin errores.
  - `npm run test` (Vitest Playwright) con 94 pruebas unitarias aprobadas en 15 suites.
  - `npm run build` exitoso generando bundles optimizados.

### Pendiente para Fase 2
- Conexión con Supabase (`@supabase/supabase-js`, cliente en `src/lib/supabase.ts`).
- Generación de tipos de base de datos (`src/types/database.ts`).
- Pantalla de inicio de sesión con correo y contraseña.
- Protección de rutas authenticated con redirección a `/login`.
- Configuración de TanStack Query para consumo de datos del servidor.
