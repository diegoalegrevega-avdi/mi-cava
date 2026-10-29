import Dexie, { type Table } from 'dexie'
import type { StockEvent, Wine } from './schema'

export class CellarDb extends Dexie {
  wines!: Table<Wine, string>
  events!: Table<StockEvent, string>

  constructor() {
    super('mi-cava')
    this.version(1).stores({
      wines: 'id, name, updatedAt, vintage',
      events: 'id, wineId, at, undoOf, [wineId+at]',
    })
  }
}

export const db = new CellarDb()
