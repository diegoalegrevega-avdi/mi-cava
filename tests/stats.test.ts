import { describe, expect, it } from 'vitest'
import { computeStats } from '@/domain/stats'
import type { WineWithStock } from '@/db/schema'

function wine(p: Partial<WineWithStock>): WineWithStock {
  return {
    id: 'x',
    name: 'Vino',
    winery: '',
    vintage: 2019,
    region: '',
    country: '',
    varietals: [],
    type: 'tinto',
    purchasedAt: null,
    priceCents: null,
    location: '',
    drinkFrom: null,
    drinkUntil: null,
    notes: '',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    stock: 1,
    ...p,
  }
}

describe('computeStats', () => {
  it('cuenta botellas por tipo y semáforo', () => {
    const wines: WineWithStock[] = [
      // una tinta ya pasada, ventana cerrada
      wine({ id: '1', type: 'tinto', priceCents: 1000, drinkFrom: 2020, drinkUntil: 2024 }),
      // dos tintas sin ventana
      wine({ id: '2', type: 'tinto', priceCents: 1000 }),
      wine({ id: '3', type: 'tinto', priceCents: 1000 }),
      // una blanca lista
      wine({ id: '4', type: 'blanco', priceCents: 500, drinkFrom: 2024, drinkUntil: 2030 }),
    ]
    expect(computeStats(wines, 2026)).toMatchObject({
      bottles: 4,
      references: 4,
      valueCents: 3500,
      ready: 1,
      past: 1,
      unknown: 2,
      byType: { tinto: 3, blanco: 1 },
    })
  })
})
