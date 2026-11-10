import { describe, expect, it } from 'vitest'
import { monthlyConsumptions } from '@/domain/monthly'

describe('monthlyConsumptions', () => {
  it('12 meses, excluye undo, años vacíos = 0', () => {
    const now = new Date().getFullYear()
    const events = [
      { id: '1', wineId: 'w1', delta: -1, kind: 'consume' as const, at: `${now}-01-15T10:00:00.000Z` },
      { id: '2', wineId: 'w1', delta: -1, kind: 'consume' as const, at: `${now}-01-20T10:00:00.000Z` },
      { id: '3', wineId: 'w1', delta: 1, kind: 'undo' as const, undoOf: '1', at: `${now}-02-01T10:00:00.000Z` },
      { id: '4', wineId: 'w1', delta: -1, kind: 'consume' as const, at: `${now}-03-10T10:00:00.000Z` },
    ]
    const res = monthlyConsumptions(events, now)
    expect(res).toHaveLength(12)
    expect(res[0]?.count).toBe(1) // ene: 2 consume - 1 undo = 1
    expect(res[1]?.count).toBe(0) // feb: solo undo
    expect(res[2]?.count).toBe(1) // mar
    expect(res[11]?.count).toBe(0)
  })

  it('año sin eventos = todos ceros', () => {
    const res = monthlyConsumptions([], 2020)
    expect(res).toHaveLength(12)
    expect(res.every(m => m.count === 0)).toBe(true)
  })
})