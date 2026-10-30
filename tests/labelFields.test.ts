import { describe, expect, it } from 'vitest';
import { extractLabelFields, toLabelDraft } from '@/services/labelFields';

const byField = (text: string, year = 2026) =>
  Object.fromEntries(extractLabelFields(text, year).map((f) => [f.field, f.value]));

describe('extractLabelFields', () => {
  it('lee una etiqueta completa y no inventa el nombre', () => {
    const text = 'BODEGAS MUGA\nRESERVA 2019\nRIOJA\nTEMPRANILLO, GRACIANO Y MAZUELO\nTINTO';
    expect(byField(text)).toEqual({
      vintage: 2019,
      type: 'tinto',
      region: 'Rioja',
      country: 'España',
      varietals: ['tempranillo', 'graciano', 'mazuelo'],
      winery: 'BODEGAS MUGA',
    });
    expect(extractLabelFields(text, 2026).some((f) => f.field === ('name' as never))).toBe(false);
  });

  it('entiende 2.019 y descarta años imposibles', () => {
    expect(byField('RESERVA 2.019')).toMatchObject({ vintage: 2019 });
    expect(byField('COSECHA 1899')).not.toHaveProperty('vintage');
    expect(byField('COSECHA 2099')).not.toHaveProperty('vintage');
  });

  it('acepta regiones sin tilde y devuelve la forma canónica con país', () => {
    expect(byField('RIAS BAIXAS')).toMatchObject({ region: 'Rías Baixas', country: 'España' });
  });

  it('trata CAVA como tipo espumoso, no como región', () => {
    const fields = byField('CAVA BRUT NATURE');
    expect(fields).toMatchObject({ type: 'espumoso' });
    expect(fields).not.toHaveProperty('region');
  });

  it('no confunde palabras de la etiqueta con la bodega', () => {
    expect(byField('RESERVA\n2019\nTINTO')).not.toHaveProperty('winery');
    expect(byField('BODEGAS MUGA')).toMatchObject({ winery: 'BODEGAS MUGA' });
  });

  it('devuelve lista vacía con texto sin datos', () => {
    expect(extractLabelFields('', 2026)).toEqual([]);
    expect(extractLabelFields('la la la', 2026)).toEqual([]);
  });

  it('toLabelDraft omite lo que no hay', () => {
    expect(toLabelDraft([])).toEqual({});
    expect(toLabelDraft(extractLabelFields('RIOJA 2019 TINTO', 2026))).toMatchObject({
      vintage: 2019,
      type: 'tinto',
      region: 'Rioja',
    });
  });
});
