import { describe, expect, it } from 'vitest'
import { getMaxLtv } from '@/llamalend/features/market-advanced-information/market-risk-values'

describe('getMaxLtv', () => {
  it('calculates the maximum LTV at four bands', () => {
    expect(getMaxLtv(30, '11')).toBeCloseTo(83.1655555556)
    expect(getMaxLtv(100, '0')).toBeCloseTo(98.01)
  })

  it('returns undefined until both market parameters are available', () => {
    expect(getMaxLtv(undefined, '11')).toBeUndefined()
    expect(getMaxLtv(30, undefined)).toBeUndefined()
  })
})
