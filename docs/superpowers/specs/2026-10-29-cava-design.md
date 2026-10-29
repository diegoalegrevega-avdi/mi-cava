# Mi Cava — Diseño V0 (PWA local-first para 250 botellas)

Fecha: 2026-10-29
Estado: borrador para aprobación

## 1. Intención y porqué

Una persona con una cava doméstica de hasta 250 botellas quiere saber **qué tiene, dónde está y cuándo beberlo**, y quiere registrar el movimiento en **un toque**, desde el sofá o desde la bodega, sin cobertura.

El éxito se mide por una cosa: abrir la app, encontrar el vino y dejarlo registrado (o descorchado) en menos de cinco segundos, sin pensar. Lo demás —semáforo de apogeo, notas, estadísticas, OCR— existe para que ese gesto sea más útil, no más largo.

Contexto del proyecto: repositorio nuevo y vacío en `C:\Users\diego\OneDrive\Documents\Opencode\Android app`. Open source desde el primer commit.

## 2. Objetivos y no-objetivos

**Objetivos**

1. Stock sin fricción: `+1` y `−1` visibles en cada fila de la lista, un toque, sin diálogo.
2. Cero pérdida de datos: un vino con stock 0 pasa a Historial con sus notas intactas; nada se borra solo.
3. Ventana de consumo con semáforo verde/amarillo/rojo, calculada al vuelo.
4. Import/export total (JSON propio + CSV compatible con hojas de cálculo y con el esquema de CellarTracker), con mapeo previo y sin duplicados.
5. Datos portables: si mañana desaparece la app, el JSON abre la cava en cualquier otro sitio.
6. Autocompletar por foto de etiqueta (OCR + IA) como módulo opcional y aislado.
7. Instalable como PWA en Android/iOS/escritorio y usable 100% offline.

**No-objetivos (V0)**

- Cuentas, login, multiusuario, permisos.
- Sincronización entre dispositivos (diseñada para llegar en V1, no construida).
- Backend, Docker, base de datos servidor.
- Mapa visual de la cava, planos 3D, códigos de barras.
- Fotos de etiquetas persistidas, valoraciones con estrellas, monedas múltiples.
- Precio de mercado, integraciones con Vivino/CellarTracker en vivo, compras.

**Anti-objetivos** (si algo de esto aparece, el diseño ha fallado aunque funcione)

- Un modal para sumar o restar una botella.
- Un spinner bloqueante al arrancar.
- Perder la fila de un vino al llegar a 0.
- Pedir confirmación para acciones reversibles.
- Una pantalla que haya que "cargar" teniendo los datos en local.

## 3. Restricciones

- Navegador moderno con IndexedDB (Chrome/Edge/Safari/Firefox actuales). Sin IE, sin polyfills.
- Sin red en tiempo de uso normal. Solo el escáner de etiquetas y la instalación tocan la red.
- 250 botellas, decenas de referencias: cualquier listado cabe en memoria; no se necesita virtualización ni paginación.
- Arranque percibido < 300 ms en móvil de gama media.
- Accesibilidad: objetivos táctiles ≥ 44 px, contraste AA, navegación por teclado, `prefers-reduced-motion`.
- Licencia MIT.
- Node 20+ para el build.

## 4. Enfoques considerados

| # | Enfoque | A favor | En contra | Veredicto |
|---|---------|---------|-----------|-----------|
| 1 | **PWA pura**: React + Vite + Tailwind + Dexie (IndexedDB), sin servidor | Cero infraestructura, offline real, un solo código para web y móvil, export/import como respaldo | Un dispositivo a la vez; datos a salvo solo si el usuario exporta | **Elegido** |
| 2 | Vue 3 + Tailwind + Dexie | Mismas propiedades | Ninguna ventaja técnica; el usuario no tiene preferencia por Vue | Descartado por simetría |
| 3 | Local-first con backend desde V0 (SQLite + Docker, o PocketBase) | Multidispositivo desde el día 1 | Hay que desplegar y mantener un servidor; contradice "sin ataduras" y "simplicidad radical" | Descartado para V0; compatible como V1 |

