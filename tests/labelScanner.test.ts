import { describe, expect, it, vi } from 'vitest'
import { scanLabel } from '@/services/labelScanner'

describe('scanLabel', () => {
  it('lee en local y devuelve texto, campos y borrador sin clave', async () => {
    const ocr = vi.fn(async () => 'BODEGAS MUGA\nRIOJA 2019\nTEMPRANILLO\nTINTO')
    const reading = await scanLabel(new File(['x'], 'l.jpg'), ocr)
    expect(reading.text).toContain('RIOJA')
    expect(reading.fields.map((f) => f.field)).toContain('region')
    expect(reading.draft).toMatchObject({ vintage: 2019, type: 'tinto', region: 'Rioja', winery: 'BODEGAS MUGA' })
  })

  it('devuelve un borrador vacío si el OCR no reconoce nada', async () => {
    const reading = await scanLabel(new File(['x'], 'l.jpg'), vi.fn(async () => '· · ·'))
    expect(reading.draft).toEqual({})
    expect(reading.fields).toEqual([])
  })
})