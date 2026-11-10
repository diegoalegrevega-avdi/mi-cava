# Cava 3D + Estadísticas — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir una vista 2D de "Cava 3D" (SVG, botellas como cilindros en cuadrícula profundidad × ancho × pisos, coloreadas por tipo), configuración en Ajustes, y una sección "Estadísticas" completa con donut por tipo, tarjetas de apogeo y evolución mensual de descorches.

**Architecture:** Tres bloques independientes que comparten el repositorio y el modelo: (1) `src/features/cellar/Cave3D.tsx` + `src/domain/caveLayout.ts` (lógica pura de layout + SVG), (2) `src/features/settings/StatsPanel.tsx` ampliado con `StatsSection.tsx` + `src/domain/monthly.ts` (eventos mensuales + donut), (3) `src/features/settings/CaveConfig.tsx` + `localStorage['micava.cave']`. Sin nuevas dependencias.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Tailwind 4, Vitest 5. Sin Three.js / WebGL / dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-11-10-cava-3d-stats-design.md`

## Global Constraints

- PowerShell: siempre `npm.cmd`, nunca `npm`.
- `vite.config.ts` ya tiene `base: '/mi-cava/'`.
- Ejecución nativa en esta sesión; 1 subagente revisor al final.
- 2D puro SVG/canvas — **no Three.js, no WebGL, no dependencias nuevas**.
- Tokens de color y semáforo existentes (`text-wine`, `DRINK_LABEL`, `typeColors`).
- `localStorage['micava.cave']` con defaults `{depth: 8, width: 1, shelves: 3, fill: 'wine'}`.
- Capacidad máxima 320 (warning soft, no clamp en steppers).
- Sin migración de Dexie; la config es clave-valor en localStorage.

## Review Focus

1. **Botellas con stock > 0 en `layoutCave`** (cero stock van a Historial, no a la cava 3D).
2. **Descorches revertidos (undo) NO cuentan** en `monthlyConsumptions` (coincide con Historial).
3. **Config depth > 1: row-major + wrapping por piso + pila de sobrantes** — tests unitarios cubren casos límite.
4. **Cap 320 es warning soft, no bloqueo** — steppers pueden ir a 640, aviso y recorte visual.
5. **Donut incluye `sinTipo`** al final, con colores del diseño; caso un solo tipo = círculo completo + leyenda 100%.

---

### Task 1: Dominio — layoutCave y monthlyConsumptions

**Files:**
- Create: `src/domain/caveLayout.ts`, `src/domain/monthly.ts`
- Test: `tests/caveLayout.test.ts`, `tests/monthly.test.ts`

**Interfaces:**
- Consumes: `WineWithStock`, `StockEvent`, `drinkStatus`, `DRINK_LABEL`, `computeStats`.
- Produces:
  - `interface CaveConfig { depth: number; width: number; shelves: number; fill: 'wine' | 'type' }`
  - `interface Cell { wineId: string | null; wine?: WineWithStock }`
  - `type CaveGrid = Cell[][][]` — `[shelf][depth][width]`
  - `layoutCave(wines: WineWithStock[], config: CaveConfig): { grid: CaveGrid; overflow: Array<{wineId, count}> }`
  - `monthlyConsumptions(events: StockEvent[], year: number): Array<{month: number; count: number}>` — 12 meses, cero si vacío, excluye `undo`.

- [ ] **Step 1: Escribir tests**

```ts
// tests/caveLayout.test.ts
import { describe, expect, it } from 'vitest'
import { layoutCave } from '@/domain/caveLayout'
import { normalize } from '@/domain/normalize'

const wines = [
  { id: '1', name: 'A', winery: '', vintage: 2019, stock: 3 },
  { id: '2', name: 'B', winery: '', vintage: 2018, stock: 2 },
  { id: '3', name: 'C', winery: '', vintage: 2020, stock: 5 },
] as any

