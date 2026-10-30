import Papa from 'papaparse';
import type { CellarBundle, StockEvent, Wine, WineDraft, WineType } from '@/db/schema';
import { defaultWindow } from '@/domain/drinkWindow';
import { findDuplicate, wineKey } from '@/domain/dedupe';
import { normalize } from '@/domain/normalize';
import { parsePriceToCents } from '@/lib/money';

export type Field =
  | 'name'
  | 'winery'
  | 'vintage'
  | 'region'
  | 'country'
  | 'varietals'
  | 'type'
  | 'stock'
  | 'price'
  | 'purchasedAt'
  | 'location'
  | 'notes'
  | 'drinkFrom'
  | 'drinkUntil';

export type DateOrder = 'dmy' | 'mdy';

export interface ParsedTable {
  headers: string[];
  rows: string[][];
}

export interface RowError {
  line: number;
  message: string;
}

export interface ImportPlan {
  creates: WineDraft[];
  merges: Array<{ wineId: string; addStock: number; patch: Partial<Wine> }>;
  possibleDuplicates: Array<{ line: number; name: string; vintage: number | null; draft: WineDraft }>;
  errors: RowError[];
}

const ALIASES: Record<Field, string[]> = {
  name: ['wine', 'name', 'nombre', 'vino', 'wine name'],
  winery: ['producer', 'winery', 'bodega', 'producer name'],
  vintage: ['vintage', 'anada', 'year', 'vint'],
  region: ['region', 'region viticola'],
  country: ['country', 'pais'],
  varietals: ['varietal', 'uva', 'variety', 'cepa', 'mastervarietal', 'master varietal'],
  type: ['type', 'color', 'tipo'],
  stock: ['quantity', 'stock', 'qty', 'bottles', 'cantidad'],
  price: ['price', 'coste', 'cost', 'precio'],
  purchasedAt: ['purchasedate', 'purchase date', 'fecha de compra', 'fecha compra'],
  location: ['location', 'bin', 'ubicacion', 'estante'],
  notes: ['notes', 'private note', 'notas', 'tasting notes'],
  drinkFrom: ['beginconsume', 'drink from', 'desde'],
  drinkUntil: ['endconsume', 'drink until', 'hasta'],
};

const TYPES: WineType[] = ['tinto', 'blanco', 'rosado', 'espumoso', 'dulce', 'fortificado'];

const ALIAS_LOOKUP = new Map<string, Field>();
for (const [field, aliases] of Object.entries(ALIASES) as Array<[Field, string[]]>) {
  for (const alias of aliases) ALIAS_LOOKUP.set(normalize(alias), field);
}

export function parseCsv(text: string): ParsedTable {
  const clean = text.replace(/^\uFEFF/, '');
  const delimiter = clean.includes(',') ? ',' : clean.includes(';') ? ';' : '\t';
  const parsed = Papa.parse<string[]>(clean, { delimiter, skipEmptyLines: true });
  const [headers = [], ...rows] = parsed.data.map((row) => row.map((cell) => String(cell ?? '')));
  return { headers, rows };
}

export function autoMap(headers: string[]): Array<Field | null> {
  return headers.map((header) => ALIAS_LOOKUP.get(normalize(header)) ?? null);
}

export function parseVintage(raw: string, currentYear = new Date().getFullYear()): number | null | 'error' {
  const text = raw.trim();
  if (text === '' || normalize(text) === 'nv' || text === '1001') return null;
  if (!/^\d{4}$/.test(text)) return 'error';
  const year = Number(text);
  return year >= 1900 && year <= currentYear + 1 ? year : 'error';
}

export function parseStamp(raw: string, order: DateOrder): string | null {
  const text = raw.trim();
  if (text === '') return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return validIso(text) ? text : null;
  const parts = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(text);
  if (!parts) return null;
  const [, a = '', b = '', y = ''] = parts;
  const year = y.length === 2 ? 2000 + Number(y) : Number(y);
  const day = Number(order === 'dmy' ? a : b);
  const month = Number(order === 'dmy' ? b : a);
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return validIso(iso) ? iso : null;
}

