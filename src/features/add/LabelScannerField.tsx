import { useMemo, useRef, useState } from 'react'
import { getScanner, type LabelDraft } from '@/services/labelScanner'
import { Button } from '@/components/ui/Button'

export function LabelScannerField({ onDraft }: { onDraft: (draft: LabelDraft) => void }) {
  const scanner = useMemo(() => getScanner(() => localStorage.getItem('micava.geminiKey')), [])
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function scan(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onDraft(await scanner.scan(file))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo leer la etiqueta.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (!scanner.enabled) {
    return (
      <div className="rounded-lg border border-dashed border-border p-3 text-sm text-muted">
        <p>{scanner.reason}</p>
        <p className="mt-1 text-xs">Mientras tanto, puedes escribir los datos a mano.</p>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        void scan(e.dataTransfer.files[0])
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? 'Leyendo etiqueta…' : 'Escanear etiqueta'}
        </Button>
        <span className="text-xs text-muted">o arrastra una foto aquí</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-label="Foto de la etiqueta"
        onChange={(e) => void scan(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="text-sm text-wine">
          {error}
        </p>
      )}
    </div>
  )
}