describe('layoutCave', () => {
  it('row-major: profundida->ancho, wrapping por piso, overflow', () => {
    const cfg = { depth: 2, width: 2, shelves: 1, fill: 'wine' }
    const { grid, overflow } = layoutCave(wines, cfg)
    // shelf 0, depth 0: [A, A] (w=2) → depth 1: [A] + wrap a siguiente fila
    // shelf 0, depth 1: [B, B] → depth 0 next shelf
    // shelf 0, depth 1: [C, C] → overflow 3
    expect(grid[0].length).toBe(2) // depth
    expect(grid[0][0].length).toBe(2) // width
    expect(overflow).toHaveLength(1)
    expect(overflow[0].count).toBe(3) // C tiene 5, caben 2
  })

  it('fill: type agrupa por tipo', () => {
    const mixed = [
      { id: '1', name: 'Tinto1', type: 'tinto', stock: 2 },
      { id: '2', name: 'Blanco1', type: 'blanco', stock: 2 },
      { id: '3', name: 'Tinto2', type: 'tinto', stock: 1 },
    ] as any
    const { grid } = layoutCave(mixed, { depth: 2, width: 2, shelves: 1, fill: 'type' })
    // tinto primero, luego blanco
    const cells = grid.flat().flat().filter(c => c.wineId).map(c => c.wine!.type)
    expect(cells.slice(0, 3)).toEqual(['tinto', 'tinto', 'tinto'])
  })

  it('profundos >1, pila de sobrantes', () => {
    const many = [{ id: '1', name: 'X', stock: 10 }] as any
    const { overflow } = layoutCave(many, { depth: 3, width: 2, shelves: 2, fill: 'wine' })
    expect(overflow[0].count).toBe(10 - 12) // capacity 12, overflow 0 if < cap
  })

  it('ignora vinos con stock <= 0', () => {
    const mixed = [
      { id: '1', name: 'A', stock: 2 },
      { id: '2', name: 'B', stock: 0 },
      { id: '3', name: 'C', stock: -1 },
    ] as any
    const { grid } = layoutCave(mixed, { depth: 1, width: 2, shelves: 1, fill: 'wine' })
    const ids = grid.flat().flat().filter(c => c.wineId).map(c => c.wineId)
    expect(ids).toEqual(['1'])
  })

  it('cap 320 soft: warning pero renderiza recortado', () => {
    const big = [{ id: '1', name: 'X', stock: 400 }] as any
    const { grid, overflow } = layoutCave(big, { depth: 4, width: 20, shelves: 4, fill: 'wine' }) // 320
    const total = grid.flat().flat().filter(c => c.wineId).length
    expect(total).toBe(320)
    expect(overflow[0].count).toBe(80)
  })
})
```

```ts
// tests/monthly.test.ts
import { describe, expect, it } from 'vitest'
import { monthlyConsumptions } from '@/domain/monthly'

