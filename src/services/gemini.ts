import type { WineType } from '@/db/schema'
import type { LabelDraft } from './labelScanner'

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
const PROMPT = 'Lee la etiqueta de esta botella de vino y devuelve los datos en JSON. Deja vacío lo que no se lea.'
const TYPES: WineType[] = ['tinto', 'blanco', 'rosado', 'espumoso', 'dulce', 'fortificado']

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING' },
    winery: { type: 'STRING' },
    vintage: { type: 'INTEGER' },
    region: { type: 'STRING' },
    country: { type: 'STRING' },
    varietals: { type: 'ARRAY', items: { type: 'STRING' } },
    type: { type: 'STRING', enum: TYPES },
  },
}

async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function text(value: unknown): string | undefined {
  const trimmed = typeof value === 'string' ? value.trim() : ''
  return trimmed ? trimmed : undefined
}

function toDraft(raw: Record<string, unknown>): LabelDraft {
  const draft: LabelDraft = {}
  for (const field of ['name', 'winery', 'region', 'country'] as const) {
    const value = text(raw[field])
    if (value) draft[field] = value
  }
  const vintage = typeof raw.vintage === 'number' && Number.isInteger(raw.vintage) ? raw.vintage : null
  if (vintage) draft.vintage = vintage
  const varietals = Array.isArray(raw.varietals) ? raw.varietals.map(text).filter((v): v is string => Boolean(v)) : []
  if (varietals.length > 0) draft.varietals = varietals
  const type = TYPES.find((t) => t === raw.type)
  if (type) draft.type = type
  return draft
}

export async function geminiScan(file: File, key: string, fetchImpl: typeof fetch = fetch): Promise<LabelDraft> {
  const response = await fetchImpl(`${ENDPOINT}?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: file.type || 'image/jpeg', data: await toBase64(file) } },
          ],
        },
      ],
      generationConfig: { responseMimeType: 'application/json', responseSchema: RESPONSE_SCHEMA },
    }),
  })

  if (response.status === 401 || response.status === 403) {
    throw new Error('La clave de Gemini no es válida. Revísala en Ajustes.')
  }
  if (response.status === 429) throw new Error('Cuota de Gemini agotada. Prueba más tarde.')
  if (!response.ok) throw new Error(`No se pudo escanear la etiqueta (${response.status}).`)

  const body = (await response.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const payload = body.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  try {
    return toDraft(JSON.parse(payload) as Record<string, unknown>)
  } catch {
    throw new Error('El escáner devolvió una respuesta ilegible. Prueba otra foto.')
  }
}
