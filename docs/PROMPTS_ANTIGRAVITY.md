# PANEL PROVENTAS — Prompts por fase para Antigravity

Cómo usar: una **conversación nueva por fase**. Copia el prompt tal cual. No pases a la siguiente fase hasta que se cumpla la "Definición de terminado" de `AGENTS.md`. Si algo falla 2 veces, aplica el orden de escalado (sección 6 de `AGENTS.md`).

---

## Fase 0 — Verificación del entorno (tú, antes de abrir Antigravity)
- [ ] Skills instaladas con `scripts/instalar-skills.ps1` (o `.sh`).
- [ ] Proyecto Supabase creado y migración + seed aplicados (ver `README.md`).
- [ ] `.env.local` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- [ ] (Opcional) MCP de Supabase conectado en Antigravity en **modo solo lectura** y limitado a este proyecto.

**Prompt 0 (comprobación):**
```
Lista las skills que tienes disponibles en este workspace y confirma que leíste AGENTS.md, docs/PRD.md y la skill proventas-dominio. Resume en 5 líneas el stack, las reglas de seguridad y el orden de escalado. No escribas código todavía.
```

---

## Fase 1 — Base del proyecto
```
Fase 1 de docs/PROMPTS_ANTIGRAVITY.md. El repositorio contiene la base de satnaing/shadcn-admin.
1. Elimina las páginas y datos de demostración (tasks, apps, chats, users de ejemplo, Clerk) y deja: layout, sidebar, header, búsqueda Ctrl+K, tema claro/oscuro, componentes ui y la tabla de datos reutilizable.
2. Crea la navegación de docs/PRD.md sección 3 (Inicio, Ventas, Clientes, Catálogo, Reportes) con páginas vacías que tengan su estado vacío, y el botón "+ Nueva venta" (atajo N) que por ahora abre un Sheet vacío. En celular, barra inferior con botón central.
3. Organiza src/ según la sección 5 de AGENTS.md. Crea lib/formato.ts con formatoMoneda (es-PE, PEN) y formatoFecha (dd/mm/aaaa, America/Lima) con pruebas unitarias.
4. Usa la skill frontend-design para proponer una dirección visual propia (tipografía, color de acento, densidad) apropiada para un panel de ventas; muéstrame 2 opciones antes de aplicarla. Evita el aspecto de plantilla por defecto.
5. Interfaz 100 % en español. Ejecuta typecheck, lint y build.
```

---

## Fase 2 — Supabase, autenticación y tipos
```
Fase 2. Lee la migración en supabase/migrations y usa las skills supabase y supabase-postgres-best-practices.
1. Instala @supabase/supabase-js y crea lib/supabase.ts leyendo VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. Crea .env.example. Verifica que .env* esté en .gitignore.
2. Genera src/types/database.ts con `npx supabase gen types typescript` y tipa el cliente.
3. Pantalla de inicio de sesión (correo + contraseña, mostrar/ocultar contraseña, errores en español, "¿Olvidaste tu contraseña?" con resetPasswordForEmail). Sin registro público.
4. Protege todas las rutas: sin sesión → /login. Muestra nombre y rol del perfil en el menú de usuario, con "Cerrar sesión".
5. Configura TanStack Query (staleTime razonable, reintentos, manejo global de errores con toast).
6. No modifiques la migración. Si crees que el esquema necesita un cambio, propónlo como migración nueva y espera mi aprobación.
```
**Revisión recomendada con Codex/GPT** al terminar esta fase: "Revisa lib/supabase.ts, el flujo de auth y que ninguna clave secreta esté expuesta. Revisa las políticas RLS de la migración frente a docs/PRD.md criterio A6."

---

## Fase 3 — Catálogo
```
Fase 3: pantalla Catálogo según docs/PRD.md 4.5 y la skill proventas-dominio (regla 9).
- Pestañas Productos y Plataformas. Tabla de productos agrupada por plataforma con margen calculado (precio − costo) e interruptor Activo con actualización optimista.
- Crear/editar en Dialog con React Hook Form + Zod. Selector de color para plataformas.
- Borrar solo visible para admin y solo si no tiene ventas; si falla por clave foránea, explica que debe desactivarlo.
- Hooks en features/catalogo/api.ts. Estados de carga, vacío y error.
- Prueba el flujo en el navegador con webapp-testing (escritorio y 390 px).
```

---

