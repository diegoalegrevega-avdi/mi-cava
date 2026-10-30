import type { WineType } from '@/db/schema'
import { geminiScan } from './gemini'

export interface LabelDraft {
  name?: string
  winery?: string
  vintage?: number | null
  region?: string
  country?: string
  varietals?: string[]
  type?: WineType | null
}

export interface LabelScanner {
  readonly enabled: boolean
  readonly reason?: string
  scan(file: File): Promise<LabelDraft>
}

export const NO_KEY_REASON = 'Añade una clave de Gemini en Ajustes para escanear etiquetas.'

export function getScanner(getKey: () => string | null, fetchImpl: typeof fetch = fetch): LabelScanner {
  const key = getKey()?.trim()
  if (!key) {
    return {
      enabled: false,
      reason: NO_KEY_REASON,
      scan: async () => {
        throw new Error(NO_KEY_REASON)
      },
    }
  }
  return { enabled: true, scan: (file) => geminiScan(file, key, fetchImpl) }
}