**Elegido: 1.** La V1 (sincronización) se añade detrás de la capa `storage`, sin reescribir pantallas. Las decisiones que lo permiten están en §6 y §7.

## 5. Decisiones

**Del usuario**

- App open source, web + móvil, para 250 botellas, sin mapas 3D.
- Simplicidad radical; el foco es meter/sacar stock y analizar datos.
- Campos obligatorios del modelo (§7), ventana de apogeo con semáforo, import/export con mapeo y deduplicación, 4 pestañas, paleta oscura tipo bodega con modo claro, OCR opcional.
- Arrancar con versión local y evaluar sincronización después → enfoque 1.

**Mías (revísalas mientras lees)**

1. **Sin backend ni SQLite.** IndexedDB vía Dexie; SQLite solo tendría sentido con servidor.
2. **Modelo normalizado en dos tablas** (`wines` + `events`) en vez de un objeto "Botella" con `historial[]` y `stock` dentro. El stock y el historial son **derivados** de los eventos: una sola fuente de verdad, y es lo que permite fusionar dos dispositivos en V1 sin conflictos. La forma "Botella" del pedido se mantiene en el JSON exportado, que es la vista que el usuario ve y descarga.
3. **Ventana de apogeo precalculada en el formulario** (`añada+3` a `añada+12`), siempre editable. Sin reglas por varietal. Si el usuario la borra, el badge muestra "Sin datos" (gris), nunca un color inventado.
4. **Precio en céntimos enteros** (`priceCents`), no en decimales flotantes: evita errores de redondeo al sumar el valor de la cava.
5. **Campo extra `type`** (`tinto | blanco | rosado | espumoso | dulce | fortificado`): el modelo pedido no lo trae y las estadísticas de "porcentaje de tintos/blancos" lo necesitan. Opcional, editable, también sale en el CSV como `Type`/`Color`.
6. **Añadas sin año permitidas** (`vintage: null`, se muestra "NV"): el champán y muchos generosos no tienen añada, y forzar un año falso rompería la deduplicación y el apogeo.
7. **Nota opcional por descorche** además de las notas del vino: el Historial es un diario, y una nota por botella abierta es lo que lo hace útil. Se ofrece en el toast, nunca en un modal obligatorio.
8. **"Deshacer" en el toast** al descorchar (5 s) y al sumar: revierte añadiendo un evento compensatorio. No hay confirmaciones.
9. **UI en español (es-ES)**, fechas `dd/mm/aaaa`, sin i18n en V0. El código queda listo para extraer textos.
10. **Tema oscuro por defecto**, conmutador manual en Ajustes persistido; `prefers-color-scheme` solo decide el primer arranque.
11. **Tipografía sin descargas**: serif del sistema para títulos, sans del sistema para el resto, números tabulares en stock y precios. Cero FOUT, cero peso.
12. **Escáner de etiquetas apagado por defecto**, solo se activa al pegar una clave de Gemini en Ajustes. Sin clave, el botón queda visible pero explica que está desactivado (no se oculta: así se descubre).
13. **Límite de 250 como aviso, no como bloqueo**: banner "Cava llena" cuando el total llega a 250. Bloquear sería fricción.
14. **Imágenes de etiqueta no se guardan**, solo los datos extraídos. Ahorra cuota de almacenamiento y evita un problema de privacidad.
15. **Importación idempotente por `id`**: si el JSON trae un `id` que ya existe, se restaura/fusiona ese vino tal cual (mismos eventos, mismas fechas) y **no** se suma stock. Si el `id` no existe, se aplica la deduplicación por clave y sí se suma stock. Resultado: importar dos veces el mismo JSON deja la cava igual, e importar un CSV de otra app suma.
16. **Sin borrado de vinos en V0**: no hay botón "borrar" ni papelera. Un vino sale de la lista cuando su stock llega a 0, y sigue en Historial con sus notas. `deletedAt` no existe en el esquema hasta que exista la papelera (V0.1), que será un salto de versión de Dexie de una línea. "Vaciar cava" en Ajustes es la única destrucción, con confirmación escrita y oferta de exportar antes.
17. **Deshacer deja rastro explícito**: el evento `undo` apunta al evento que revierte (`undoOf`). El stock es la suma de deltas; el Historial y las estadísticas **ignoran los descorches revertidos**. Deshacer un `−1` no deja una botella "bebida que no se bebió".
18. **No hay "Deshacer" al crear un vino**: crear no es un error de toque, y deshacerlo dejaría un vino fantasma con stock 0 y sin historial. El toast solo confirma.
19. **Fechas ambiguas resueltas en la pantalla de mapeo**: por defecto `dd/mm/aaaa` (UI española), con selector `mm/dd/aaaa` para archivos de origen estadounidense. Si el día es > 12 o el mes > 12 se deduce solo; si ambos son ≤ 12 manda el selector. Nunca se adivina en silencio.
20. **La clave de duplicado incluye la bodega**: `normalize(nombre) | añada | normalize(bodega)`. Si falta la bodega en alguno de los dos lados, se usa nombre+añada pero el plan de importación lo marca como "posible duplicado sin bodega" en vez de fusionar a ciegas. Dos "Reserva 2019" de productores distintos siguen siendo dos vinos.
21. **Estadísticas contadas en botellas**, no en referencias (es lo que se posee); el número de referencias se muestra aparte.
22. **Moneda única EUR** en V0; `priceCents` es un entero sin símbolo y el CSV escribe `Currency=EUR`.

