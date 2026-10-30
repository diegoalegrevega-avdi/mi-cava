import type { WineType } from '@/db/schema'
import { geminiScan } from './gemini'
import { createOcr, type Ocr } from './ocr'
import { extractLabelFields, toLabelDraft, type DetectedField } from './labelFields'
import { type OcrProgress } from './ocr'

export interface LabelDraft {
  name?: string
  winery?: string
  vintage?: number | null
  region?: string
  country?: string
  varietals?: string[]
  type?: WineType | null
}

export interface LabelReading {
  text: string
  fields: DetectedField[]
  draft: LabelDraft
}

export function readGeminiKey(): string | null {
  const value = (globalThis as { localStorage?: Storage }).localStorage?.getItem('micava.geminiKey')
  return value ? value.trim() : null
}

export async function scanLabel(file: File, ocr?: Ocr, onProgress?: (p: OcrProgress) => void): Promise<LabelReading> {
  const engine = ocr ?? createOcr()
  const text = await engine(file, onProgress)
  const fields = extractLabelFields(text, new Date().getFullYear())
  return { text, fields, draft: toLabelDraft(fields) }
}

export async function geminiDraft(file: File, key: string, fetchImpl?: typeof fetch): Promise<LabelDraft> {
  return geminiScan(file, key, fetchImpl)
}