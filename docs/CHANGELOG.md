# CHANGELOG — PANEL PROVENTAS

Registro de cambios y avances por cada fase del proyecto.

---

## [Fase 2] — Supabase, autenticación, tipos y protección de rutas (2026-11-13)

### Completado
- **Tokens de contraste de estado**:
  - Corrección de contraste en `src/styles/theme.css` con tokens dedicados para texto de estado sobre tarjetas:
    - Modo claro sobre `#FFFFFF`: `--estado-vigente-text` (`#047857`, 5.48:1), `--estado-por-vencer-text` (`#B45309`, 5.02:1), `--estado-vencida-text` (`#DC2626`, 4.83:1), `--estado-renovada-text` (`#4B5563`, 7.56:1) (todos superan 4.5:1 WCAG AA).
    - Modo oscuro sobre `#111827`: `--estado-vigente-text` (`#34D399`, 9.23:1), `--estado-por-vencer-text` (`#FBBF24`, 10.63:1), `--estado-vencida-text` (`#F87171`, 6.41:1), `--estado-renovada-text` (`#94A3B8`, 6.92:1) (todos superan 4.5:1 WCAG AA).
- **Integración con Supabase y tipos**:
  - Instalación de `@supabase/supabase-js`.
  - Creación de `src/lib/supabase.ts` con validación estricta de variables de entorno en desarrollo (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Generación de tipos TypeScript desde el esquema real del proyecto Supabase `azjhrehaopigugaypugk` en `src/types/database.ts` (466 líneas tipadas).
- **Flujo de autenticación sin registro público**:
  - Creación de la ruta de inicio de sesión `/login` (`src/routes/(auth)/login.tsx` y `src/features/auth/sign-in/`):
    - Formulario con validación en Zod y React Hook Form.
    - Toggle de visibilidad de contraseña accesible en español.
    - Manejo de errores traducidos en español (`"Correo o contraseña incorrectos"`, `"El correo no ha sido confirmado"`, `"Demasiados intentos fallidos"`).
    - Eliminación de todas las páginas y componentes de registro público (`sign-up`), demos de OTP y botones de redes sociales.
    - Redirección automática de `/sign-in` a `/login` preservando parámetros de búsqueda.
  - Creación de la pantalla de recuperación `/forgot-password` (`src/features/auth/forgot-password/`) utilizando `supabase.auth.resetPasswordForEmail` y confirmación visual.
  - Creación de la pantalla de definición de nueva contraseña `/reset-password` (`src/features/auth/reset-password/`) con confirmación de clave y llamada a `supabase.auth.updateUser`.
- **Protección de rutas y sesión**:
  - Hook de ruta `/_authenticated` (`src/routes/_authenticated/route.tsx`) con `beforeLoad`:
    - Verifica sesión activa en memoria o consulta a Supabase.
    - Redirige usuarios no autenticados a `/login?redirect=<ruta_destino>`.
    - Sincroniza sesión y perfil en Zustand `useAuthStore`.
  - Integración de perfil real:
    - Componentes `NavUser` (barra lateral) y `ProfileDropdown` (cabecera) leen datos reales de la tabla `public.perfiles` (`nombre` y `rol`).
    - Presentación del rol del usuario (`Administrador(a)` u `Operador(a)`).
    - Diálogo de confirmación "Cerrar sesión" operativo ejecutando `supabase.auth.signOut()` y redirección inmediata a `/login`.
- **Configuración de TanStack Query**:
  - `staleTime` configurado en 2 minutos para consultas en caché.
  - Reintentos desactivados para errores de autenticación o permisos (401, 403 y código Postgres `42501`).
  - `handleServerError` configurado para capturar errores de PostgREST, Auth y red, emitiendo Sonner toasts en español.
- **Validación de calidad y pruebas**:
  - Pruebas E2E en navegador con Playwright cubriendo:
    1. Acceso no autenticado a `/ventas` redirigido a `/login?redirect=%2Fventas`.
    2. Inicio de sesión con contraseña incorrecta mostrando alerta en español.
    3. Inicio de sesión exitoso con usuario operador redireccionando al destino.
    4. Comprobación del nombre y rol "Operador(a)" en el menú de usuario.
    5. Cierre de sesión y retorno a `/login`.
  - `tsc -b` (typecheck) sin errores.
  - `eslint .` (lint) sin errores.
  - `vitest run --browser.headless` con 88 de 88 pruebas unitarias aprobadas.
  - `vite build` exitoso.

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
