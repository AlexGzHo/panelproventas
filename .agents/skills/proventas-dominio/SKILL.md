---
name: proventas-dominio
description: Reglas de negocio de PANEL PROVENTAS (ventas de suscripciones de streaming e IA). Úsala siempre que trabajes en ventas, renovaciones, estados de suscripción, clientes, catálogo, ingresos mensuales, comparación con el mes anterior o exportación del historial.
---

# Dominio de PANEL PROVENTAS

## Glosario
- **Plataforma**: servicio vendido (Netflix, ChatGPT, Spotify…). Tabla `plataformas`, con `color` para el badge.
- **Producto**: lo que se vende de una plataforma, con duración, precio y costo. Ej.: "Netflix · Perfil 1 mes · S/ 15". Tabla `productos`.
- **Tipo de cuenta**: `perfil`, `cuenta_completa`, `compartida`, `otro`. En la UI: "Perfil", "Cuenta completa", "Compartida", "Otro".
- **Cliente**: persona que compra. Solo el nombre es obligatorio; teléfono recomendado (WhatsApp).
- **Venta / suscripción**: una fila de `suscripciones`. Cada renovación es una venta NUEVA enlazada con `renovacion_de`.

## Reglas
1. **Snapshot de precio**: al vender se copian `precio_venta` y `costo` del producto. Cambiar el catálogo no altera ventas pasadas. El usuario puede editar el precio en la venta (descuento) antes de guardar.
2. **Fechas**: `fecha_venta` (cuándo cobró, define el mes del ingreso), `fecha_inicio` y `fecha_fin`. `fecha_fin = fecha_inicio + duracion_meses` y la suscripción vence ese mismo día. Hoy = fecha actual en `America/Lima`.
3. **Estados** (calculados en `v_suscripciones`, nunca guardados):
   - `anulada` → se anuló con motivo.
   - `renovada` → existe una venta no anulada con `renovacion_de = id`.
   - `vencida` → `fecha_fin < hoy`.
   - `por_vencer` → vence en 3 días o menos.
   - `vigente` → el resto.
   Etiquetas UI: Vigente (verde), Por vencer (ámbar), Vencida (rojo), Renovada (gris), Anulada (gris tachado). Nunca dependas solo del color: muestra texto.
4. **Renovar**: crea una venta con el mismo cliente y producto (editable), `renovacion_de` = venta original, `fecha_venta` = hoy y
   `fecha_inicio = fecha_fin anterior` si aún no venció; si ya venció, `fecha_inicio = hoy`. Botón "Renovar" visible en filas vigentes, por vencer y vencidas.
5. **Anular**: pide motivo obligatorio (diálogo de confirmación). Una anulada no se reactiva; se registra una venta nueva. Nunca se borra una venta.
6. **Ingresos del mes** = suma de `precio_venta` de ventas no anuladas cuya `fecha_venta` cae en el mes. Ganancia = ingresos − costos. Usa `v_ingresos_mensuales`, que ya rellena meses sin ventas con 0 y trae `ingresos_mes_anterior`, `diferencia` y `variacion_pct`.
7. **Comparación con el mes anterior**: mostrar `variacion_pct` con flecha y signo (`▲ 12,5 %` / `▼ 8,0 %`). Si el mes anterior fue 0, `variacion_pct` es `null`: mostrar "Sin ventas el mes anterior", no "∞" ni "100 %". Para el mes en curso, aclarar "mes en curso (al dd/mm)".
8. **Clientes**: antes de crear uno nuevo, el combobox busca por nombre o teléfono (`ilike`, índice trigram). Crear cliente debe poder hacerse dentro del mismo formulario de venta, sin cambiar de pantalla.
9. **Catálogo**: productos y plataformas se desactivan (`activo = false`) en lugar de borrarse; los inactivos no aparecen al vender, pero sí en el historial.

## Consultas de referencia (supabase-js)
```ts
// Historial paginado con filtros
supabase.from('v_suscripciones')
  .select('*', { count: 'exact' })
  .gte('fecha_venta', desde).lte('fecha_venta', hasta)
  .in('estado', estados)              // opcional
  .eq('plataforma_id', plataformaId)  // opcional
  .ilike('cliente_nombre', `%${q}%`)  // opcional
  .order('fecha_venta', { ascending: false }).order('id', { ascending: false })
  .range(desde0, hasta0)

// Últimos 12 meses para el gráfico y KPIs
supabase.from('v_ingresos_mensuales').select('*').order('mes', { ascending: false }).limit(12)

// Vencen pronto (lista de Inicio)
supabase.from('v_suscripciones').select('*').in('estado', ['por_vencer', 'vencida'])
  .gte('dias_restantes', -7).order('fecha_fin').limit(10)

// Registro rápido: el trigger completa precio, costo y fecha_fin
supabase.from('suscripciones').insert({ cliente_id, producto_id, metodo_pago }).select().single()
```

## Exportación
- Exporta exactamente lo que el filtro actual muestra, pero **todas** las páginas: pide lotes de 1000 con `.range()` hasta terminar y muestra progreso.
- Columnas: N.º, Fecha venta, Cliente, Teléfono, Plataforma, Producto, Tipo, Inicio, Fin, Estado, Método de pago, Precio (S/), Costo (S/), Ganancia (S/), Notas, Motivo anulación.
- CSV: UTF-8 con BOM (para que Excel lea tildes), fechas `dd/mm/aaaa`, importes con punto decimal sin símbolo.
- XLSX: ExcelJS con `import()` dinámico, encabezado en negrita y fijado, columnas de importe con formato numérico, fila final de totales.
- Nombre de archivo: `proventas_historial_AAAA-MM-DD.csv|xlsx`.
