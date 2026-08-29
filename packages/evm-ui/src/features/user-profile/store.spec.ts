import { afterEach, describe, expect, it, vi } from 'vitest'

describe('user profile rate display', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('defaults an existing persisted profile to APY without resetting unrelated settings', async () => {
    const values = new Map([
      [
        'user-profile',
        JSON.stringify({
          state: { showDeprecatedMarkets: true },
          version: 1,
        }),
      ],
    ])
    const localStorage = {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    }
    vi.stubGlobal('localStorage', localStorage)
    vi.stubGlobal('window', {
      localStorage,
      matchMedia: () => ({ matches: false }),
    })

    const { useUserProfileStore } = await import('./store')

    expect(useUserProfileStore.getState()).toMatchObject({
      rateDisplay: 'apy',
      showDeprecatedMarkets: true,
    })
  })
})
