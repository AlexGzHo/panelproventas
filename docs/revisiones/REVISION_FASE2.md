# Revisión de seguridad y calidad — Fase 2

Fecha: 13/11/2026. Base: `24628bb` (`main`). Rama: `codex/revision-fase2`.
Revisión inicial terminada antes de las correcciones de aplicación. La tabla registra ubicaciones de la base para conservar la trazabilidad.

| ID | Severidad | Archivo:línea (base) | Problema | Cómo lo comprobé | Corrección recomendada |
|---|---|---|---|---|---|
| AUTH-01 | Alta | src/stores/auth-store.ts:91; src/main.tsx:83 | Cerrar sesión conserva cachés de consultas y mutaciones; cambios de identidad conservan perfil anterior y respuestas tardías pueden restaurarlo. Riesgo de datos de otro usuario en equipo compartido. | `signOut` solo limpia Zustand; `SIGNED_OUT` solo limpia perfil; no hay `queryClient.clear()`. | Vaciar ambas cachés y perfil al salir/cambiar identidad; ignorar respuestas de perfil de sesiones anteriores; probar salida, evento remoto y carreras. |
| AUTH-02 | Alta | src/features/auth/reset-password/components/reset-password-form.tsx:52; src/main.tsx:83 | URL directa permite invocar `updateUser` con una sesión ordinaria. No se comprueba `PASSWORD_RECOVERY`. No equivale a cambio anónimo: Supabase requiere un token válido. | La ruta no tiene guard y el submit llama directamente al SDK. | Registrar evento de recuperación en memoria asociado a sesión e identidad, comprobar vigencia al mostrar y enviar, consumir permiso al guardar. |
| AUTH-03 | Alta | src/main.tsx:83 | Callback `onAuthStateChange` async espera una consulta Supabase bajo el bloqueo de Auth; puede bloquear login/refresco y verificación de sesión. | `SIGNED_IN` espera `fetchPerfil`; documentación oficial advierte sobre llamadas SDK dentro del callback. | Callback síncrono; consultar perfil fuera del callback, antes de loaders protegidos. |
| AUTH-04 | Media | src/features/auth/sign-in/components/user-auth-form.tsx:87 | Validador acepta `//ejemplo.com` y rutas con protocolo; `https://ejemplo.com` sí se descarta. Falta defensa explícita, aunque TanStack puede rechazar o mantener el destino interno. | Comparación `startsWith('/')`; se probarán ambos payloads en navegador. No se afirma exfiltración demostrada. | Validador compartido estricto para búsqueda y navegación; Antigravity debe corregirlo. |
| AUTH-05 | Media | src/routes/_authenticated/route.tsx:11 | Sesión sin fila en perfiles entra al layout; falta pantalla «Sin acceso, contacta a la administradora». RLS impide leer datos, por lo que no hay bypass de A6 demostrado. | `fetchPerfil` devuelve null y `beforeLoad` retorna igualmente. | Bloquear loaders y mostrar estado específico con salida; diferenciar ausencia de perfil de fallo de red. Antigravity. |
| AUTH-06 | Media | src/stores/auth-store.ts:64 | Errores de perfil y fila ausente se convierten en el mismo null, ocultando fallos operativos. | `.single()` y `catch { return null }`. | Usar `maybeSingle`, propagar error y ofrecer reintentar. Antigravity, salvo cambios mínimos necesarios para AUTH-01/03. |
| UX-01 | Baja | src/features/auth/sign-in/components/user-auth-form.tsx:144 | Recuperar contraseña queda fuera de la navegación por tabulador. | `tabIndex={-1}` en enlace. | Eliminar exclusión y comprobar teclado. Antigravity. |
| CODE-01 | Baja | src/routeTree.gen.ts:32 | 16 `as any` en archivo generado por TanStack. | `rg` y cabecera «no editar». Sin `any` de aplicación detectado. | Evaluar generador/configuración; no editar generado manualmente. Antigravity. |
| DB-01 | Baja | supabase/migrations/20261111000000_init_proventas.sql:62 | Trigger security definer `crear_perfil` conserva EXECUTE por defecto de PUBLIC. Esquema privado y retorno trigger limitan explotación; no es bypass observado. | Revisé grants y firma; helpers es_miembro/es_admin sí revocan PUBLIC/anon. | Proponer migración NUEVA que revoque EXECUTE de PUBLIC/anon/authenticated en crear_perfil(); no aplicar en esta revisión. |

