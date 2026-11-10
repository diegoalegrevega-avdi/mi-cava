import type { WineType } from '@/db/schema'

export const TYPE_LABEL: Record<WineType, string> = {
  tinto: 'Tinto',
  blanco: 'Blanco',
  rosado: 'Rosado',
  espumoso: 'Espumoso',
  dulce: 'Dulce',
  fortificado: 'Fortificado',
}

export const TYPE_COLOR: Record<WineType, string> = {
  tinto: '#7a2233',
  blanco: '#c2a369',
  rosado: '#d48a8a',
  espumoso: '#a8c4e8',
  dulce: '#e8c4a8',
  fortificado: '#8a6d2f',
}

export const SIN_TIPO_LABEL = 'Sin tipo'
export const SIN_TIPO_COLOR = '#6b625a'

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