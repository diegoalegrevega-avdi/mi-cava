import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { lookupBarcode, toOffDraft, OFF_URL, type OffProduct, OFF_ATTRIBUTION } from '@/services/openfoodfacts'
import { normalizeBarcode } from '@/services/openfoodfacts'
import { barcodeSupported, detectBarcode } from '@/services/barcode'
import { useI18n } from '@/hooks/useI18n'

export function BarcodeLookup({ onDraft }: { onDraft: (draft: { name?: string; winery?: string }) => void }) {
  const { t, locale } = useI18n()
  const [ean, setEan] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<OffProduct | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'idle' | 'noProduct' | 'notWine' | 'error'>('idle')

  async function lookup() {
    const code = normalizeBarcode(ean)
    if (!code) {
      setMode('error')
      setError(t.add.barcode.invalid)
      setProduct(null)
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await lookupBarcode(code)
      setProduct(result)
      if (!result) {
        setMode('noProduct')
        return
      }
      if (!result.isWine) {
        setMode('notWine')
        return
      }
      setMode('idle')
    } catch (cause) {
      setMode('error')
      setError(cause instanceof Error ? cause.message : t.add.barcode.readError)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setEan('')
    setProduct(null)
    setMode('idle')
    setError('')
  }

  return (
    <div className="flex flex-col gap-2">
      <Field label={t.add.barcode.label}>
        <div className="flex items-center gap-2">
          <input
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            inputMode="numeric"
            placeholder="8410302106300"
            className={cn(
              'min-h-11 flex-1 rounded-lg border border-border bg-surface-2 px-3 focus:border-gold focus:outline-none',
            )}
            aria-label={t.add.barcode.label}
            disabled={loading}
          />
          <Button type="button" variant="secondary" onClick={lookup} disabled={loading || !ean.trim()}>
            {loading ? t.add.barcode.searching : t.add.barcode.search}
          </Button>
        </div>
      </Field>
      {barcodeSupported() && (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label={t.add.barcode.camera}
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setLoading(true)
            setError('')
            try {
              const code = await detectBarcode(file)
              if (code) {
                setEan(code)
                void lookup()
              } else {
                setMode('error')
                setError(t.add.barcode.noBarcode)
              }
            } catch (cause) {
              setMode('error')
              setError(cause instanceof Error ? cause.message : t.add.barcode.readError)
            } finally {
              setLoading(false)
              e.target.value = ''
            }
          }}
        />
      )}
      {mode === 'noProduct' && <p className="text-sm text-muted">{t.importer.errors.notFound}</p>}
      {mode === 'notWine' && <p className="text-sm text-muted">{t.importer.errors.notWine}</p>}
      {mode === 'error' && error && <p role="alert" className="text-sm text-wine">{error}</p>}
      {product && (
        <div className="rounded-lg border border-border bg-surface-2 p-3 text-sm">
          <p className="font-medium text-text">{product.name}</p>
          {product.brand && <p className="text-muted">{t.add.winery}: {product.brand}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="primary" onClick={() => { onDraft(toOffDraft(product)); reset() }}>
              {t.add.barcode.use}
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      )}
      <a
        href={OFF_URL}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-muted hover:underline"
      >
        {OFF_ATTRIBUTION[locale]}
      </a>
    </div>
  )
}