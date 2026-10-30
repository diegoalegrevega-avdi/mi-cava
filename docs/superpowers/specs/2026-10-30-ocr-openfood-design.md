# Escáner local (Tesseract) y datos de Open Food Facts — Diseño

**Fecha:** 2026-10-30
**Estado:** pendiente de aprobación
**Base:** V0 de Mi Cava (commit `db70d68`), espec `docs/superpowers/specs/2026-10-29-cava-design.md`

## 1. Intención

Hoy el escáner de etiquetas exige una clave de Gemini y manda la foto a la nube. La persona que usa la app quiere dos cosas:

1. Que la lectura de la etiqueta ocurra **dentro de la app**, sin clave ni cuenta.
2. Poder **completar datos que la etiqueta no dice** (bodega, país, nombre comercial) con una base de datos abierta.

El objetivo no es leer etiquetas perfectamente. Es que añadir un vino cueste menos teclas: la foto rellena lo que puede, la persona corrige lo que está mal y escribe lo que falta.

## 2. Objetivos

- Escanear una foto de etiqueta sin clave, sin conexión a un servicio propio y sin subir la imagen a ningún sitio.
- Convertir el texto leído en campos del formulario (añada, tipo, región, país, variedades, bodega) y rellenar **solo los campos vacíos**.
- Identificar una botella por su código de barras contra Open Food Facts y ofrecer nombre, bodega y país.
- Decir siempre de dónde sale cada dato y con qué confianza, para que la persona decida.
- Mantener el escáner de Gemini como opción de reintento para quien ya tenga clave (no se tira lo que funciona).

## 3. No objetivos

- Reconocimiento en vídeo o cámara en vivo leyendo fotogramas.
- Leer el código de barras de la misma foto que la etiqueta (son dos gestos distintos).
- Buscar en Open Food Facts por texto libre.
- Empaquetar los modelos de idioma dentro del bundle de la app.
- Añadir idiomas distintos de español e inglés.
- Preprocesar la imagen (recorte, contraste, rotación) más allá de lo que hace Tesseract.
- Garantizar aciertos: la salida es una propuesta editable, nunca un dato definitivo.

**Anti-objetivos** (si pasa, el trabajo está mal):

- Que un fallo del OCR impida guardar el vino a mano.
- Que la app suba fotos a un servidor propio.
- Que un campo adivinado machaque lo que la persona ya escribió.
- Que la primera pantalla de Añadir tarde en cargar por culpa del escáner.

## 4. Restricciones

- Sigue siendo una PWA estática: sin backend propio, sin claves.
- `tesseract.js` es la única vía práctica al navegador (los otros repositorios evaluados no sirven: OpenWinesOCR es un envoltorio de 2016 sobre el binario de Tesseract para Node, y RapidOCR obliga a servir modelos ONNX a mano).
- Los modelos y el núcleo WASM pesan: `spa` 2,1 MB + `eng` 3,0 MB + núcleo ≈ 4 MB (gzip). La primera lectura necesita red.
- Open Food Facts es ODbL, API pública sin clave, con CORS. Su cobertura de vino español es parcial.
- El formulario ya existe y ya tiene `applyDraft` (rellena huecos) y la comprobación de duplicados. No se rediseña.
- Objetivo táctil 44 px, textos en español, tema oscuro/claro con los tokens existentes.

## 5. Enfoques considerados

1. **Tesseract local + heurísticas + Open Food Facts por código de barras** (elegido). OCR en el dispositivo; del texto se derivan añada, tipo, región, país y variedades; la bodega se propone con confianza media. Aparte, un botón de código de barras consulta Open Food Facts y ofrece nombre, bodega y país. Cada fuente hace lo que sabe hacer: el OCR lee la etiqueta, el código identifica el producto.
2. **Solo OCR + búsqueda difusa en Open Food Facts** por nombre o bodega detectados. Menos interfaz, pero Open Food Facts devuelve mucho producto que no es vino y nombres descuadrados; la confianza es difícil de explicar y la persona acaba corrigiendo más de lo que ahorra.
3. **Un solo gesto "Escanear botella"**: foto → OCR → si aparece un EAN en el texto, consulta y fusiona. La más simple de usar, pero mezcla dos fallos posibles en un solo resultado y es más difícil de depurar.

Se eligió la 1 porque separa las dos fuentes, permite decir de dónde viene cada campo y deja que la persona use solo la que le sirva.

