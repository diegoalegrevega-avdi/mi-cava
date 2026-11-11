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

describe('i18n food pairing', () => {
  const PAIRING_TYPES = TYPES.filter((type) => type !== 'sinTipo')

  it('translates serving temperature, tip and avoid list for every wine type', () => {
    // Proper nouns and numbers stay the same across locales; these Spanish words must not.
    const spanishOnly = /Joven|Fermentado en barrica|Sobre lías|Seco y ligero|Con cuerpo|Con toque dulzor|Vendimia tardía/

    for (const locale of ['en', 'fr'] as const) {
      for (const type of PAIRING_TYPES) {
        const translated = DICTIONARIES[locale].foodPairing.notes[type]
        const spanish = DICTIONARIES.es.foodPairing.notes[type]
        expect(translated.servingTemp, `${locale}.notes.${type}.servingTemp`).not.toMatch(spanishOnly)
        expect(translated.tip, `${locale}.notes.${type}.tip`).not.toBe(spanish.tip)
        expect(translated.avoid, `${locale}.notes.${type}.avoid`).not.toEqual(spanish.avoid)
        expect(translated.avoid.length).toBe(spanish.avoid.length)
      }
    }
  })
})
