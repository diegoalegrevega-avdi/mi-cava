import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { SideBar } from '@/components/SideBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { IconButton } from '@/components/ui/IconButton'
import { MoonIcon, SunIcon } from '@/components/ui/Icons'
import { ToastProvider } from '@/hooks/useToast'
import { useTheme } from '@/hooks/useTheme'
import { activeNav, type NavId } from '@/nav'

const TITLES: Record<NavId, string> = {
  cava: 'Mi cava',
  add: 'Añadir vino',
  historial: 'Historial',
  ajustes: 'Ajustes y datos',
}

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function Screen({ route }: { route: NavId }) {
  return <EmptyState title={TITLES[route]} description="Pantalla en construcción." />
}

export default function App() {
  const hash = useHashRoute()
  const route = activeNav(hash)
  const { theme, toggle } = useTheme()

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg text-text md:flex">
        <SideBar active={route} className="hidden md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:px-6">
            <h1 className="font-serif text-2xl">{TITLES[route]}</h1>
            <IconButton label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} onClick={toggle}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </IconButton>
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4 pb-24 md:px-6 md:pb-10">
            <Screen route={route} />
          </main>
        </div>
        <BottomNav active={route} className="md:hidden" />
      </div>
    </ToastProvider>
  )
}
