import { describe, expect, it } from 'vitest'
import { findDuplicate, wineKey } from '@/domain/dedupe'
import { formatEuros, parsePriceToCents } from '@/lib/money'
import type { Wine } from '@/db/schema'

const base = { id: 'a', name: 'Reserva 2019', vintage: 2019, winery: 'Bodega A' } as Wine

describe('wineKey / findDuplicate', () => {
  it('bodega distinta o vacía no es duplicado exacto sino posible', () => {
    const wines = [base]
    expect(wineKey({ name: 'Reserva 2019', vintage: 2019, winery: 'Bodega A' })).toBe(
      'reserva 2019|2019|bodega a',
    )
    expect(
      findDuplicate(wines, { name: 'reserva 2019', vintage: 2019, winery: 'bodega a' }).exact?.id,
    ).toBe('a')
    expect(
      findDuplicate(wines, { name: 'Reserva 2019', vintage: 2019, winery: 'Bodega B' }).exact,
    ).toBeNull()
    expect(
      findDuplicate(wines, { name: 'Reserva 2019', vintage: 2019, winery: 'Bodega B' }).possible,
    ).toHaveLength(1)
    expect(
      findDuplicate(wines, { name: 'Reserva 2019', vintage: 2020, winery: 'Bodega A' }).possible,
    ).toHaveLength(0)
  })
})

describe('money', () => {
  it('parsea precios europeos y rechaza lo que no es número', () => {
    expect(parsePriceToCents('1.234,50 €')).toBe(123450)
    expect(parsePriceToCents('12,50')).toBe(1250)
    expect(parsePriceToCents('1234.50')).toBe(123450)
    expect(parsePriceToCents('')).toBeNull()
  })

  it('formatea en euros españoles', () => {
    expect(formatEuros(123450)).toBe('1.234,50 €')
  })
})
