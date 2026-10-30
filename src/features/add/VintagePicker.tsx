import { cn } from '@/lib/cn'

const INPUT =
  'min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 tabular-nums focus:border-gold focus:outline-none disabled:opacity-40'

export function VintagePicker({
  value,
  onChange,
  disabled = false,
  currentYear = new Date().getFullYear(),
}: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  currentYear?: number
}) {
  const recent = Array.from({ length: 6 }, (_, i) => currentYear - i)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {recent.map((year) => {
          const selected = value === String(year)
          return (
            <button
              key={year}
              type="button"
              disabled={disabled}
              aria-pressed={selected}
              onClick={() => onChange(String(year))}
              className={cn(
                'min-h-9 rounded-full border px-3 text-sm tabular-nums transition-colors disabled:opacity-40',
                selected
                  ? 'border-wine bg-wine text-text'
                  : 'border-border bg-surface-2 text-muted hover:text-text',
              )}
            >
              {year}
            </button>
          )
        })}
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        disabled={disabled}
        inputMode="numeric"
        maxLength={4}
        placeholder="Añada"
        aria-label="Añada"
        className={INPUT}
      />
    </div>
  )
}
