# Escáner local con Tesseract y Open Food Facts — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Leer etiquetas de vino en el propio dispositivo con Tesseract.js, rellenar los huecos del formulario Añadir y completar nombre y bodega desde Open Food Facts por código de barras.

**Architecture:** Cinco módulos de servicio con responsabilidades separadas —motor OCR, extracción de campos, código de barras, cliente de Open Food Facts y orquestación— y dos componentes de interfaz dentro de la pantalla Añadir. Todo lo que se puede probar sin navegador (extracción, mapeo, validación de EAN, reducción de tamaño) es una función pura; sólo `ocr.ts` toca WASM y sólo `LabelScannerField.tsx` toca la cámara.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Tailwind 4, Vitest 5, `tesseract.js@^7.0.0` (única dependencia nueva).

**Spec:** `docs/superpowers/specs/2026-10-30-ocr-openfood-design.md`

## Global Constraints

- PowerShell: usar siempre `npm.cmd`, nunca `npm`.
- `tesseract.js@^7.0.0` es la única dependencia nueva. Prohibido añadir jsdom, Playwright, librerías de códigos de barras o de imágenes.
- Ninguna función ni pantalla nueva puede exigir una clave de Gemini. Sin clave, el escáner funciona entero en local.
- Solo se rellenan campos vacíos: el relleno pasa por `applyDraft` de `WineForm.tsx`, sin tocarlo.
- La foto no se persiste en ningún sitio: ni IndexedDB, ni exportación, ni miniaturas.
- Open Food Facts aporta solo `name` y `winery`. Nunca país, añada, precio ni variedades.
- Los modelos y el núcleo de Tesseract no entran en el precache: se cargan del CDN con `import()` dinámico y caché de runtime.
- Textos de interfaz en español, botones de 44 px mínimo, tokens de color existentes (`text-wine` para errores, `text-muted` para ayuda).
- Bundle inicial ≤ 130 kB gzip (hoy 123 kB). `npm.cmd run build` debe seguir pasando.

## Review Focus

1. **Foto de móvil de 12 MP:** la lectura debe tardar segundos, no decenas, y no tumbar el worker. Test: `fitSize` en `tests/ocr.test.ts` (Tarea 3).
2. **Códigos de barras sucios** (`8410 3021 06300`, `036000291452`, dígito de control falso): o se normalizan al EAN correcto o se rechazan, nunca se consulta un código inválido. Test: `tests/openfoodfacts.test.ts` (Tarea 2).
3. **Etiquetas con ruido** (`CAVA`, `Reserva`, `2.019`, un año 1899): no deben producir campos falsos ni un tipo equivocado. Test: `tests/labelFields.test.ts` (Tarea 1).
4. **Producto de Open Food Facts que no es vino:** no se rellena nada. Test: `tests/openfoodfacts.test.ts` (Tarea 2).
5. **Primera lectura sin red:** mensaje accionable, formulario intacto y escribible a mano. Test: `tests/ocr.test.ts` + humo en navegador (Tareas 3 y 6).

---

### Task 1: Extracción de campos desde el texto

**Files:**
- Create: `src/services/labelFields.ts`
- Test: `tests/labelFields.test.ts`

**Interfaces:**
- Consumes: `WineType` de `@/db/schema`; `LabelDraft` de `@/services/labelScanner`.
- Produces:
  - `type FieldConfidence = 'alta' | 'media'`
  - `interface DetectedField { field: 'vintage' | 'type' | 'region' | 'country' | 'varietals' | 'winery'; value: number | WineType | string | string[]; confidence: FieldConfidence; label: string }` (`label` es el texto ya formateado para el chip, p. ej. `'Añada 2019'`, `'Rioja'`, `'Tempranillo, Graciano'`)
  - `extractLabelFields(text: string, currentYear: number): DetectedField[]` — como mucho uno por campo, nunca `name`
  - `toLabelDraft(fields: DetectedField[]): LabelDraft`

- [ ] **Step 1: Escribir el test**