| CODE-02 | Baja | .agents/skills/shadcn/assets/showcase/state-matrix.tsx:62 | Warning de Fast Refresh en un ejemplo de skill. | `pnpm run lint`, 0 errores y 1 warning. | Separar export de constantes del ejemplo si se mantiene; Antigravity. |
| CODE-03 | Baja | vite.config.ts:21 | `__dirname` no será compatible con el futuro configLoader native por defecto. | Aviso de Vite al compilar. | Migrar a import.meta.dirname cuando corresponda; Antigravity. |
| PERF-01 | Baja | src/main.tsx:1 | Bundle inicial supera aviso de 500 kB minificado (622,99 kB; gzip 182,59 kB). No se midieron Core Web Vitals. | Salida de `pnpm run build`. | Analizar partición y dependencias antes de fase de rendimiento; Antigravity. |

| SEC-01 | Media | .gitignore:37 | Se ignoran nombres estándar `.env` y `.env.*`, pero no TODO el prefijo `.env*` pedido (ej. `.env-backup`, `.envrc`). No hay secretos detectados en ellos. | `git check-ignore -v .env-backup .envrc` no encuentra regla. | Usar `.env*` y mantener `!.env.example`, o acordar lista explícita. Antigravity. |

## Dependencias

Inventario íntegro sanitizado: [audit-antes.json](audit-antes.json). El registro reporta 5 críticas, 47 altas, 43 medias y 4 bajas (cuentas de pnpm, no necesariamente paquetes únicos). Cada aviso alto/crítico se enumera a continuación; severidad del registro, con exposición variable entre navegador y herramientas locales. No se demuestra explotación de todos en esta SPA.

