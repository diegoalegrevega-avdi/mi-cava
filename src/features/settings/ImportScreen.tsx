import { useMemo, useState } from 'react'
import { applyImportPlan, listWines, restoreBundle } from '@/db/repo'
import type { CellarBundle } from '@/db/schema'
import { Button } from '@/components/ui/Button'
import { Field as FieldRow } from '@/components/ui/Field'
import { autoMap, countPlan, parseCsv, planImport, readBundleFile } from '@/services/importer'
import type { DateOrder, Field, ImportPlan } from '@/services/importer'

const FIELDS: Array<[Field, string]> = [
  ['name', 'Nombre'],
  ['winery', 'Bodega'],
  ['vintage', 'Añada'],
  ['type', 'Tipo'],
  ['varietals', 'Varietales'],
  ['region', 'Región'],
  ['country', 'País'],
  ['stock', 'Botellas'],
  ['price', 'Precio'],
  ['purchasedAt', 'Fecha de compra'],
  ['location', 'Ubicación'],
  ['drinkFrom', 'Desde'],
  ['drinkUntil', 'Hasta'],
  ['notes', 'Notas'],
]

export function ImportScreen({
  fileName,
  content,
  onClose,
}: {
  fileName: string
  content: string
  onClose: () => void
}) {
  const isJson = /\.json$/i.test(fileName) || content.trimStart().startsWith('{')

  const parsed = useMemo(() => {
    if (isJson) {
      try {
        return { bundle: readBundleFile(content) }
      } catch {
        return { error: 'El archivo JSON no se puede leer.' }
      }
    }
    const table = parseCsv(content)
    if (table.headers.length === 0) return { error: 'El CSV está vacío.' }
    return { table, map: autoMap(table.headers) }
  }, [isJson, content])

  const [map, setMap] = useState<Array<Field | null>>(parsed.map ?? [])
  const [dateOrder, setDateOrder] = useState<DateOrder>('dmy')
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const [included, setIncluded] = useState<number[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const bundle: CellarBundle | undefined = parsed.bundle

  async function review() {
    if (!parsed.table) return
    setPlan(planImport(parsed.table, map, dateOrder, await listWines()))
  }

  async function apply() {
    setBusy(true)
    setRunError(null)
    try {
      if (bundle) {
        const { created, updated } = await restoreBundle(bundle)
        setResult(`Restaurado: ${created} vinos nuevos, ${updated} actualizados.`)
      } else if (plan) {
        const extra = plan.possibleDuplicates
          .filter((d) => included.includes(d.line))
          .map((d) => d.draft)
        const finalPlan = { ...plan, creates: [...plan.creates, ...extra] }
        await applyImportPlan(finalPlan)
        const counts = countPlan(finalPlan)
        setResult(`Importado: ${counts.creates} vinos nuevos, ${counts.merges} actualizados.`)
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'No se pudo importar')
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
        <Button onClick={onClose}>Cerrar</Button>
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
          Cerrar
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
            {busy ? 'Restaurando…' : 'Restaurar'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
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
          <Stat label="Vinos nuevos" value={counts.creates + included.length} />
          <Stat label="Se suman a existentes" value={counts.merges} />
          <Stat label="Filas con error" value={counts.errors} />
          <Stat label="Posibles duplicados" value={counts.duplicates} />
        </dl>

        {plan.errors.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm text-wine">
            {plan.errors.map((error) => (
              <li key={error.line}>
                Línea {error.line}: {error.message}
              </li>
            ))}
          </ul>
        )}

        {plan.possibleDuplicates.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm text-muted">
              Mismo nombre y añada en otra bodega. Márcalos para añadirlos como vinos nuevos.
            </legend>
            {plan.possibleDuplicates.map((duplicate) => (
              <label key={duplicate.line} className="flex items-center gap-2 text-sm">
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
                {duplicate.name} {duplicate.vintage ?? 'NV'}
              </label>
            ))}
          </fieldset>
        )}

        {runError && (
          <p role="alert" className="text-sm text-wine">
            {runError}
          </p>
        )}

        <div className="flex gap-2">
          <Button onClick={apply} disabled={busy || counts.creates + counts.merges + included.length === 0}>
            {busy ? 'Importando…' : 'Aplicar'}
          </Button>
          <Button variant="ghost" onClick={() => setPlan(null)}>
            Volver
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
