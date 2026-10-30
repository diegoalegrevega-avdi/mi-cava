import { beforeEach, describe, expect, it } from 'vitest'
import { applyImportPlan, listEvents, listWines, totalBottles, _resetForTests } from '@/db/repo'
import type { WineDraft } from '@/db/schema'

function draft(patch: Partial<WineDraft>): WineDraft {
  return {
    name: 'Tinto',
    winery: '',
    vintage: 2019,
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
    stock: 1,
    ...patch,
  }
}

const emptyPlan = { creates: [], merges: [], possibleDuplicates: [], errors: [] }

describe('applyImportPlan', () => {
  beforeEach(() => _resetForTests())

  it('aplica el plan completo y no deja nada a medias si falla', async () => {
    const plan = { ...emptyPlan, creates: [draft({ name: 'A', vintage: 2019, stock: 2 })] }
    await applyImportPlan(plan)
    expect(await totalBottles()).toBe(2)

    await expect(
      applyImportPlan({ ...plan, creates: [...plan.creates, draft({ name: '   ', vintage: 2019 })] }),
    ).rejects.toThrow()
    expect(await totalBottles()).toBe(2)
  })

  it('fusiona stock en el vino existente sin crear otra referencia', async () => {
    await applyImportPlan({ ...emptyPlan, creates: [draft({ name: 'A', vintage: 2019, stock: 1 })] })
    const [wine] = await listWines()

    await applyImportPlan({
      ...emptyPlan,
      merges: [{ wineId: wine!.id, addStock: 3, patch: { region: 'Rioja' } }],
    })

    const after = await listWines()
    expect(after).toHaveLength(1)
    expect(after[0]!.stock).toBe(4)
    expect(after[0]!.region).toBe('Rioja')
    expect((await listEvents(wine!.id)).filter((e) => e.kind === 'import')).toHaveLength(2)
  })
})
