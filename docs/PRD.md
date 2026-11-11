# PANEL PROVENTAS — Documento de requisitos (v1)

## 1. Problema y objetivo
Hoy las ventas de cuentas de streaming e IA se registran a mano y es difícil saber cuánto se ganó cada mes, qué clientes deben renovar y qué se vendió en el pasado.
**Objetivo v1**: registrar una venta en menos de 15 segundos, ver de un vistazo cómo va el mes frente al anterior y tener el historial completo exportable.

**Usuarios**: la dueña del negocio (admin) y, opcionalmente, 1–3 vendedores (operadores). Uso diario desde celular y laptop.

## 2. Alcance v1
### Incluido
1. Inicio de sesión (correo + contraseña). Sin registro público: los usuarios se invitan desde Supabase.
2. **Inicio** (panel resumen).
3. **Nueva venta** (panel lateral accesible desde cualquier pantalla).
4. **Ventas** (historial completo, filtros, exportación).
5. **Clientes** (lista y ficha con su historial).
6. **Catálogo** (plataformas y productos).
7. **Reportes** (comparativo mensual y por plataforma).

### Fuera de alcance v1
- Guardar contraseñas de las cuentas vendidas (riesgo de seguridad; si se necesita en el futuro, se evalúa Supabase Vault).
- Envío automático de recordatorios por WhatsApp (v2: botón "Recordar" que abre `wa.me` con mensaje prellenado sí puede entrar al final de v1 si sobra tiempo).
- Pagos en línea, facturación electrónica, multiempresa.

## 3. Navegación
Sidebar (en celular: barra inferior con 4 ítems + botón central "Nueva venta"):
`Inicio · Ventas · Clientes · Catálogo · Reportes`
- Botón primario **"+ Nueva venta"** siempre visible (header en escritorio, botón central en celular). Atajo de teclado `N`.
- Búsqueda global `Ctrl+K`: clientes y ventas por nombre o teléfono.

## 4. Pantallas

### 4.1 Inicio
- 4 tarjetas KPI del **mes en curso**: Ingresos (con ▲/▼ % vs mes anterior), Ventas (cantidad, vs anterior), Ganancia, Por vencer (próximos 3 días).
- Gráfico de barras de los últimos 12 meses (ingresos), mes en curso resaltado; tooltip con ingresos, ventas y variación.
- Lista "Vencen pronto" (por vencer y vencidas de los últimos 7 días, no renovadas) con botón **Renovar** en cada fila.
- Estado vacío (sin ventas aún): mensaje + botón "Registrar primera venta" + enlace "Revisar catálogo".

### 4.2 Nueva venta (Sheet lateral; pantalla completa en celular)
Campos en este orden:
1. **Cliente** — combobox con búsqueda por nombre o teléfono. Última opción: "+ Crear «texto escrito»" → despliega nombre (prellenado) y teléfono opcional, sin salir del formulario.
2. **Producto** — combobox agrupado por plataforma, con badge de color, duración y precio. Solo productos activos.
3. **Resumen editable** (autocompletado al elegir producto): fecha de inicio (hoy), vence (calculado), precio (del catálogo, editable), método de pago (chips: Yape, Plin, Transferencia, Efectivo, Otro; recuerda el último usado).
4. Notas (opcional, colapsado).
Botones: **Guardar** y **Guardar y registrar otra**. Al guardar: toast "Venta registrada · Deshacer" (deshacer = anular con motivo "Registro por error" dentro de 10 s).
Validación en línea con Zod; mensajes en español claro.

### 4.3 Ventas (historial)
- Tabla con: Fecha, Cliente, Plataforma (badge), Producto, Vence, Estado, Precio, Acciones.
- Filtros visibles: rango de fechas (atajos: Este mes, Mes anterior, Últimos 3 meses, Este año, Todo), Plataforma, Estado, búsqueda por cliente. Los filtros se guardan en la URL (compartibles y persisten al volver).
- Paginación del lado servidor (25 por página), orden por fecha descendente.
- Pie de tabla: total de ventas e ingresos **del filtro actual**.
- Acciones por fila (menú): Renovar, Editar, Anular (con motivo), Ver cliente.
- **Exportar** (botón con menú): CSV / Excel. Exporta todo el filtro actual, con barra de progreso.
- En celular la tabla se convierte en tarjetas.

### 4.4 Clientes
- Lista con búsqueda, columnas: Nombre, Teléfono, Suscripciones vigentes, Total comprado, Última compra.
- Ficha del cliente: datos editables, botón WhatsApp (`wa.me`), historial de sus ventas, botón "Nueva venta para este cliente" (cliente ya prellenado).

### 4.5 Catálogo
- Pestañas **Productos** y **Plataformas**.
- Productos: tabla agrupada por plataforma con nombre, tipo, duración, precio, costo, margen, interruptor Activo. Crear/editar en diálogo.
- Plataformas: nombre, color (selector), activo.
- Desactivar en vez de borrar; borrar solo si nunca se vendió (admin).

### 4.6 Reportes
- Selector de periodo (por defecto últimos 12 meses).
- Tabla comparativa mensual: Mes, Ventas, Ingresos, Costos, Ganancia, Variación vs mes anterior (▲/▼, color + texto).
- Gráfico de ingresos por plataforma (barras apiladas) y ranking de plataformas del periodo.
- Exportar la tabla comparativa (CSV / Excel).

## 5. Criterios de aceptación
| # | Criterio |
|---|---|
| A1 | Una venta de un cliente existente se registra con ≤ 4 interacciones (abrir, cliente, producto, guardar). |
| A2 | Crear un cliente nuevo no obliga a salir del formulario de venta. |
| A3 | El KPI de ingresos del mes coincide con `v_ingresos_mensuales` y muestra la variación vs el mes anterior; si el anterior fue 0 muestra "Sin ventas el mes anterior". |
| A4 | El historial muestra todas las ventas, incluidas anuladas (filtrables), y nunca permite borrar. |
| A5 | La exportación con 5 000 ventas descarga las 5 000 filas (no se corta en 1 000). |
| A6 | Un usuario sin perfil o sin sesión no ve ningún dato (RLS). |
| A7 | Todas las pantallas funcionan a 390 px de ancho y con solo teclado. |
| A8 | LCP < 2,5 s e INP < 200 ms en el build de producción (Lighthouse, móvil). |
| A9 | Renovar una venta crea una nueva enlazada y la original pasa a estado "Renovada". |

## 6. Modelo de datos
Definido en `supabase/migrations/20261111000000_init_proventas.sql`:
`perfiles`, `plataformas`, `productos`, `clientes`, `suscripciones` + vistas `v_suscripciones`, `v_ingresos_mensuales`, `v_ingresos_plataforma_mes`. Reglas de negocio en `.agents/skills/proventas-dominio/SKILL.md`.
