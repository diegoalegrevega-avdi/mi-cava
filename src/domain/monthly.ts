import type { StockEvent } from '@/db/schema'

export function monthlyConsumptions(events: StockEvent[], year: number): Array<{ month: number; count: number }> {
  const result = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }))

  const undoneIds = new Set<string>()
  for (const e of events) {
    if (e.kind === 'undo' && e.undoOf) {
      undoneIds.add(e.undoOf)
    }
  }

  for (const e of events) {
    if (e.kind !== 'consume') continue
    if (undoneIds.has(e.id)) continue

    const date = new Date(e.at)
    if (date.getFullYear() !== year) continue

    const month = date.getMonth() // 0-11
    result[month]!.count++
  }

  return result
}