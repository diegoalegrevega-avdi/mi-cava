import { describe, expect, test } from 'vitest'
import type { WineWithStock } from '@/db/schema'
import { visibleWines } from '@/hooks/useWines'

function wine(over: Partial<WineWithStock>): WineWithStock {
  return {
    id: over.id ?? crypto.randomUUID(),
    name: 'Tinto',
    winery: 'Bodega',
    vintage: 2019,
    region: 'Rioja',
    country: 'España',
    varietals: ['Tempranillo'],
    type: 'tinto',
    purchasedAt: '2026-01-01',
    priceCents: null,
    location: '',
    drinkFrom: null,
    drinkUntil: null,
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    stock: 1,
    ...over,
  }
}

describe('visibleWines', () => {
  test('orders by updatedAt descending', () => {
    const older = wine({ name: 'Viejo', updatedAt: '2026-01-01T00:00:00.000Z' })
    const newer = wine({ name: 'Nuevo', updatedAt: '2026-05-01T00:00:00.000Z' })
    expect(visibleWines([older, newer], '').map((w) => w.name)).toEqual(['Nuevo', 'Viejo'])
  })

  test('filters by name ignoring case and accents', () => {
    const rioja = wine({ name: 'Rioja Reserva', winery: 'Muga' })
    const rias = wine({ name: 'Albariño', winery: 'Pazo' })
    expect(visibleWines([rioja, rias], 'muga').map((w) => w.name)).toEqual(['Rioja Reserva'])
    expect(visibleWines([rioja, rias], 'ALBARINO').map((w) => w.name)).toEqual(['Albariño'])
  })
})
