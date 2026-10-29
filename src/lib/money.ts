export function parsePriceToCents(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.,-]/g, '').trim()
  if (cleaned === '' || cleaned === '-') return null
  const normalized = cleaned.includes(',')
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned
  const value = Number(normalized)
  if (!Number.isFinite(value)) return null
  return Math.round(value * 100)
}

export function formatEuros(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  const euros = String(Math.floor(abs / 100))
  const decimals = String(abs % 100).padStart(2, '0')
  const grouped = euros.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${sign}${grouped},${decimals} €`
}
