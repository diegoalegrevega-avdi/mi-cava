import { normalizeBarcode } from '@/services/openfoodfacts'

export interface BarcodeDetectorLike {
  detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>>
}

type DetectorCtor = new (options: { formats: string[] }) => BarcodeDetectorLike

export function barcodeSupported(detector: unknown = (globalThis as { BarcodeDetector?: unknown }).BarcodeDetector): boolean {
  return typeof detector === 'function'
}

export async function detectBarcode(file: File, detector?: BarcodeDetectorLike | null): Promise<string | null> {
  const ctor = (globalThis as { BarcodeDetector?: DetectorCtor }).BarcodeDetector
  const reader =
    detector === undefined
      ? barcodeSupported(ctor)
        ? new ctor({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })
        : null
      : detector
  if (!reader) return null
  try {
    // shortcut: without createImageBitmap (tests, old Safari) the blob goes straight to the detector
    const bitmap = typeof createImageBitmap === 'function' ? await createImageBitmap(file) : file
    const [first] = await reader.detect(bitmap)
    return first ? normalizeBarcode(first.rawValue) : null
  } catch {
    return null
  }
}
