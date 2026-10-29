import { beforeEach, describe, expect, it } from 'vitest'
import type { WineDraft } from '@/db/schema'
import {
  _resetForTests,
  addBottles,
  consumeBottle,
  createWine,
  getWine,
  listActiveConsumptions,
  listWines,
  undoEvent,
} from '@/db/repo'

const draft = (over: Partial<WineDraft>): WineDraft => ({
  name: '',
  winery: '',
  vintage: null,
  region: '',
  country: '',
  varietals: [],
  type: null,
  purchasedAt: null,
  priceCents: null,
  location: '',
  drinkFrom: null,
  drinkUntil: null,
  notes: '',
  ...over,
})

describe('repo', () => {
  beforeEach(() => _resetForTests())

  it('crea, suma, descorcha hasta 0 y conserva el vino con su historial', async () => {
    const { wine } = await createWine(draft({ name: 'Tinto', vintage: 2019, winery: 'B', stock: 2 }))
    expect((await getWine(wine.id))!.stock).toBe(2)
    await addBottles(wine.id)
    await consumeBottle(wine.id, 'Aromas a fruta')
    await consumeBottle(wine.id)
    const w = (await getWine(wine.id))!
    expect(w.stock).toBe(1)
    const active = (await listActiveConsumptions()).map((c) => c.event.note)
    expect(active).toHaveLength(2)
    expect(active).toContain('Aromas a fruta')
  })

  it('nunca baja de 0 y el doble toque no crea descorche fantasma', async () => {
    const { wine } = await createWine(draft({ name: 'Único', vintage: 2020 }))
    await consumeBottle(wine.id)
    await expect(consumeBottle(wine.id)).rejects.toThrow('Sin stock')
    expect(await listActiveConsumptions()).toHaveLength(1)
  })

  it('deshacer revierte stock y retira el descorche del historial, una sola vez', async () => {
    const { wine } = await createWine(draft({ name: 'D', vintage: 2018 }))
    const ev = await consumeBottle(wine.id)
    await undoEvent(ev.id)
    await undoEvent(ev.id)
    expect((await getWine(wine.id))!.stock).toBe(1)
    expect(await listActiveConsumptions()).toHaveLength(0)
  })

  it('crear un duplicado exacto suma stock en vez de duplicar la fila', async () => {
    const d = draft({ name: 'Mismo', vintage: 2019, winery: 'Bodega' })
    const a = await createWine(d)
    const b = await createWine(d)
    expect(b.merged).toBe(true)
    expect(b.wine.id).toBe(a.wine.id)
    expect(await listWines()).toHaveLength(1)
    expect((await getWine(a.wine.id))!.stock).toBe(2)
  })
})
