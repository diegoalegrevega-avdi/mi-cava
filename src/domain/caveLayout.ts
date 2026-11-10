import type { WineWithStock, WineType } from '@/db/schema'

export interface CaveConfig {
  depth: number
  width: number
  shelves: number
  fill: 'wine' | 'type'
}

export interface Cell {
  wineId: string | null
  wine?: WineWithStock
}

export type CaveGrid = Cell[][][]

export interface CaveLayoutResult {
  grid: CaveGrid
  overflow: Array<{ wineId: string; count: number }>
}

const MAX_CAPACITY = 320

const TYPE_ORDER: WineType[] = ['tinto', 'blanco', 'rosado', 'espumoso', 'dulce', 'fortificado']

function sortWinesByFill(wines: WineWithStock[], fill: 'wine' | 'type'): WineWithStock[] {
  if (fill === 'type') {
    return [...wines].sort((a, b) => {
      const ia = a.type ? TYPE_ORDER.indexOf(a.type) : TYPE_ORDER.length
      const ib = b.type ? TYPE_ORDER.indexOf(b.type) : TYPE_ORDER.length
      if (ia !== ib) return ia - ib
      return a.updatedAt < b.updatedAt ? 1 : -1
    })
  }
  return [...wines].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export function layoutCave(wines: WineWithStock[], config: CaveConfig): CaveLayoutResult {
  const { depth, width, shelves, fill } = config
  const capacity = depth * width * shelves
  const effectiveCapacity = Math.min(capacity, MAX_CAPACITY)

  const sorted = sortWinesByFill(wines.filter(w => w.stock > 0), fill)

  const grid: CaveGrid = Array.from({ length: shelves }, () =>
    Array.from({ length: depth }, () =>
      Array.from({ length: width }, () => ({ wineId: null as string | null }))
    )
  )

  const overflow: Array<{ wineId: string; count: number }> = []
  let placed = 0

  for (const wine of sorted) {
    let remaining = wine.stock
    while (remaining > 0 && placed < effectiveCapacity) {
      const shelf = Math.floor(placed / (depth * width))
      const posInShelf = placed % (depth * width)
      const d = Math.floor(posInShelf / width)
      const w = posInShelf % width

      if (shelf >= shelves) break

      grid[shelf]![d]![w] = { wineId: wine.id, wine }
      placed++
      remaining--
    }
    if (remaining > 0) {
      overflow.push({ wineId: wine.id, count: remaining })
    }
  }

  return { grid, overflow }
}