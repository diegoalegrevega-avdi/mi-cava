import { describe, expect, it } from 'vitest';
import {
  autoMap,
  countPlan,
  parseCsv,
  parseStamp,
  parseVintage,
  planImport,
  readBundleFile,
} from '@/services/importer';
import type { Wine } from '@/db/schema';

const existing = [
  { id: 'x', name: 'Otra', vintage: 2019, winery: 'OtraBodega' } as Wine,
];

describe('autoMap', () => {
  it('automapea cabeceras de CellarTracker y en español', () => {
    expect(autoMap(['iWine', 'Wine', 'Vintage', 'Producer', 'Varietal', 'Region', 'Quantity', 'Price', 'Location', 'Private Note'])).toEqual([
      null,
      'name',
      'vintage',
      'winery',
      'varietals',
      'region',
      'stock',
      'price',
      'location',
      'notes',
    ]);
    expect(autoMap(['Nombre', 'Añada', 'Bodega', 'Cantidad', 'Fecha de compra'])).toEqual([
      'name',
      'vintage',
      'winery',
      'stock',
      'purchasedAt',
    ]);
  });
});

describe('parseVintage', () => {
  it('añadas: 1001/NV/vacía → NV, fuera de rango o texto → error', () => {
    expect(parseVintage('1001')).toBeNull();
    expect(parseVintage('NV')).toBeNull();
    expect(parseVintage('')).toBeNull();
    expect(parseVintage('2019')).toBe(2019);
    expect(parseVintage('20199')).toBe('error');
    expect(parseVintage('abc')).toBe('error');
  });
});

describe('parseStamp', () => {
  it('fechas: ISO, dmy y mdy, y null si no se puede', () => {
    expect(parseStamp('2026-03-05', 'dmy')).toBe('2026-03-05');
    expect(parseStamp('05/03/2026', 'dmy')).toBe('2026-03-05');
    expect(parseStamp('05/03/2026', 'mdy')).toBe('2026-05-03');
    expect(parseStamp('31/02/2026', 'dmy')).toBeNull();
  });
});

describe('planImport', () => {
  it('precio europeo y plan con errores, duplicados internos y posible duplicado', () => {
    const csv = [
      'Wine,Vintage,Producer,Quantity,Price',
      'Tinto,2019,Bodega,2,"1.234,50 €"',
      ',2019,Bodega,1,10',
      'Tinto,2019,Bodega,3,5',
      'Otra,2019,OtraBodega,1,10',
      'Otra,2019,OtraOtra,1,10',
      '',
    ].join('\n');
    const table = parseCsv(csv);
    const plan = planImport(table, autoMap(table.headers), 'dmy', existing);
    expect(plan.errors).toHaveLength(1);
    expect(plan.creates).toHaveLength(1);
    expect(plan.merges).toHaveLength(1);
    expect(plan.creates[0]!.stock).toBe(5);
    expect(plan.creates[0]!.priceCents).toBe(123450);
    expect(plan.merges[0]).toMatchObject({ wineId: 'x', addStock: 1 });
    expect(plan.possibleDuplicates).toEqual([{ line: 6, name: 'Otra', vintage: 2019 }]);
    expect(countPlan(plan)).toEqual({ creates: 1, merges: 1, duplicates: 1, errors: 1 });
  });

  it('rellena solo los huecos del vino existente y aplica la ventana por defecto', () => {
    const table = parseCsv('Wine,Vintage,Producer,Quantity,Region\nOtra,2019,OtraBodega,2,Rioja\n');
    const target = { ...existing[0]!, region: '', notes: 'mía' } as Wine;
    const plan = planImport(table, autoMap(table.headers), 'dmy', [target]);
    expect(plan.merges).toHaveLength(1);
    expect(plan.merges[0]!.patch).toEqual({ region: 'Rioja' });
    expect(plan.merges[0]!.patch.notes).toBeUndefined();
  });

  it('ventana por defecto desde la añada cuando el CSV no la trae', () => {
    const table = parseCsv('Wine,Vintage,Quantity\nNuevo,2015,1\n');
    const plan = planImport(table, autoMap(table.headers), 'dmy', []);
    expect(plan.creates[0]).toMatchObject({ drinkFrom: 2018, drinkUntil: 2027 });
  });
});

describe('readBundleFile', () => {
  it('convierte un JSON plano del pedido en un bundle con eventos', () => {
    const flat = JSON.stringify([{ name: 'Muga', vintage: 2019, winery: 'Muga', stock: 3 }]);
    const bundle = readBundleFile(flat);
    expect(bundle.schemaVersion).toBe(1);
    expect(bundle.wines[0]!.name).toBe('Muga');
    expect(bundle.wines[0]!.stock).toBe(3);
    expect(bundle.events[0]).toMatchObject({ delta: 3, kind: 'import' });
  });

  it('acepta un bundle propio sin tocarlo', () => {
    const bundle = readBundleFile(JSON.stringify({ schemaVersion: 1, app: 'mi-cava', exportedAt: 'x', wines: [], events: [] }));
    expect(bundle.events).toEqual([]);
  });
});
