import { useEffect, useState } from 'react'
import { BottomNav } from '@/components/BottomNav'
import { SideBar } from '@/components/SideBar'
import { IconButton } from '@/components/ui/IconButton'
import { MoonIcon, SunIcon } from '@/components/ui/Icons'
import { CellarScreen } from '@/features/cellar/CellarScreen'
import { Cave3DScreen } from '@/features/cellar/Cave3DScreen'
import { AddScreen } from '@/features/add/AddScreen'
import { HistoryScreen } from '@/features/history/HistoryScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { ToastProvider, useToast } from '@/hooks/useToast'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/hooks/useI18n'
import { activeNav, type NavId } from '@/nav'
import logoMark from '@/assets/logo-mark.svg'

function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

function PwaUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const { show } = useToast()

  useEffect(() => {
    if (!needRefresh) return
    show('Nueva versión disponible', {
      label: 'Recargar',
      onClick: () => void updateServiceWorker(true),
    })
  }, [needRefresh, show, updateServiceWorker])

  return null
}

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const { t } = useI18n()

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-6 md:right-6 z-50">
      <div className="mx-auto max-w-sm rounded-xl border border-border bg-surface p-4 shadow-lg">
        <p className="mb-3 text-sm text-text">{t.common.save} como app</p>
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 rounded-lg bg-wine px-4 py-2 text-sm font-medium text-white"
          >
            {t.common.yes}
          </button>
          <button
            onClick={() => setShowPrompt(false)}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text"
          >
            {t.common.no}
          </button>
        </div>
      </div>
    </div>
  )
}

function Screen({ route }: { route: NavId }) {
  if (route === 'cava') return <CellarScreen />
  if (route === 'add') return <AddScreen />
  if (route === 'historial') return <HistoryScreen />
  if (route === 'cava3d') return <Cave3DScreen />
  return <SettingsScreen />
}

export default function App() {
  const hash = useHashRoute()
  const route = activeNav(hash)
  const { theme, toggle } = useTheme()
  const { t } = useI18n()

  const TITLES: Record<NavId, string> = {
    cava: t.titles.cava,
    add: t.titles.add,
    historial: t.titles.historial,
    ajustes: t.titles.ajustes,
    cava3d: t.titles.cava3d,
  }

  return (
    <ToastProvider>
      <PwaUpdate />
      <InstallPrompt />
      <div className="min-h-dvh bg-bg text-text md:flex">
        <SideBar active={route} className="hidden md:flex" />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <img src={logoMark} alt="" className="size-7 shrink-0 md:hidden" />
              <h1 className="truncate font-serif text-2xl">{TITLES[activeNav(hash)]}</h1>
            </div>
            <div className="flex items-center gap-2">
              <IconButton label={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'} onClick={toggle}>
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </IconButton>
              <LanguageSelector />
            </div>
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

function LanguageSelector() {
  const { locale, setLocale, t } = useI18n()
  const locales: { code: 'es' | 'en' | 'fr'; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => {
          const currentIndex = locales.findIndex((l) => l.code === locale)
          const next = locales[(currentIndex + 1) % locales.length]!
          setLocale(next.code)
        }}
        className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-text hover:bg-surface"
        aria-label={t.common.save}
      >
        {locales.find((l) => l.code === locale)?.flag ?? '🇪🇸'}
      </button>
    </div>
  )
}