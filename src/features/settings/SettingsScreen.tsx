import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { DataPanel } from '@/features/settings/DataPanel'
import { StatsSection } from '@/features/settings/StatsSection'
import { CaveConfigPanel } from '@/features/settings/CaveConfig'
import { useToast } from '@/hooks/useToast'
import { useTheme } from '@/hooks/useTheme'
import { useWines } from '@/hooks/useWines'
import { useEvents } from '@/hooks/useEvents'
import { useI18n } from '@/hooks/useI18n'
import { APP_VERSION, REPO_URL } from '@/lib/appInfo'
import { Brand } from '@/components/Brand'
import { OFF_ATTRIBUTION } from '@/services/openfoodfacts'

const KEY_STORAGE = 'micava.geminiKey'

function readKey(): string {
  return localStorage.getItem(KEY_STORAGE) ?? ''
}

export function SettingsScreen() {
  const { wines } = useWines()
  const { events } = useEvents()
  const { theme, toggle } = useTheme()
  const { show } = useToast()
  const { t, locale } = useI18n()
  const [key, setKey] = useState(readKey)
  const [hasKey, setHasKey] = useState(() => readKey() !== '')

  function saveKey() {
    const trimmed = key.trim()
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed)
    else localStorage.removeItem(KEY_STORAGE)
    setHasKey(trimmed !== '')
    show(trimmed ? t.settings.scanner.saved : t.settings.scanner.deleted)
  }

  function clearKey() {
    localStorage.removeItem(KEY_STORAGE)
    setKey('')
    setHasKey(false)
    show(t.settings.scanner.deleted)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">{t.settingsScreen.stats}</h2>
        <StatsSection wines={wines} events={events} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">{t.settingsScreen.appearance}</h2>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">{t.settings.appearance.theme} {theme === 'dark' ? t.settings.appearance.dark : t.settings.appearance.light}</p>
          <Button variant="secondary" onClick={toggle}>
            {t.settings.appearance.toggle(theme === 'dark' ? t.settings.appearance.light : t.settings.appearance.dark)}
          </Button>
        </div>
      </section>

      <CaveConfigPanel />

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">{t.settingsScreen.scanner}</h2>
        <p className="mb-3 text-sm text-muted">{t.settingsScreen.scannerInfo}</p>
        <Field
          label={t.settings.scanner.keyLabel}
          hint={t.settings.scanner.keyHint}
        >
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="AIza…"
            autoComplete="off"
            className="min-h-11 w-full rounded-lg border border-border bg-surface-2 px-3 text-text"
          />
        </Field>
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" onClick={saveKey}>
            {t.settings.scanner.save}
          </Button>
          <Button variant="ghost" onClick={clearKey} disabled={!hasKey}>
            {t.settings.scanner.delete}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">{t.settingsScreen.data}</h2>
        <DataPanel />
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <h2 className="mb-2 font-serif text-xl text-text">{t.settingsScreen.about}</h2>
        <Brand className="mb-3" />
        <p>{t.settings.about.version.replace('{version}', APP_VERSION)}</p>
        <a className="mt-1 inline-block text-gold underline" href={REPO_URL} target="_blank" rel="noreferrer">
          {t.settings.about.github}
        </a>
        <p className="mt-2">
          <a className="text-gold underline" href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">
            {OFF_ATTRIBUTION[locale]}
          </a>
        </p>
      </section>
    </div>
  )
}
