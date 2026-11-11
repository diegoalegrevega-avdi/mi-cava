import { describe, expect, it, vi } from 'vitest'
import { scanLabel } from '@/services/labelScanner'

describe('scanLabel', () => {
  it('lee en local y devuelve texto, campos y borrador sin clave', async () => {
    const ocr = vi.fn(async () => ({ text: 'BODEGAS MUGA\nRIOJA 2019\nTEMPRANILLO\nTINTO', lines: [] }))
    const reading = await scanLabel(new File(['x'], 'l.jpg'), ocr)
    expect(reading.text).toContain('RIOJA')
    expect(reading.fields.map((f) => f.field)).toContain('region')
    expect(reading.draft).toMatchObject({ vintage: 2019, type: 'tinto', region: 'Rioja', winery: 'BODEGAS MUGA' })
  })

  it('usa el tamaño de línea para sacar el nombre de la etiqueta', async () => {
    const ocr = vi.fn(async () => ({
      text: 'MUGA\nReserva 2019\nRIOJA\nCONTIENE SULFITOS',
      lines: [
        { text: 'MUGA', height: 90, y: 20, confidence: 95 },
        { text: 'Reserva 2019', height: 44, y: 130, confidence: 92 },
        { text: 'RIOJA', height: 30, y: 200, confidence: 90 },
        { text: 'CONTIENE SULFITOS', height: 22, y: 400, confidence: 88 },
      ],
    }))
    const reading = await scanLabel(new File(['x'], 'l.jpg'), ocr)
    expect(reading.draft.name).toBe('MUGA')
    expect(reading.draft.winery).toBeUndefined()
  })

  it('devuelve un borrador vacío si el OCR no reconoce nada', async () => {
    const reading = await scanLabel(new File(['x'], 'l.jpg'), vi.fn(async () => ({ text: '· · ·', lines: [] })))
    expect(reading.draft).toEqual({})
    expect(reading.fields).toEqual([])
  })
})
