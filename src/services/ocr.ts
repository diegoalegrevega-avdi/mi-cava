export interface OcrProgress {
  status: 'loading' | 'reading'
  progress: number
}

/** A line of recognised text with the layout hints Tesseract gives us. */
export interface OcrLine {
  text: string
  /** Visual line height in pixels: bigger means more prominent on the label. */
  height: number
  /** Distance from the top of the image, used to order lines. */
  y: number
  confidence: number
}

export interface OcrResult {
  text: string
  lines: OcrLine[]
}

export type Ocr = (file: File, onProgress?: (p: OcrProgress) => void) => Promise<OcrResult>

interface RawLine {
  text: string
  confidence: number
  bbox: { y0: number; y1: number }
  rowAttributes?: { rowHeight: number }
}

interface RawBlock {
  paragraphs: Array<{ lines: RawLine[] }>
}

export interface OcrWorker {
  recognize(
    image: Blob,
    options?: unknown,
    output?: { blocks: boolean },
  ): Promise<{ data: { text: string; blocks?: RawBlock[] | null } }>
  terminate(): Promise<unknown>
}

export const NO_NETWORK_MESSAGE =
  'La primera vez hay que descargar el lector (≈9 MB). Conecta a internet e inténtalo de nuevo.'

const GENERIC_MESSAGE = 'No se pudo preparar el lector de etiquetas.'

/**
 * Labels need more pixels than 1600: thin serif strokes on a photo blur into mush.
 * Big photos are capped at 2400, small crops are doubled so the text is readable.
 */
export function fitSize(width: number, height: number, max = 2400): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest < 1000) {
    const scale = Math.min(2, max / longest)
    return { width: Math.round(width * scale), height: Math.round(height * scale) }
  }
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
      const image = await prepare(file)
      const { data } = await current.recognize(image, {}, { blocks: true })
      return { text: data.text, lines: readLines(data.blocks) }
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

function readLines(blocks: RawBlock[] | null | undefined): OcrLine[] {
  if (!blocks) return []
  const lines: OcrLine[] = []
  for (const block of blocks) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const text = line.text.trim()
        if (!text) continue
        lines.push({
          text,
          height: line.rowAttributes?.rowHeight ?? line.bbox.y1 - line.bbox.y0,
          y: line.bbox.y0,
          confidence: line.confidence,
        })
      }
    }
  }
  return lines.sort((a, b) => a.y - b.y)
}

/**
 * Grayscale + contrast stretch. A phone photo of a dark bottle has its real
 * information squeezed into ~80 grey levels; stretching them back to 0-255 is
 * what makes Tesseract stop inventing characters.
 */
async function prepare(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== 'function' || typeof OffscreenCanvas !== 'function') return file
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = fitSize(bitmap.width, bitmap.height)
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const image = context.getImageData(0, 0, width, height)
    const pixels = image.data
    const histogram = new Uint32Array(256)
    for (let i = 0; i < pixels.length; i += 4) {
      const red = pixels[i] ?? 0
      const green = pixels[i + 1] ?? 0
      const blue = pixels[i + 2] ?? 0
      const grey = (red * 0.299 + green * 0.587 + blue * 0.114) | 0
      pixels[i] = pixels[i + 1] = pixels[i + 2] = grey
      histogram[grey] = (histogram[grey] ?? 0) + 1
    }

    const total = pixels.length / 4
    const low = percentile(histogram, total, 0.02, 1)
    const high = percentile(histogram, total, 0.02, -1)
    const span = Math.max(1, high - low)
    const lut = new Uint8ClampedArray(256)
    for (let v = 0; v < 256; v += 1) lut[v] = ((v - low) * 255) / span
    for (let i = 0; i < pixels.length; i += 4) {
      const grey = lut[pixels[i] ?? 0] ?? 0
      pixels[i] = pixels[i + 1] = pixels[i + 2] = grey
    }

    context.putImageData(image, 0, 0)
    return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.95 })
  } catch {
    return file
  }
}

function percentile(histogram: Uint32Array, total: number, fraction: number, direction: 1 | -1): number {
  const target = total * fraction
  let seen = 0
  for (let step = 0; step < 256; step += 1) {
    const value = direction === 1 ? step : 255 - step
    seen += histogram[value] ?? 0
    if (seen >= target) return value
  }
  return direction === 1 ? 0 : 255
}
