# PANEL PROVENTAS — Kit de arranque

Kit para que Antigravity construya el panel de ventas de suscripciones con las reglas, skills y base de datos ya definidas.

## Contenido
| Archivo | Para qué |
|---|---|
| `AGENTS.md` | Reglas permanentes del proyecto (Antigravity lo lee automáticamente). |
| `.agents/skills/proventas-dominio/` | Skill propia con las reglas de negocio (ventas, renovaciones, ingresos, exportación). |
| `docs/PRD.md` | Qué se construye: pantallas, flujos, criterios de aceptación. |
| `docs/PROMPTS_ANTIGRAVITY.md` | Prompts listos, fase por fase. |
| `supabase/migrations/…_init_proventas.sql` | Base de datos completa con seguridad (RLS) y vistas de ingresos. Probada. |
| `supabase/seed.sql` | Catálogo inicial de plataformas y productos (precios de ejemplo). |
| `scripts/instalar-skills.ps1` / `.sh` | Instala las skills externas para Antigravity. |
| `.env.example` | Variables que necesita el frontend. |

## Paso a paso

### 1. Crear el proyecto a partir de la plantilla base
```bash
git clone --depth 1 https://github.com/satnaing/shadcn-admin.git panel-proventas
cd panel-proventas
rm -rf .git          # en PowerShell: Remove-Item -Recurse -Force .git
git init
```
Copia **todo el contenido de este kit** dentro de `panel-proventas/` (si pregunta por reemplazar `README.md`, acepta).
Instala dependencias con `pnpm install` (la plantilla usa pnpm).

### 2. Instalar las skills
Desde la raíz del proyecto:
```powershell
.\scripts\instalar-skills.ps1        # Windows
```
```bash
bash scripts/instalar-skills.sh      # macOS / Linux / Git Bash
```
Instala: `supabase-postgres-best-practices`, `supabase`, `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `shadcn`, `frontend-design` y `webapp-testing`.
`webapp-testing` necesita Python 3 y Playwright (`pip install playwright` y `playwright install chromium`).

### 3. Preparar Supabase
1. Crea un proyecto en supabase.com (región más cercana a Lima: **South America (São Paulo)**).
2. **Authentication → Sign In / Providers**: desactiva *Allow new users to sign up*.
3. **SQL Editor**: pega y ejecuta `supabase/migrations/20261111000000_init_proventas.sql`, luego `supabase/seed.sql`.
   (Alternativa con CLI: `npx supabase link` y `npx supabase db push`.)
4. **Authentication → Users → Invite user** con tu correo. Luego, en SQL Editor:
   ```sql
   update public.perfiles set rol = 'admin'
   where id = (select id from auth.users where email = 'TU-CORREO');
   ```
5. **Project Settings → API**: copia la URL y la clave pública (anon / publishable) a `.env.local` usando `.env.example` como modelo. **Nunca** uses la clave `service_role` en el frontend.

### 4. (Opcional) Conectar el MCP de Supabase a Antigravity
En el gestor de MCP de Antigravity, agrega Supabase **en modo solo lectura y limitado a este proyecto** (`read_only=true` y `project_ref=<tu-ref>` en la URL del servidor). Sirve para que el agente consulte el esquema y diagnostique sin poder modificar datos.

### 5. Construir con Antigravity
Abre la carpeta en Antigravity y sigue `docs/PROMPTS_ANTIGRAVITY.md` desde el Prompt 0. Una conversación por fase.

## Lo que ya resuelve la base de datos
- Registro rápido: al insertar una venta con solo cliente y producto, se completan precio, costo y fecha de vencimiento desde el catálogo.
- Historial inmutable: las ventas no se pueden borrar, solo anular con motivo; una anulada no se reactiva.
- Estados calculados: vigente, por vencer (≤ 3 días), vencida, renovada, anulada.
- `v_ingresos_mensuales`: ingresos, costos, ganancia y variación vs mes anterior, rellenando meses sin ventas con 0.
- `v_ingresos_plataforma_mes`: ingresos por plataforma y mes.
- Seguridad: sin sesión o sin perfil no se ve nada; solo admin borra clientes y productos (y solo si no tienen ventas).
