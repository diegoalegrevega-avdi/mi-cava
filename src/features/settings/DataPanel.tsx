import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { useToast } from '@/hooks/useToast'
import { useWines } from '@/hooks/useWines'
import { computeStats } from '@/domain/stats'
import { formatEuros } from '@/lib/money'
import { formatDate } from '@/lib/dates'
import { downloadFile } from '@/lib/download'
import { toCsv, toJson } from '@/services/exporters'
import { ImportScreen } from '@/features/settings/ImportScreen'
import {
  clearAll,
  exportBundle,
  getLastExportAt,
  listWines,
  setLastExportAt,
} from '@/db/repo'

export function DataPanel() {
  const { wines, reload } = useWines()
  const { show } = useToast()
  const [imported, setImported] = useState<{ fileName: string; content: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const stats = computeStats(wines, new Date().getFullYear())
  const lastExport = getLastExportAt()

  async function exportJson() {
    const bundle = await exportBundle()
    downloadFile(`mi-cava-${bundle.exportedAt.slice(0, 10)}.json`, 'application/json', toJson(bundle))
    setLastExportAt(bundle.exportedAt)
    show('Copia JSON descargada')
  }

  async function exportCsv() {
    const all = await listWines()
    downloadFile(`mi-cava-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv', toCsv(all))
    show('CSV descargado')
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const content = await file.text()
    setImported({ fileName: file.name, content })
    event.target.value = ''
  }

  async function emptyCellar() {
    if (confirmText.trim() !== 'BORRAR') return
    const bundle = await exportBundle()
    downloadFile(`mi-cava-antes-de-vaciar-${bundle.exportedAt.slice(0, 10)}.json`, 'application/json', toJson(bundle))
    setLastExportAt(bundle.exportedAt)
    await clearAll()
    setConfirmText('')
    reload()
    show('Cava vaciada · copia descargada')
  }

  const types = Object.entries(stats.byType).filter(([, count]) => count > 0)

  return (
    <div className="flex w-full flex-col gap-6">
      <dl className="grid grid-cols-2 gap-3">
        <Figure label="Botellas" value={String(stats.bottles)} />
        <Figure label="Referencias" value={String(stats.references)} />
        <Figure label="Valor estimado" value={formatEuros(stats.valueCents)} />
        <Figure label="Última exportación" value={lastExport ? formatDate(lastExport) : 'Nunca'} />
      </dl>

      {types.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">Por tipo</h2>
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
            {types.map(([type, count]) => (
              <span
                key={type}
                className={count > 0 ? 'bg-wine' : ''}
                style={{ width: `${(count / stats.bottles) * 100}%` }}
                aria-hidden="true"
              />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {types.map(([type, count]) => (
              <li key={type}>
                {type === 'sinTipo' ? 'Sin tipo' : type}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-muted">Copia de seguridad</h2>
        <Button variant="secondary" onClick={exportJson}>
          Exportar JSON
        </Button>
        <Button variant="secondary" onClick={exportCsv}>
          Exportar CSV
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-sm text-text hover:bg-surface-2">
          Importar archivo
          <input type="file" accept=".csv,.json" className="sr-only" onChange={onFile} />
        </label>
        <p className="text-xs text-muted">JSON guarda el historial completo. CSV vale para otras apps.</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-muted">Vaciar cava</h2>
        <p className="text-xs text-muted">
          Se descarga antes una copia JSON. Escribe BORRAR para confirmar.
        </p>
        <input
          className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 text-sm text-text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder="BORRAR"
          aria-label="Escribe BORRAR para confirmar"
        />
        <Button variant="danger" onClick={emptyCellar} disabled={confirmText.trim() !== 'BORRAR'}>
          Vaciar cava
        </Button>
      </div>

      <Sheet open={imported !== null} onClose={() => setImported(null)} title="Importar">
        {imported && (
          <ImportScreen
            key={imported.fileName + imported.content}
            fileName={imported.fileName}
            content={imported.content}
            onClose={() => {
              setImported(null)
              reload()
            }}
          />
        )}
      </Sheet>
    </div>
  )
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-xl text-text">{value}</dd>
    </div>
  )
}