## 6. Decisiones

1. **Motor:** `tesseract.js@^7.0.0` con `createWorker('spa+eng')`, creado la primera vez que se escanea y reutilizado mientras dure la página. Corre en el worker interno de la librería: la interfaz no se bloquea.
2. **Modelos desde CDN y cacheados por el service worker.** No se precargan. La primera lectura muestra "Preparando el lector (≈9 MB)…" con progreso; a partir de ahí funciona sin red. Bundlarlos subiría la instalación de 450 KiB a ~9,5 MB para todos, incluidos los que nunca escanean.
3. **Dónde se enciende:** el escáner local está siempre disponible; ya no depende de una clave. El bloque de Ajustes «Escáner de etiquetas» pasa a explicar que es local y que la clave de Gemini es opcional para reintentar.
4. **Gemini queda como reintento, nunca como requisito.** Si hay clave guardada, «Probar con Gemini» aparece tanto cuando la lectura local dejó campos vacíos como cuando el motor local falló (sin red en la primera descarga, sin WASM, worker roto). **Sin clave no existe el botón** y toda la función trabaja en local; el mensaje de error menciona que se pueden añadir la clave en Ajustes o escribir a mano.
5. **El OCR no inventa el nombre del vino.** El nombre es lo que la persona teclea; el OCR no propone nombres porque una línea de la etiqueta cualquiera produce basura. El nombre solo puede venir de Open Food Facts (campo `product_name`).
6. **La bodega del OCR es una propuesta de confianza media.** Se detecta por palabras clave (`Bodegas`, `Château`, `Domaine`, `Casa`, `Viña`, `Cellars`…) o por una línea en mayúsculas distinta de la denominación y del tipo. Se marca como «detectado, revísalo» y solo rellena si el campo está vacío.
7. **Región y país salen de una lista cerrada.** Denominaciones españolas y regiones extranjeras frecuentes, con mapa región → país. Sin coincidencia, no se propone nada.
8. **Tipo:** palabras clave (tinto, blanco, rosado, espumoso, brut, cava, dulce, moscatel, jerez, fortified…) al `WineType` existente. Sin coincidencia, no se propone.
9. **Añada:** token de 4 cifras en `1900..año+1`, prefiriendo el que esté junto a `año`, `cosecha`, `vintage` o al nombre de la denominación. Varias candidatas → la primera con confianza alta; el resto no se muestran.
10. **Variedades:** lista cerrada de uvas (tempranillo, garnacha, graciano, mazuelo, albariño, verdejo, chardonnay, merlot, cabernet sauvignon, syrah, monastrell, mencía, godello, parellada, xarel·lo, macabeo, palomino, pedro ximénez, airén, bobal, viura…), sin acentos y en minúsculas al guardar.
11. **El código de barras es un gesto aparte:** botón «Buscar por código de barras», con campo manual y, si el navegador lo soporta, lectura desde una foto con `BarcodeDetector`. Si la API no existe, solo el campo manual; no se añade una librería de lectura de códigos.
12. **Solo se aceptan productos de vino de Open Food Facts:** si `categories_tags` no incluye `en:wines`, se avisa («Ese código no es un vino en Open Food Facts») y no se rellena nada.
13. **De Open Food Facts se toman dos campos y nada más:** `product_name` → nombre y la primera marca de `brands` → bodega. **El país no se toma**: `countries_tags` registra dónde se ha visto el producto, no su origen (el Rioja de prueba aparece como Australia y Países Bajos). Nunca añada, precio ni variedades: Open Food Facts no es fiable ahí.
14. **Nada machaca lo escrito.** Tanto el OCR como Open Food Facts usan el `applyDraft` existente, que solo rellena huecos.
15. **La foto no sale del dispositivo** salvo que la persona pulse «Probar con Gemini», que es explícito y ya existe. El código de barras se envía solo como número.
16. **Los fallos son locales y visibles.** Sin red en la primera lectura: «La primera vez hay que descargar el lector (≈9 MB). Conecta a internet e inténtalo de nuevo». OCR sin campos: «No he reconocido datos; puedes escribirlos a mano».
17. **La lectura cruda se puede ver.** Un desplegable «Ver texto leído» muestra lo que devolvió Tesseract, para entender un fallo sin abrir la consola.
18. **Pruebas:** la extracción y el mapeo de Open Food Facts son funciones puras con tests; la red se inyecta (`fetchImpl`); el motor se prueba con un `recognize` falso. No se añade jsdom ni Playwright.
19. **La foto se reduce a 1600 px de lado mayor antes de leerla**, con un canvas, sin recorte, contraste ni rotación. Una captura de móvil de 12 MP tarda decenas de segundos y puede tumbar el worker; el resto del preprocesado sigue fuera de alcance.
20. **La foto no se guarda en ningún sitio.** Se usa en memoria mientras se lee y se descarta: ni IndexedDB, ni exportación, ni miniaturas. El esquema y el backup no cambian.
21. **Open Food Facts se acredita.** La búsqueda por código muestra «Datos de Open Food Facts (ODbL)» con enlace a la licencia, y el «Acerca de» de Ajustes lo repite.
22. **Los chips muestran lo detectado**, no lo aplicado (el formulario solo rellena huecos), con la nota «solo se rellenan los campos vacíos».

