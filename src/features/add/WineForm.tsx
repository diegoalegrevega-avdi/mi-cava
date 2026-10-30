import { useRef, useState } from 'react'
import type { WineDraft, WineType } from '@/db/schema'
import { listWines } from '@/db/repo'
import { defaultWindow } from '@/domain/drinkWindow'
import { findDuplicate } from '@/domain/dedupe'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import type { LabelDraft } from '@/services/labelScanner'
import { LabelScannerField } from './LabelScannerField'
import { VintagePicker } from './VintagePicker'
import { emptyWineForm, validateWineForm, type WineFormValues } from './validation'

const INPUT =
  'min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 focus:border-gold focus:outline-none'
const TYPES: WineType[] = ['tinto', 'blanco', 'rosado', 'espumoso', 'dulce', 'fortificado']

const TYPE_LABEL: Record<WineType, string> = {
  tinto: 'Tinto',
  blanco: 'Blanco',
  rosado: 'Rosado',
  espumoso: 'Espumoso',
  dulce: 'Dulce',
  fortificado: 'Fortificado',
}

export function WineForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<WineDraft>
  submitLabel: string
  onSubmit: (draft: WineDraft) => Promise<void>
}) {
  const currentYear = new Date().getFullYear()
  const [values, setValues] = useState<WineFormValues>(() => ({
    ...emptyWineForm(),
    ...(initial
      ? {
          name: initial.name ?? '',
          winery: initial.winery ?? '',
          vintage: initial.vintage ? String(initial.vintage) : '',
          type: initial.type ?? '',
          varietals: initial.varietals?.join(', ') ?? '',
          region: initial.region ?? '',
          country: initial.country ?? '',
          purchasedAt: initial.purchasedAt ?? emptyWineForm().purchasedAt,
          price: '',
          location: initial.location ?? '',
          drinkFrom: initial.drinkFrom ? String(initial.drinkFrom) : '',
          drinkUntil: initial.drinkUntil ? String(initial.drinkUntil) : '',
          notes: initial.notes ?? '',
          stock: initial.stock ?? 1,
        }
      : {}),
  }))
  const [errors, setErrors] = useState<ReturnType<typeof validateWineForm>['errors']>({})
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof WineFormValues>(key: K, value: WineFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setConfirming(false)
  }

  function setVintage(vintage: string) {
    const year = Number.parseInt(vintage, 10)
    const window = vintage.length === 4 && Number.isInteger(year) ? defaultWindow(year) : { drinkFrom: null, drinkUntil: null }
    setValues((prev) => ({
      ...prev,
      vintage,
      drinkFrom: window.drinkFrom ? String(window.drinkFrom) : '',
      drinkUntil: window.drinkUntil ? String(window.drinkUntil) : '',
    }))
    setConfirming(false)
  }

  function setNoVintage(nv: boolean) {
    setValues((prev) => ({
      ...prev,
      nv,
      vintage: nv ? '' : prev.vintage,
      drinkFrom: nv ? '' : prev.drinkFrom,
      drinkUntil: nv ? '' : prev.drinkUntil,
    }))
    setConfirming(false)
  }

  function applyDraft(draft: LabelDraft) {
    const year = draft.vintage ?? null
    const window = year ? defaultWindow(year) : { drinkFrom: null, drinkUntil: null }
    setValues((prev) => ({
      ...prev,
      name: prev.name || draft.name || '',
      winery: prev.winery || draft.winery || '',
      region: prev.region || draft.region || '',
      country: prev.country || draft.country || '',
      varietals: prev.varietals || draft.varietals?.join(', ') || '',
      type: prev.type || draft.type || '',
      vintage: prev.vintage || (year ? String(year) : ''),
      drinkFrom: prev.drinkFrom || (window.drinkFrom ? String(window.drinkFrom) : ''),
      drinkUntil: prev.drinkUntil || (window.drinkUntil ? String(window.drinkUntil) : ''),
    }))
    setConfirming(false)
    if (!draft.name) nameRef.current?.focus()
  }

  async function submit(confirmed = false) {
    const result = validateWineForm(values, currentYear)
    setErrors(result.errors)
    if (!result.draft) return

    if (!confirmed) {
      const { possible } = findDuplicate(await listWines(), result.draft)
      if (possible.length > 0) {
        setConfirming(true)
        return
      }
    }

    setSaving(true)
    try {
      await onSubmit(result.draft)
      setValues(emptyWineForm())
      setConfirming(false)
      setErrors({})
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
    >
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Lo esencial</h2>

        <LabelScannerField onDraft={applyDraft} />

        <Field label="Nombre" error={errors.name}>
          <input
            ref={nameRef}
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Muga Reserva"
            autoComplete="off"
            className={INPUT}
          />
        </Field>

        <Field label="Bodega">
          <input
            value={values.winery}
            onChange={(e) => set('winery', e.target.value)}
            placeholder="Bodegas Muga"
            autoComplete="off"
            className={INPUT}
          />
        </Field>

        <Field label="Añada" error={errors.vintage}>
          <VintagePicker value={values.vintage} onChange={setVintage} disabled={values.nv} currentYear={currentYear} />
          <label className="mt-1 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.nv}
              onChange={(e) => setNoVintage(e.target.checked)}
              className="size-4 accent-[var(--wine)]"
            />
            Sin añada (NV)
          </label>
        </Field>

        <Field label="Tipo">
          <select
            value={values.type}
            onChange={(e) => set('type', e.target.value as WineFormValues['type'])}
            className={INPUT}
          >
            <option value="">Sin especificar</option>
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Varietales" hint="Separados por coma">
          <input
            value={values.varietals}
            onChange={(e) => set('varietals', e.target.value)}
            placeholder="Tempranillo, Graciano"
            className={INPUT}
          />
        </Field>

        <Field label="Botellas">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              aria-label="Quitar una botella"
              onClick={() => set('stock', Math.max(1, values.stock - 1))}
            >
              −
            </Button>
            <span className="min-w-10 text-center text-lg tabular-nums">{values.stock}</span>
            <Button
              type="button"
              variant="secondary"
              aria-label="Añadir una botella"
              onClick={() => set('stock', values.stock + 1)}
            >
              +
            </Button>
          </div>
        </Field>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Cata y ubicación</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Región">
            <input
              value={values.region}
              onChange={(e) => set('region', e.target.value)}
              placeholder="Rioja"
              className={INPUT}
            />
          </Field>
          <Field label="País">
            <input
              value={values.country}
              onChange={(e) => set('country', e.target.value)}
              placeholder="España"
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Fecha de compra">
          <input
            type="date"
            value={values.purchasedAt}
            onChange={(e) => set('purchasedAt', e.target.value)}
            className={INPUT}
          />
        </Field>

        <Field label="Precio" hint="En euros, opcional" error={errors.price}>
          <input
            value={values.price}
            onChange={(e) => set('price', e.target.value)}
            inputMode="decimal"
            placeholder="18,90"
            className={INPUT}
          />
        </Field>

        <Field label="Ubicación">
          <input
            value={values.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Balda 2, hueco 4"
            className={INPUT}
          />
        </Field>

        <Field label="Ventana de consumo" hint="Años desde y hasta">
          <div className="flex items-center gap-2">
            <input
              value={values.drinkFrom}
              onChange={(e) => set('drinkFrom', e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              placeholder="Desde"
              aria-label="Año desde"
              className={INPUT}
            />
            <span className="text-muted">–</span>
            <input
              value={values.drinkUntil}
              onChange={(e) => set('drinkUntil', e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              placeholder="Hasta"
              aria-label="Año hasta"
              className={INPUT}
            />
          </div>
        </Field>

        <Field label="Notas de cata y maridaje">
          <textarea
            value={values.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            placeholder="Fruta roja, roble…"
            className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 focus:border-gold focus:outline-none"
          />
        </Field>
      </section>

      {confirming && (
        <div className="flex flex-col gap-2 rounded-lg border border-gold/50 bg-surface-2 p-3 text-sm">
          <p className="text-gold">Ya tienes un vino con ese nombre y añada en otra bodega.</p>
          <Button type="button" variant="secondary" onClick={() => void submit(true)} disabled={saving}>
            Guardar de todas formas
          </Button>
        </div>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? 'Guardando…' : submitLabel}
      </Button>
    </form>
  )
}
