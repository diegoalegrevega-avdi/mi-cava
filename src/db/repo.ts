import { db } from './db'
import type { StockEvent, Wine, WineDraft, WineWithStock } from './schema'
import { findDuplicate } from '@/domain/dedupe'

const now = () => new Date().toISOString()
const newId = () => crypto.randomUUID()

function stockOf(events: StockEvent[]): number {
  return events.reduce((total, e) => total + e.delta, 0)
}

function withStock(wine: Wine, events: StockEvent[]): WineWithStock {
  return { ...wine, stock: stockOf(events.filter((e) => e.wineId === wine.id)) }
}

async function allWithStock(): Promise<WineWithStock[]> {
  const [wines, events] = await Promise.all([db.wines.toArray(), db.events.toArray()])
  return wines.map((w) => withStock(w, events))
}

export async function listWines(): Promise<WineWithStock[]> {
  const wines = await allWithStock()
  return wines.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getWine(id: string): Promise<WineWithStock | undefined> {
  const wine = await db.wines.get(id)
  if (!wine) return undefined
  const events = await db.events.where('wineId').equals(id).toArray()
  return withStock(wine, events)
}

export async function listEvents(wineId?: string): Promise<StockEvent[]> {
  const events = wineId
    ? await db.events.where('wineId').equals(wineId).toArray()
    : await db.events.toArray()
  return events.sort((a, b) => a.at.localeCompare(b.at))
}

export async function createWine(draft: WineDraft): Promise<{ wine: Wine; merged: boolean }> {
  return db.transaction('rw', db.wines, db.events, async () => {
    const existing = findDuplicate(await allWithStock(), draft)
    const at = now()

    if (existing.exact) {
      const wine = existing.exact
      const filled: Wine = { ...wine }
      for (const key of Object.keys(draft) as (keyof WineDraft)[]) {
        if (key === 'stock') continue
        const current = wine[key]
        const incoming = draft[key]
        const empty = current === null || current === '' || (Array.isArray(current) && current.length === 0)
        if (empty && incoming !== undefined && incoming !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ;(filled as any)[key] = incoming
        }
      }
      filled.updatedAt = at
      await db.wines.put(filled)
      await db.events.add({
        id: newId(),
        wineId: wine.id,
        delta: draft.stock ?? 1,
        kind: 'import',
        at,
      })
      return { wine: filled, merged: true }
    }

    const wine: Wine = {
      ...draft,
      id: newId(),
      createdAt: at,
      updatedAt: at,
    }
    await db.wines.add(wine)
    await db.events.add({
      id: newId(),
      wineId: wine.id,
      delta: draft.stock ?? 1,
      kind: 'add',
      at,
    })
    return { wine, merged: false }
  })
}

export async function updateWine(
  id: string,
  patch: Partial<Omit<Wine, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.transaction('rw', db.wines, async () => {
    await db.wines.update(id, { ...patch, updatedAt: now() })
  })
}

async function pushEvent(wineId: string, delta: number, kind: StockEvent['kind'], note?: string) {
  const at = now()
  const event: StockEvent = { id: newId(), wineId, delta, kind, at, ...(note ? { note } : {}) }
  await db.events.add(event)
  await db.wines.update(wineId, { updatedAt: at })
  return event
}

export async function addBottles(wineId: string, n = 1): Promise<StockEvent> {
  return db.transaction('rw', db.wines, db.events, () => pushEvent(wineId, n, 'add'))
}

export async function consumeBottle(wineId: string, note?: string): Promise<StockEvent> {
  return db.transaction('rw', db.wines, db.events, async () => {
    const events = await db.events.where('wineId').equals(wineId).toArray()
    if (stockOf(events) <= 0) throw new Error('Sin stock')
    return pushEvent(wineId, -1, 'consume', note)
  })
}

export async function undoEvent(eventId: string): Promise<void> {
  await db.transaction('rw', db.wines, db.events, async () => {
    const event = await db.events.get(eventId)
    if (!event || (event.kind !== 'consume' && event.kind !== 'add')) return
    const already = await db.events.where('undoOf').equals(eventId).first()
    if (already) return
    await db.events.add({
      id: newId(),
      wineId: event.wineId,
      delta: -event.delta,
      kind: 'undo',
      at: now(),
      undoOf: eventId,
    })
    await db.wines.update(event.wineId, { updatedAt: now() })
  })
}

export async function adjustStock(wineId: string, target: number): Promise<StockEvent | null> {
  return db.transaction('rw', db.wines, db.events, async () => {
    const events = await db.events.where('wineId').equals(wineId).toArray()
    const diff = target - stockOf(events)
    if (diff === 0) return null
    return pushEvent(wineId, diff, 'import')
  })
}

export async function listActiveConsumptions(): Promise<Array<{ wine: WineWithStock; event: StockEvent }>> {
  const events = await db.events.toArray()
  const undone = new Set(
    events.filter((e) => e.kind === 'undo').map((e) => e.undoOf).filter((id): id is string => Boolean(id)),
  )
  const consumes = events
    .filter((e) => e.kind === 'consume' && !undone.has(e.id))
    .sort((a, b) => b.at.localeCompare(a.at))
  const wines = await allWithStock()
  const byId = new Map(wines.map((w) => [w.id, w]))
  return consumes.flatMap((event) => {
    const wine = byId.get(event.wineId)
    return wine ? [{ wine, event }] : []
  })
}

export async function totalBottles(): Promise<number> {
  const events = await db.events.toArray()
  return stockOf(events)
}

export async function _resetForTests(): Promise<void> {
  await db.wines.clear()
  await db.events.clear()
}