## 6. Arquitectura

Una SPA que se instala. Cuatro capas, dependencias en un solo sentido:

```
features/ (pantallas)  →  domain/ (reglas puras)  →  db/repo.ts  →  Dexie/IndexedDB
        ↘ services/ (import, export, ocr) ────────↗
```

- **`db/repo.ts`** es la **única** puerta a los datos. Ninguna pantalla importa Dexie. Firma estable y pequeña:
  `listWines()`, `getWine(id)`, `createWine(draft)`, `updateWine(id, patch)`, `addBottles(id, n, note?)`, `consumeBottle(id, note?)`, `undoEvent(id)`, `listEvents(wineId?)`, `allEvents()`, `importBundle(bundle)`, `exportBundle()`, `clearAll()`.
  En V1 esta interfaz gana `sync()` y una implementación remota; las pantallas no cambian.
- **`domain/`** puro y testeable: stock derivado, ventana de apogeo, normalización de texto para búsqueda y deduplicación, estadísticas, plan de importación.
- **`services/`**: exportadores (JSON/CSV), importador (parseo, automapeo, plan, aplicación atómica), escáner de etiquetas (interfaz + mock + Gemini).
- **`features/`**: una carpeta por pestaña, componentes de UI compartidos en `components/ui`.

Estado: sin Redux ni Zustand. Un hook `useWines()` suscrito a Dexie (`liveQuery`) devuelve la lista; los cambios se reflejan solos y no hay estado duplicado que pueda desincronizarse.

## 7. Modelo de datos

Base Dexie `mi-cava`, versión 1.

```ts
type Wine = {
  id: string;              // crypto.randomUUID()
  name: string;            // obligatorio
  winery: string;
  vintage: number | null;  // 4 cifras, o null = NV
  region: string;          // "Rioja, España"
  country: string;         // opcional, separado para estadísticas y CSV
  varietals: string[];     // etiquetas
  type: WineType | null;
  purchasedAt: string | null;   // ISO date, por defecto hoy al crear
  priceCents: number | null;    // por botella
  location: string;             // "Estante superior izquierdo"
  drinkFrom: number | null;     // año
  drinkUntil: number | null;    // año
  notes: string;                // cata y maridaje
  createdAt: string;            // ISO datetime
  updatedAt: string;            // ISO datetime; se toca con cada evento
};

type StockEvent = {
  id: string;
  wineId: string;
  delta: number;           // +1, -1, +N de importación, o reversión
  kind: 'add' | 'consume' | 'import' | 'undo';
  at: string;              // ISO datetime del hecho
  note?: string;           // nota del descorche
  undoOf?: string;         // solo en kind:'undo': id del evento revertido
};
```

