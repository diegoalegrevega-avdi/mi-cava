import logoMark from '@/assets/logo-mark.svg'
import { cn } from '@/lib/cn'

export const TAGLINE = 'Complex problems, simple tools'

export function Brand({ className, withTagline = true }: { className?: string; withTagline?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <img src={logoMark} alt="" className="size-6 shrink-0" />
        <span className="font-serif text-xl text-text">Mi Cava</span>
      </div>
      {withTagline ? <span className="text-[11px] leading-tight text-muted">{TAGLINE}</span> : null}
    </div>
  )
}