```ts
import { describe, expect, it } from 'vitest'
import { extractLabelFields, toLabelDraft } from '@/services/labelFields'

const byField = (text: string, year = 2026) =>
  Object.fromEntries(extractLabelFields(text, year).map((f) => [f.field, f.value]))

describe('extractLabelFields', () => {
  it('lee una etiqueta completa y no inventa el nombre', () => {
    const text = 'BODEGAS MUGA\nRESERVA 2019\nRIOJA\nTEMPRANILLO, GRACIANO Y MAZUELO\nTINTO'
    expect(byField(text)).toEqual({
      vintage: 2019,
      type: 'tinto',
      region: 'Rioja',
      country: 'España',
      varietals: ['tempranillo', 'graciano', 'mazuelo'],
      winery: 'BODEGAS MUGA',
    })
    expect(extractLabelFields(text, 2026).some((f) => f.field === ('name' as never))).toBe(false)
  })

  it('entiende 2.019 y descarta años imposibles', () => {
    expect(byField('RESERVA 2.019')).toMatchObject({ vintage: 2019 })
    expect(byField('COSECHA 1899')).not.toHaveProperty('vintage')
    expect(byField('COSECHA 2099')).not.toHaveProperty('vintage')
  })

  it('acepta regiones sin tilde y devuelve la forma canónica con país', () => {
    expect(byField('RIAS BAIXAS')).toMatchObject({ region: 'Rías Baixas', country: 'España' })
  })

  it('trata CAVA como tipo espumoso, no como región', () => {
    const fields = byField('CAVA BRUT NATURE')
    expect(fields).toMatchObject({ type: 'espumoso' })
    expect(fields).not.toHaveProperty('region')
  })

  it('no confunde palabras de la etiqueta con la bodega', () => {
    expect(byField('RESERVA\n2019\nTINTO')).not.toHaveProperty('winery')
    expect(byField('BODEGAS MUGA')).toMatchObject({ winery: 'BODEGAS MUGA' })
  })

  it('devuelve lista vacía con texto sin datos', () => {
    expect(extractLabelFields('', 2026)).toEqual([])
    expect(extractLabelFields('la la la', 2026)).toEqual([])
  })

  it('toLabelDraft omite lo que no hay', () => {
    expect(toLabelDraft([])).toEqual({})
    expect(toLabelDraft(extractLabelFields('RIOJA 2019 TINTO', 2026))).toMatchObject({
      vintage: 2019,
      type: 'tinto',
      region: 'Rioja',
    })
  })
})
```

- [ ] **Step 2: Verificar el fallo**

Run: `npm.cmd test tests/labelFields.test.ts`
Expected: FAIL con "Failed to resolve import \"@/services/labelFields\"".

- [ ] **Step 3: Implementar**

Listas cerradas en el módulo (normalizadas sin acentos para comparar):

- `REGIONS: Array<{ name: string; country: string }>` — mínimo: Rioja, Rioja Alavesa, Ribera del Duero, Rías Baixas, Rueda, Priorat, Penedès, Jerez, Jumilla, Toro, Bierzo, Navarra, Somontano, Montsant, Campo de Borja, Cariñena, Valdepeñas, La Mancha, Utiel-Requena, Alicante, Yecla, Txakoli, Valdeorras, Ribeiro, Monterrei (España); Burdeos, Borgoña, Champaña, Loira, Alsacia, Ródano, Provenza, Beaujolais (Francia); Toscana, Chianti, Barolo, Piamonte, Véneto, Sicilia, Puglia (Italia); Duero, Alentejo, Vinho Verde, Dão (Portugal); Mosel, Rheingau (Alemania); Mendoza (Argentina); Maipo, Colchagua (Chile); Napa (Estados Unidos); Barossa (Australia); Stellenbosch (Sudáfrica); Marlborough (Nueva Zelanda).
- `GRAPES: string[]` — tempranillo, garnacha, garnacha tintorera, graciano, mazuelo, monastrell, bobal, mencía, albariño, godello, treixadura, verdejo, viura, macabeo, xarel·lo, parellada, chardonnay, sauvignon blanc, semillón, riesling, gewürztraminer, merlot, cabernet sauvignon, cabernet franc, syrah, petit verdot, malbec, pinot noir, nebbiolo, sangiovese, palomino, pedro ximénez, moscatel, airén.
- `TYPE_WORDS: Array<[RegExp, WineType]>` — tinto/red; blanco/white; rosado/rosé/rose; espumoso/brut/cava/champagne/champaña/sparkling/prosecco; dulce/sweet/moscatel/vendimia tardía; fortificado/jerez/sherry/oporto/port/madeira/marsala/vermut.
- `NOISE` — reserva, gran reserva, crianza, joven, selección, cosecha, botella, vino, wine, brut, nature, 750ml.

