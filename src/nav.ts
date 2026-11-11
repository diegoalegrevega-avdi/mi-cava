export type NavId = 'cava' | 'add' | 'historial' | 'stats' | 'ajustes' | 'cava3d'

export type NavLabelKey = 'cava' | 'add' | 'historial' | 'stats' | 'ajustes'

export type NavItem = { id: NavId; hash: string; labelKey: NavLabelKey }

export const NAV_ITEMS: NavItem[] = [
  { id: 'cava', hash: '#/cava', labelKey: 'cava' },
  { id: 'add', hash: '#/add', labelKey: 'add' },
  { id: 'historial', hash: '#/historial', labelKey: 'historial' },
  { id: 'stats', hash: '#/estadisticas', labelKey: 'stats' },
  { id: 'ajustes', hash: '#/ajustes', labelKey: 'ajustes' },
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
