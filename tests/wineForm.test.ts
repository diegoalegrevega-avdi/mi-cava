import { describe, expect, it } from 'vitest'
import { emptyWineForm, validateWineForm } from '@/features/add/validation'

const YEAR = 2026

function form(patch: Partial<ReturnType<typeof emptyWineForm>> = {}) {
  return { ...emptyWineForm(), name: 'Muga Reserva', winery: 'Muga', vintage: '2019', ...patch }
}

describe('validateWineForm', () => {
  it('builds a draft from minimal valid input', () => {
    const { errors, draft } = validateWineForm(form({ varietals: 'Tempranillo, Graciano ' }), YEAR)
    expect(errors).toEqual({})
    expect(draft).toMatchObject({
      name: 'Muga Reserva',
      winery: 'Muga',
      vintage: 2019,
      type: null,
      priceCents: null,
      varietals: ['Tempranillo', 'Graciano'],
      stock: 1,
    })
  })

  it('requires a name', () => {
    const { errors, draft } = validateWineForm(form({ name: '   ' }), YEAR)
    expect(errors.name).toBeTruthy()
    expect(draft).toBeNull()
  })

  it('rejects a vintage outside 1900..next year', () => {
    expect(validateWineForm(form({ vintage: '1899' }), YEAR).errors.vintage).toBeTruthy()
    expect(validateWineForm(form({ vintage: String(YEAR + 2) }), YEAR).errors.vintage).toBeTruthy()
    expect(validateWineForm(form({ vintage: '2030' }), 2029).errors).toEqual({})
  })

  it('treats NV as a null vintage and no drink window', () => {
    const { errors, draft } = validateWineForm(form({ nv: true, vintage: '', drinkFrom: '', drinkUntil: '' }), YEAR)
    expect(errors).toEqual({})
    expect(draft).toMatchObject({ vintage: null, drinkFrom: null, drinkUntil: null })
  })

  it('parses a european price and rejects unparseable text', () => {
    expect(validateWineForm(form({ price: '18,90' }), YEAR).draft?.priceCents).toBe(1890)
    const bad = validateWineForm(form({ price: 'doce' }), YEAR)
    expect(bad.errors.price).toBeTruthy()
    expect(bad.draft).toBeNull()
  })
})
