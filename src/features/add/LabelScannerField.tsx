import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BarcodeLookup } from './BarcodeLookup'
import { readGeminiKey, scanLabel, geminiDraft, type LabelDraft } from '@/services/labelScanner'

export function LabelScannerField({ onDraft }: { onDraft: (draft: LabelDraft) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'idle' | 'working' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [fields, setFields] = useState<{ label: string }[]>([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')

  async function scan(file: File | undefined) {
    if (!file) return
    setPhase('working')
    setProgress(0)
    setError('')
    setText('')
    setFields([])
    try {
      const reading = await scanLabel(file, undefined, (p) => setProgress(p.progress))
      setFields(reading.fields)
      setText(reading.text)
      onDraft(reading.draft)
      setPhase('done')
    } catch (cause) {
      setPhase('idle')
      setError(cause instanceof Error ? cause.message : 'No se pudo leer la etiqueta.')
    }
  }

  async function retryWithGemini() {
    const file = inputRef.current?.files?.[0]
    if (!file) return
    const key = readGeminiKey()
    if (!key) return
    setPhase('working')
    setProgress(0)
    setError('')
    try {
      onDraft(await geminiDraft(file, key))
      setPhase('done')
    } catch (cause) {
      setPhase('idle')
      setError(cause instanceof Error ? cause.message : 'Gemini no reconoció la etiqueta.')
    }
  }

  const hasKey = useMemo(() => readGeminiKey() !== null, [])

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={phase === 'working'}
        >
          {phase === 'working' ? `Leyendo etiqueta… ${Math.round(progress * 100)}%` : 'Escanear etiqueta'}
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
      {phase === 'working' && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full bg-gold transition-[width]"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-wine">
          {error}
          {hasKey && phase === 'idle' && (
            <>
              {' '}
              <button type="button" onClick={retryWithGemini} className="underline">
                Probar con Gemini
              </button>
            </>
          )}
        </p>
      )}
      {phase === 'done' && fields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {fields.map((f, i) => (
            <span
              key={`${f.label}-${i}`}
              className="rounded-full border border-border px-2 py-1 text-xs text-muted"
            >
              {f.label}
            </span>
          ))}
          <span className="self-center text-xs text-muted">Solo se rellenan los campos vacíos.</span>
        </div>
      )}
      {phase === 'done' && text && (
        <details>
          <summary className="cursor-pointer text-xs text-muted">Ver texto leído</summary>
          <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-words text-xs text-muted">
            {text}
          </pre>
        </details>
      )}
      <BarcodeLookup onDraft={onDraft} />
    </div>
  )
}