import { describe, expect, it } from 'vitest'
import { formatDate, formatDateTime, formatMonth, todayIso } from '@/lib/dates'

describe('dates', () => {
  it('formatea una fecha ISO como dd/mm/aaaa', () => {
    expect(formatDate('2026-03-05')).toBe('05/03/2026')
    expect(formatDate(new Date(2026, 2, 5, 18, 30).toISOString())).toBe('05/03/2026')
  })

  it('muestra la hora y el día locales, no los de UTC', () => {
    const lateNight = new Date(2026, 2, 5, 23, 30).toISOString()
    expect(formatDateTime(lateNight)).toBe('05/03/2026 23:30')
    expect(formatMonth(lateNight)).toBe('marzo 2026')
    const afterMidnight = new Date(2026, 0, 1, 0, 30).toISOString()
    expect(formatDate(afterMidnight)).toBe('01/01/2026')
    expect(formatMonth(afterMidnight)).toBe('enero 2026')
  })

  it('todayIso devuelve la fecha local en formato YYYY-MM-DD', () => {
    const d = new Date()
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    expect(todayIso()).toBe(expected)
  })

  it('formatea el mes en palabras', () => {
    expect(formatMonth('2026-10-09T20:00:00.000Z')).toBe('octubre 2026')
    expect(formatMonth('2025-01-01')).toBe('enero 2025')
    expect(formatMonth('2026-12-31')).toBe('diciembre 2026')
    expect(formatMonth('')).toBe('')
  })

  it('devuelve cadena vacía para valores no reconocibles', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate('ayer')).toBe('')
  })
})