`extractLabelFields`: normaliza el texto con `normalize()` de `@/domain/normalize` para comparar y conserva las líneas originales para la bodega. Añada: junta dígitos separados por punto o espacio (`2.019` → `2019`), busca `\b(19\d{2}|20\d{2})\b`, filtra `1900..currentYear+1`, prefiere la línea que contenga `año|cosecha|vintage|reserva|crianza`; confianza `alta` si el año está solo en su línea, `media` si comparte línea. Región y país: primera coincidencia de `REGIONS` por palabra completa sobre el texto normalizado. Tipo: primera coincidencia de `TYPE_WORDS` en el texto normalizado, `alta`. Variedades: todas las de `GRAPES` presentes por palabra completa, en el orden de aparición, sin duplicados. Bodega: línea que empiece por `bodegas?|cellers?|cellars?|winery|château|chateau|domaine|casa|viña|vina|bodega` → se queda la línea completa recortada, confianza `alta`; si no, una línea íntegramente en mayúsculas de 4 a 40 letras que no sea ruido, año, región, tipo ni variedad → confianza `media`. `label` se construye aquí (`Añada 2019`, `Tinto`, nombre de región, país, variedades unidas por coma, nombre de la bodega).

- [ ] **Step 4: Verificar que pasa**

Run: `npm.cmd test tests/labelFields.test.ts && npm.cmd run typecheck`
Expected: PASS y 0 errores.

- [ ] **Step 5: Commit**

```bash
git add src/services/labelFields.ts tests/labelFields.test.ts
git commit -m "feat: extract wine fields from label text"
```

---

### Task 2: Cliente de Open Food Facts

**Files:**
- Create: `src/services/openfoodfacts.ts`
- Test: `tests/openfoodfacts.test.ts`

**Interfaces:**
- Consumes: `LabelDraft` de `@/services/labelScanner`.
- Produces:
  - `interface OffProduct { code: string; name: string; brand: string; country: string; isWine: boolean }`
  - `normalizeBarcode(raw: string): string | null`
  - `lookupBarcode(ean: string, fetchImpl?: typeof fetch): Promise<OffProduct | null>` — `null` si no existe o no es un EAN válido; lanza `Error('No se pudo consultar Open Food Facts. ¿Tienes conexión?')` si la red falla
  - `toOffDraft(product: OffProduct): LabelDraft`
  - `OFF_ATTRIBUTION = 'Datos de Open Food Facts'` y `OFF_URL = 'https://world.openfoodfacts.org'`

- [ ] **Step 1: Escribir el test**

