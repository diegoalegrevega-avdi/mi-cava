import type { WineType } from '@/db/schema'

export const TYPE_LABEL: Record<WineType, string> = {
  tinto: 'Tinto',
  blanco: 'Blanco',
  rosado: 'Rosado',
  espumoso: 'Espumoso',
  dulce: 'Dulce',
  fortificado: 'Fortificado',
}

// Vivid palette: readable on both the cream (light) and near-black (dark) surfaces.
export const TYPE_COLOR: Record<WineType, string> = {
  tinto: '#c4163f',
  blanco: '#e9b42e',
  rosado: '#ff9b7a',
  espumoso: '#3fb8d4',
  dulce: '#b07ce8',
  fortificado: '#8b4a2f',
}

export const SIN_TIPO_LABEL = 'Sin tipo'
export const SIN_TIPO_COLOR = '#8a8078'

export const DONUT_RADIUS = 50
const CENTER = 50

function polar(deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180
  return [CENTER + DONUT_RADIUS * Math.cos(rad), CENTER + DONUT_RADIUS * Math.sin(rad)]
}

/** SVG slice path for the 100×100 donut viewBox. Angles: -90 is 12 o'clock, growing clockwise. */
export function donutPath(startAngle: number, endAngle: number): string {
  const [x0, y0] = polar(startAngle)
  const [x1, y1] = polar(endAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${CENTER} ${CENTER} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${DONUT_RADIUS} ${DONUT_RADIUS} 0 ${largeArc} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`
}

export type DonutType = WineType | 'sinTipo'

export function donutSegments(
  counts: Record<string, number>
): Array<{
  type: DonutType
  count: number
  percent: number
  color: string
  startAngle: number
  endAngle: number
}> {
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0)
  if (total === 0) return []

  const types: DonutType[] = [
    'tinto',
    'blanco',
    'rosado',
    'espumoso',
    'dulce',
    'fortificado',
    'sinTipo',
  ]

  const segments: Array<{
    type: DonutType
    count: number
    percent: number
    color: string
    startAngle: number
    endAngle: number
  }> = []

  let currentAngle = -90 // Start at top

  for (const type of types) {
    const count = counts[type] || 0
    if (count === 0) continue

    const percent = (count / total) * 100
    const angle = (count / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle

    const color = type === 'sinTipo' ? SIN_TIPO_COLOR : TYPE_COLOR[type as WineType]

    segments.push({
      type,
      count,
      percent: Math.round(percent * 10) / 10,
      color,
      startAngle,
      endAngle,
    })

    currentAngle = endAngle
  }

  // If only one segment, make it a full circle
  if (segments.length === 1) {
    segments[0]!.startAngle = -90
    segments[0]!.endAngle = 270
  }

  return segments
}