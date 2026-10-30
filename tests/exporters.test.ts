import Papa from 'papaparse';
import { describe, expect, it } from 'vitest';
import { CSV_COLUMNS, toCsv, toJson } from '@/services/exporters';
import type { CellarBundle, WineWithStock } from '@/db/schema';

const wine: WineWithStock = {
  id: 'w1',
  name: 'Muga Reserva',
  winery: 'Muga',
  vintage: 2019,
  region: 'Rioja',
  country: 'España',
  varietals: ['Tempranillo'],
  type: 'tinto',
  purchasedAt: '2026-10-01',
  priceCents: 1890,
  location: 'Balda 2',
  drinkFrom: 2022,
  drinkUntil: 2031,
  notes: '',
  createdAt: '2026-10-01T10:00:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  stock: 2,
};

function parse(csv: string) {
  return Papa.parse(csv.replace(/^\uFEFF/, ''), { header: true }).data[0] as Record<string, string>;
}

describe('toCsv', () => {
  it('escapa comillas, comas y saltos de línea y sobrevive a la ida y vuelta', () => {
    const csv = toCsv([{ ...wine, name: 'Château "Margaux", 1er cru', notes: 'Nota\ncon salto' }]);
    expect(csv).toContain('"Château ""Margaux"", 1er cru"');
    const row = parse(csv);
    expect(row.Notes).toBe('Nota\ncon salto');
    expect(row.Vintage).toBe('2019');
  });

  it('NV deja Vintage vacío y el precio usa punto decimal', () => {
    const row = parse(toCsv([{ ...wine, vintage: null, priceCents: 123450 }]));
    expect(row.Vintage).toBe('');
    expect(row.Price).toBe('1234.50');
    expect(row.Currency).toBe('EUR');
  });

  it('escribe las columnas de CellarTracker en orden', () => {
    const csv = toCsv([wine]);
    expect(csv.replace(/^\uFEFF/, '').split('\r\n')[0]).toBe(CSV_COLUMNS.join(','));
    expect(parse(csv).Quantity).toBe('2');
  });
});

describe('toJson', () => {
  it('serializa el bundle con indentación de dos espacios', () => {
    const bundle = { schemaVersion: 1, exportedAt: '2026-10-30T00:00:00.000Z', app: 'mi-cava', wines: [], events: [] } as unknown as CellarBundle;
    const json = toJson(bundle);
    expect(json).toBe(JSON.stringify(bundle, null, 2));
    expect(JSON.parse(json).app).toBe('mi-cava');
  });
});
