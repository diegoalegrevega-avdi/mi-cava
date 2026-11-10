import { useState, useEffect, useMemo, createContext, useContext } from 'react'
import { DICTIONARIES, type Dictionary, type Locale } from '@/lib/i18n'

const DEFAULT_LOCALE: Locale = 'es'
const STORAGE_KEY = 'micava.locale'

interface I18nContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  t: Dictionary
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && DICTIONARIES[stored as Locale]) return stored as Locale
    } catch {
      // ignore
    }
    const browser = navigator.language.split('-')[0] as Locale
    return DICTIONARIES[browser] ? browser : DEFAULT_LOCALE
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const t = useMemo(() => DICTIONARIES[locale], [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}