```ts
import { describe, expect, it, vi } from 'vitest'
import { lookupBarcode, normalizeBarcode, toOffDraft } from '@/services/openfoodfacts'

const wine = {
  status: 1,
  product: {
    code: '8410302106300',
    product_name: 'Campo Viejo Rioja tempranillo',
    brands: 'Campo Viejo, Compañía',
    countries_tags: ['en:australia'],
    categories_tags: ['en:alcoholic-beverages', 'en:wines'],
  },
}

describe('normalizeBarcode', () => {
  it('limpia espacios, guiones y valida el dígito de control', () => {
    expect(normalizeBarcode('8410 3021 06300')).toBe('8410302106300')
    expect(normalizeBarcode('8410-3021-06300')).toBe('8410302106300')
    expect(normalizeBarcode('8410302106301')).toBeNull()
    expect(normalizeBarcode('abc')).toBeNull()
  })

  it('convierte un UPC-A de 12 dígitos en EAN-13', () => {
    expect(normalizeBarcode('036000291452')).toBe('0036000291452')
  })
})

describe('lookupBarcode', () => {
  it('devuelve nombre, marca y país de origen dudoso, sin aplicarlo', () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(wine), { status: 200 }))
    const product = await lookupBarcode('8410302106300', fetchImpl as unknown as typeof fetch)
    expect(product).toMatchObject({ name: 'Campo Viejo Rioja tempranillo', brand: 'Campo Viejo', isWine: true })
    expect(toOffDraft(product!)).toEqual({ name: 'Campo Viejo Rioja tempranillo', winery: 'Campo Viejo' })
  })

  it('marca como no vino un producto de otra categoría', async () => {
    const other = { status: 1, product: { code: '1', product_name: 'Maíz', brands: 'Mercadona', categories_tags: ['en:seeds'] } }
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(other), { status: 200 }))
    expect((await lookupBarcode('8410302106300', fetchImpl as unknown as typeof fetch))?.isWine).toBe(false)
  })

  it('devuelve null si no existe y lanza mensaje legible sin red', async () => {
    const missing = vi.fn(async () => new Response(JSON.stringify({ status: 0 }), { status: 200 }))
    expect(await lookupBarcode('8410302106300', missing as unknown as typeof fetch)).toBeNull()
    const down = vi.fn(async () => { throw new TypeError('Failed to fetch') })
    await expect(lookupBarcode('8410302106300', down as unknown as typeof fetch)).rejects.toThrow(/conexión/i)
  })
})
```

- [ ] **Step 2: Verificar el fallo**

Run: `npm.cmd test tests/openfoodfacts.test.ts`
Expected: FAIL "Failed to resolve import".

- [ ] **Step 3: Implementar**

`normalizeBarcode`: quita todo lo que no sea dígito; `8`, `12`, `13` o `14` caracteres; un `14` que empiece por `0` se recorta a 13; un `12` se prefija con `0`; el dígito de control se valida con el módulo 10 estándar (pesos 1 y 3 desde la derecha). Cualquier otro tamaño o control inválido → `null`.

`lookupBarcode`: `GET https://world.openfoodfacts.org/api/v2/product/{ean}.json?fields=code,product_name,brands,countries_tags,categories_tags`; `!res.ok` → para `404` devuelve `null` y para el resto lanza el error de conexión. `status !== 1` o sin `product` → `null`. `brand = brands.split(',')[0].trim()`. `country = COUNTRY_ES[countries_tags[0]] ?? ''` con un mapa mínimo (spain, france, italy, portugal, germany…); solo se guarda para el aviso, no se aplica. `isWine = categories_tags.includes('en:wines')`. Un `fetch` rechazado se convierte en el `Error` de conexión; un JSON ilegible también.

`toOffDraft`: incluye `name` y `winery` solo si no están vacíos; nunca `country`.

- [ ] **Step 4: Verificar que pasa**

Run: `npm.cmd test tests/openfoodfacts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/openfoodfacts.ts tests/openfoodfacts.test.ts
git commit -m "feat: Open Food Facts barcode lookup"
```

---

### Task 3: Motor OCR con reducción de imagen

**Files:**
- Create: `src/services/ocr.ts`
- Modify: `package.json` (dependencia nueva)
- Test: `tests/ocr.test.ts`

**Interfaces:**
- Produces:
  - `interface OcrProgress { status: 'loading' | 'reading'; progress: number }` (`0..1`)
  - `type Ocr = (file: File, onProgress?: (p: OcrProgress) => void) => Promise<string>`
  - `fitSize(width: number, height: number, max?: number): { width: number; height: number }` — `max` por defecto 1600, nunca amplía
  - `createOcr(deps?: { makeWorker?: () => Promise<OcrWorker> }): Ocr`
  - `interface OcrWorker { recognize(image: Blob): Promise<{ data: { text: string } }>; terminate(): Promise<void> }`
  - `NO_NETWORK_MESSAGE = 'La primera vez hay que descargar el lector (≈9 MB). Conecta a internet e inténtalo de nuevo.'`

