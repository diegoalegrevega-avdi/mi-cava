import { describe, expect, it } from 'vitest'
import { drinkStatus, defaultWindow } from '@/domain/drinkWindow'

describe('drinkStatus', () => {
  it('clasifica los cuatro estados en los bordes', () => {
    const w = { drinkFrom: 2020, drinkUntil: 2030 }
    expect(drinkStatus(w, 2019)).toBe('keep')
    expect(drinkStatus(w, 2020)).toBe('ready')
    expect(drinkStatus(w, 2030)).toBe('ready')
    expect(drinkStatus(w, 2031)).toBe('past')
    expect(drinkStatus({ drinkFrom: null, drinkUntil: 2030 }, 2026)).toBe('unknown')
    expect(drinkStatus({ drinkFrom: 2020, drinkUntil: null }, 2026)).toBe('unknown')
  })
})

describe('defaultWindow', () => {
  it('calcula la ventana por defecto y deja NV sin datos', () => {
    expect(defaultWindow(2019)).toEqual({ drinkFrom: 2022, drinkUntil: 2031 })
    expect(defaultWindow(null)).toEqual({ drinkFrom: null, drinkUntil: null })
  })
})
