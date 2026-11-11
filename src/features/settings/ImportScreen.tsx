import { useMemo, useState } from 'react'
import { applyImportPlan, listWines, restoreBundle } from '@/db/repo'
import type { CellarBundle } from '@/db/schema'
import { Button } from '@/components/ui/Button'
import { Field as FieldRow } from '@/components/ui/Field'
import { autoMap, countPlan, parseCsv, planDrafts, planImport, readJsonFile } from '@/services/importer'
import type { DateOrder, Field, ImportPlan } from '@/services/importer'
import { useI18n } from '@/hooks/useI18n'

export function ImportScreen({
  fileName,
  content,
  onClose,
}: {
  fileName: string
  content: string
  onClose: () => void
}) {
  const { t } = useI18n()

  const FIELDS: Array<[Field, string]> = [
    ['name', t.add.name],
    ['winery', t.add.winery],
    ['vintage', t.add.vintage],
    ['type', t.add.type],
    ['varietals', t.add.varietals],
    ['region', t.add.region],
    ['country', t.add.country],
    ['stock', t.add.bottles],
    ['price', t.add.price],
    ['purchasedAt', t.add.purchaseDate],
    ['location', t.add.location],
    ['drinkFrom', t.add.from],
    ['drinkUntil', t.add.to],
    ['notes', t.add.notes],
  ]

  const isJson = /\.json$/i.test(fileName) || content.trimStart().startsWith('{')

  const parsed = useMemo(() => {
    if (isJson) {
      try {
        return { json: readJsonFile(content) }
      } catch {
        return { error: t.importer.errors.notFound }
      }
    }
    const table = parseCsv(content)
    if (table.headers.length === 0) return { error: t.importer.empty }
    return { table, map: autoMap(table.headers) }
  }, [isJson, content, t])

  const [map, setMap] = useState<Array<Field | null>>(parsed.map ?? [])
  const [dateOrder, setDateOrder] = useState<DateOrder>('dmy')
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const [included, setIncluded] = useState<number[]>([])
  const [mergedIds, setMergedIds] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const bundle: CellarBundle | undefined = parsed.json?.kind === 'bundle' ? parsed.json.bundle : undefined
  const jsonDrafts = parsed.json?.kind === 'drafts' ? parsed.json : undefined

  async function review() {
    const existing = await listWines()
    if (jsonDrafts) {
      setPlan(planDrafts(jsonDrafts.drafts, existing, jsonDrafts.errors))
      return
    }
    if (!parsed.table) return
    setPlan(planImport(parsed.table, map, dateOrder, existing))
  }

  async function apply() {
    setBusy(true)
    setRunError(null)
    try {
      if (bundle) {
        const { created, updated } = await restoreBundle(bundle)
        setResult(t.importer.result.restored.replace('{new}', String(created)).replace('{updated}', String(updated)))
      } else if (plan) {
        const extra = plan.possibleDuplicates
          .filter((d) => included.includes(d.line))
          .map((d) => d.draft)
        const extraMerges = plan.possibleDuplicates
          .filter((d) => mergedIds.includes(d.wineId))
          .map((d) => ({ wineId: d.wineId, addStock: d.draft.stock ?? 1, patch: {} }))
        const finalPlan = {
          ...plan,
          creates: [...plan.creates, ...extra],
          merges: [...plan.merges, ...extraMerges],
        }
        await applyImportPlan(finalPlan)
        const counts = countPlan(finalPlan)
        setResult(t.importer.result.imported.replace('{creates}', String(counts.creates)).replace('{merges}', String(counts.merges)))
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : t.importer.errors.notFound)
    } finally {
      setBusy(false)
    }
  }

  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sm text-text">
          {result}
        </p>
        <Button onClick={onClose}>{t.common.close}</Button>
      </div>
    )
  }

  if (parsed.error) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="text-sm text-wine">
          {parsed.error}
        </p>
        <Button variant="secondary" onClick={onClose}>
          {t.common.close}
        </Button>
      </div>
    )
  }

  if (bundle) {
    const bottles = bundle.wines.reduce((total, w) => total + w.stock, 0)
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          {bundle.wines.length} vinos y {bottles} botellas, con su historial de descorches. Se
          restauran tal cual, sobrescribiendo lo que coincida por identificador.
        </p>
        {runError && (
          <p role="alert" className="text-sm text-wine">
            {runError}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={apply} disabled={busy}>
            {busy ? t.importer.restoring : t.importer.restore}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
        </div>
      </div>
    )
  }

  if (plan) {
    const counts = countPlan(plan)
    return (
      <div className="flex flex-col gap-4">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Stat label={t.importer.plan.creates} value={counts.creates + included.length} />
          <Stat label={t.importer.plan.merges} value={counts.merges + mergedIds.length} />
          <Stat label={t.importer.plan.errors} value={counts.errors} />
          <Stat label={t.importer.plan.duplicates} value={counts.duplicates} />
        </dl>

        {plan.errors.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm text-wine">
            {plan.errors.map((error) => (
              <li key={error.line}>
                {t.importer.lineError.replace('{n}', String(error.line)).replace('{msg}', error.message)}
              </li>
            ))}
          </ul>
        )}

        {plan.possibleDuplicates.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm text-muted">
              Mismo nombre y añada en otra bodega. Elige en cada uno si es el mismo vino (suma
              botellas) o uno distinto (se añade).
            </legend>
            {plan.possibleDuplicates.map((duplicate) => (
              <div key={duplicate.line} className="flex flex-wrap items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="size-5 accent-wine"
                    checked={included.includes(duplicate.line)}
                    onChange={(event) =>
                      setIncluded((current) =>
                        event.target.checked
                          ? [...current, duplicate.line]
                          : current.filter((line) => line !== duplicate.line),
                      )
                    }
                  />
                  Es otro vino
                </label>
                <span className="text-text">
                  {duplicate.name} {duplicate.vintage ?? t.wine.noVintage}
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  aria-pressed={mergedIds.includes(duplicate.wineId)}
                  onClick={() =>
                    setMergedIds((current) =>
                      current.includes(duplicate.wineId)
                        ? current.filter((id) => id !== duplicate.wineId)
                        : [...current, duplicate.wineId],
                    )
                  }
                >
                  Es el mismo
                </Button>
              </div>
            ))}
          </fieldset>
        )}

        {runError && (
          <p role="alert" className="text-sm text-wine">
            {runError}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={apply}
            disabled={busy || counts.creates + counts.merges + included.length + mergedIds.length === 0}
          >
            {busy ? t.common.loading : t.importer.plan.apply}
          </Button>
          <Button variant="ghost" onClick={() => setPlan(null)}>
            {t.common.cancel}
          </Button>
        </div>
      </div>
    )
  }

  if (jsonDrafts) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          {jsonDrafts.drafts.length} vinos en el archivo. Se revisan contra tu cava: los que ya
          tienes suman botellas, los demás se añaden. Nada se escribe hasta que pulses Aplicar.
        </p>
        {runError && (
          <p role="alert" className="text-sm text-wine">
            {runError}
          </p>
        )}
        <div className="flex gap-2">
          <Button onClick={review}>{t.importer.step2}</Button>
          <Button variant="ghost" onClick={onClose}>
            {t.common.cancel}
          </Button>
        </div>
      </div>
    )
  }

  const table = parsed.table!
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Revisa qué columna es cada cosa. Nada se escribe hasta que pulses Aplicar.
      </p>

      <div className="flex flex-col gap-3">
        {table.headers.map((header, column) => (
          <FieldRow key={`${header}-${column}`} label={header || `Columna ${column + 1}`}>
            <select
              className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-text"
              value={map[column] ?? ''}
              onChange={(event) =>
                setMap((current) =>
                  current.map((value, index) =>
                    index === column ? ((event.target.value || null) as Field | null) : value,
                  ),
                )
              }
            >
              <option value="">Ignorar</option>
              {FIELDS.map(([field, label]) => (
                <option key={field} value={field}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">
              {table.rows
                .slice(0, 3)
                .map((row) => row[column] ?? '')
                .filter(Boolean)
                .join(' · ')}
            </p>
          </FieldRow>
        ))}
      </div>

      <fieldset className="flex flex-wrap gap-4">
        <legend className="mb-1 text-sm text-muted">Formato de las fechas</legend>
        {(
          [
            ['dmy', 'dd/mm/aaaa'],
            ['mdy', 'mm/dd/aaaa'],
          ] as Array<[DateOrder, string]>
        ).map(([order, label]) => (
          <label key={order} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="date-order"
              className="size-5 accent-wine"
              checked={dateOrder === order}
              onChange={() => setDateOrder(order)}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <div className="flex gap-2">
        <Button onClick={review}>Ver resumen</Button>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg text-text">{value}</dd>
    </div>
  )
}
