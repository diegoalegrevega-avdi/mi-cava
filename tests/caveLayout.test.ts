import { describe, expect, it } from 'vitest'
import { layoutCave } from '@/domain/caveLayout'

import type { WineWithStock } from '@/db/schema'

function wine(overrides: Partial<WineWithStock> = {}): WineWithStock {
  return {
    id: 'test',
    name: 'Test',
    winery: '',
    vintage: 2019,
    region: '',
    country: '',
    varietals: [],
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
    ...overrides,
  }
}

const wines: WineWithStock[] = [
  wine({ id: '1', name: 'A', vintage: 2019, stock: 3, type: 'tinto' }),
  wine({ id: '2', name: 'B', vintage: 2018, stock: 2, type: 'blanco' }),
  wine({ id: '3', name: 'C', vintage: 2020, stock: 5, type: 'tinto' }),
]

describe('layoutCave', () => {
  it('row-major: profundidad->ancho, wrapping por piso, overflow', () => {
    const cfg = { depth: 2, width: 2, shelves: 1, fill: 'wine' as const }
    const { grid, overflow } = layoutCave(wines, cfg)
    expect(grid.length).toBe(1) // shelves
    expect(grid[0]?.length).toBe(2) // depth
    expect(grid[0]?.[0]?.length).toBe(2) // width
    // Total stock 10, capacity 4: A(3) + B(1) placed, B(1) + C(5) overflow
    expect(overflow.length).toBeGreaterThanOrEqual(1)
    const totalOverflow = overflow.reduce((sum, o) => sum + o.count, 0)
    expect(totalOverflow).toBe(6)
  })

  it('fill: type agrupa por tipo', () => {
    const mixed: WineWithStock[] = [
      wine({ id: '1', name: 'Tinto1', type: 'tinto', stock: 2 }),
      wine({ id: '2', name: 'Blanco1', type: 'blanco', stock: 2 }),
      wine({ id: '3', name: 'Tinto2', type: 'tinto', stock: 1 }),
    ]
    const { grid } = layoutCave(mixed, { depth: 2, width: 2, shelves: 1, fill: 'type' as const })
    const cells = grid.flat().flat().filter(c => c.wineId).map(c => c.wine!.type)
    expect(cells.slice(0, 3)).toEqual(['tinto', 'tinto', 'tinto'])
  })

  it('profundos >1, pila de sobrantes', () => {
    const many: WineWithStock[] = [wine({ id: '1', name: 'X', stock: 10 })]
    const { overflow } = layoutCave(many, { depth: 3, width: 2, shelves: 2, fill: 'wine' as const })
    expect(overflow.length).toBe(0) // capacity 12, stock 10 < 12
  })

  it('ignora vinos con stock <= 0', () => {
    const mixed: WineWithStock[] = [
      wine({ id: '1', name: 'A', stock: 2 }),
      wine({ id: '2', name: 'B', stock: 0 }),
      wine({ id: '3', name: 'C', stock: -1 }),
    ]
    const { grid } = layoutCave(mixed, { depth: 1, width: 2, shelves: 1, fill: 'wine' as const })
    const ids = grid.flat().flat().filter(c => c.wineId).map(c => c.wineId)
    expect(ids).toEqual(['1', '1'])
  })

  it('cap 320 soft: warning pero renderiza recortado', () => {
    const big: WineWithStock[] = [wine({ id: '1', name: 'X', stock: 400 })]
    const { grid, overflow } = layoutCave(big, { depth: 4, width: 20, shelves: 4, fill: 'wine' as const }) // 320
    const total = grid.flat().flat().filter(c => c.wineId).length
    expect(total).toBe(320)
    expect(overflow[0]?.count).toBe(80)
  })
})