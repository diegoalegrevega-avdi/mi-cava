import type { StockEvent } from '@/db/schema'

/** Consumptions that an `undo` event reverted, so the diary and the detail sheet agree. */
export function lastConsumption(events: StockEvent[]): StockEvent | null {
  const reverted = new Set(events.filter((e) => e.kind === 'undo' && e.undoOf).map((e) => e.undoOf))
  const alive = events.filter((e) => e.kind === 'consume' && !reverted.has(e.id))
  return alive.at(-1) ?? null
}