- [ ] **Step 1: Escribir el test**

```ts
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
    expect(makeWorker).toHaveBeenCalledTimes(1) // worker reutilizado
  })

  it('traduce un fallo de descarga a un mensaje accionable', async () => {
    const makeWorker = vi.fn(async () => { throw new TypeError('Failed to fetch') })
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
```

- [ ] **Step 2: Verificar el fallo**

Run: `npm.cmd test tests/ocr.test.ts`
Expected: FAIL "Failed to resolve import".

- [ ] **Step 3: Instalar y implementar**

```bash
npm.cmd install tesseract.js@^7.0.0
```

`createOcr`: worker perezoso en una variable de módulo; `makeWorker` por defecto importa `tesseract.js` con `await import('tesseract.js')` y hace `createWorker('spa+eng', 1, { logger })`, guardando el `onProgress` vigente para mapear `status: 'recognizing text'` → `reading` con su `progress`, y el resto de estados → `loading`. Antes de reconocer, reduce la imagen: `createImageBitmap(file)`, `fitSize`, `OffscreenCanvas` (o `<canvas>`) y `convertToBlob`/`toBlob` a `image/jpeg` con calidad 0,9; si el navegador no tiene `createImageBitmap`, se pasa el `File` original. En caso de error: `terminate()` best-effort, worker a `null`, y se lanza `new Error(NO_NETWORK_MESSAGE)` si el mensaje contiene `fetch|network|Failed|load`, o `new Error('No se pudo preparar el lector de etiquetas.')` en cualquier otro caso.

- [ ] **Step 4: Verificar que pasa**

Run: `npm.cmd test tests/ocr.test.ts && npm.cmd run typecheck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/services/ocr.ts tests/ocr.test.ts
git commit -m "feat: on-device Tesseract engine with downscaled images"
```

---

### Task 4: Lectura del código de barras

**Files:**
- Create: `src/services/barcode.ts`
- Test: `tests/barcode.test.ts`

**Interfaces:**
- Consumes: `normalizeBarcode` de `@/services/openfoodfacts` (Tarea 2).
- Produces:
  - `barcodeSupported(detector?: unknown): boolean`
  - `detectBarcode(file: File, detector?: BarcodeDetectorLike | null): Promise<string | null>`
  - `interface BarcodeDetectorLike { detect(source: ImageBitmapSource): Promise<Array<{ rawValue: string }>> }`

- [ ] **Step 1: Escribir el test**

```ts
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
```

- [ ] **Step 2: Verificar el fallo**

Run: `npm.cmd test tests/barcode.test.ts`
Expected: FAIL "Failed to resolve import".

- [ ] **Step 3: Implementar**

`barcodeSupported(detector = globalThis.BarcodeDetector)` devuelve `typeof detector === 'function'`. `detectBarcode` usa el detector inyectado o construye uno con `{ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] }`; decodifica la imagen con `createImageBitmap(file)` y devuelve `normalizeBarcode(rawValue)` del primer resultado válido; cualquier excepción → `null` (nunca rompe el formulario).

- [ ] **Step 4: Verificar que pasa**

Run: `npm.cmd test tests/barcode.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/barcode.ts tests/barcode.test.ts
git commit -m "feat: barcode detection with graceful fallback"
```

---

### Task 5: Orquestación local y reintento con Gemini

**Files:**
- Modify: `src/services/labelScanner.ts`
- Test: `tests/labelScanner.test.ts` (reescritura)

**Interfaces:**
- Consumes: `createOcr` y `Ocr` (Tarea 3), `extractLabelFields`, `toLabelDraft`, `DetectedField` (Tarea 1), `geminiScan` existente.
- Produces:
  - `interface LabelReading { text: string; fields: DetectedField[]; draft: LabelDraft }`
  - `scanLabel(file: File, ocr?: Ocr): Promise<LabelReading>`
  - `geminiDraft(file: File, key: string, fetchImpl?: typeof fetch): Promise<LabelDraft>` (envoltorio de `geminiScan`)
  - `readGeminiKey(): string | null` (lee `localStorage['micava.geminiKey']`)
  - `interface LabelDraft` se mantiene con los mismos campos (lo usa `WineForm`).
  - Se eliminan `getScanner` y `NO_KEY_REASON`.

