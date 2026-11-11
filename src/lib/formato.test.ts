import { describe, expect, it } from 'vitest'
import { formatoFecha, formatoMoneda } from './formato'

describe('formatoMoneda', () => {
  it('formatea montos positivos en soles peruanos', () => {
    const resultado = formatoMoneda(15)
    // es-PE suele generar "S/ 15.00" o "S/ 15,00" con espacio de no separación
    expect(resultado).toContain('15')
    expect(resultado).toMatch(/S\/\s*15[.,]00/)
  })

  it('formatea montos con decimales correctamente', () => {
    const resultado = formatoMoneda(1234.5)
    expect(resultado).toMatch(/S\/\s*1[.,\s]?234[.,]50/)
  })

  it('formatea cero correctamente', () => {
    const resultado = formatoMoneda(0)
    expect(resultado).toMatch(/S\/\s*0[.,]00/)
  })

  it('formatea montos negativos correctamente', () => {
    const resultado = formatoMoneda(-50)
    expect(resultado).toContain('50')
    expect(resultado).toMatch(/-S\/\s*50[.,]00|S\/\s*-50[.,]00/)
  })
})

describe('formatoFecha', () => {
  it('formatea fechas en string ISO con zona horaria America/Lima en dd/mm/aaaa', () => {
    // 2026-11-11T12:00:00Z -> en America/Lima (UTC-5) es 11/11/2026
    const fechaISO = '2026-11-11T12:00:00Z'
    expect(formatoFecha(fechaISO)).toBe('11/11/2026')
  })

  it('maneja el cambio de día por zona horaria UTC-5 correctamente', () => {
    // 2026-05-01T02:00:00Z en UTC -> en Lima (UTC-5) sigue siendo 30/04/2026
    const fechaUTC = '2026-05-01T02:00:00Z'
    expect(formatoFecha(fechaUTC)).toBe('30/04/2026')
  })

  it('acepta objetos Date', () => {
    const d = new Date('2026-07-28T15:00:00Z')
    expect(formatoFecha(d)).toBe('28/07/2026')
  })

  it('devuelve cadena vacía ante valores nulos, indefinidos o fechas inválidas', () => {
    expect(formatoFecha(null)).toBe('')
    expect(formatoFecha(undefined)).toBe('')
    expect(formatoFecha('fecha-invalida')).toBe('')
  })
})