| ID | Severidad | Archivo:línea | Problema | Cómo lo comprobé | Corrección recomendada |
|---|---|---|---|---|---|
| DEP-01 | Alta | pnpm-lock.yaml:2839 | minimatch 9.0.5: [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=9.0.6, conservando compatibilidad. |
| DEP-02 | Alta | pnpm-lock.yaml:2839 | minimatch 9.0.5: [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=9.0.7, conservando compatibilidad. |
| DEP-03 | Alta | pnpm-lock.yaml:2839 | minimatch 9.0.5: [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=9.0.7, conservando compatibilidad. |
| DEP-04 | Alta | pnpm-lock.yaml:2910 | picomatch 2.3.1: [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=2.3.2, conservando compatibilidad. |
| DEP-05 | Alta | pnpm-lock.yaml:2794 | lodash-es 4.17.21: [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.18.1, conservando compatibilidad. |
| DEP-06 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-pmwg-cvhr-8vh7](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.15.1, conservando compatibilidad. |
| DEP-07 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-pf86-5x62-jrwf](https://github.com/advisories/GHSA-pf86-5x62-jrwf) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.15.1, conservando compatibilidad. |
| DEP-08 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-6chq-wfr3-2hj9](https://github.com/advisories/GHSA-6chq-wfr3-2hj9) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.15.1, conservando compatibilidad. |
| DEP-09 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-q8qp-cvcw-x6jj](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.15.2, conservando compatibilidad. |
| DEP-10 | Crítica | pnpm-lock.yaml:2099 | @vitest/browser 4.1.4: [GHSA-2h32-95rg-cppp](https://github.com/advisories/GHSA-2h32-95rg-cppp) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.1.6, conservando compatibilidad. |
| DEP-11 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-hfxv-24rg-xrqf](https://github.com/advisories/GHSA-hfxv-24rg-xrqf) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.16.0, conservando compatibilidad. |
| DEP-12 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-777c-7fjr-54vf](https://github.com/advisories/GHSA-777c-7fjr-54vf) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.16.0, conservando compatibilidad. |
| DEP-13 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-p92q-9vqr-4j8v](https://github.com/advisories/GHSA-p92q-9vqr-4j8v) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.16.0, conservando compatibilidad. |
| DEP-14 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-j5f8-grm9-p9fc](https://github.com/advisories/GHSA-j5f8-grm9-p9fc) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.16.0, conservando compatibilidad. |
| DEP-15 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-3g43-6gmg-66jw](https://github.com/advisories/GHSA-3g43-6gmg-66jw) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.15.2, conservando compatibilidad. |
| DEP-16 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-35jp-ww65-95wh](https://github.com/advisories/GHSA-35jp-ww65-95wh) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.16.0, conservando compatibilidad. |
| DEP-17 | Alta | pnpm-lock.yaml:2522 | form-data 4.0.5: [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.0.6, conservando compatibilidad. |
| DEP-18 | Alta | pnpm-lock.yaml:3427 | ws 8.20.0: [GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=8.21.0, conservando compatibilidad. |
| DEP-19 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-pjwm-pj3p-43mv](https://github.com/advisories/GHSA-pjwm-pj3p-43mv) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.16.0, conservando compatibilidad. |
| DEP-20 | Alta | pnpm-lock.yaml:2199 | brace-expansion 2.0.2: [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=2.1.2, conservando compatibilidad. |
| DEP-21 | Alta | pnpm-lock.yaml:2202 | brace-expansion 5.0.5: [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=5.0.7, conservando compatibilidad. |
| DEP-22 | Alta | pnpm-lock.yaml:2932 | postcss 8.5.8: [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=8.5.12, conservando compatibilidad. |
| DEP-23 | Crítica | pnpm-lock.yaml:3139 | seroval 1.5.1: [GHSA-mv8w-475r-vwqw](https://github.com/advisories/GHSA-mv8w-475r-vwqw) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.5.3, conservando compatibilidad. |
| DEP-24 | Alta | pnpm-lock.yaml:2199 | brace-expansion 2.0.2: [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=2.1.3, conservando compatibilidad. |
| DEP-25 | Alta | pnpm-lock.yaml:2202 | brace-expansion 5.0.5: [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=5.0.8, conservando compatibilidad. |
| DEP-26 | Alta | pnpm-lock.yaml:2202 | brace-expansion 5.0.5: [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=5.0.9, conservando compatibilidad. |
| DEP-27 | Alta | pnpm-lock.yaml:2199 | brace-expansion 2.0.2: [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=2.1.4, conservando compatibilidad. |
| DEP-28 | Alta | pnpm-lock.yaml:2853 | nanoid 3.3.11: [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=3.3.16, conservando compatibilidad. |
| DEP-29 | Alta | pnpm-lock.yaml:2853 | nanoid 3.3.11: [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=3.3.18, conservando compatibilidad. |
| DEP-30 | Alta | pnpm-lock.yaml:2932 | postcss 8.5.8: [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=8.5.18, conservando compatibilidad. |
| DEP-31 | Crítica | pnpm-lock.yaml:2099 | @vitest/browser 4.1.4: [GHSA-p63j-vcc4-9vmv](https://github.com/advisories/GHSA-p63j-vcc4-9vmv) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.1.10, conservando compatibilidad. |
| DEP-32 | Crítica | pnpm-lock.yaml:2099 | @vitest/browser 4.1.4: [GHSA-g8mr-85jm-7xhm](https://github.com/advisories/GHSA-g8mr-85jm-7xhm) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.1.8, conservando compatibilidad. |
| DEP-33 | Alta | pnpm-lock.yaml:2210 | browserslist 4.25.0: [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.28.7, conservando compatibilidad. |
| DEP-34 | Alta | pnpm-lock.yaml:2210 | browserslist 4.25.0: [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.28.7, conservando compatibilidad. |
| DEP-35 | Alta | pnpm-lock.yaml:2853 | nanoid 3.3.11: [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=3.3.12, conservando compatibilidad. |
| DEP-36 | Alta | pnpm-lock.yaml:716 | @faker-js/faker 10.4.0: [GHSA-qxc2-j82w-r537](https://github.com/advisories/GHSA-qxc2-j82w-r537) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=10.5.0, conservando compatibilidad. |
| DEP-37 | Alta | pnpm-lock.yaml:3158 | smol-toml 1.6.1: [GHSA-7w5x-hrqm-74c2](https://github.com/advisories/GHSA-7w5x-hrqm-74c2) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.7.1, conservando compatibilidad. |
| DEP-38 | Alta | pnpm-lock.yaml:2199 | brace-expansion 2.0.2: [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=2.1.6, conservando compatibilidad. |
| DEP-39 | Alta | pnpm-lock.yaml:2202 | brace-expansion 5.0.5: [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=5.0.11, conservando compatibilidad. |
| DEP-40 | Alta | pnpm-lock.yaml:2199 | brace-expansion 2.0.2: [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=2.1.5, conservando compatibilidad. |
| DEP-41 | Alta | pnpm-lock.yaml:2202 | brace-expansion 5.0.5: [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=5.0.10, conservando compatibilidad. |
| DEP-42 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-mghh-pgcx-3jjj](https://github.com/advisories/GHSA-mghh-pgcx-3jjj) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.20.0, conservando compatibilidad. |
| DEP-43 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-3pq3-5fj3-cg6v](https://github.com/advisories/GHSA-3pq3-5fj3-cg6v) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.20.0, conservando compatibilidad. |
| DEP-44 | Alta | pnpm-lock.yaml:2182 | axios 1.15.0: [GHSA-542g-h47m-68v8](https://github.com/advisories/GHSA-542g-h47m-68v8) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.20.0, conservando compatibilidad. |
| DEP-45 | Crítica | pnpm-lock.yaml:3139 | seroval 1.5.1: [GHSA-p6vx-979v-rg4c](https://github.com/advisories/GHSA-p6vx-979v-rg4c) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.6.1, conservando compatibilidad. |
| DEP-46 | Alta | pnpm-lock.yaml:3139 | seroval 1.5.1: [GHSA-jp82-f5mq-hwhp](https://github.com/advisories/GHSA-jp82-f5mq-hwhp) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.6.3, conservando compatibilidad. |
| DEP-47 | Alta | pnpm-lock.yaml:3168 | source-map-js 1.2.1: [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.2.2, conservando compatibilidad. |
| DEP-48 | Alta | pnpm-lock.yaml:3308 | vite 8.0.8: [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=8.1.6, conservando compatibilidad. |
| DEP-49 | Alta | pnpm-lock.yaml:3457 | zod 3.25.76, 4.3.6: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=4.6.6, conservando compatibilidad. |
| DEP-50 | Alta | pnpm-lock.yaml:3139 | seroval 1.5.1: [GHSA-97r2-qh9m-474h](https://github.com/advisories/GHSA-97r2-qh9m-474h) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.6.8, conservando compatibilidad. |
| DEP-51 | Alta | pnpm-lock.yaml:3139 | seroval 1.5.1: [GHSA-wp97-x4hv-qvhp](https://github.com/advisories/GHSA-wp97-x4hv-qvhp) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.6.8, conservando compatibilidad. |
| DEP-52 | Alta | pnpm-lock.yaml:3139 | seroval 1.5.1: [GHSA-7rv5-mrxv-xcr9](https://github.com/advisories/GHSA-7rv5-mrxv-xcr9) | `pnpm audit --json`; rutas en inventario. | Actualizar a >=1.6.8, conservando compatibilidad. |

### Avisos medios y bajos pendientes (Antigravity)

| ID | Severidad | Archivo:línea | Problema | Cómo lo comprobé | Corrección recomendada |
|---|---|---|---|---|---|
| DEP-P01 | Baja | pnpm-lock.yaml:256 | @babel/core: [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) | Auditoría posterior; @babel/core: Arbitrary File Read via sourceMappingURL Comment. | Actualizar a >=7.29.6 en tarea separada. |
| DEP-P02 | Media | pnpm-lock.yaml:806 | @humanfs/node: [GHSA-p498-v437-472g](https://github.com/advisories/GHSA-p498-v437-472g) | Auditoría posterior; humanfs: Recursive copy follows symlinked files and copies data from outside the source tree. | Actualizar a >=0.16.8 en tarea separada. |
| DEP-P03 | Media | pnpm-lock.yaml:2581 | fflate: [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98) | Auditoría posterior; fflate unzipSync can enter an infinite loop when parsing malformed ZIP64 archives. | Actualizar a >=0.8.3 en tarea separada. |
| DEP-P04 | Media | pnpm-lock.yaml:2292 | brace-expansion: [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) | Auditoría posterior; brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service. | Actualizar a >=5.0.12 en tarea separada. |
| DEP-P05 | Media | pnpm-lock.yaml:3336 | smol-toml: [GHSA-r4xh-jqrq-34v2](https://github.com/advisories/GHSA-r4xh-jqrq-34v2) | Auditoría posterior; smol-toml: Quadratic-time parse() from parseKey rescanning to end of document on each key line. | Actualizar a >=1.9.0 en tarea separada. |
| DEP-P06 | Media | pnpm-lock.yaml:3007 | minimatch: [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | Auditoría posterior; minimatch has potential denial of service via globparts amplification. | Actualizar a >=11.0.1 en tarea separada. |

## Secretos e historial

Se inspeccionaron archivos rastreados y **63 618 líneas** de `git log --all -p --full-history`, tres commits; `git rev-parse --is-shallow-repository` = false. Se buscaron JWT (decodificando rol sin imprimir el token), `sb_secret_`, claves privadas y menciones `service_role`. No se detectaron tokens ni claves secretas. Las menciones son reglas de documentación; `.env.example` contiene solo `TU-PROYECTO` y `tu-clave-publica-anon`.

`git check-ignore -v` confirma `.env`, `.env.local`, `.env.test.local`, `.env.production` y `supabase/.temp/probe`; `.env.example` es la excepción intencional. Solo `.env.example` y declaraciones de tipos coinciden con nombres env rastreados. Esto cubre objetos alcanzables por las referencias disponibles, no objetos borrados de GitHub, forks, backups o secretos de servicios externos.

## Base de datos: revisión estática, sin escrituras

- A6: cinco tablas con RLS; anon sin privilegios; authenticated sin perfil no satisface es_miembro/es_admin. Perfil propio requiere auth.uid y existencia de fila; admin puede consultar otros perfiles. Los miembros comparten negocio por diseño, no multiempresa.
- Tres funciones SECURITY DEFINER con `set search_path = ''` y referencias calificadas; helpers privados revisan auth.uid. Tres vistas con `security_invoker = true` y permisos anon revocados.
- Suscripciones no tiene política DELETE; actualizaciones tienen USING/WITH CHECK, anulación exige motivo. No se propone desactivar seguridad.
- No se ejecutaron consultas sobre la base desplegada: no se certifican políticas efectivamente instaladas, grants por defecto del proyecto ni registro público desactivado. Verificar en entorno autorizado, con anónimo, usuario sin perfil, operador y admin. No se modifica ni aplica ninguna migración.

## Sesión y solicitudes

`beforeLoad` del padre espera getSession antes de obtener perfil; la consulta de perfil es parte de autorización. No hay consultas de negocio actuales en loaders descendientes. No encontré `@ts-ignore`, `@ts-expect-error`, `console.log` ni catch vacíos en código de aplicación. Los catch de formularios muestran mensajes; el catch de perfil sí oculta la causa (AUTH-06). Verificado también después de las correcciones. El frontend no reemplaza RLS.

## Referencias

- [OWASP ASVS 5.0.0](https://github.com/OWASP/ASVS/tree/v5.0.0/5.0): V6 autenticación, V7 sesiones y V8 autorización. Referencia de revisión, no certificación completa ASVS.
- [Supabase onAuthStateChange](https://supabase.com/docs/reference/javascript/auth-onauthstatechange): eventos y callback sin llamadas SDK bloqueantes.
- [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md): teclado, foco y estados.

## Correcciones y validación

Se corrigieron AUTH-01, AUTH-02, AUTH-03 y los avisos DEP altos/críticos. Los medios y bajos de la tabla se reservan a Antigravity. No hay cambios en las migraciones ni se escribieron datos reales.

- `setSession` elimina consultas/mutaciones y perfil al cambiar identidad o salir, incluido SIGNED_OUT remoto; una generación impide que una consulta antigua restaure el perfil. Se cancela la consulta pendiente al limpiar QueryClient. `signOut` limpia inmediatamente y al terminar, y contempla revocación local si falla la remota.
- `handleAuthEvent` es síncrono y no consulta al SDK; las rutas/formulario siguen obteniendo el perfil fuera del callback. Las invalidaciones del router se programan después del callback.
- La recuperación exige PASSWORD_RECOVERY y token de sesión coincidente no vencido; se comprueba al renderizar y enviar, se consume tras actualización y se borra al salir/cambiar usuario. Acceso directo muestra mensaje y enlace a forgot-password. No se persiste el permiso en localStorage.
- Actualizaciones dentro de las versiones mayores existentes: axios, Zod, Vite, Vitest y TanStack. Overrides puntuales de transitivas con avisos altos conservan su API mayor; no se añadieron dependencias. Algunas correcciones medias/bajas del mismo paquete llegan inevitablemente con esos parches, sin trabajo adicional sobre ellas. `routeTree.gen.ts` fue regenerado por la versión actualizada del plugin (orden, mismas rutas).
- [audit-despues.json](audit-despues.json): **0 críticas, 0 altas, 5 medias, 1 baja**. No hay supresiones del auditor. Los overrides exactos dejan de actuar si el padre resuelve otra versión; mantener auditoría en futuras actualizaciones.

### Verificación

- `pnpm run typecheck`: aprobado.
- `pnpm run lint`: aprobado, 0 errores; un warning en `.agents/skills/shadcn/assets/showcase/state-matrix.tsx:62` (ejemplo de skill, fuera de la app). Se deja como baja.
- `pnpm test`: 101 pruebas aprobadas en 14 archivos, Chromium real mediante Vitest. Incluye caché de consultas/mutaciones, respuesta tardía de perfil, consulta activa cancelada, salida remota, cambio de identidad, fallback local, callback sin SDK anidado, recuperación ordinaria/anónima/vencida/válida y revocada.
- `pnpm run build`: aprobado. Advertencias de compatibilidad futura de `__dirname` en Vite y chunk mayor a 500 kB; no fallos. Se dejan como mejoras bajas para Antigravity.
- Playwright, 1280 y 390 px: [evidencia JSON](evidencias/navegador.json) y capturas en `evidencias/`. `https://ejemplo.com` → `/`; `//ejemplo.com` → `/ejemplo.com`, mismo origen en ambos casos. La segunda URL no cumple el contrato solicitado: sigue pendiente AUTH-04. El login simulado sin fila de perfil muestra Inicio en ambos anchos, confirmando AUTH-05 (capturas sin-perfil). Reset directo sin formulario, con enlace y sin desbordamiento horizontal. Enlace simulado válido procesado por el SDK real emite PASSWORD_RECOVERY y permite exactamente un PUT de contraseña en ambos anchos. `/ventas` sin sesión → `/login`.
- Revisión visual de capturas y del nuevo estado contra Web Interface Guidelines: enlace nuevo accesible por teclado, foco heredado de Button, altura mínima 44 px, texto en español, sin desbordamiento a 390 px. UX-01 preexistente sigue pendiente. No es auditoría completa de todas las pantallas.

Reproducción de navegador: `PLAYWRIGHT_BROWSERS_PATH` apunta al Chromium instalado en `node_modules/.cache/ms-playwright`; ejecutar `python .agents/skills/webapp-testing/scripts/with_server.py --server "pnpm run dev --host 127.0.0.1 --port 5174" --port 5174 -- node scripts/revision-fase2.mjs` con `REVIEW_BASE_URL=http://127.0.0.1:5174`. Se usó Node Playwright ya instalado porque Python no tenía su módulo; sin dependencias nuevas. Auth y PostgREST están simulados; esto no valida la configuración del servicio desplegado.
