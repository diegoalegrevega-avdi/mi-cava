import type { LabelDraft } from '@/services/labelScanner';

export interface OffProduct {
  code: string;
  name: string;
  brand: string;
  country: string;
  isWine: boolean;
}

export const OFF_ATTRIBUTION = 'Datos de Open Food Facts';
export const OFF_URL = 'https://world.openfoodfacts.org';

const NETWORK_ERROR = 'No se pudo consultar Open Food Facts. ¿Tienes conexión?';

const COUNTRY_ES: Record<string, string> = {
  'en:spain': 'España',
  'en:france': 'Francia',
  'en:italy': 'Italia',
  'en:portugal': 'Portugal',
  'en:germany': 'Alemania',
  'en:argentina': 'Argentina',
  'en:chile': 'Chile',
  'en:australia': 'Australia',
  'en:netherlands': 'Países Bajos',
  'en:belgium': 'Bélgica',
  'en:united-kingdom': 'Reino Unido',
  'en:united-states': 'Estados Unidos',
  'en:mexico': 'México',
  'en:south-africa': 'Sudáfrica',
  'en:new-zealand': 'Nueva Zelanda',
  'en:austria': 'Austria',
  'en:switzerland': 'Suiza',
};

export function normalizeBarcode(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (![8, 12, 13, 14].includes(digits.length)) return null;
  let code = digits;
  if (code.length === 14) {
    if (!code.startsWith('0')) return null;
    code = code.slice(1);
  } else if (code.length === 12) {
    code = `0${code}`;
  }
  return validEan(code) ? code : null;
}

function validEan(code: string): boolean {
  const check = Number(code.at(-1));
  let sum = 0;
  let weight = 3;
  for (let i = code.length - 2; i >= 0; i--) {
    sum += Number(code[i]) * weight;
    weight = 4 - weight;
  }
  return (10 - (sum % 10)) % 10 === check;
}

export async function lookupBarcode(ean: string, fetchImpl: typeof fetch = fetch): Promise<OffProduct | null> {
  const code = normalizeBarcode(ean);
  if (!code) return null;
  const fields = 'code,product_name,brands,countries_tags,categories_tags';
  const url = `${OFF_URL}/api/v2/product/${code}.json?fields=${fields}`;
  let payload: unknown;
  try {
    const res = await fetchImpl(url);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(String(res.status));
    payload = await res.json();
  } catch {
    throw new Error(NETWORK_ERROR);
  }

  const body = payload as { status?: number; product?: Record<string, unknown> };
  if (body.status !== 1 || !body.product) return null;
  const product = body.product;
  const categories = Array.isArray(product.categories_tags) ? product.categories_tags : [];
  const countries = Array.isArray(product.countries_tags) ? product.countries_tags : [];
  const firstCountry = typeof countries[0] === 'string' ? countries[0] : '';

  return {
    code: typeof product.code === 'string' ? product.code : code,
    name: typeof product.product_name === 'string' ? product.product_name.trim() : '',
    brand: typeof product.brands === 'string' ? (product.brands.split(',')[0] ?? '').trim() : '',
    country: COUNTRY_ES[firstCountry] ?? '',
    isWine: categories.includes('en:wines'),
  };
}

export function toOffDraft(product: OffProduct): LabelDraft {
  const draft: LabelDraft = {};
  if (product.name) draft.name = product.name;
  if (product.brand) draft.winery = product.brand;
  return draft;
}
