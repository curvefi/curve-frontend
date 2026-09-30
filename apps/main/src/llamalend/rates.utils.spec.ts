import { describe, expect, it, vi } from 'vitest'
import { constQ } from '@ui/features/queries/util'
import { formatReturnOnEquity, getSupplyApyMetrics } from './rates.utils'

// These unrelated barrel imports load browser-only code.
vi.mock('@evm-ui/utils', () => ({ MAINNET_CRV_ADDRESS: '' }))
vi.mock('@ui/features/storage/useLocalStorage', () => ({ getReleaseChannel: () => undefined }))
vi.mock('@ui/lib/env', () => ({ ReleaseChannel: { Beta: 'beta' } }))

describe('Action-form annual rate', () => {
  const leverage = constQ('4' as const)
  const rates = constQ({ borrowApr: '3', borrowApy: '5' } as const)

  it('uses APR inputs for Beta and preserves the APY calculation', () => {
    const apr = formatReturnOnEquity(leverage, rates, constQ(5), 'apr')
    const apy = formatReturnOnEquity(leverage, rates, constQ(9))
    expect(parseFloat(apr.data!)).toBe(11)
    expect(parseFloat(apy.data!)).toBe(21)
  })

  it('leaves an unknown APR unavailable instead of using APY', () => {
    const apr = formatReturnOnEquity(leverage, constQ({ borrowApy: '5' } as const), constQ(5), 'apr')
    expect(apr.data).toBeUndefined()
  })
})

describe('Supply reward annualization', () => {
  it('adds weekly-compounded rewards to the supply total', () => {
    const metrics = getSupplyApyMetrics({
      supplyApy: 5,
      rebasingYieldApy: 2,
      crvBoostApr: [10, 25],
      extraIncentivesApy: 3,
      campaignsApy: 4,
      userSupplyBoost: '2',
    })
    const weeklyApy = (apr: number) => ((1 + apr / 100 / (365 / 7)) ** (365 / 7) - 1) * 100
    expect(metrics.totalMinBoost).toBeCloseTo(14 + weeklyApy(10), 10)
    expect(metrics.totalMaxBoost).toBeCloseTo(14 + weeklyApy(25), 10)
    expect(metrics.totalUserBoost).toBeCloseTo(14 + weeklyApy(20), 10)
  })
})