- [ ] **Step 1: Reescribir el test**

```ts
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
```

- [ ] **Step 2: Verificar el fallo**

Run: `npm.cmd test tests/labelScanner.test.ts`
Expected: FAIL — `scanLabel` no existe.

- [ ] **Step 3: Implementar**

`scanLabel` usa `ocr ?? createOcr()`, `await ocr(file)`, `extractLabelFields(text, new Date().getFullYear())` y `toLabelDraft(fields)`. `geminiDraft` delega en `geminiScan(file, key, fetchImpl)`. `readGeminiKey` devuelve el valor recortado o `null` (guarda contra `localStorage` ausente como ya hace el repo con `globalThis.localStorage?.`).

- [ ] **Step 4: Verificar que pasa**

Run: `npm.cmd test tests/labelScanner.test.ts`
Expected: PASS. El typecheck completo se cierra en la Tarea 6: `LabelScannerField.tsx` todavía importa `getScanner`, que esta tarea elimina.

- [ ] **Step 5: Commit**

```bash
git add src/services/labelScanner.ts tests/labelScanner.test.ts
git commit -m "feat: local label scanning orchestration"
```

---

### Task 6: Interfaz del escáner y del código de barras

**Files:**
- Modify: `src/features/add/LabelScannerField.tsx` (reescritura)
- Create: `src/features/add/BarcodeLookup.tsx`
- Modify: `src/features/add/WineForm.tsx` (sin cambios de contrato: el bloque sigue en "Lo esencial")
- Test: ninguno nuevo (lógica cubierta en Tareas 1–5); verificación en navegador.

**Interfaces:**
- Consumes: `scanLabel`, `geminiDraft`, `readGeminiKey` (Tarea 5), `DetectedField` (Tarea 1), `lookupBarcode`, `toOffDraft`, `OFF_ATTRIBUTION`, `OFF_URL` (Tarea 2), `detectBarcode`, `barcodeSupported` (Tarea 4), `normalizeBarcode` (Tarea 2), `Button`, `Field`, `cn`.
- Produces:
  - `LabelScannerField({ onDraft }: { onDraft: (d: LabelDraft) => void })`
  - `BarcodeLookup({ onDraft }: { onDraft: (d: LabelDraft) => void })`

- [ ] **Step 1: Implementar `BarcodeLookup`**

Campo `Field label="Código de barras"` con `inputMode="numeric"`, placeholder `8410302106300`, botón «Buscar»; si `barcodeSupported()` añade «Leer de una foto» con `<input type="file" accept="image/*" capture="environment" className="sr-only">`. Estados: vacío, buscando, no encontrado («Ese código no está en Open Food Facts»), no vino (`product.isWine === false` → «Ese código no es un vino en Open Food Facts»), encontrado (nombre + marca + botón «Usar estos datos» → `onDraft(toOffDraft(product))`), error de red con el mensaje de la excepción. Debajo, `Datos de Open Food Facts (ODbL)` como enlace a `OFF_URL` con `target="_blank" rel="noreferrer"` y `text-xs text-muted`.

- [ ] **Step 2: Reescribir `LabelScannerField`**

Estado: `phase: 'idle' | 'working' | 'done'`, `progress: number`, `fields: DetectedField[]`, `text: string`, `error: string`, `geminiBusy: boolean`. Al escanear: `scanLabel(file, undefined)` con `onProgress` → `phase 'working'` y porcentaje; al terminar `onDraft(reading.draft)`, guarda `fields` y `text`, `phase 'done'`. Error: `role="alert"` con el mensaje, y si `readGeminiKey()` existe, botón «Probar con Gemini» también en ese estado. En `done`, chips con `field.label` (`rounded-full border border-border px-2 py-1 text-xs`), nota «Solo se rellenan los campos vacíos» si `fields.length > 0`, `<details><summary>Ver texto leído</summary><pre className="max-h-24 overflow-auto text-xs">`. La clave se lee al pulsar (no al montar). Sin clave, ningún botón de Gemini aparece. `<BarcodeLookup onDraft={onDraft} />` al final de la misma tarjeta.

