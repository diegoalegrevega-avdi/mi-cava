import { cn } from '@/lib/cn'
import { NAV_ITEMS, type NavId } from '@/nav'
import { NavIcon } from '@/components/ui/Icons'
import { Brand } from '@/components/Brand'
import { useI18n } from '@/hooks/useI18n'

export function SideBar({ active, className }: { active: NavId; className?: string }) {
  const { t } = useI18n()
  return (
    <nav
      aria-label={t.cellar.addWine}
      className={cn('sticky top-0 h-dvh w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-3', className)}
    >
      <Brand className="px-3 py-4" />
      {NAV_ITEMS.map((item) => {
        const on = item.id === active
        const label = t.nav[item.labelKey]
        return (
          <a
            key={item.id}
            href={item.hash}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition',
              on ? 'bg-surface-2 text-gold' : 'text-muted hover:bg-surface-2 hover:text-text',
            )}
          >
            <NavIcon id={item.id} className="size-5" />
            {label}
          </a>
        )
      })}
    </nav>
  )
}