## 7. Arquitectura y piezas

```
src/services/
  ocr.ts              motor Tesseract: recognizer perezoso, progreso, errores legibles
  labelFields.ts      texto → campos propuestos (puro, sin DOM ni red)
  barcode.ts          foto → EAN con BarcodeDetector (si existe)
  openfoodfacts.ts    EAN → producto → propuesta (fetch inyectable)
  labelScanner.ts     interfaz LabelScanner; getScanner elige local y expone el reintento Gemini
src/features/add/
  LabelScannerField.tsx   foto, progreso, chips de lo leído, texto crudo, botón de código de barras
  BarcodeLookup.tsx       campo manual + foto + resultado de Open Food Facts
```

### `ocr.ts`

```ts
export interface OcrProgress { status: 'loading' | 'reading'; progress: number }
export type Ocr = (file: File, onProgress?: (p: OcrProgress) => void) => Promise<string>
export function createOcr(): Ocr          // worker perezoso, reutilizado
export const NO_NETWORK_MESSAGE = 'La primera vez hay que descargar el lector (≈9 MB). Conecta a internet e inténtalo de nuevo.'
```

`createOcr` envuelve `createWorker('spa+eng', 1, { logger })`; un `Worker` fallido se descarta para que el siguiente intento vuelva a empezar. El texto devuelto es `data.text`.

Antes de leer, la imagen se reduce a 1600 px de lado mayor con un canvas (`createImageBitmap` + `canvas.toBlob`), sin otros ajustes. La función de encaje (`fitSize`) es pura y se prueba aparte.

### `labelFields.ts`

```ts
export type FieldConfidence = 'alta' | 'media'
export interface DetectedField {
  field: 'vintage' | 'type' | 'region' | 'country' | 'varietals' | 'winery'
  value: string | number | string[] | WineType
  confidence: FieldConfidence
}
export function extractLabelFields(text: string, currentYear: number): DetectedField[]
export function toLabelDraft(fields: DetectedField[]): LabelDraft  // bodega solo si confianza media/alta, sin duplicar
```

Reglas: normaliza acentos y mayúsculas; trabaja línea a línea; devuelve como mucho un campo por tipo (el de mayor confianza); nunca devuelve `name`.

### `openfoodfacts.ts`

```ts
export interface OffProduct { code: string; name: string; brand: string; country: string; isWine: boolean }
export function normalizeBarcode(raw: string): string | null   // dígitos, EAN-8/13 con dígito de control, UPC-A → EAN-13
export async function lookupBarcode(ean: string, fetchImpl?: typeof fetch): Promise<OffProduct | null>
export function toOffDraft(product: OffProduct): LabelDraft   // solo name y winery
```

URL: `https://world.openfoodfacts.org/api/v2/product/{ean}.json?fields=code,product_name,brands,countries_tags,categories_tags`. `status: 0` → `null`. `isWine` = `categories_tags` incluye `en:wines`. Errores de red → mensaje legible; nunca `throw` sin texto. `toOffDraft` devuelve solo `{name?, winery?}`; `countries_tags` se lee para el aviso de origen dudoso pero no se aplica.

### `barcode.ts`

```ts
export function barcodeSupported(): boolean
export async function detectBarcode(file: File): Promise<string | null>
```

`BarcodeDetector` con formatos `ean_13`, `ean_8`, `upc_a`, `upc_e`; si no existe, `barcodeSupported()` es `false` y la interfaz solo muestra el campo manual.

### Interfaz

