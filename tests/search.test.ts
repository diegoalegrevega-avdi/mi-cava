import { it, expect } from 'vitest'
import { filterWines } from '@/domain/search'

const base = {
  stock: 1,
  id: '1',
  vintage: 2019,
  varietals: ['Tempranillo'],
  location: 'Estante superior',
  notes: '',
  createdAt: '',
  updatedAt: '',
  type: 'tinto',
} as const

const wines = [
  { ...base, name: 'Viña Ardanza', winery: 'La Rioja Alta', region: 'Rioja' },
  {
    ...base,
    id: '2',
    name: 'Puligny-Montrachet',
    winery: 'Leflaive',
    region: 'Borgoña',
    varietals: ['Chardonnay'],
    type: 'blanco',
  },
] as never[]

it('encuentra sin acentos ni mayúsculas por nombre, bodega, uva y ubicación', () => {
  expect(filterWines(wines, 'ardanza')).toHaveLength(1)
  expect(filterWines(wines, 'leflaive')).toHaveLength(1)
  expect(filterWines(wines, 'tempranillo')).toHaveLength(1)
  expect(filterWines(wines, 'ESTANTE')).toHaveLength(2)
})

it('devuelve todo con consulta vacía y nada si no hay coincidencia', () => {
  expect(filterWines(wines, '   ')).toHaveLength(2)
  expect(filterWines(wines, 'zzz')).toHaveLength(0)
})
