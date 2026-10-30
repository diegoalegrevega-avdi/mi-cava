export interface OcrProgress {
  status: 'loading' | 'reading'
  progress: number
}

export type Ocr = (file: File, onProgress?: (p: OcrProgress) => void) => Promise<string>

export interface OcrWorker {
  recognize(image: Blob): Promise<{ data: { text: string } }>
  terminate(): Promise<unknown>
}

export const NO_NETWORK_MESSAGE =
  'La primera vez hay que descargar el lector (≈9 MB). Conecta a internet e inténtalo de nuevo.'

const GENERIC_MESSAGE = 'No se pudo preparar el lector de etiquetas.'

export function fitSize(width: number, height: number, max = 1600): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= max) return { width, height }
  const scale = max / longest
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export function createOcr(deps: { makeWorker?: () => Promise<OcrWorker> } = {}): Ocr {
  let worker: OcrWorker | null = null
  let report: ((p: OcrProgress) => void) | undefined

  const makeWorker =
    deps.makeWorker ??
    (async (): Promise<OcrWorker> => {
      const { createWorker } = await import('tesseract.js')
      return createWorker('spa+eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          report?.({
            status: m.status === 'recognizing text' ? 'reading' : 'loading',
            progress: typeof m.progress === 'number' ? m.progress : 0,
          })
        },
      })
    })

  return async (file, onProgress) => {
    report = onProgress
    let current = worker
    try {
      if (!current) {
        current = await makeWorker()
        worker = current
      }
      report?.({ status: 'reading', progress: 0 })
      const image = await shrink(file)
      const { data } = await current.recognize(image)
      return data.text
    } catch (error) {
      if (worker) {
        const broken = worker
        worker = null
        await broken.terminate().catch(() => undefined)
      }
      // Failing before a worker exists is almost always the model download.
      if (!current) throw new Error(NO_NETWORK_MESSAGE, { cause: error })
      const message = error instanceof Error ? error.message : ''
      throw new Error(/fetch|network|failed|load/i.test(message) ? NO_NETWORK_MESSAGE : GENERIC_MESSAGE, {
        cause: error,
      })
    } finally {
      report = undefined
    }
  }
}

async function shrink(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') return file
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = fitSize(bitmap.width, bitmap.height)
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()
    return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.9 })
  } catch {
    return file
  }
}