Sin `deletedAt`: en V0 no se borran vinos (§5.16).

Índices Dexie: `wines: id, name, updatedAt, vintage`; `events: id, wineId, at, undoOf, [wineId+at]`.

**Derivados (nunca almacenados)**

- `stock(wine) = Σ events.delta` (garantizado ≥ 0: `consumeBottle` falla si ya es 0).
- `reverted = new Set(events.filter(kind==='undo').map(undoOf))`.
- `activeConsumptions(wine) = events.filter(e => e.delta < 0 && !reverted.has(e.id))` → fechas y notas del diario. **Un `−1` deshecho no cuenta como descorche.**
- `consumedDates(wine) = activeConsumptions.map(at)` → esto es el `historial` del modelo pedido.
- `hasHistory(wine) = activeConsumptions.length > 0` → un vino con stock 0 y descorches reales aparece en Historial; uno con stock 0 sin consumo no existe (no puede pasar: cada vino nace con al menos un `add`).
- `status(wine, year)`: verde si `drinkFrom ≤ year ≤ drinkUntil`; amarillo si `year < drinkFrom`; rojo si `year > drinkUntil`; gris "Sin datos" si falta algún extremo. Se recalcula sin guardar nada, con el año del sistema.

**Mapeo con la entidad "Botella" del pedido**

| Campo pedido | Dónde vive |
|---|---|
| ID | `wines.id` |
| Nombre, Bodega, Añada, Región, Varietal, Fecha de compra, Precio, Ubicación, Notas | campos de `wines` |
| Cantidad / Stock | derivado de `events` |
| Ventana de consumo | `drinkFrom` / `drinkUntil` |
| Historial de consumo | derivado de `events` |

El export JSON emite exactamente la forma plana del pedido (`stock`, `history[]`), para que sea legible sin conocer el esquema interno. El import acepta ambas formas.

## 8. Reglas de negocio

- **Crear**: `name` obligatorio; `vintage` obligatorio salvo NV; `purchasedAt` = hoy; `drinkFrom/Until` = `vintage+3/+12` si hay añada; un evento `add` con `delta = stock inicial` (por defecto 1, ajustable en el formulario). `createdAt = updatedAt = now`. Toast solo confirma, sin "Deshacer" (§5.18).
- **Sumar**: evento `add +1`, `updatedAt = now`. Toast "Botella añadida · Deshacer".
- **Descorchar**: si `stock > 0`, evento `consume −1`; si llega a 0 el vino **sigue existiendo** y aparece en Historial (filtro `stock === 0 && hasHistory`). Toast "Descorchada · Deshacer · Añadir nota", 5 s.
- **Deshacer**: evento `undo` con `delta` opuesto y `undoOf` = id del evento revertido (`at = now`). No se edita ni se borra nada. Deshacer deshace una vez: si el evento ya está revertido, la acción no está disponible.
- **Editar**: solo metadatos; el stock no se escribe a mano. Para corregirlo existe "Ajustar stock" en la ficha, que crea un evento `import` con la diferencia (una sola puerta, trazable).
- **Sacar un vino de la cava**: dejarlo a 0 con `−` o con "Ajustar stock". No hay borrado (§5.16); las notas permanecen accesibles en Historial y en la ficha.
- **Búsqueda**: insensible a mayúsculas y acentos (`NFD` + quitar diacríticos), sobre nombre, bodega, varietales y ubicación. Debounce 0: filtrado en memoria, instantáneo.
- **Orden Mi Cava**: `updatedAt` descendente.
- **Historial**: agrupado por fecha de descorche descendente, con nombre, añada y última nota.
- **Estadísticas**: total botellas, nº de referencias, valor estimado (`Σ priceCents × stock / 100`), reparto por `type` (barra), y conteo verde/amarillo/rojo.
- **Deduplicación** (import y creación manual): clave = `normalize(name) | vintage ?? 'NV' | normalize(winery)` (§5.20). Si existe, se suma stock y se rellenan huecos de metadatos; nunca se crea un duplicado. Si falta la bodega en algún lado, la coincidencia se marca como posible duplicado antes de fusionar. Mismo nombre con añada distinta = dos vinos.

