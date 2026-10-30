import { describe, expect, it, vi } from 'vitest'
import { getScanner } from '@/services/labelScanner'
import { mockScan } from '@/services/mockScanner'

describe('label scanner', () => {
  it('sin clave el escáner está desactivado y no llama a la red', async () => {
    const scanner = getScanner(() => null)
    expect(scanner.enabled).toBe(false)
    await expect(scanner.scan(new File(['x'], 'l.jpg'))).rejects.toThrow(/clave/i)
  })

  it('con clave llama a Gemini y mapea la respuesta, ignorando campos vacíos', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: '{"name":"Rioja Reserva","vintage":2016,"winery":"","region":"Rioja"}',
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200 },
        ),
    )
    const scanner = getScanner(() => 'k', fetchImpl as unknown as typeof fetch)
    expect(await scanner.scan(new File(['x'], 'l.jpg'))).toEqual({
      name: 'Rioja Reserva',
      vintage: 2016,
      region: 'Rioja',
    })
    expect(fetchImpl).toHaveBeenCalledOnce()
  })

  it('mock autocompleta un borrador plausible', async () => {
    expect((await mockScan(new File(['x'], 'l.jpg'))).name).toBeTruthy()
  })
})
