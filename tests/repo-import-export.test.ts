import { beforeEach, describe, expect, it } from 'vitest'
import type { WineDraft } from '@/db/schema'
import {
  _resetForTests,
  clearAll,
  consumeBottle,
  createWine,
  exportBundle,
  getWine,
  restoreBundle,
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

describe('export / restore', () => {
  beforeEach(() => _resetForTests())

  it('restaurar el propio export dos veces deja la cava idéntica', async () => {
    const { wine } = await createWine(draft({ name: 'Backup', vintage: 2015, winery: 'X', stock: 3 }))
    await consumeBottle(wine.id)
    const bundle = await exportBundle()
    await clearAll()
    await restoreBundle(bundle)
    const afterFirst = await exportBundle()
    await restoreBundle(bundle)
    expect((await getWine(wine.id))!.stock).toBe(2)
    expect((await exportBundle()).wines).toEqual(afterFirst.wines)
    expect((await exportBundle()).events).toHaveLength(afterFirst.events.length)
  })
})
