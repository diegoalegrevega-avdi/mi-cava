const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})/
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function formatDate(iso: string): string {
  const m = ISO_DATE.exec(iso)
  if (!m) return ''
  return `${m[3]}/${m[2]}/${m[1]}`
}

export function formatDateTime(iso: string): string {
  const date = formatDate(iso)
  if (!date) return ''
  const t = ISO_TIME.exec(iso)
  return t ? `${date} ${t[1]}:${t[2]}` : date
}

export function formatMonth(iso: string): string {
  const m = ISO_DATE.exec(iso)
  if (!m) return ''
  const month = MONTHS[Number(m[2]) - 1]
  return month ? `${month} ${m[1]}` : ''
}

export function todayIso(): string {
  const d = new Date()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
