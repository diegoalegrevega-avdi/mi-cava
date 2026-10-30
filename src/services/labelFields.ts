import type { WineType } from '@/db/schema';
import { normalize } from '@/domain/normalize';
import type { LabelDraft } from '@/services/labelScanner';

export type FieldConfidence = 'alta' | 'media';

export interface DetectedField {
  field: 'vintage' | 'type' | 'region' | 'country' | 'varietals' | 'winery';
  value: number | WineType | string | string[];
  confidence: FieldConfidence;
  label: string;
}

interface Region {
  name: string;
  country: string;
}

const REGIONS: Region[] = [
  { name: 'Rioja Alavesa', country: 'España' },
  { name: 'Ribera del Duero', country: 'España' },
  { name: 'Rías Baixas', country: 'España' },
  { name: 'Campo de Borja', country: 'España' },
  { name: 'Utiel-Requena', country: 'España' },
  { name: 'La Mancha', country: 'España' },
  { name: 'Rioja', country: 'España' },
  { name: 'Rueda', country: 'España' },
  { name: 'Priorat', country: 'España' },
  { name: 'Penedès', country: 'España' },
  { name: 'Jerez', country: 'España' },
  { name: 'Jumilla', country: 'España' },
  { name: 'Toro', country: 'España' },
  { name: 'Bierzo', country: 'España' },
  { name: 'Navarra', country: 'España' },
  { name: 'Somontano', country: 'España' },
  { name: 'Montsant', country: 'España' },
  { name: 'Cariñena', country: 'España' },
  { name: 'Valdepeñas', country: 'España' },
  { name: 'Alicante', country: 'España' },
  { name: 'Yecla', country: 'España' },
  { name: 'Txakoli', country: 'España' },
  { name: 'Valdeorras', country: 'España' },
  { name: 'Ribeiro', country: 'España' },
  { name: 'Monterrei', country: 'España' },
  { name: 'Burdeos', country: 'Francia' },
  { name: 'Borgoña', country: 'Francia' },
  { name: 'Champaña', country: 'Francia' },
  { name: 'Loira', country: 'Francia' },
  { name: 'Alsacia', country: 'Francia' },
  { name: 'Ródano', country: 'Francia' },
  { name: 'Provenza', country: 'Francia' },
  { name: 'Beaujolais', country: 'Francia' },
  { name: 'Toscana', country: 'Italia' },
  { name: 'Chianti', country: 'Italia' },
  { name: 'Barolo', country: 'Italia' },
  { name: 'Piamonte', country: 'Italia' },
  { name: 'Véneto', country: 'Italia' },
  { name: 'Sicilia', country: 'Italia' },
  { name: 'Puglia', country: 'Italia' },
  { name: 'Duero', country: 'Portugal' },
  { name: 'Alentejo', country: 'Portugal' },
  { name: 'Vinho Verde', country: 'Portugal' },
  { name: 'Dão', country: 'Portugal' },
  { name: 'Mosel', country: 'Alemania' },
  { name: 'Rheingau', country: 'Alemania' },
  { name: 'Mendoza', country: 'Argentina' },
  { name: 'Maipo', country: 'Chile' },
  { name: 'Colchagua', country: 'Chile' },
  { name: 'Napa', country: 'Estados Unidos' },
  { name: 'Barossa', country: 'Australia' },
  { name: 'Stellenbosch', country: 'Sudáfrica' },
  { name: 'Marlborough', country: 'Nueva Zelanda' },
];

const GRAPES = [
  'tempranillo',
  'garnacha tintorera',
  'garnacha',
  'graciano',
  'mazuelo',
  'monastrell',
  'bobal',
  'mencía',
  'albariño',
  'godello',
  'treixadura',
  'verdejo',
  'viura',
  'macabeo',
  'xarel·lo',
  'parellada',
  'chardonnay',
  'sauvignon blanc',
  'semillón',
  'riesling',
  'gewürztraminer',
  'merlot',
  'cabernet sauvignon',
  'cabernet franc',
  'syrah',
  'petit verdot',
  'malbec',
  'pinot noir',
  'nebbiolo',
  'sangiovese',
  'palomino',
  'pedro ximénez',
  'moscatel',
  'airén',
];

const TYPE_WORDS: Array<[RegExp, WineType]> = [
  [/\btintos?\b|\breds?\b/, 'tinto'],
  [/\bblancos?\b|\bwhites?\b/, 'blanco'],
  [/\brosados?\b|\broses?\b/, 'rosado'],
  [/\bespumosos?\b|\bbrut\b|\bcava\b|\bchampagne\b|\bchampana\b|\bsparkling\b|\bprosecco\b/, 'espumoso'],
  [/\bdulces?\b|\bsweet\b|\bmoscatel\b|\bvendimia tardia\b/, 'dulce'],
  [/\bfortificados?\b|\bjerez\b|\bsherry\b|\boporto\b|\bport\b|\bmadeira\b|\bmarsala\b|\bvermut\b/, 'fortificado'],
];

