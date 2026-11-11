# PANEL PROVENTAS — Reglas del proyecto para agentes

Panel interno para registrar ventas de suscripciones de cuentas (Netflix, ChatGPT, Spotify…), ver ingresos mes a mes comparados con el mes anterior, consultar y exportar el historial completo, y gestionar clientes y catálogo de productos.

Documentos de referencia (léelos antes de cada fase):
- `docs/PRD.md` — alcance, pantallas, flujos y criterios de aceptación.
- `docs/PROMPTS_ANTIGRAVITY.md` — fases de trabajo en orden.
- `supabase/migrations/` — esquema real de la base de datos. Es la fuente de verdad.

## 1. Prioridad número uno: experiencia de usuario
Comodidad y rapidez antes que cantidad de funciones. Si una función hace la interfaz más pesada o confusa, no se agrega.
- Registrar una venta debe tomar **menos de 15 segundos**: cliente + producto, el resto se autocompleta.
- Todo en **español (Perú)**. Moneda `S/` con `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`. Fechas `dd/mm/aaaa`. Zona horaria `America/Lima`.
- Cada lista tiene estado de carga (skeleton), estado vacío con acción sugerida y mensaje de error con opción de reintentar.
- Acciones destructivas (anular, borrar) piden confirmación y explican la consecuencia.
- Navegable con teclado, foco visible, contraste WCAG 2.2 AA, objetivos táctiles ≥ 44 px. Debe funcionar bien en celular.
- Se aplican las 10 heurísticas de Nielsen; en particular: visibilidad del estado, prevención de errores y reconocer antes que recordar.

## 2. Stack (no cambiar sin aprobación)
| Capa | Elección |
|---|---|
| Build | Vite + React + TypeScript (estricto) |
| Rutas | TanStack Router (basado en archivos) |
| Datos servidor | TanStack Query + `@supabase/supabase-js` |
| UI | shadcn/ui + Tailwind CSS + íconos Lucide |
| Tablas | TanStack Table (paginación y filtros del lado servidor) |
| Gráficos | Recharts mediante el componente Chart de shadcn |
| Formularios | React Hook Form + Zod |
| Backend | Supabase: Auth (correo + contraseña, registro público desactivado), Postgres, RLS |
| Exportación | CSV propio (UTF-8 con BOM) y XLSX con ExcelJS cargado con `import()` dinámico |
| Despliegue | Sitio estático (Vercel, Netlify o Cloudflare Pages) |

**No usar Next.js**: es un panel privado tras login, sin SEO; una SPA con Vite es más simple y rápida.
Base de interfaz: `satnaing/shadcn-admin` (MIT). Se reutilizan layout, sidebar, búsqueda global (Ctrl+K), tema claro/oscuro y tabla de datos; se eliminan las páginas de demostración y la autenticación de ejemplo (se reemplaza por Supabase Auth).

## 3. Skills instaladas y cuándo usarlas
| Skill | Úsala cuando… |
|---|---|
| `proventas-dominio` | Cualquier lógica de negocio: ventas, renovaciones, estados, ingresos, exportación. **Léela primero.** |
| `supabase-postgres-best-practices` | Escribas o revises SQL, índices, RLS, vistas o migraciones. |
| `supabase` | Auth, cliente supabase-js, CLI, tipos generados, MCP. |
| `shadcn` | Agregues, compongas o tematices componentes. Nunca reinventes un componente que shadcn ya trae. |
| `vercel-react-best-practices` | Escribas o refactorices componentes React (re-renders, bundle, cargas en cascada). |
| `vercel-composition-patterns` | Diseñes componentes reutilizables (evitar props booleanas en exceso). |
| `frontend-design` | Definas la dirección visual. Objetivo: que no parezca una plantilla genérica. |
| `web-design-guidelines` | Al cerrar cada fase: auditoría de accesibilidad y UX del código de interfaz. |
| `webapp-testing` | Verifiques flujos en el navegador con Playwright y captures pantallas. |

## 4. Base de datos y seguridad (obligatorio)
- En el frontend **solo** la clave pública (`anon`/publishable). La `service_role` nunca entra al repositorio ni al navegador.
- Variables en `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); `.env*` en `.gitignore`; existe `.env.example`.
- Todo cambio de esquema es una **migración nueva** en `supabase/migrations/`. Nunca edites una migración ya aplicada.
- RLS activo en todas las tablas. Las políticas usan `(select privado.es_miembro())`. No desactives RLS para "probar".
- Las ventas **no se borran**: se anulan con motivo. No existe política DELETE en `suscripciones`; no la crees.
- Lee desde las vistas `v_suscripciones`, `v_ingresos_mensuales` y `v_ingresos_plataforma_mes`. No recalcules ingresos en el cliente.
- Al insertar una venta envía solo lo que el usuario cambió; el trigger completa `precio_venta`, `costo` y `fecha_fin` desde el catálogo.
- Tipos TypeScript generados con `npx supabase gen types typescript` en `src/types/database.ts`. Prohibido `any`.
- PostgREST devuelve como máximo 1000 filas por petición: paginar con `.range()` en tablas y en exportación.

## 5. Estructura de carpetas
```
src/
  routes/                 # TanStack Router (archivos)
  features/
    auth/  inicio/  ventas/  clientes/  catalogo/  reportes/
      components/  api.ts (hooks de TanStack Query)  schemas.ts (Zod)
  components/ui/          # shadcn (no editar a mano salvo tema)
  components/layout/
  lib/supabase.ts  lib/formato.ts  lib/exportar.ts
  types/database.ts
supabase/migrations/  supabase/seed.sql
```

## 6. Orden de escalado entre IAs
1. **Antigravity** (y modelos gratuitos de Kilo Code) implementan.
2. Si un problema persiste tras 2 intentos o la tarea es compleja (RLS, rendimiento, errores que no se entienden): se detiene, documenta en `docs/BLOQUEOS.md` (qué se intentó, error exacto, archivos) y se escala a **Codex/GPT**.
3. **Claude Code** solo interviene si Codex tampoco lo resuelve.
Nunca se "arregla" un bloqueo desactivando seguridad, borrando validaciones o silenciando errores de TypeScript.

## 7. Definición de terminado (cada fase)
- `npm run typecheck` y `npm run lint` sin errores; `npm run build` exitoso.
- Flujo de la fase probado en navegador (skill `webapp-testing`), en escritorio y a 390 px de ancho.
- Revisión con `web-design-guidelines` y corrección de hallazgos de severidad alta.
- Sin `console.log` olvidados, sin datos de prueba en código, sin claves en el repositorio.
- Resumen corto en `docs/CHANGELOG.md`: qué se hizo, qué falta.

## 8. Prohibido
- Agregar dependencias sin justificar en una línea por qué no basta lo que ya existe.
- Guardar contraseñas o credenciales de las cuentas vendidas (fuera de alcance por seguridad).
- Pantallas o funciones que no estén en `docs/PRD.md` sin consultarlo antes.
- Textos de relleno tipo "Lorem ipsum" o métricas inventadas en la interfaz final.