## 9. Pantallas

Navegación: pestañas inferiores en móvil, barra lateral fija desde 768 px. Cuatro pestañas: **Mi Cava · Añadir · Historial · Ajustes**.

1. **Mi Cava** — buscador fijo arriba (con botón ×), banner "Cava llena" si procede, lista de filas: nombre + añada, bodega · región, badge de apogeo, `ubicación` y stock a la derecha con `− [n] +`. Tocar la fila abre la ficha (editar, notas, historial, ajustar stock). Sin acción de borrar (§5.16). Vacío: invitación a añadir la primera botella.
2. **Añadir** — formulario en una columna, campos agrupados (Lo esencial / Cata y ubicación), añada con selector rápido (año actual −1, −2… o teclado numérico), fecha de compra precargada con hoy, zona de foto con `capture="environment"` y arrastrar-y-soltar, botón "Guardar" siempre visible al pie. Al guardar: vuelta a Mi Cava con toast. El escáner rellena nombre, bodega, añada, región y deja el foco en lo que falte.
3. **Historial** — diario descendente. Cada entrada: vino, añada, fecha del descorche, nota si la hay. Agrupado por mes. Los vinos con stock 0 muestran además su ficha completa (notas intactas) y un botón "Volver a la cava" (+1).
4. **Ajustes / Datos** — estadísticas ultracompactas (4 cifras + barra por tipo), Exportar JSON / Exportar CSV, Importar (archivo), tema claro/oscuro, clave de escáner, "Vaciar cava" con confirmación escrita y oferta de exportar antes. Versión y enlace al repositorio.

Flujo de importación: elegir archivo → **mapeo** (solo CSV: columnas detectadas ↔ campos, automapeo con alias, muestra de 3 valores por columna, aviso de columnas ignoradas, selector de formato de fecha) → **resumen del plan** ("12 nuevos · 8 actualizados · 2 filas con error" con motivos) → aplicar en una transacción → resultado. Un JSON salta el mapeo y va directo al resumen. Nada se escribe hasta confirmar.

## 10. Import / Export

**Export JSON** (`mi-cava-AAAA-MM-DD.json`)

```json
{ "schemaVersion": 1, "exportedAt": "…", "app": "mi-cava",
  "wines": [ { …campos de Wine…, "stock": 3, "history": ["2026-03-01T…"] } ],
  "events": [ …StockEvent completos… ] }
```

Se incluyen los eventos para que una restauración exacta y una futura sincronización sean posibles; `wines[].stock/history` para lectura humana.

**Semántica de importación** (§5.15)

1. **JSON con `events` e `id`s**: restauración. Para cada vino, si el `id` ya existe, se reemplazan metadatos y eventos por los del archivo (mismos `id`, mismas fechas) — importar dos veces no suma nada. Si el `id` no existe, se crea. El stock del bundle (`wines[].stock`) es informativo: manda la suma de `events`; si el JSON trae solo la forma plana sin eventos, se reconstruye un `add` con `delta = stock` y una fecha `at` = `purchasedAt` o hoy, y `history[]` se convierte en un `consume` por fecha.
2. **CSV, o JSON sin `id`**: fusión por clave de deduplicación. Vino existente → se suma stock con un evento `import` y se completan huecos (nunca se sobrescriben notas del usuario). Vino nuevo → se crea.
3. Filas que coinciden en nombre y añada pero no en bodega (o con bodega vacía) → se listan como "posible duplicado" en el resumen y **no** se fusionan sin confirmación.

