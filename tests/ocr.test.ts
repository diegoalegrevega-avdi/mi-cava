import { describe, expect, it, vi } from 'vitest'
import { createOcr, fitSize, NO_NETWORK_MESSAGE } from '@/services/ocr'

describe('fitSize', () => {
  it('deja la foto grande en 2400 px de lado mayor', () => {
    expect(fitSize(4000, 3000)).toEqual({ width: 2400, height: 1800 })
    expect(fitSize(3000, 4000)).toEqual({ width: 1800, height: 2400 })
  })

  it('amplía un recorte pequeño, que si no no se lee', () => {
    expect(fitSize(800, 600)).toEqual({ width: 1600, height: 1200 })
  })
})

describe('createOcr', () => {
  it('devuelve el texto y reporta progreso', async () => {
    const recognize = vi.fn(async () => ({ data: { text: 'RIOJA 2019' } }))
    const makeWorker = vi.fn(async () => ({ recognize, terminate: async () => undefined }))
    const ocr = createOcr({ makeWorker })
    const events: string[] = []
    expect((await ocr(new File(['x'], 'l.jpg'), (p) => events.push(p.status))).text).toBe('RIOJA 2019')
    expect(events[0]).toBe('reading')
    expect(makeWorker).toHaveBeenCalledTimes(1)
    await ocr(new File(['x'], 'l.jpg'))
    expect(makeWorker).toHaveBeenCalledTimes(1)
  })

  it('devuelve las líneas con su altura para poder ordenar la etiqueta', async () => {
    const recognize = vi.fn(async () => ({
      data: {
        text: 'MUGA\n2019',
        blocks: [
          {
            paragraphs: [
              {
                lines: [
                  { text: '2019', confidence: 90, bbox: { y0: 300, y1: 340 }, rowAttributes: { rowHeight: 40 } },
                  { text: 'MUGA', confidence: 95, bbox: { y0: 100, y1: 180 }, rowAttributes: { rowHeight: 80 } },
                ],
              },
            ],
          },
        ],
      },
    }))
    const ocr = createOcr({ makeWorker: async () => ({ recognize, terminate: async () => undefined }) })
    const { lines } = await ocr(new File(['x'], 'l.jpg'))
    expect(lines.map((l) => l.text)).toEqual(['MUGA', '2019'])
    expect(lines[0]).toMatchObject({ height: 80, y: 100 })
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
    expect((await ocr(new File(['x'], 'l.jpg'))).text).toBe('ok')
  })
})
