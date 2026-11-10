import { describe, expect, it } from 'vitest'
import { donutSegments } from '@/domain/donut'

describe('donutSegments', () => {
  it('un solo tipo -> círculo completo', () => {
    const segs = donutSegments({ tinto: 10, blanco: 0, rosado: 0, espumoso: 0, dulce: 0, fortificado: 0 })
    expect(segs).toHaveLength(1)
    expect(segs[0]?.type).toBe('tinto')
    expect(segs[0]?.percent).toBe(100)
    expect(segs[0]?.startAngle).toBe(-90)
    expect(segs[0]?.endAngle).toBe(270)
  })

  it('múltiples tipos con porcentajes correctos', () => {
    const segs = donutSegments({ tinto: 70, blanco: 20, rosado: 10, espumoso: 0, dulce: 0, fortificado: 0 })
    expect(segs).toHaveLength(3)
    expect(segs[0]?.type).toBe('tinto')
    expect(segs[0]?.percent).toBe(70)
    expect(segs[1]?.type).toBe('blanco')
    expect(segs[1]?.percent).toBe(20)
    expect(segs[2]?.type).toBe('rosado')
    expect(segs[2]?.percent).toBe(10)
    // Ángulos suman 360
    const sum = segs.reduce((a, s) => a + (s.endAngle - s.startAngle), 0)
    expect(Math.round(sum)).toBe(360)
  })

  it('incluye sinTipo al final', () => {
    const segs = donutSegments({ tinto: 50, sinTipo: 50, blanco: 0, rosado: 0, espumoso: 0, dulce: 0, fortificado: 0 })
    expect(segs).toHaveLength(2)
    expect(segs[0]?.type).toBe('tinto')
    expect(segs[1]?.type).toBe('sinTipo')
  })

  it('total cero -> array vacío', () => {
    expect(donutSegments({ tinto: 0, blanco: 0 })).toEqual([])
  })
})