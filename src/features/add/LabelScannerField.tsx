import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { WineType } from '@/db/schema'
import { BarcodeLookup } from './BarcodeLookup'
import { readGeminiKey, scanLabel, geminiDraft, type LabelDraft } from '@/services/labelScanner'
import type { DetectedField } from '@/services/labelFields'
import { useI18n } from '@/hooks/useI18n'

export function LabelScannerField({ onDraft }: { onDraft: (draft: LabelDraft) => void }) {
  const { t } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<'idle' | 'working' | 'done'>('idle')
  const [progress, setProgress] = useState(0)
  const [fields, setFields] = useState<DetectedField[]>([])
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
      setError(cause instanceof Error ? cause.message : t.add.scanner.error)
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
      setError(cause instanceof Error ? cause.message : t.add.scanner.failed)
    }
  }

  const hasKey = useMemo(() => readGeminiKey() !== null, [])

  const fieldText = (item: DetectedField): string => {
    switch (item.field) {
      case 'vintage':
        return t.add.scanner.fields.vintage(item.value as number)
      case 'type':
        return t.types[item.value as WineType]
      case 'varietals':
        return (item.value as string[]).join(', ')
      default:
        return String(item.value)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          disabled={phase === 'working'}
        >
          {phase === 'working' ? `${t.add.scanner.loading} ${Math.round(progress * 100)}%` : t.add.scanner.title}
        </Button>
        <span className="text-xs text-muted">{t.add.scanner.drop}</span>
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
                {t.add.scanner.retry}
              </button>
            </>
          )}
        </p>
      )}
      {phase === 'done' && fields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {fields.map((f, i) => (
            <span
              key={`${f.field}-${i}`}
              className="rounded-full border border-border px-2 py-1 text-xs text-muted"
            >
              {fieldText(f)}
            </span>
          ))}
          <span className="self-center text-xs text-muted">{t.add.scanner.fillEmpty}</span>
        </div>
      )}
      {phase === 'done' && text && (
        <details>
          <summary className="cursor-pointer text-xs text-muted">{t.add.scanner.viewText}</summary>
          <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-words text-xs text-muted">
            {text}
          </pre>
        </details>
      )}
      <BarcodeLookup onDraft={onDraft} />
    </div>
  )
}