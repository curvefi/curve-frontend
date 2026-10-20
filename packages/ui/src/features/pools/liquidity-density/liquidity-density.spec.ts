import { describe, expect, it } from 'vitest'
import { balanceAtPrice, peakPrice, spotPrice } from './curve'
import { liquidityProfile } from './profile'
import { createStableSwapCurve } from './stableswap'
import { createTriCryptoCurve } from './tricrypto'
import { createTwoCryptoCurve } from './twocrypto'
import type { LiquidityCurve } from './types'

describe('liquidity density', () => {
  it.each([
    [
      [1_000_000, 500_000],
      [1, 2],
    ],
    [
      ['1000000', '500000'],
      ['1', '2'],
    ],
    [
      ['1e200', '5e199'],
      ['1e200', '2e200'],
    ],
  ] as const)('prices a rate-balanced StableSwap with balances %j and rates %j', (balances, rates) => {
    const curve = createStableSwapCurve(balances, rates, 200)!
    expect(spotPrice(curve, [0, 1])).toBeCloseTo(0.5, 7)
    expect(spotPrice(curve, [1, 0])).toBeCloseTo(2, 7)
  })

  it.each([
    ['twocrypto', createTwoCryptoCurve([1_400_000, 240], 2500, 40, 0.001)],
    ['twocrypto decimals', createTwoCryptoCurve(['1400000', '240'], '2500', 40, 0.001)],
    ['twocrypto legacy', createTwoCryptoCurve([1_400_000, 240], 2500, 40, 0.001, undefined, { legacy: true })],
    ['tricrypto', createTriCryptoCurve([1_200_000, 12, 300], [60_000, 3000], 270, 0.001)],
    ['tricrypto decimals', createTriCryptoCurve(['1200000', '12', '300'], ['60000', '3000'], 270, 0.001)],
    [
      'tricrypto legacy',
      createTriCryptoCurve([1_200_000, 12, 300], [60_000, 3000], 270, 0.001, undefined, { legacy: true }),
    ],
  ] as const)('recovers the original %s balances when D is computed', (_, curve) => {
    expect(curve).toBeDefined()
    // An incorrect ANN multiplier changes D and fails to reproduce the starting reserves.
    curve!.xp.forEach((balance, index) => {
      expect(curve!.solve(curve!.xp, index)! / balance).toBeCloseTo(1, 6)
    })
  })

  it('inverts prices and integrates density against an analytic constant-product curve', () => {
    const curve: LiquidityCurve = {
      xp: [1, 1],
      scale: [1_000_000, 1_000_000],
      seed: 0.05,
      solve: (balances, outputCoin) => 1 / balances[1 - outputCoin],
    }
    // x * y = 1 gives p = 1 / x², hence x(p) = 1 / sqrt(p).
    expect(balanceAtPrice(curve, [0, 1], 4)).toBeCloseTo(0.5, 7)
    expect(balanceAtPrice(curve, [0, 1], 0.25)).toBeCloseTo(2, 7)
    const { samples } = liquidityProfile(curve, [0, 1], { low: 0.5, high: 2, points: 16 })!
    expect(samples).toHaveLength(16)
    const travelled = samples.reduce((total, { depth, low, high }) => total + (depth * Math.log(high / low)) / 0.01, 0)
    expect(travelled / (1_000_000 * (Math.sqrt(2) - 1 / Math.sqrt(2)))).toBeCloseTo(1, 6)
  })

  it('keeps both the spot and the peak inside an imbalanced pool’s automatic window', () => {
    const curve = createStableSwapCurve([1_400_000, 600_000], [1, 1], 200)!
    const { high, low, spot } = liquidityProfile(curve, [0, 1], { points: 16 })!
    const peak = peakPrice(curve, [0, 1])!
    expect(spot).toBeLessThan(0.999)
    expect(peak).toBeCloseTo(1, 6)
    expect(low).toBeLessThan(spot)
    expect(high).toBeGreaterThan(peak)
  })

  it('leaves prices outside the solver domain unsampled', () => {
    const curve: LiquidityCurve = {
      xp: [1, 1],
      scale: [1, 1],
      seed: 0.05,
      solve: (balances, outputCoin) => {
        const input = balances[1 - outputCoin]
        return input <= 2 ? 1 / input : undefined
      },
    }
    // x * y = 1 with x <= 2 only supports prices p >= 1/4.
    expect(balanceAtPrice(curve, [0, 1], 0.1)).toBeUndefined()
    const { samples } = liquidityProfile(curve, [0, 1], { low: 0.1, high: 2, points: 16 })!
    expect(samples.length).toBeGreaterThan(0)
    expect(samples.length).toBeLessThan(16)
    expect(samples.every(({ low }) => low >= 0.25)).toBe(true)
  })
})
