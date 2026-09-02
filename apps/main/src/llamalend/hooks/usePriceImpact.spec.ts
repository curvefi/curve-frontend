import { describe, expect, it } from 'vitest'
import { calculatePriceImpact } from './usePriceImpact.utils'

describe('calculatePriceImpact', () => {
  it('returns the rate deterioration from the tiny reference quote', () => {
    expect(
      Number(
        calculatePriceImpact({
          selectedAmountIn: '5000000000',
          selectedAmountOut: '3800000000000000000000',
          referenceAmountIn: '100000',
          referenceAmountOut: '80000000000000000',
          tokenInDecimals: 6,
          tokenOutDecimals: 18,
        }),
      ),
    ).toBeCloseTo(5)
  })

  it('clamps improved execution to zero', () => {
    expect(
      Number(
        calculatePriceImpact({
          selectedAmountIn: '1000000000',
          selectedAmountOut: '1010000000',
          referenceAmountIn: '100000',
          referenceAmountOut: '100000',
          tokenInDecimals: 6,
          tokenOutDecimals: 6,
        }),
      ),
    ).toBe(0)
  })
})
