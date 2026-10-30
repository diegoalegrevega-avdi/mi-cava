import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { lookupBarcode, toOffDraft, OFF_ATTRIBUTION, OFF_URL, type OffProduct } from '@/services/openfoodfacts'
import { normalizeBarcode } from '@/services/openfoodfacts'
import { barcodeSupported, detectBarcode } from '@/services/barcode'

export function BarcodeLookup({ onDraft }: { onDraft: (draft: { name?: string; winery?: string }) => void }) {
  const [ean, setEan] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<OffProduct | null>(null)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'idle' | 'noProduct' | 'notWine' | 'error'>('idle')

  async function lookup() {
    const code = normalizeBarcode(ean)
    if (!code) {
      setMode('error')
      setError('Código de barras no válido.')
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
      setError(cause instanceof Error ? cause.message : 'No se pudo consultar Open Food Facts.')
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
      <Field label="Código de barras">
        <div className="flex items-center gap-2">
          <input
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            inputMode="numeric"
            placeholder="8410302106300"
            className={cn(
              'min-h-11 flex-1 rounded-lg border border-border bg-surface-2 px-3 focus:border-gold focus:outline-none',
            )}
            aria-label="Código de barras"
            disabled={loading}
          />
          <Button type="button" variant="secondary" onClick={lookup} disabled={loading || !ean.trim()}>
            {loading ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>
      </Field>
      {barcodeSupported() && (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label="Leer código de barras con la cámara"
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
                setError('No he encontrado un código de barras en la foto.')
              }
            } catch (cause) {
              setMode('error')
              setError(cause instanceof Error ? cause.message : 'No se pudo leer el código.')
            } finally {
              setLoading(false)
              e.target.value = ''
            }
          }}
        />
      )}
      {mode === 'noProduct' && <p className="text-sm text-muted">Ese código no está en Open Food Facts.</p>}
      {mode === 'notWine' && <p className="text-sm text-muted">Ese código no es un vino en Open Food Facts.</p>}
      {mode === 'error' && error && <p role="alert" className="text-sm text-wine">{error}</p>}
      {product && (
        <div className="rounded-lg border border-border bg-surface-2 p-3 text-sm">
          <p className="font-medium text-text">{product.name}</p>
          {product.brand && <p className="text-muted">Bodega: {product.brand}</p>}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" variant="primary" onClick={() => { onDraft(toOffDraft(product)); reset() }}>
              Usar estos datos
            </Button>
            <Button type="button" variant="ghost" onClick={reset}>
              Descartar
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
        {OFF_ATTRIBUTION} (ODbL)
      </a>
    </div>
  )
}