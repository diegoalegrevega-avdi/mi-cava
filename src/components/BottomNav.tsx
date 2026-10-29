import { cn } from '@/lib/cn'
import { NAV_ITEMS, type NavId } from '@/nav'
import { NavIcon } from '@/components/ui/Icons'

export function BottomNav({ active, className }: { active: NavId; className?: string }) {
  return (
    <nav
      aria-label="Secciones"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]',
        className,
      )}
    >
      <ul className="mx-auto flex max-w-lg">
        {NAV_ITEMS.map((item) => {
          const on = item.id === active
          return (
            <li key={item.id} className="flex-1">
              <a
                href={item.hash}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] transition',
                  on ? 'text-gold' : 'text-muted hover:text-text',
                )}
              >
                <NavIcon id={item.id} className={cn('size-6', on && 'text-gold')} />
                {item.label}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
