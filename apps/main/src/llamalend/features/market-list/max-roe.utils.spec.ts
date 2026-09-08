import { describe, expect, it } from 'vitest'
import { getMaxRoe } from './max-roe.utils'

const market = (
  leverage: number | null | undefined = 9.99,
  rebasingYield: number | null | undefined = 3.44,
  borrowApy: number | null | undefined = 3.1,
) => ({ leverage, assets: { collateral: { rebasingYield } }, rates: { borrowApy } })

describe('getMaxRoe', () => {
  it('uses collateral APY, base borrow APY and the supplied multiplier in percentage points', () => {
    const data = {
      ...market(),
      rates: { borrowApy: 3.1, lendApy: 100, borrowApr: 90, borrowTotalApy: -0.34 },
      maxLtv: 90,
    }
    const withoutMaxLtv = { ...data, maxLtv: null }
    expect(getMaxRoe(data)).toBeCloseTo(6.4966, 10)
    expect(getMaxRoe(withoutMaxLtv)).toBeCloseTo(6.4966, 10)
  })

  it('preserves negative returns, explicit zero yield, zero borrowing cost and zero ROE', () => {
    expect(getMaxRoe(market(3, 2, 4))).toBe(-2)
    expect(getMaxRoe(market(3, 0, 4))).toBe(-8)
    expect(getMaxRoe(market(3, 2, 0))).toBe(6)
    expect(getMaxRoe(market(3, 2, 3))).toBe(0)
    expect(getMaxRoe(market(1, 2, 4))).toBe(2)
  })

  it.each([null, undefined, NaN, Infinity, -Infinity])('returns no ROE for missing or invalid inputs: %s', value => {
    expect(getMaxRoe({ ...market(), leverage: value })).toBeUndefined()
    expect(getMaxRoe({ ...market(), assets: { collateral: { rebasingYield: value } } })).toBeUndefined()
    expect(getMaxRoe({ ...market(), rates: { borrowApy: value } })).toBeUndefined()
  })

  it('rejects multipliers below one and overflowing results', () => {
    expect(getMaxRoe(market(-1))).toBeUndefined()
    expect(getMaxRoe(market(0))).toBeUndefined()
    expect(getMaxRoe(market(0.99))).toBeUndefined()
    expect(getMaxRoe(market(Number.MAX_VALUE, 2, 0))).toBeUndefined()
  })
})
