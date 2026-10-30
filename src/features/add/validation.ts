import type { WineDraft, WineType } from '@/db/schema'
import { todayIso } from '@/lib/dates'
import { parsePriceToCents } from '@/lib/money'

export interface WineFormValues {
  name: string
  winery: string
  nv: boolean
  vintage: string
  type: WineType | ''
  varietals: string
  region: string
  country: string
  purchasedAt: string
  price: string
  location: string
  drinkFrom: string
  drinkUntil: string
  notes: string
  stock: number
}

export interface WineFormErrors {
  name?: string
  vintage?: string
  price?: string
}

export function emptyWineForm(): WineFormValues {
  return {
    name: '',
    winery: '',
    nv: false,
    vintage: '',
    type: '',
    varietals: '',
    region: '',
    country: '',
    purchasedAt: todayIso(),
    price: '',
    location: '',
    drinkFrom: '',
    drinkUntil: '',
    notes: '',
    stock: 1,
  }
}

function toYear(raw: string): number | null {
  const value = Number.parseInt(raw, 10)
  return Number.isFinite(value) ? value : null
}

export function validateWineForm(
  values: WineFormValues,
  currentYear: number,
): { errors: WineFormErrors; draft: WineDraft | null } {
  const errors: WineFormErrors = {}
  const name = values.name.trim()
  if (!name) errors.name = 'Pon un nombre'

  let vintage: number | null = null
  if (!values.nv) {
    const parsed = Number.parseInt(values.vintage, 10)
    const max = currentYear + 1
    if (!Number.isInteger(parsed) || parsed < 1900 || parsed > max) {
      errors.vintage = `Añada entre 1900 y ${max}, o marca NV`
    } else {
      vintage = parsed
    }
  }

  let priceCents: number | null = null
  if (values.price.trim()) {
    priceCents = parsePriceToCents(values.price)
    if (priceCents === null) errors.price = 'Precio no válido'
  }

  if (Object.keys(errors).length > 0) return { errors, draft: null }

  return {
    errors,
    draft: {
      name,
      winery: values.winery.trim(),
      vintage,
      region: values.region.trim(),
      country: values.country.trim(),
      varietals: values.varietals
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean),
      type: values.type || null,
      purchasedAt: values.purchasedAt || null,
      priceCents,
      location: values.location.trim(),
      drinkFrom: values.nv ? null : toYear(values.drinkFrom),
      drinkUntil: values.nv ? null : toYear(values.drinkUntil),
      notes: values.notes.trim(),
      stock: Math.max(1, Math.trunc(values.stock) || 1),
    },
  }
}