**Export CSV** (`mi-cava-AAAA-MM-DD.csv`, UTF-8 con BOM, separador `,`, entrecomillado estándar)

Columnas: `Wine, Producer, Vintage, Type, Color, Varietal, Country, Region, Location, Quantity, Price, Currency, PurchaseDate, BeginConsume, EndConsume, Notes`.
Cabeceras alineadas con las de CellarTracker (`Wine`, `Producer`, `Vintage`, `Varietal`, `Country`, `Region`, `Quantity`, `Price`, `Location`) para que el archivo se pueda subir allí sin retoques. `Vintage` vacío = NV. Una fila por referencia con stock > 0; los vinos a 0 van a un CSV de historial solo si el usuario lo pide (V0.1).

**Import** acepta `.json` (nuestro esquema, o el plano del pedido) y `.csv` (nuestro, CellarTracker, hoja de cálculo genérica).

Alias automáticos (normalizados, sin acentos, minúsculas) → campo:
`wine|name|nombre|vino|wine name` → name · `producer|winery|bodega|producer name` → winery · `vintage|añada|anada|year|vint` → vintage (`1001`, `NV`, vacío → NV) · `region` → region · `country|país|pais` → country · `varietal|uva|variety|cepa|mastervarietal` → varietals (separar por `,` `;` `/`) · `type|color|tipo` → type · `quantity|stock|qty|bottles|cantidad` → stock a sumar · `price|coste|cost|precio` → priceCents (limpia `€`, `$`, comas de miles) · `purchasedate|fecha de compra|purchase date` → purchasedAt (ISO, `dd/mm/aaaa` o `mm/dd/aaaa` según el selector, §5.19) · `location|bin|ubicación|ubicacion|estante` → location · `notes|private note|notas|tasting notes` → notes · `beginconsume|drink from` / `endconsume|drink until` → ventana.

Validación: fila sin nombre → error; añada vacía, `NV` o `1001` → vino NV válido; añada no numérica, no entera o fuera de `1900…año+1` → error; `stock` negativo o no numérico → error. Cada error se lista con número de fila y motivo, y no se aplica ninguna fila hasta confirmar. Duplicados dentro del archivo → se suman. Existentes en la cava → se suma stock y se completan huecos (no se sobrescriben notas del usuario). Todo en una transacción Dexie: o entra el lote, o no entra nada.

## 11. Escáner de etiquetas

```ts
// services/labelScanner.ts
type Draft = Partial<Pick<Wine,'name'|'winery'|'vintage'|'region'|'country'|'varietals'|'type'>>;
interface LabelScanner { readonly enabled: boolean; scan(file: File): Promise<Draft>; }
```

- `mockScanner`: devuelve un borrador plausible tras 400 ms, sin red. Es el que usan las pruebas y el modo demo.
- `geminiScanner`: `POST generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` con la imagen en base64 y `responseSchema` estricto; prompt de una línea ("extrae los datos de esta etiqueta de vino; no inventes; deja vacío lo que no se lea"). Clave en `localStorage` bajo `micava.geminiKey`, campo tipo password, aviso de que la foto se envía a Google y de que la clave queda en ese dispositivo.
- Errores (sin red, 401, cuota, JSON inválido) → toast con el motivo y el formulario intacto. Nunca autocompleta con datos inventados: los campos vacíos se quedan vacíos.
- La imagen no se almacena ni se sube a ningún otro sitio.

## 12. Diseño visual

Paleta (variables CSS + `data-theme`):

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0F0D0C` | `#FAF8F5` |
| `--surface` | `#191614` | `#FFFFFF` |
| `--surface-2` | `#221D1A` | `#F1EDE7` |
| `--border` | `#2E2824` | `#E2DCD3` |
| `--text` | `#F2EDE7` | `#1B1815` |
| `--muted` | `#A69C92` | `#6B625A` |
| `--wine` | `#7A2233` | `#8A2436` |
| `--gold` | `#C2A369` | `#8A6D2F` |

