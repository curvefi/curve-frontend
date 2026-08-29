import { afterEach, describe, expect, it, vi } from 'vitest'
import { aprToApy } from '@evm-ui/utils/rates'
import { useAprToApy, useRateDisplay } from './useAprToApy'

const profile = vi.hoisted<{ rateDisplay: 'apr' | 'apy' }>(() => ({ rateDisplay: 'apy' }))

vi.mock('@evm-ui/features/user-profile/store', () => ({
  useUserProfileStore: (selector: (state: typeof profile) => unknown) => selector(profile),
}))

describe('useAprToApy', () => {
  afterEach(() => {
    profile.rateDisplay = 'apy'
  })

  it('converts APR to APY for the default display preference', () => {
    expect(useAprToApy()(10)).toBeCloseTo(aprToApy(10))
  })

  it('leaves APR values unchanged for the APR display preference', () => {
    profile.rateDisplay = 'apr'

    const convertRate = useAprToApy()
    expect(useRateDisplay()).toBe('apr')
    expect(convertRate(10)).toBe(10)
    expect(convertRate(null)).toBeNull()
  })
})
