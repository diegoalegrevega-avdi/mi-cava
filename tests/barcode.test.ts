import { describe, expect, it, vi } from 'vitest'
import { barcodeSupported, detectBarcode } from '@/services/barcode'

describe('barcode', () => {
  it('no está soportado sin BarcodeDetector', async () => {
    expect(barcodeSupported(undefined)).toBe(false)
    expect(await detectBarcode(new File(['x'], 'b.jpg'), null)).toBeNull()
  })

  it('devuelve un EAN normalizado y descarta lecturas inválidas', async () => {
    const fake = { detect: vi.fn(async () => [{ rawValue: '8410 3021 06300' }]) }
    expect(await detectBarcode(new File(['x'], 'b.jpg'), fake)).toBe('8410302106300')
    const junk = { detect: vi.fn(async () => [{ rawValue: '123' }]) }
    expect(await detectBarcode(new File(['x'], 'b.jpg'), junk)).toBeNull()
    const broken = { detect: vi.fn(async () => { throw new Error('no') }) }
    expect(await detectBarcode(new File(['x'], 'b.jpg'), broken)).toBeNull()
  })
})