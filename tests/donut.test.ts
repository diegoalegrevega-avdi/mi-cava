import { describe, expect, it } from 'vitest'
import { donutPath, donutSegments } from '@/domain/donut'

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

describe('donutPath', () => {
  it('arranca en las 12 y encadena una porción con la siguiente', () => {
    const [a, b] = donutSegments({ tinto: 69, blanco: 31 })
    const da = donutPath(a!.startAngle, a!.endAngle)
    const db = donutPath(b!.startAngle, b!.endAngle)
    expect(da.startsWith('M 50 50 L 50.00 0.00')).toBe(true)
    const end = da.match(/A 50 50 0 \d 1 ([\d.]+) ([\d.]+) Z$/)
    expect(end).not.toBeNull()
    expect(db).toContain(`L ${end![1]} ${end![2]}`)
  })

  it('usa el arco largo solo cuando la porción pasa de media vuelta', () => {
    expect(donutPath(-90, 90)).toContain('A 50 50 0 0 1')
    expect(donutPath(-90, 91)).toContain('A 50 50 0 1 1')
  })
})