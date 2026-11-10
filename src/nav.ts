export type NavId = 'cava' | 'add' | 'historial' | 'ajustes' | 'cava3d'

export type NavItem = { id: NavId; hash: string; label: string }

export const NAV_ITEMS: NavItem[] = [
  { id: 'cava', hash: '#/cava', label: 'Mi cava' },
  { id: 'add', hash: '#/add', label: 'Añadir' },
  { id: 'historial', hash: '#/historial', label: 'Historial' },
  { id: 'ajustes', hash: '#/ajustes', label: 'Ajustes' },
]

/** Which tab to highlight. `#/cava3d` belongs to the cava tab. */
export function activeNav(hash: string): NavId {
  if (hash.startsWith('#/cava3d')) return 'cava'
  const found = NAV_ITEMS.find((item) => hash === item.hash || hash.startsWith(`${item.hash}/`))
  return found?.id ?? 'cava'
}

/** Which screen to render. Differs from `activeNav` for routes that are not tabs. */
export function screenRoute(hash: string): NavId {
  return hash.startsWith('#/cava3d') ? 'cava3d' : activeNav(hash)
}