const NOISE = new Set(
  [
    'reserva',
    'gran reserva',
    'crianza',
    'joven',
    'seleccion',
    'cosecha',
    'botella',
    'vino',
    'wine',
    'brut',
    'nature',
    '750ml',
    '750 ml',
    'tinto',
    'tintos',
    'red',
    'reds',
    'blanco',
    'blancos',
    'white',
    'whites',
    'rosado',
    'rosados',
    'rose',
    'espumoso',
    'espumosos',
    'dulce',
    'dulces',
    'sweet',
    'fortificado',
    'fortificados',
    'cava',
    'champagne',
    'champana',
    'prosecco',
    'sparkling',
    'jerez',
    'sherry',
    'oporto',
    'port',
    'madeira',
    'marsala',
    'vermut',
  ].map(normalize),
);

const WINERY_START = /^(bodegas?|cellers?|cellars?|winery|chateau|domaine|casa|vina)\b/;
const YEAR_LINE_HINT = /\b(ano|cosecha|vintage|reserva|crianza)\b/;
const YEAR = /\b(19\d{2}|20\d{2})\b/g;

function escape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsPhrase(haystack: string, phrase: string): boolean {
  return new RegExp(`(^|[^a-z0-9])${escape(normalize(phrase))}(?![a-z0-9])`).test(haystack);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function findRegion(text: string): Region | null {
  const sorted = [...REGIONS].sort((a, b) => b.name.split(' ').length - a.name.split(' ').length);
  return sorted.find((region) => containsPhrase(text, region.name)) ?? null;
}

function findVintage(lines: string[], year: number): { value: number; confidence: FieldConfidence } | null {
  const candidates = lines.map((line) => ({
    line,
    years: [...line.replace(/(\d)[.\s](?=\d)/g, '$1').matchAll(YEAR)].map((m) => Number(m[1])),
  }));
  const valid = candidates.filter((c) => c.years.some((y) => y >= 1900 && y <= year + 1));
  if (valid.length === 0) return null;
  const preferred = valid.find((c) => YEAR_LINE_HINT.test(normalize(c.line))) ?? valid[0];
  if (!preferred) return null;
  const value = preferred.years.find((y) => y >= 1900 && y <= year + 1) ?? preferred.years[0];
  if (value === undefined) return null;
  const alone = normalize(preferred.line).replace(/\s/g, '') === String(value);
  return { value, confidence: alone ? 'alta' : 'media' };
}

function findType(text: string): WineType | null {
  for (const [pattern, type] of TYPE_WORDS) if (pattern.test(text)) return type;
  return null;
}

function findVarietals(text: string): string[] {
  const found: Array<{ at: number; grape: string }> = [];
  for (const grape of GRAPES) {
    const match = new RegExp(`(^|[^a-z0-9])${escape(normalize(grape))}(?![a-z0-9])`).exec(text);
    if (match) found.push({ at: match.index, grape });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.grape);
}

function findWinery(lines: string[], taken: Set<string>): { name: string; confidence: FieldConfidence } | null {
  for (const line of lines) {
    const value = line.trim();
    if (WINERY_START.test(normalize(value))) return { name: value, confidence: 'alta' };
  }
  for (const line of lines) {
    const value = line.trim();
    const letters = value.replace(/[^\p{L}]/gu, '');
    if (letters.length < 4 || letters.length > 40) continue;
    if (value !== value.toUpperCase() || /\d/.test(value)) continue;
    const key = normalize(value);
    if (NOISE.has(key) || taken.has(key)) continue;
    return { name: value, confidence: 'media' };
  }
  return null;
}

export function extractLabelFields(text: string, currentYear: number): DetectedField[] {
  if (text.trim() === '') return [];
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const flat = normalize(text.replace(/\r?\n/g, ' '));
  const fields: DetectedField[] = [];

  const vintage = findVintage(lines, currentYear);
  if (vintage) {
    fields.push({ field: 'vintage', value: vintage.value, confidence: vintage.confidence, label: `Añada ${vintage.value}` });
  }

  const type = findType(flat);
  if (type) fields.push({ field: 'type', value: type, confidence: 'alta', label: capitalize(type) });

  const region = findRegion(flat);
  if (region) {
    fields.push({ field: 'region', value: region.name, confidence: 'alta', label: region.name });
    fields.push({ field: 'country', value: region.country, confidence: 'alta', label: region.country });
  }

  const varietals = findVarietals(flat);
  if (varietals.length > 0) {
    fields.push({
      field: 'varietals',
      value: varietals,
      confidence: 'alta',
      label: varietals.map(capitalize).join(', '),
    });
  }

  const taken = new Set<string>([
    ...REGIONS.map((r) => normalize(r.name)),
    ...GRAPES.map(normalize),
    ...NOISE,
  ]);
  const winery = findWinery(lines, taken);
  if (winery) fields.push({ field: 'winery', value: winery.name, confidence: winery.confidence, label: winery.name });

  return fields;
}

export function toLabelDraft(fields: DetectedField[]): LabelDraft {
  const draft: LabelDraft = {};
  for (const item of fields) {
    const key = item.field as keyof LabelDraft;
    (draft as Record<string, unknown>)[key] = item.value;
  }
  return draft;
}