describe('monthlyConsumptions', () => {
  it('12 meses, excluye undo, años vacíos = 0', () => {
    const now = new Date().getFullYear()
    const events = [
      { id: '1', kind: 'consume', at: `${now}-01-15T10:00:00.000Z' },
      { id: '2', kind: 'consume', at: `${now}-01-20T10:00:00.000Z' },
      { id: '3', kind: 'undo', undoOf: '1', at: `${now}-02-01T10:00:00.000Z' },
      { id: '4', kind: 'consume', at: `${now}-03-10T10:00:00.000Z' },
    ]
    const res = monthlyConsumptions(events, now)
    expect(res).toHaveLength(12)
    expect(res[0].count).toBe(1) // ene: 2 consume - 1 undo = 1
    expect(res[1].count).toBe(0) // feb: solo undo
    expect(res[2].count).toBe(1) // mar
    expect(res[11].count).toBe(0)
  })

  it('año sin eventos = todos ceros', () => {
    expect(monthlyConsumptions([], 2020)).toEqual(Array(12).fill({ month: expect.any(Number), count: 0 }))
  })
})
```

- [ ] **Step 2: Verificar fallo** — `npm.cmd test tests/caveLayout.test.ts tests/monthly.test.ts` → FAIL.
- [ ] **Step 3: Implementar** `caveLayout.ts` y `monthly.ts` (row-major depth→width→shelf, wrapping por piso, pila overflow debajo; filtro `stock>0`, fill wine/type; monthly: `listEvents` → `kind==='consume'` && no `undoOf` en otro undo → group by month).
- [ ] **Step 4: Verificar PASS** + `typecheck` + `lint`.
- [ ] **Step 5: Commit**

```bash
git add src/domain/caveLayout.ts src/domain/monthly.ts tests/caveLayout.test.ts tests/monthly.test.ts
git commit -m "feat: cave layout algorithm and monthly consumption aggregation"
```

---

### Task 2: Dominio — donutSegments y statsSection

**Files:**
- Create: `src/domain/donut.ts`
- Modify: `src/domain/stats.ts` (export `typeCounts`, `apogeoCounts` ya existentes)
- Test: `tests/donut.test.ts`

**Interfaces:**
- Produces:
  - `donutSegments(counts: Record<string, number>): Array<{type, count, percent, color, startAngle, endAngle}>` — incluye `sinTipo` al final, orden `TYPE_LABEL`; un solo tipo → 1 segmento 0–360.
  - `StatsSectionProps` (ver Task 5).

- [ ] **Step 1: Test** — un tipo, múltiples tipos, sinTipo, cero totales.
- [ ] **Step 2–5: Implementar, test, commit**.

---

### Task 3: UI — componente Cave3D (SVG)

**Files:**
- Create: `src/features/cellar/Cave3D.tsx`, `src/features/cellar/CaveShelf.tsx`, `src/features/cellar/CaveBottle.tsx`
- Test: `tests/Cave3D.test.ts` (sin DOM; solo `layoutCave` ya testado).

**Interfaces:**
- Consumes: `layoutCave`, `CaveConfig`, `WineWithStock`, `drinkStatus`, `DRINK_LABEL`, `onOpen(id)` → `WineDetailSheet`.
- Produces: `Cave3D({ wines, config, onOpen })` — SVG responsivo, botellas cilíndricas coloreadas por tipo, huecos punteados, pila de sobrantes con badge, `role="img" aria-label`.

- [ ] **Step 1: Implementar** SVG inline (sin librería). Botella = rect + ellipse (cuello); color = `typeColor[type]`; semáforo opcional como anillo fino.
- [ ] **Step 2: Verificar en navegador** — `npm.cmd run dev`, `#/cava3d`, botellas correctas, clic abre ficha.
- [ ] **Step 3: Commit**

---

### Task 4: UI — sección Estadísticas en Ajustes

**Files:**
- Modify: `src/features/settings/StatsPanel.tsx` → export `StatsSection({ wines })` (duplica 4 cifras + donut + apogeo + evolución mensual).
- Create: `src/features/settings/MonthlyChart.tsx` (barras verticales SVG, 12 meses).
- Test: `tests/MonthlyChart.test.ts` (sin DOM; `monthlyConsumptions` testado).

**Interfaces:**
- Consumes: `computeStats`, `donutSegments`, `monthlyConsumptions`, `repo.listEvents()`.
- Produces: `StatsSection` en Ajustes (arriba 4 cifras, luego donut + apogeo, luego gráfico 12 meses). Duplica `DataPanel` (no se toca `DataPanel`).

- [ ] **Step 1: Implementar** `MonthlyChart` SVG barras verticales (altura proporcional, mes vacío = 0, tooltip `mes: N`).
- [ ] **Step 2: Integrar en `StatsPanel`** como `StatsSection`; `useLiveQuery(() => listEvents())` para eventos.
- [ ] **Step 3: Verificar** — Ajustes muestra cifras + donut + apogeo + barras 12 meses coincidiendo con Historial.
- [ ] **Step 4: Commit**

---

### Task 5: Configuración de la Cava 3D

**Files:**
- Create: `src/features/settings/CaveConfig.tsx`
- Modify: `src/features/settings/SettingsScreen.tsx` (nueva tarjeta "Cava 3D" entre Apariencia y Tus datos).
- Test: `tests/CaveConfig.test.ts` (sin DOM; localStorage mock).

**Interfaces:**
- Consumes: `localStorage['micava.cave']`, `CaveConfig` defaults `{depth:8, width:1, shelves:3, fill:'wine'}`.
- Produces: `CaveConfig` — 4 steppers (prof/anc/pisos) + select fill (Por vino / Por tipo); cap 320 soft warning; `onChange` guarda y recarga cava 3D.

- [ ] **Step 1: Implementar** tarjeta en SettingsScreen, steppers 1–20/1–4/1–8, select, warning si `d*w*s > 320`.
- [ ] **Step 2: Verificar** — cambia config → localStorage actualizado → cava 3D se recalcula.
- [ ] **Step 3: Commit**

---

### Task 6: Integración — route `#/cava3d` y botón en Mi Cava

**Files:**
- Modify: `src/nav.ts` (nuevo `NavId` 'cava3d'), `src/components/BottomNav.tsx`, `src/components/SideBar.tsx` (solo 'cava' en nav; 3D no aparece en nav).
- Modify: `src/App.tsx` — `TITLES['cava3d'] = 'Cava 3D'`, `Screen` case `'cava3d'`.
- Modify: `src/features/cellar/CellarScreen.tsx` — botón "Ver cava 3D" al lado del buscador (naviga a `#/cava3d`).
- Create: `src/features/cellar/Cave3DScreen.tsx` — wrapper que llama a `Cave3D` con `onOpen` que abre `WineDetailSheet`, botón "Volver a la lista" → `#/cava`.

**Interfaces:**
- Consumes: `Cave3D`, `WineDetailSheet`, `useWines`, `repo.getCaveConfig`.
- Produces: route `#/cava3d` funcional, header "Cava 3D", back button, botella → ficha.

- [ ] **Step 1: Implementar** route, botón en CellarScreen, Cave3DScreen.
- [ ] **Step 2: Verificar** — `#/cava3d` carga, botellas correctas, clic abre ficha, "Volver" regresa a `#/cava`, refresh mantiene la vista.
- [ ] **Step 3: Commit**

---

### Task 7: Build, README y cierre

**Files:**
- Modify: `README.md` (nueva sección "Cava 3D" y "Estadísticas completas").
- Test: `npm.cmd test`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run build`.
- Verificación: humo en navegador (`#/cava`, `#/cava3d`, `#/ajustes`).

- [ ] **Step 1: Build y tests** — 0 errores, tests PASS, build ≤ 135 kB gzip (SVG inline no añade bundle).
- [ ] **Step 2: README** — explica cava 3D, config, stats.
- [ ] **Step 3: Commit final**

```bash
git add -A
git commit -m "feat: Cava 3D configurable +Estadísticas completas (donut + apogeo + evolución)"
```

---

## Notas de ejecución

- Orden: 1 → 2 → 3 → 4 → 5 → 6 → 7. Ninguna tarea posterior cambia interfaces de una anterior sin actualizar su bloque **Interfaces**.
- Tests: puro node (`fake-indexeddb` no necesario salvo `monthly` que usa eventos; `layoutCave`, `donut`, `monthly` son funciones puras).
- Bundle: sin deps nuevas. SVG inline en componentes, 2D puro.
- Verificación en navegador al final de cada tarea UI (3, 4, 5, 6).