## Fase 4 — Clientes y Nueva venta (la fase más importante)
```
Fase 4: docs/PRD.md 4.2 y 4.4, skill proventas-dominio reglas 1, 2, 4 y 8.
1. Formulario "Nueva venta" en el Sheet: combobox de cliente con búsqueda por nombre o teléfono (debounce 250 ms, ilike) y opción "+ Crear «texto»" en línea; combobox de producto agrupado por plataforma (solo activos); resumen editable autocompletado (inicio hoy, vence calculado, precio del catálogo), chips de método de pago que recuerdan el último usado.
2. Inserta solo cliente_id, producto_id y lo que el usuario cambió; el trigger completa el resto. Botones Guardar y "Guardar y registrar otra". Toast con Deshacer (anula con motivo "Registro por error").
3. Acción Renovar reutilizable (regla 4) que abre el mismo formulario prellenado con renovacion_de.
4. Pantalla Clientes (lista + ficha con historial, botón WhatsApp wa.me, "Nueva venta para este cliente").
5. Mide: registrar una venta de cliente existente debe requerir ≤ 4 interacciones (criterio A1). Pruébalo con webapp-testing y muéstrame capturas.
```

---

## Fase 5 — Historial y exportación
```
Fase 5: docs/PRD.md 4.3 y la sección Exportación de la skill proventas-dominio.
1. Tabla de ventas sobre v_suscripciones con paginación, orden y filtros del lado servidor; filtros sincronizados con la URL (search params de TanStack Router); atajos de rango de fechas.
2. Pie con total de ventas e ingresos del filtro actual (consulta agregada, no sumar solo la página visible).
3. Menú de acciones por fila: Renovar, Editar, Anular (AlertDialog con motivo obligatorio), Ver cliente. Nunca borrar.
4. lib/exportar.ts: CSV (UTF-8 con BOM) y XLSX (ExcelJS con import dinámico), exportando TODAS las filas del filtro en lotes de 1000 con barra de progreso y opción cancelar.
5. En celular la tabla se muestra como tarjetas.
6. Prueba la exportación con más de 1000 filas (crea datos de prueba solo en local y bórralos después). Criterio A5.
```
**Revisión recomendada con Codex/GPT**: "Revisa rendimiento de las consultas de v_suscripciones con filtros, y que lib/exportar.ts no se corte en 1000 filas ni bloquee la interfaz."

---

## Fase 6 — Inicio y Reportes
```
Fase 6: docs/PRD.md 4.1 y 4.6, skill proventas-dominio reglas 6 y 7. Usa la skill shadcn para el componente Chart (Recharts).
1. Inicio: 4 KPIs del mes en curso desde v_ingresos_mensuales (con ▲/▼ y texto, no solo color), gráfico de barras de 12 meses con el mes actual resaltado, lista "Vencen pronto" con botón Renovar.
2. Reportes: tabla comparativa mensual, barras apiladas por plataforma desde v_ingresos_plataforma_mes, ranking de plataformas, exportación CSV/Excel de la tabla.
3. Casos borde: mes anterior en 0 ("Sin ventas el mes anterior"), sin ventas aún (estado vacío), mes en curso ("al dd/mm").
4. Los gráficos deben tener título, ejes legibles y una tabla o texto alternativo accesible.
```

---

## Fase 7 — Pulido, accesibilidad, rendimiento y despliegue
```
Fase 7.
1. Ejecuta la skill web-design-guidelines sobre todo src/ y corrige los hallazgos de severidad alta y media.
2. Aplica vercel-react-best-practices: carga diferida de rutas, sin cascadas de peticiones, sin re-renders innecesarios en la tabla.
3. Lighthouse móvil del build de producción: LCP < 2,5 s, INP < 200 ms, CLS < 0,1, accesibilidad ≥ 95 (criterio A8).
4. Recorre con webapp-testing los flujos: login → nueva venta → renovar → anular → exportar, en escritorio y 390 px. Adjunta capturas.
5. Prepara el despliegue como sitio estático (redirección SPA a index.html) y documenta las variables de entorno en README.md.
```

---

## Prompt de rescate: "el diseño se ve genérico"
```
El diseño se ve genérico. Usa la skill frontend-design: propone 2 direcciones visuales concretas (tipografía de títulos y cuerpo, color de acento, radio de bordes, densidad, tratamiento de las tarjetas KPI y de los badges de plataforma) coherentes con un panel de ventas rápido. Aplícalas solo a tokens de tema (CSS variables de shadcn) y a 2 pantallas (Inicio y Nueva venta) para que yo elija. No cambies la estructura ni la lógica.
```
