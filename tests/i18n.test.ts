import { describe, expect, it } from 'vitest'
import { DICTIONARIES, type Locale } from '@/lib/i18n'

const LOCALES: Locale[] = ['es', 'en', 'fr']
const TYPES = ['tinto', 'blanco', 'rosado', 'espumoso', 'dulce', 'fortificado', 'sinTipo'] as const
const DRINK = ['ready', 'keep', 'past', 'unknown'] as const

describe('i18n wine labels', () => {
  it('translates every wine type in every locale', () => {
    for (const locale of LOCALES) {
      for (const type of TYPES) {
        expect(DICTIONARIES[locale].types[type], `${locale}.types.${type}`).toBeTruthy()
      }
    }
  })

  it('translates every drink status in every locale', () => {
    for (const locale of LOCALES) {
      for (const status of DRINK) {
        expect(DICTIONARIES[locale].drink[status], `${locale}.drink.${status}`).toBeTruthy()
      }
    }
  })

  it('does not leave Spanish text in the English and French labels', () => {
    expect(DICTIONARIES.en.types.tinto).not.toBe(DICTIONARIES.es.types.tinto)
    expect(DICTIONARIES.fr.types.tinto).not.toBe(DICTIONARIES.es.types.tinto)
    expect(DICTIONARIES.en.drink.ready).not.toBe(DICTIONARIES.es.drink.ready)
    expect(DICTIONARIES.fr.drink.ready).not.toBe(DICTIONARIES.es.drink.ready)
  })
})
