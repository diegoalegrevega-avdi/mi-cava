import { describe, expect, it, vi } from 'vitest'
import { createOcr, fitSize, NO_NETWORK_MESSAGE } from '@/services/ocr'

describe('fitSize', () => {
  it('reduce una foto de 12 MP a 1600 px de lado mayor', () => {
    expect(fitSize(4000, 3000)).toEqual({ width: 1600, height: 1200 })
    expect(fitSize(3000, 4000)).toEqual({ width: 1200, height: 1600 })
  })

  it('no amplía una imagen pequeña', () => {
    expect(fitSize(800, 600)).toEqual({ width: 800, height: 600 })
  })
})

describe('createOcr', () => {
  it('devuelve el texto y reporta progreso', async () => {
    const recognize = vi.fn(async () => ({ data: { text: 'RIOJA 2019' } }))
    const makeWorker = vi.fn(async () => ({ recognize, terminate: async () => undefined }))
    const ocr = createOcr({ makeWorker })
    const events: string[] = []
    expect(await ocr(new File(['x'], 'l.jpg'), (p) => events.push(p.status))).toBe('RIOJA 2019')
    expect(events[0]).toBe('reading')
    expect(makeWorker).toHaveBeenCalledTimes(1)
    await ocr(new File(['x'], 'l.jpg'))
    expect(makeWorker).toHaveBeenCalledTimes(1)
  })

  it('traduce un fallo de descarga a un mensaje accionable', async () => {
    const makeWorker = vi.fn(async () => {
      throw new TypeError('Failed to fetch')
    })
    await expect(createOcr({ makeWorker })(new File(['x'], 'l.jpg'))).rejects.toThrow(NO_NETWORK_MESSAGE)
  })

  it('descarta el worker roto para que el siguiente intento empiece de cero', async () => {
    const makeWorker = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('boom'))
      .mockResolvedValueOnce({ recognize: async () => ({ data: { text: 'ok' } }), terminate: async () => undefined })
    const ocr = createOcr({ makeWorker })
    await expect(ocr(new File(['x'], 'l.jpg'))).rejects.toThrow(NO_NETWORK_MESSAGE)
    expect(await ocr(new File(['x'], 'l.jpg'))).toBe('ok')
  })
})
