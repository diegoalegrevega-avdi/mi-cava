import { it, expect } from 'vitest'
import { normalize } from '@/domain/normalize'

it('quita acentos, mayúsculas y espacios sobrantes', () => {
  expect(normalize('  Riója  Reserva ')).toBe('rioja reserva')
  expect(normalize('Château Margaux')).toBe('chateau margaux')
  expect(normalize('Müller-Thurgau')).toBe('muller thurgau')
})
