import { describe, expect, it } from 'vitest'
import { shouldShowSupport, SUPPORT_EVERY_VISITS, SUPPORT_COOLDOWN_DAYS } from '@/domain/support'

const DAY = 86_400_000
const NOW = Date.UTC(2026, 10, 10, 12, 0, 0)

describe('shouldShowSupport', () => {
  it('se queda callado en los primeros usos', () => {
    for (let visits = 1; visits < SUPPORT_EVERY_VISITS; visits++) {
      expect(shouldShowSupport(visits, 0, NOW)).toBe(false)
    }
  })

  it('aparece en el quinto uso si nunca se mostró', () => {
    expect(shouldShowSupport(SUPPORT_EVERY_VISITS, 0, NOW)).toBe(true)
  })

  it('no reaparece entre medias ni dos veces seguidas', () => {
    expect(shouldShowSupport(SUPPORT_EVERY_VISITS + 1, NOW - 400 * DAY, NOW)).toBe(false)
    expect(shouldShowSupport(SUPPORT_EVERY_VISITS, NOW - DAY, NOW)).toBe(false)
  })

  it('vuelve a aparecer en el décimo uso pasado el enfriamiento', () => {
    expect(shouldShowSupport(SUPPORT_EVERY_VISITS * 2, NOW - SUPPORT_COOLDOWN_DAYS * DAY, NOW)).toBe(true)
    expect(shouldShowSupport(SUPPORT_EVERY_VISITS * 2, NOW - (SUPPORT_COOLDOWN_DAYS * DAY - 1), NOW)).toBe(false)
  })
})
