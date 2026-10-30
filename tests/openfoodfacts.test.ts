import { describe, expect, it, vi } from 'vitest';
import { lookupBarcode, normalizeBarcode, toOffDraft } from '@/services/openfoodfacts';

const wine = {
  status: 1,
  product: {
    code: '8410302106300',
    product_name: 'Campo Viejo Rioja tempranillo',
    brands: 'Campo Viejo, Compañía',
    countries_tags: ['en:australia'],
    categories_tags: ['en:alcoholic-beverages', 'en:wines'],
  },
};

describe('normalizeBarcode', () => {
  it('limpia espacios, guiones y valida el dígito de control', () => {
    expect(normalizeBarcode('8410 3021 06300')).toBe('8410302106300');
    expect(normalizeBarcode('8410-3021-06300')).toBe('8410302106300');
    expect(normalizeBarcode('8410302106301')).toBeNull();
    expect(normalizeBarcode('abc')).toBeNull();
  });

  it('convierte un UPC-A de 12 dígitos en EAN-13', () => {
    expect(normalizeBarcode('036000291452')).toBe('0036000291452');
  });
});

describe('lookupBarcode', () => {
  it('devuelve nombre, marca y país de origen dudoso, sin aplicarlo', async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(wine), { status: 200 }));
    const product = await lookupBarcode('8410302106300', fetchImpl as unknown as typeof fetch);
    expect(product).toMatchObject({ name: 'Campo Viejo Rioja tempranillo', brand: 'Campo Viejo', isWine: true });
    expect(toOffDraft(product!)).toEqual({ name: 'Campo Viejo Rioja tempranillo', winery: 'Campo Viejo' });
  });

  it('marca como no vino un producto de otra categoría', async () => {
    const other = {
      status: 1,
      product: { code: '1', product_name: 'Maíz', brands: 'Mercadona', categories_tags: ['en:seeds'] },
    };
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(other), { status: 200 }));
    expect((await lookupBarcode('8410302106300', fetchImpl as unknown as typeof fetch))?.isWine).toBe(false);
  });

  it('devuelve null si no existe y lanza mensaje legible sin red', async () => {
    const missing = vi.fn(async () => new Response(JSON.stringify({ status: 0 }), { status: 200 }));
    expect(await lookupBarcode('8410302106300', missing as unknown as typeof fetch)).toBeNull();
    const down = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    await expect(lookupBarcode('8410302106300', down as unknown as typeof fetch)).rejects.toThrow(/conexión/i);
  });
});
