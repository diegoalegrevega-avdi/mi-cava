export type NavId = 'cava' | 'add' | 'historial' | 'ajustes' | 'cava3d'

export type NavItem = { id: NavId; hash: string; label: string }

export const NAV_ITEMS: NavItem[] = [
  { id: 'cava', hash: '#/cava', label: 'Mi cava' },
  { id: 'add', hash: '#/add', label: 'Añadir' },
  { id: 'historial', hash: '#/historial', label: 'Historial' },
  { id: 'ajustes', hash: '#/ajustes', label: 'Ajustes' },
]

export function activeNav(hash: string): NavId {
  const found = NAV_ITEMS.find((item) => hash === item.hash || hash.startsWith(`${item.hash}/`))
  // cava3d is not in bottom nav, but we want to highlight 'cava' when on cava3d
  if (hash === '#/cava3d') return 'cava'
  return found?.id ?? 'cava'
}
