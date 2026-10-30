import { describe, expect, it } from 'vitest'
import type { StockEvent } from '@/db/schema'
import { lastConsumption } from '@/domain/journal'

function event(id: string, delta: number, kind: StockEvent['kind'], undoOf?: string): StockEvent {
  return { id, wineId: 'w', delta, kind, at: `2026-01-0${id.length}T10:00:00.000Z`, undoOf }
}

describe('lastConsumption', () => {
  it('ignores a descorche that was undone', () => {
    expect(lastConsumption([event('a', -1, 'consume'), event('bb', 1, 'undo', 'a')])).toBeNull()
  })

  it('returns the most recent consumption still standing', () => {
    const last = event('ccc', -1, 'consume')
    expect(lastConsumption([event('a', -1, 'consume'), last, event('dddd', 2, 'add')])).toBe(last)
  })
})