Semáforo: verde `#4E8A5A`, ámbar `#C08A2E`, rojo `#A6413A`, gris `#6B625A`. Siempre icono + texto ("Listo", "Guardar", "Pronto"), nunca solo color (daltonismo).

Detalles: radios 12 px en tarjetas, 999 px en badges; sombra sutil solo en superficies elevadas (hoja de añadir nota, toasts); filas de 72 px mínimo para que `−` y `+` quepan con 44 px de objetivo; `+` en dorado apagado, `−` en burdeos; números tabulares; animación 120–180 ms solo en toast y aparición de lista, desactivada con `prefers-reduced-motion`. Modo claro con el mismo esqueleto, no una versión "lavada".

## 13. PWA / offline

`vite-plugin-pwa` con `registerType: 'autoUpdate'` y precache de todo el bundle. Manifest: `Mi Cava`, `display: standalone`, `theme_color #0F0D0C`, iconos 192/512 + maskable, `start_url: '/'`, `lang: es`. Instalable sin service worker propio: Workbox genera el precache. Estrategia: app shell cache-first; no hay API que cachear. Si hay actualización, aviso discreto "Nueva versión disponible · Recargar" (no recarga forzada, que podría cortar una edición).

## 14. Estructura de archivos

```
.
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ eslint.config.js
├─ LICENSE                       (MIT)
├─ README.md                     (qué es, cómo correr, cómo instalar, backup)
├─ docs/superpowers/specs/2026-10-29-cava-design.md
├─ docs/superpowers/plans/…      (plan de implementación)
├─ public/
│  ├─ icons/icon-192.png, icon-512.png, maskable-512.png, icon.svg, favicon.svg
├─ src/
│  ├─ main.tsx, App.tsx, index.css
│  ├─ db/
│  │  ├─ schema.ts                (tipos Wine, StockEvent, WineType, Bundle)
│  │  ├─ db.ts                    (instancia Dexie, migraciones)
│  │  └─ repo.ts                  (única puerta a datos + derivados)
│  ├─ domain/
│  │  ├─ normalize.ts             (minúsculas, sin acentos)
│  │  ├─ drinkWindow.ts           (status, texto del badge)
│  │  ├─ search.ts                (filtro)
│  │  ├─ stats.ts                 (totales, valor, reparto)
│  │  └─ dedupe.ts                (clave de vino, plan de importación)
│  ├─ services/
│  │  ├─ exporters.ts             (JSON, CSV)
│  │  ├─ importer.ts              (parseo, automapeo, validación, plan)
│  │  ├─ labelScanner.ts          (interfaz + selector de implementación)
│  │  ├─ gemini.ts                (implementación remota)
│  │  └─ mockScanner.ts
│  ├─ hooks/
│  │  ├─ useWines.ts              (liveQuery)
│  │  ├─ useTheme.ts
│  │  └─ useToast.tsx
│  ├─ components/ui/
│  │  ├─ Button.tsx, IconButton.tsx, Badge.tsx, Field.tsx, Sheet.tsx,
│  │  ├─ BottomNav.tsx, SideBar.tsx, Toast.tsx, ConfirmDialog.tsx, EmptyState.tsx
│  │  ├─ StockStepper.tsx         (+ / − con deshacer)
│  │  └─ DrinkBadge.tsx
│  ├─ features/
│  │  ├─ cellar/  CellarScreen.tsx, WineRow.tsx, SearchBar.tsx, WineDetailSheet.tsx
│  │  ├─ add/     AddScreen.tsx, WineForm.tsx, VintagePicker.tsx, LabelScannerField.tsx
│  │  ├─ history/ HistoryScreen.tsx
│  │  └─ settings/ SettingsScreen.tsx, StatsPanel.tsx, DataPanel.tsx,
│  │                ImportMappingScreen.tsx, ImportPlanScreen.tsx
│  └─ lib/        uuid.ts, dates.ts, money.ts, download.ts, cn.ts
└─ tests/
   ├─ normalize.test.ts, drinkWindow.test.ts, stats.test.ts, dedupe.test.ts,
   ├─ importer.test.ts, exporters.test.ts, repo.test.ts (fake-indexeddb)
```