En «Lo esencial», el bloque actual del escáner pasa a:

1. Botón «Escanear etiqueta» + zona de arrastre.
2. Mientras lee: «Preparando el lector (≈9 MB)…» con porcentaje, luego «Leyendo etiqueta…».
3. Al terminar: chips `Añada 2019 · Rioja · Tinto` de lo aplicado, aviso de bodega dudosa, y desplegable «Ver texto leído».
4. Botón «Buscar por código de barras» (abre `BarcodeLookup` en la misma tarjeta, no en una hoja aparte): campo EAN, «Leer de una foto» si hay soporte, y al encontrar un vino, botón «Usar estos datos».
5. Si hay clave de Gemini: «Probar con Gemini».

Todos los botones de 44 px, el progreso con `role="status"`, los errores con `role="alert"`.

## 8. Datos y compatibilidad

- No cambia el esquema de IndexedDB ni el formato de exportación: todo esto vive en la pantalla Añadir.
- `LabelDraft` no cambia; se reutiliza tal cual.
- Los campos nuevos (`DetectedField`, `OffProduct`) no se guardan.

## 9. PWA y offline

- `vite.config.ts`: `workbox.runtimeCaching` con `CacheFirst` para `https://cdn.jsdelivr.net/**` (modelos y núcleo), 1 año, 20 entradas. **No entran en el precache.**
- El código de `tesseract.js` se carga con `import()` dinámico: no engorda el bundle inicial ni el precache.
- Tras la primera lectura, el escaneo funciona sin red (modelos y núcleo cacheados).
- Open Food Facts requiere red; sin ella se dice y se sigue a mano.

## 10. Pruebas

- `tests/labelFields.test.ts`: añada con ruido (`RESERVA 2.019`), añada fuera de rango, tipo en español e inglés, Rioja con y sin tilde, variedades repetidas, bodega por palabra clave, etiqueta sin datos → `[]`, línea basura no produce nombre.
- `tests/openfoodfacts.test.ts`: EAN válido con dígito de control, EAN inválido → `null`; producto de vino → borrador con nombre y marca y **sin país**; producto no vino → `isWine: false`; 404/status 0 → `null`; error de red → mensaje legible; campos vacíos se omiten.
- `tests/ocr.test.ts` (sin red ni WASM): `createOcr` con dependencias inyectadas — primer progreso `loading`, texto devuelto, error de red → `NO_NETWORK_MESSAGE`; `fitSize` reduce 4000×3000 → 1600×1200 y deja intacta una imagen pequeña.
- Humo en navegador: escanear una foto real de etiqueta (la que dé la persona) → campos rellenados; búsqueda `8410302106300` → «Campo Viejo»; código de un producto no vino → aviso; recarga sin red tras la primera lectura → el escáner sigue funcionando.

## 11. Rendimiento

- Primera lectura: ~9 MB de descarga + 1–3 s de reconocimiento en un móvil medio. Después: 1–3 s por foto.
- Añadir la dependencia no debe subir el bundle inicial por encima de 130 kB gzip (hoy 123 kB): se mide en la tarea de cierre.

## 12. Riesgos

- **Calidad del OCR en etiquetas decorativas:** aceptable para textos grandes y tipografía legible; mala con caligrafía o dorados. Mitigación: campos editables, chips con confianza, reintento con Gemini.
- **Descarga inicial de 9 MB:** en datos móviles es un coste real. Mitigación: aviso con tamaño, solo al pulsar, cacheado después.
- **Cobertura de Open Food Facts:** puede que una de cada tres botellas esté. Mitigación: se presenta como extra, nunca como requisito.
- **Bodega adivinada:** puede ser la denominación o el nombre comercial. Mitigación: confianza media, solo huecos, aviso visible.
- **`BarcodeDetector` no está en todos los navegadores:** en Firefox y Safari no existe. Mitigación: campo manual.
- **El CDN cambia o cae:** el service worker conserva lo cacheado; si nunca se descargó, se dice claramente.

## 13. Lo que queda al constructor

- Lista exacta de denominaciones, países y variedades (empezar por las 30–40 más frecuentes en España; ampliable).
- Umbrales de la heurística de bodega y elección de línea candidata.
- Textos exactos de progreso y errores.
- Formato del desplegable de texto crudo (monoespaciado, 4 líneas visibles con scroll).
- Texto exacto del aviso de atribución ODbL y su enlace.
