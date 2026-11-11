/**
 * Formateador de moneda en soles peruanos (PEN).
 * Formato: S/ 1,234.50
 */
export function formatoMoneda(monto: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto)
}

/**
 * Formateador de fecha en formato dd/mm/aaaa con zona horaria America/Lima.
 */
export function formatoFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return ''
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha
  if (isNaN(fechaObj.getTime())) return ''

  return new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fechaObj)
}
