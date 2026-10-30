import Papa from 'papaparse';
import type { CellarBundle, WineWithStock } from '@/db/schema';

export const CSV_COLUMNS = [
  'Wine',
  'Producer',
  'Vintage',
  'Type',
  'Color',
  'Varietal',
  'Country',
  'Region',
  'Location',
  'Quantity',
  'Price',
  'Currency',
  'PurchaseDate',
  'BeginConsume',
  'EndConsume',
  'Notes',
] as const;

export function toCsv(wines: WineWithStock[]): string {
  const rows = wines.map((w) => ({
    Wine: w.name,
    Producer: w.winery,
    Vintage: w.vintage === null ? '' : String(w.vintage),
    Type: w.type ?? '',
    Color: w.type ?? '',
    Varietal: w.varietals.join(', '),
    Country: w.country,
    Region: w.region,
    Location: w.location,
    Quantity: String(w.stock),
    Price: w.priceCents === null ? '' : (w.priceCents / 100).toFixed(2),
    Currency: 'EUR',
    PurchaseDate: w.purchasedAt ?? '',
    BeginConsume: w.drinkFrom === null ? '' : String(w.drinkFrom),
    EndConsume: w.drinkUntil === null ? '' : String(w.drinkUntil),
    Notes: w.notes,
  }));
  return '\uFEFF' + Papa.unparse(rows, { columns: [...CSV_COLUMNS], newline: '\r\n' });
}

export function toJson(bundle: CellarBundle): string {
  return JSON.stringify(bundle, null, 2);
}
