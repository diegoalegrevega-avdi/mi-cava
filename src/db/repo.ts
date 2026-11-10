import { db } from './db'
import type { CellarBundle, StockEvent, Wine, WineDraft, WineWithStock } from './schema'
import { findDuplicate } from '@/domain/dedupe'
import type { ImportPlan } from '@/services/importer'

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

export async function applyImportPlan(plan: ImportPlan): Promise<void> {
  for (const draft of plan.creates) {
    if (!draft.name.trim()) throw new Error('Fila sin nombre')
    if (draft.vintage !== null && (draft.vintage < 1900 || draft.vintage > 2100)) {
      throw new Error('Añada no válida')
    }
  }

  await db.transaction('rw', db.wines, db.events, async () => {
    const at = now()

    for (const merge of plan.merges) {
      const wine = await db.wines.get(merge.wineId)
      if (!wine) throw new Error('Vino no encontrado')
      if (merge.addStock > 0) {
        await db.wines.put({ ...wine, ...merge.patch, updatedAt: at })
        await db.events.add({
          id: newId(),
          wineId: wine.id,
          delta: merge.addStock,
          kind: 'import',
          at,
        })
      }
    }

    for (const draft of plan.creates) {
      const { stock = 1, ...fields } = draft
      const wine: Wine = { ...fields, id: newId(), createdAt: at, updatedAt: at }
      await db.wines.add(wine)
      if (stock !== 0) {
        await db.events.add({ id: newId(), wineId: wine.id, delta: stock, kind: 'import', at })
      }
    }
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

export async function setEventNote(eventId: string, note: string): Promise<void> {
  await db.events.update(eventId, { note })
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

/** Quita `stock`/`history` (derivados) de una fila del bundle. */
function toWine(row: Wine & { stock: number; history: string[] }): Wine {
  return {
    id: row.id,
    name: row.name,
    winery: row.winery,
    vintage: row.vintage,
    region: row.region,
    country: row.country,
    varietals: row.varietals,
    type: row.type,
    purchasedAt: row.purchasedAt,
    priceCents: row.priceCents,
    location: row.location,
    drinkFrom: row.drinkFrom,
    drinkUntil: row.drinkUntil,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function exportBundle(): Promise<CellarBundle> {
  const [wines, events] = await Promise.all([db.wines.toArray(), db.events.toArray()])
  const undone = new Set(
    events.filter((e) => e.kind === 'undo').map((e) => e.undoOf).filter((id): id is string => Boolean(id)),
  )
  return {
    schemaVersion: 1,
    exportedAt: now(),
    app: 'mi-cava',
    wines: wines
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map((wine) => {
        const own = events.filter((e) => e.wineId === wine.id)
        return {
          ...wine,
          stock: stockOf(own),
          history: own
            .filter((e) => e.kind === 'consume' && !undone.has(e.id))
            .map((e) => e.at)
            .sort(),
        }
      }),
    events: events.sort((a, b) => a.at.localeCompare(b.at)),
  }
}

/** Por `id`: reemplaza el vino y sus eventos. Nunca suma stock. */
export async function restoreBundle(bundle: CellarBundle): Promise<{ created: number; updated: number }> {
  return db.transaction('rw', db.wines, db.events, async () => {
    let created = 0
    let updated = 0
    for (const row of bundle.wines) {
      const wine = toWine(row)
      const exists = await db.wines.get(wine.id)
      await db.wines.put(wine)
      if (exists) updated++
      else created++
      await db.events.where('wineId').equals(wine.id).delete()
      const own = bundle.events.filter((e) => e.wineId === wine.id)
      if (own.length > 0) await db.events.bulkPut(own)
    }
    return { created, updated }
  })
}

export async function clearAll(): Promise<void> {
  await db.transaction('rw', db.wines, db.events, async () => {
    await db.events.clear()
    await db.wines.clear()
  })
}

const EXPORT_KEY = 'micava.lastExport'

export function getLastExportAt(): string | null {
  return globalThis.localStorage?.getItem(EXPORT_KEY) ?? null
}

export function setLastExportAt(iso: string): void {
  globalThis.localStorage?.setItem(EXPORT_KEY, iso)
}

export async function _resetForTests(): Promise<void> {
  await db.wines.clear()
  await db.events.clear()
}

/** Crea 10 vinos de demo si la cava está vacía. */
export async function seedDemoWines(): Promise<void> {
  const wines = await db.wines.toArray()
  if (wines.length > 0) return

  const now = new Date().toISOString()
  const demoWines = [
    { name: 'Muga Reserva', winery: 'Bodegas Muga', vintage: 2019, region: 'Rioja', country: 'España', varietals: ['Tempranillo', 'Garnacha', 'Mazuelo', 'Graciano'], type: 'tinto', purchasedAt: '2026-01-15', priceCents: 2490, location: 'Estante 1', drinkFrom: 2022, drinkUntil: 2032, notes: 'Notas a frutos rojos y vainilla', stock: 3 },
    { name: 'Vega Sicilia Único', winery: 'Vega Sicilia', vintage: 2015, region: 'Ribera del Duero', country: 'España', varietals: ['Tempranillo', 'Cabernet Sauvignon'], type: 'tinto', purchasedAt: '2025-11-20', priceCents: 35900, location: 'Estante 2', drinkFrom: 2025, drinkUntil: 2045, notes: 'Potente y elegante, gran guarda', stock: 1 },
    { name: 'Marqués de Murrieta Reserva', winery: 'Marqués de Murrieta', vintage: 2018, region: 'Rioja', country: 'España', varietals: ['Tempranillo', 'Mazuelo', 'Graciano', 'Garnacha'], type: 'tinto', purchasedAt: '2026-03-10', priceCents: 1890, location: 'Estante 1', drinkFrom: 2022, drinkUntil: 2030, notes: 'Elegante, notas a fruta madura', stock: 2 },
    { name: 'Pazo de Señoráns Albariño', winery: 'Pazo de Señoráns', vintage: 2023, region: 'Rías Baixas', country: 'España', varietals: ['Albariño'], type: 'blanco', purchasedAt: '2026-04-05', priceCents: 1450, location: 'Estante 3', drinkFrom: 2023, drinkUntil: 2027, notes: 'Fresco, notas cítricas', stock: 4 },
    { name: 'La Rioja Alta Viña Ardanza', winery: 'La Rioja Alta', vintage: 2016, region: 'Rioja', country: 'España', varietals: ['Tempranillo', 'Garnacha'], type: 'tinto', purchasedAt: '2025-12-01', priceCents: 2890, location: 'Estante 2', drinkFrom: 2021, drinkUntil: 2031, notes: 'Clásico de Rioja', stock: 2 },
    { name: 'Cune Reserva', winery: 'CVNE', vintage: 2019, region: 'Rioja', country: 'España', varietals: ['Tempranillo', 'Garnacha', 'Mazuelo', 'Graciano'], type: 'tinto', purchasedAt: '2026-02-14', priceCents: 1690, location: 'Estante 1', drinkFrom: 2023, drinkUntil: 2033, notes: 'Equilibrado y persistente', stock: 3 },
    { name: 'Terras Gauda Albariño', winery: 'Terras Gauda', vintage: 2023, region: 'Rías Baixas', country: 'España', varietals: ['Albariño', 'Loureiro', 'Caiño'], type: 'blanco', purchasedAt: '2026-05-20', priceCents: 1350, location: 'Estante 3', drinkFrom: 2023, drinkUntil: 2026, notes: 'Aromático y fresco', stock: 5 },
    { name: 'Torres Mas La Plana', winery: 'Familia Torres', vintage: 2018, region: 'Penedès', country: 'España', varietals: ['Cabernet Sauvignon'], type: 'tinto', purchasedAt: '2025-10-10', priceCents: 4290, location: 'Estante 2', drinkFrom: 2022, drinkUntil: 2035, notes: 'Potente, buena estructura', stock: 1 },
    { name: 'Protos Roble', winery: 'Protos', vintage: 2022, region: 'Ribera del Duero', country: 'España', varietals: ['Tempranillo'], type: 'tinto', purchasedAt: '2026-06-01', priceCents: 1190, location: 'Estante 1', drinkFrom: 2023, drinkUntil: 2027, notes: 'Joven y afrutado', stock: 6 },
    { name: 'Marques de Riscal Reserva', winery: 'Marqués de Riscal', vintage: 2019, region: 'Rioja', country: 'España', varietals: ['Tempranillo', 'Graciano', 'Mazuelo'], type: 'tinto', purchasedAt: '2026-03-20', priceCents: 1790, location: 'Estante 1', drinkFrom: 2023, drinkUntil: 2031, notes: 'Clásico moderno', stock: 2 },
  ]

  await db.transaction('rw', db.wines, db.events, async () => {
    for (const wine of demoWines) {
      const { stock = 1, ...fields } = wine
      const wineData = { ...fields, id: crypto.randomUUID(), createdAt: now(), updatedAt: now() } as import('./schema').Wine
      await db.wines.add(wineData)
      if (stock !== 0) {
        await db.events.add({ id: crypto.randomUUID(), wineId: wineData.id, delta: stock, kind: 'add', at: now() })
      }
    }
  })
}
