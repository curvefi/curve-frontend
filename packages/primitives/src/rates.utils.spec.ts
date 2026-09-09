import { describe, expect, it } from 'vitest'
import { aprToApy, COMPOUNDING_CATEGORIES, type CompoundingCategory } from './rates.utils'

describe('aprToApy', () => {
  it.each([
    [10, 10.517091807565],
    [0, 0],
    [-10, -9.516258196404],
  ])('compounds %s%% borrow APR continuously', (apr, apy) => {
    expect(aprToApy(apr, 'llamalend.borrow')).toBeCloseTo(apy, 10)
  })

  it('preserves very small rates with continuous compounding', () => {
    expect(aprToApy(1e-15, 'llamalend.borrow') / 1e-15).toBeCloseTo(1, 10)
  })

  it('preserves weekly reward compounding', () => {
    expect(aprToApy(10, 'llamalend.rewards')).toBeCloseTo(10.506508315, 7)
  })

  it('compounds savings supply daily using a 365-day year', () => {
    expect(aprToApy(10, 'savings.supply')).toBe(((1 + 0.1 / 365) ** 365 - 1) * 100)
  })

  it.each(Object.keys(COMPOUNDING_CATEGORIES) as CompoundingCategory[])(
    'preserves missing and zero APRs for %s',
    category => {
      expect(aprToApy(null, category)).toBeUndefined()
      expect(aprToApy(undefined, category)).toBeUndefined()
      expect(aprToApy(0, category)).toBe(0)
    },
  )
})