function validIso(iso: string): boolean {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function cell(record: Map<Field, string>, field: Field): string {
  return (record.get(field) ?? '').trim();
}

function parseYear(raw: string): number | null {
  const year = Number(raw.trim());
  return /^\d{4}$/.test(raw.trim()) && Number.isFinite(year) ? year : null;
}

export function planImport(
  table: ParsedTable,
  map: Array<Field | null>,
  dateOrder: DateOrder,
  existing: Wine[],
): ImportPlan {
  const plan: ImportPlan = { creates: [], merges: [], possibleDuplicates: [], errors: [] };
  const drafts: Array<{ draft: WineDraft; line: number }> = [];
  const byKey = new Map<string, WineDraft>();

  table.rows.forEach((row, index) => {
    const line = index + 2;
    const record = new Map<Field, string>();
    map.forEach((field, column) => {
      if (field) record.set(field, row[column] ?? '');
    });

    const name = cell(record, 'name');
    if (!name) {
      plan.errors.push({ line, message: 'falta el nombre' });
      return;
    }
    const vintage = parseVintage(cell(record, 'vintage'));
    if (vintage === 'error') {
      plan.errors.push({ line, message: 'añada no válida' });
      return;
    }
    const rawStock = cell(record, 'stock');
    const stock = rawStock === '' ? 1 : Number(rawStock);
    if (!Number.isInteger(stock) || stock < 0) {
      plan.errors.push({ line, message: 'stock no válido' });
      return;
    }

    const typeRaw = normalize(cell(record, 'type'));
    const type = TYPES.find((t) => t === typeRaw) ?? null;
    const drinkFrom = parseYear(cell(record, 'drinkFrom'));
    const drinkUntil = parseYear(cell(record, 'drinkUntil'));
    const window = drinkFrom === null && drinkUntil === null ? defaultWindow(vintage) : { drinkFrom, drinkUntil };

    const draft: WineDraft = {
      name,
      winery: cell(record, 'winery'),
      vintage,
      region: cell(record, 'region'),
      country: cell(record, 'country'),
      varietals: cell(record, 'varietals')
        .split(/[,;/]/)
        .map((v) => v.trim())
        .filter(Boolean),
      type,
      purchasedAt: parseStamp(cell(record, 'purchasedAt'), dateOrder),
      priceCents: parsePriceToCents(cell(record, 'price')),
      location: cell(record, 'location'),
      drinkFrom: window.drinkFrom,
      drinkUntil: window.drinkUntil,
      notes: cell(record, 'notes'),
      stock,
    };

    const key = wineKey(draft);
    const same = byKey.get(key);
    if (same) {
      same.stock = (same.stock ?? 0) + stock;
      fillGaps(same, draft);
      return;
    }
    byKey.set(key, draft);
    drafts.push({ draft, line });
  });

  for (const { draft, line } of drafts) {
    if ((draft.stock ?? 0) === 0) continue;
    const match = findDuplicate(existing, draft);
    if (match.exact) {
      const merge = plan.merges.find((m) => m.wineId === match.exact!.id);
      const patch = gaps(match.exact, draft);
      if (merge) {
        merge.addStock += draft.stock ?? 0;
        Object.assign(merge.patch, patch);
      } else {
        plan.merges.push({ wineId: match.exact.id, addStock: draft.stock ?? 0, patch });
      }
      continue;
    }
    if (match.possible.length > 0) {
      plan.possibleDuplicates.push({ line, name: draft.name, vintage: draft.vintage, draft });
      continue;
    }
    plan.creates.push(draft);
  }

  return plan;
}

function gaps(target: Wine, draft: WineDraft): Partial<Wine> {
  const patch: Partial<Wine> = {};
  if (!target.winery && draft.winery) patch.winery = draft.winery;
  if (!target.region && draft.region) patch.region = draft.region;
  if (!target.country && draft.country) patch.country = draft.country;
  if ((target.varietals?.length ?? 0) === 0 && draft.varietals.length > 0) patch.varietals = draft.varietals;
  if (!target.type && draft.type) patch.type = draft.type;
  if (!target.location && draft.location) patch.location = draft.location;
  if (!target.notes && draft.notes) patch.notes = draft.notes;
  if (target.priceCents === null && draft.priceCents !== null) patch.priceCents = draft.priceCents;
  if (target.drinkFrom === null && draft.drinkFrom !== null) patch.drinkFrom = draft.drinkFrom;
  if (target.drinkUntil === null && draft.drinkUntil !== null) patch.drinkUntil = draft.drinkUntil;
  return patch;
}

function fillGaps(target: WineDraft, source: WineDraft): void {
  if (!target.winery && source.winery) target.winery = source.winery;
  if (!target.region && source.region) target.region = source.region;
  if (!target.country && source.country) target.country = source.country;
  if (target.varietals.length === 0 && source.varietals.length > 0) target.varietals = source.varietals;
  if (!target.type && source.type) target.type = source.type;
  if (!target.location && source.location) target.location = source.location;
  if (!target.notes && source.notes) target.notes = source.notes;
  if (target.priceCents === null && source.priceCents !== null) target.priceCents = source.priceCents;
}

export function countPlan(plan: ImportPlan): { creates: number; merges: number; duplicates: number; errors: number } {
  return {
    creates: plan.creates.length,
    merges: plan.merges.length,
    duplicates: plan.possibleDuplicates.length,
    errors: plan.errors.length,
  };
}

export function readBundleFile(text: string): CellarBundle {
  const parsed: unknown = JSON.parse(text);
  if (isBundle(parsed)) return parsed;
  const flat: unknown[] = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { wines?: unknown }).wines)
      ? ((parsed as { wines: unknown[] }).wines)
      : [];
  const now = new Date().toISOString();
  const wines: CellarBundle['wines'] = [];
  const events: StockEvent[] = [];
  for (const item of flat) {
    if (typeof item !== 'object' || item === null) continue;
    const raw = item as Record<string, unknown>;
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) continue;
    const id = crypto.randomUUID();
    const stock = typeof raw.stock === 'number' && Number.isFinite(raw.stock) ? Math.trunc(raw.stock) : 1;
    const wine: CellarBundle['wines'][number] = {
      id,
      name,
      winery: str(raw.winery),
      vintage: typeof raw.vintage === 'number' ? raw.vintage : null,
      region: str(raw.region),
      country: str(raw.country),
      varietals: Array.isArray(raw.varietals) ? raw.varietals.filter((v): v is string => typeof v === 'string') : [],
      type: TYPES.find((t) => t === raw.type) ?? null,
      purchasedAt: typeof raw.purchasedAt === 'string' ? raw.purchasedAt : null,
      priceCents: typeof raw.priceCents === 'number' ? raw.priceCents : null,
      location: str(raw.location),
      drinkFrom: typeof raw.drinkFrom === 'number' ? raw.drinkFrom : null,
      drinkUntil: typeof raw.drinkUntil === 'number' ? raw.drinkUntil : null,
      notes: str(raw.notes),
      createdAt: now,
      updatedAt: now,
      stock,
      history: [],
    };
    wines.push(wine);
    events.push({ id: crypto.randomUUID(), wineId: id, delta: stock, kind: 'import', at: now });
  }
  return { schemaVersion: 1, exportedAt: now, app: 'mi-cava', wines, events };
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isBundle(value: unknown): value is CellarBundle {
  if (typeof value !== 'object' || value === null) return false;
  const bundle = value as Partial<CellarBundle>;
  return bundle.schemaVersion === 1 && Array.isArray(bundle.wines) && Array.isArray(bundle.events);
}
