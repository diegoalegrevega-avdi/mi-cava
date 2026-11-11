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
import { useI18n } from '@/hooks/useI18n'

export function DataPanel() {
  const { wines, reload } = useWines()
  const { show } = useToast()
  const { t } = useI18n()
  const [imported, setImported] = useState<{ fileName: string; content: string } | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const stats = computeStats(wines, new Date().getFullYear())
  const lastExport = getLastExportAt()

  async function exportJson() {
    const bundle = await exportBundle()
    downloadFile(`mi-cava-${bundle.exportedAt.slice(0, 10)}.json`, 'application/json', toJson(bundle))
    setLastExportAt(bundle.exportedAt)
    show(t.settings.data.exportJson)
  }

  async function exportCsv() {
    const all = await listWines()
    downloadFile(`mi-cava-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv', toCsv(all))
    show(t.settings.data.exportCsv)
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
    show(t.settings.data.empty.toast)
  }

  const types = Object.entries(stats.byType).filter(([, count]) => count > 0)

  return (
    <div className="flex w-full flex-col gap-6">
      <dl className="grid grid-cols-2 gap-3">
        <Figure label={t.settings.stats.bottles} value={String(stats.bottles)} />
        <Figure label={t.settings.stats.references} value={String(stats.references)} />
        <Figure label={t.settings.stats.value} value={formatEuros(stats.valueCents)} />
        <Figure label={t.settings.stats.lastExport} value={lastExport ? formatDate(lastExport) : t.settings.stats.never} />
      </dl>

      {types.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-sm text-muted">{t.settings.stats.byType}</h2>
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
                {type === 'sinTipo' ? t.types.sinTipo : t.types[type as keyof typeof t.types]}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-muted">{t.settings.data.title}</h2>
        <Button variant="secondary" onClick={exportJson}>
          {t.settings.data.exportJson}
        </Button>
        <Button variant="secondary" onClick={exportCsv}>
          {t.settings.data.exportCsv}
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-sm text-text hover:bg-surface-2">
          {t.settings.data.import}
          <input type="file" accept=".csv,.json" className="sr-only" onChange={onFile} />
        </label>
        <p className="text-xs text-muted">JSON guarda el historial completo. CSV vale para otras apps.</p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm text-muted">{t.settings.data.empty.title}</h2>
        <p className="text-xs text-muted">
          {t.settings.data.empty.confirm}
        </p>
        <input
          className="min-h-11 rounded-lg border border-border bg-surface-2 px-3 text-sm text-text"
          value={confirmText}
          onChange={(event) => setConfirmText(event.target.value)}
          placeholder="BORRAR"
          aria-label={t.settings.data.empty.confirm}
        />
        <Button variant="danger" onClick={emptyCellar} disabled={confirmText.trim() !== 'BORRAR'}>
          {t.settings.data.empty.action}
        </Button>
      </div>

      <Sheet open={imported !== null} onClose={() => setImported(null)} title={t.importer.title}>
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
