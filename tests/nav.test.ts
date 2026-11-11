import { describe, expect, it } from 'vitest'
import { activeNav, screenRoute } from '@/nav'

describe('nav routing', () => {
  it('renders the 3D screen for #/cava3d but highlights the cava tab', () => {
    expect(screenRoute('#/cava3d')).toBe('cava3d')
    expect(activeNav('#/cava3d')).toBe('cava')
  })

  it('maps the tab routes to themselves', () => {
    expect(screenRoute('#/add')).toBe('add')
    expect(screenRoute('#/historial')).toBe('historial')
    expect(screenRoute('#/estadisticas')).toBe('stats')
    expect(screenRoute('#/ajustes')).toBe('ajustes')
    expect(screenRoute('#/cava')).toBe('cava')
  })

  it('falls back to the cellar', () => {
    expect(screenRoute('')).toBe('cava')
    expect(screenRoute('#/desconocido')).toBe('cava')
  })
})