- [ ] **Step 3: Verificar**

Run: `npm.cmd run typecheck && npm.cmd run lint && npm.cmd test`
Expected: todo limpio, 15+ archivos en verde.

- [ ] **Step 4: Humo en navegador**

Con el dev server en `:5173` y sin clave en `localStorage`: abrir `#/add`, comprobar que no hay ningún texto que pida clave; buscar `8410302106300` → «Campo Viejo Rioja tempranillo» + «Usar estos datos» rellena Nombre y Bodega; buscar `8480000167125` → aviso de que no es vino; buscar `0000000000000` → no encontrado; escribir un vino a mano y guardarlo. Con una foto de etiqueta real (si hay): comprobar progreso, chips y que «Ver texto leído» muestra el texto.

- [ ] **Step 5: Commit**

```bash
git add src/features/add/LabelScannerField.tsx src/features/add/BarcodeLookup.tsx
git commit -m "feat: local label scanner UI with barcode lookup"
```

---

### Task 7: Ajustes, caché offline, README y cierre

**Files:**
- Modify: `src/features/settings/SettingsScreen.tsx`
- Modify: `vite.config.ts`
- Modify: `README.md`
- Test: ninguno nuevo; build + humo.

**Interfaces:**
- Consumes: `OFF_URL` (Tarea 2).
- Produces: configuración de `workbox.runtimeCaching` y textos definitivos.

- [ ] **Step 1: Ajustes**

En «Escáner de etiquetas»: explicar que la lectura ocurre en el dispositivo y que la primera vez descarga ≈9 MB; la clave de Gemini pasa a «opcional, solo para reintentar lecturas difíciles». En «Acerca de», añadir `Datos de Open Food Facts (ODbL)` con enlace a `OFF_URL`.

- [ ] **Step 2: Caché de runtime**

En `vite.config.ts`, dentro de `workbox`, añadir:

```ts
runtimeCaching: [
  {
    urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
    handler: 'CacheFirst',
    options: { cacheName: 'tesseract-assets', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
  },
],
```

- [ ] **Step 3: README**

Sustituir la sección del escáner: lectura local con Tesseract, primera vez ≈9 MB y luego offline, Gemini opcional como reintento, búsqueda por código de barras en Open Food Facts (solo nombre y bodega, atribución ODbL), y que la foto no sale del dispositivo salvo reintento explícito con Gemini.

- [ ] **Step 4: Verificar**

Run: `npm.cmd run typecheck && npm.cmd run lint && npm.cmd test && npm.cmd run build`
Expected: 0 errores, todos los tests en verde, build OK, JS inicial ≤ 130 kB gzip, y que el precache no incluya ningún `.traineddata` ni `tesseract-core` (comprobar el tamaño de `dist/sw.js` y que el chunk de `tesseract.js` sea aparte).

- [ ] **Step 5: Humo offline y commit**

Con `npm.cmd run preview`: una búsqueda por código de barras online, recarga, y comprobar en `#/add` que el bloque sigue sin pedir clave. Commit:

```bash
git add src/features/settings/SettingsScreen.tsx vite.config.ts README.md
git commit -m "docs: local scanner settings, offline cache and README"
```

---

## Notas de ejecución

- Cada tarea se ejecuta en orden; ninguna posterior cambia una interfaz anterior sin actualizar su bloque **Interfaces**.
- Los tests usan el entorno `node`: nada de DOM. `File` existe en Node 24; `createImageBitmap` no se usa en tests porque `fitSize` es puro y `createOcr` inyecta `makeWorker`.
- Si `npm.cmd install tesseract.js` trae `opencollective-postinstall`, ignorar su salida; no añade nada al bundle.
- Fuera de alcance: cámara en vivo, preprocesado de imagen (contraste, rotación, recorte), idiomas distintos de `spa`+`eng`, búsqueda por texto en Open Food Facts, guardar fotos.
