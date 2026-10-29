export type WineType = 'tinto' | 'blanco' | 'rosado' | 'espumoso' | 'dulce' | 'fortificado'

export type EventKind = 'add' | 'consume' | 'import' | 'undo'

export interface Wine {
  id: string
  name: string
  winery: string
  vintage: number | null
  region: string
  country: string
  varietals: string[]
  type: WineType | null
  purchasedAt: string | null
  priceCents: number | null
  location: string
  drinkFrom: number | null
  drinkUntil: number | null
  notes: string
  createdAt: string
  updatedAt: string
}

export interface StockEvent {
  id: string
  wineId: string
  delta: number
  kind: EventKind
  at: string
  note?: string
  undoOf?: string
}

export interface WineWithStock extends Wine {
  stock: number
}

export interface WineDraft extends Omit<Wine, 'id' | 'createdAt' | 'updatedAt'> {
  stock?: number
}

export interface CellarBundle {
  schemaVersion: 1
  exportedAt: string
  app: 'mi-cava'
  wines: (Wine & { stock: number; history: string[] })[]
  events: StockEvent[]
}