## 15. Pruebas y verificación

- **Unitarias (Vitest)**: normalización y búsqueda con acentos; semáforo en los cuatro estados y con ventana vacía; estadísticas con precios en céntimos; clave de deduplicación (mismo nombre distinta añada, NV, bodega ausente → posible duplicado); importador (alias de CellarTracker, `1001`→NV, fechas `dd/mm` y `mm/dd` con y sin ambigüedad, precio con `€` y miles, filas inválidas, duplicados internos, **re-import del mismo JSON = cero cambios**, JSON plano sin eventos); exportadores (ida y vuelta JSON → import = misma cava; CSV con comillas y comas en el nombre); `repo` con `fake-indexeddb` (stock nunca negativo, descorche a 0 conserva el vino, deshacer revierte stock **y** retira el descorche del histórico, doble deshacer imposible, transacción de importación falla entera).
- **Tipos**: `tsc --noEmit` limpio, sin `any` en `domain/` ni `db/`.
- **Lint**: ESLint + react-hooks, sin warnings.
- **Build**: `npm run build` y comprobación de que el precache incluye todo.
- **Humo manual** (navegador integrado, viewport 390×844 y 1280×800): añadir, `+1`, `−1` hasta 0, verlo en Historial, deshacer, recargar y comprobar persistencia, exportar JSON, importar el mismo JSON (debe salir "0 nuevos, todo igual"), cambiar tema, instalar. Capturas como evidencia.
- No hay E2E automatizado en V0 (Playwright llega cuando haya V1 con sincronización).

## 16. Rendimiento

Lista completa en memoria (≤ 250 filas), sin virtualización. Búsqueda con `useMemo` sobre 250 elementos: despreciable. Escrituras de un evento: una transacción Dexie de milisegundos. `liveQuery` evita refetch manual. Bundle objetivo < 200 KB gzip (React + Dexie + papaparse; Tailwind purga).

## 17. Riesgos y límites conocidos

- **Un dispositivo**: el respaldo es exportar. Sin exportar, perder el navegador es perder la cava. El README lo dice en la primera pantalla y Ajustes muestra "última exportación: hace N días" si existe.
- **IndexedDB se puede borrar**: el navegador puede desalojar datos de sitios no visitados (Safari, 7 días en algunos casos). Mitigación: pedir persistencia (`navigator.storage.persist()`) al instalar y recordar exportar.
- **Una ubicación por referencia**: si las botellas del mismo vino están en dos sitios, se usa el texto de la ubicación como aproximación. Se documenta.
- **Precio por referencia**, no por compra: dos compras a distinto precio comparten precio. V0.1 podría moverlo al evento.
- **Sin valoración por cata**, solo nota de texto.
- **No hay forma de borrar un vino** en V0 (decisión de §5.16): un alta equivocada se queda en el Historial con stock 0 para siempre. La papelera es lo primero de V0.1.
- **Reloj del dispositivo**: fechas y semáforo usan la hora local; un móvil con la fecha mal pone los descorches en el día equivocado. No se corrige, se documenta.
- **CellarTracker cambia sus columnas**: el mapeo manual de la pantalla de importación es la red de seguridad; el automapeo es una comodidad, no una garantía.
- **OCR depende de una clave ajena** y de la red; si Gemini cambia el endpoint, solo se toca `gemini.ts`.

## 18. Lo que queda a criterio del constructor

- Nombres exactos de componentes y hooks, siempre dentro del árbol de §14.
- Composición visual fina (espaciados, jerarquía tipográfica) dentro de los tokens de §12.
- Generación de los PNG de icono a partir de un SVG propio.
- Textos definitivos de la UI en español, tono breve y directo.
- Cualquier optimización de render que no cambie el comportamiento.
