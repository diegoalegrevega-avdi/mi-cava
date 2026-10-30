const ISO = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

interface Parts {
  year: string
  month: string
  day: string
  hour?: string
  minute?: string
}

// A timestamp is shown in the user's timezone; a bare YYYY-MM-DD is a calendar day and stays as is.
function parts(iso: string): Parts | null {
  const m = ISO.exec(iso)
  if (!m) return null
  const year = m[1]!
  const month = m[2]!
  const day = m[3]!
  const hour = m[4]
  if (hour === undefined) return { year, month, day }
  const local = new Date(iso)
  if (Number.isNaN(local.getTime())) return null
  return {
    year: String(local.getFullYear()),
    month: pad(local.getMonth() + 1),
    day: pad(local.getDate()),
    hour: pad(local.getHours()),
    minute: pad(local.getMinutes()),
  }
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatDate(iso: string): string {
  const p = parts(iso)
  return p ? `${p.day}/${p.month}/${p.year}` : ''
}

export function formatDateTime(iso: string): string {
  const p = parts(iso)
  if (!p) return ''
  const date = `${p.day}/${p.month}/${p.year}`
  return p.hour ? `${date} ${p.hour}:${p.minute}` : date
}

export function formatMonth(iso: string): string {
  const p = parts(iso)
  if (!p) return ''
  const month = MONTHS[Number(p.month) - 1]
  return month ? `${month} ${p.year}` : ''
}

export function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
