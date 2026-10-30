import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { DataPanel } from '@/features/settings/DataPanel'
import { StatsPanel } from '@/features/settings/StatsPanel'
import { useToast } from '@/hooks/useToast'
import { useTheme } from '@/hooks/useTheme'
import { useWines } from '@/hooks/useWines'
import { APP_VERSION, REPO_URL } from '@/lib/appInfo'

const KEY_STORAGE = 'micava.geminiKey'

function readKey(): string {
  return localStorage.getItem(KEY_STORAGE) ?? ''
}

export function SettingsScreen() {
  const { wines } = useWines()
  const { theme, toggle } = useTheme()
  const { show } = useToast()
  const [key, setKey] = useState(readKey)
  const [hasKey, setHasKey] = useState(() => readKey() !== '')

  function saveKey() {
    const trimmed = key.trim()
    if (trimmed) localStorage.setItem(KEY_STORAGE, trimmed)
    else localStorage.removeItem(KEY_STORAGE)
    setHasKey(trimmed !== '')
    show(trimmed ? 'Clave guardada' : 'Clave borrada')
  }

  function clearKey() {
    localStorage.removeItem(KEY_STORAGE)
    setKey('')
    setHasKey(false)
    show('Clave borrada')
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">Tu cava en números</h2>
        <StatsPanel wines={wines} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">Apariencia</h2>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Tema {theme === 'dark' ? 'oscuro' : 'claro'}</p>
          <Button variant="secondary" onClick={toggle}>
            Cambiar a {theme === 'dark' ? 'claro' : 'oscuro'}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">Escáner de etiquetas</h2>
        <p className="mb-3 text-sm text-muted">
          La lectura se hace en el propio dispositivo con Tesseract. La primera vez descarga los modelos (≈9 MB) y los guarda
          en el navegador; después funciona sin red. La foto no se guarda en ningún sitio.
        </p>
        <Field
          label="Clave de Google Gemini"
          hint="Opcional. Se guarda solo en este navegador y se envía únicamente a Google para reintentar lecturas que el motor local no ha podido completar."
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
            Guardar clave
          </Button>
          <Button variant="ghost" onClick={clearKey} disabled={!hasKey}>
            Borrar clave
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-3 font-serif text-xl">Tus datos</h2>
        <DataPanel />
      </section>

      <section className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        <h2 className="mb-2 font-serif text-xl text-text">Acerca de</h2>
        <p>Mi Cava {APP_VERSION} · software libre bajo licencia MIT.</p>
        <a className="mt-1 inline-block text-gold underline" href={REPO_URL} target="_blank" rel="noreferrer">
          Código en GitHub
        </a>
        <p className="mt-2">
          <a className="text-gold underline" href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">
            Datos de Open Food Facts (ODbL)
          </a>
        </p>
      </section>
    </div>
  )
}
