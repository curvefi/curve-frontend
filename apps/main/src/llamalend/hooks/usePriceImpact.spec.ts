import { describe, expect, it } from 'vitest'
import { calculatePriceImpact } from './useMarketRoutes'

describe('calculatePriceImpact', () => {
  it('values yield-bearing output tokens in USD', () => {
    expect(
      Number(
        calculatePriceImpact({
          selectedAmountIn: '5000000000',
          selectedAmountOut: '4000000000',
          tokenInDecimals: 6,
          tokenOutDecimals: 6,
          tokenInUsdRate: '1',
          tokenOutUsdRate: '1.25',
        }),
      ),
    ).toBe(0)
  })

  it('returns the loss in USD value', () => {
    expect(
      Number(
        calculatePriceImpact({
          selectedAmountIn: '1000000000',
          selectedAmountOut: '900000000',
          tokenInDecimals: 6,
          tokenOutDecimals: 6,
          tokenInUsdRate: '1',
          tokenOutUsdRate: '1.1',
        }),
      ),
    ).toBeCloseTo(1)
  })
})
