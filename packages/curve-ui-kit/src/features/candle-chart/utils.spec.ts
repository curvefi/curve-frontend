import { describe, expect, it } from 'vitest'
import { calculateRobustPriceRange, priceFormatter } from './utils'
describe('calculateRobustPriceRange', () => {
  it('returns null when no prices are available', () => {
    expect(calculateRobustPriceRange([])).toBeNull()
  })
  it('does not let padding push non-negative prices below zero', () => {
    const range = calculateRobustPriceRange([0.01, 0.4], [], 0, 1, 0.1)
    expect(range?.minValue).toBe(0)
    expect(range?.maxValue).toBeCloseTo(0.439)
  })
  it('keeps percentile boundaries in range', () => {
    expect(calculateRobustPriceRange([1, 2], [], 1, 1, 0)).toEqual({
      minValue: 2,
      maxValue: 2,
    })
  })
})
describe('priceFormatter', () => {
  it('formats floating-point zero drift as zero', () => {
    expect(priceFormatter(Number.EPSILON, 0.4)).toBe('0')
  })
  it('formats small asset prices when the visible scale needs that precision', () => {
    expect(priceFormatter(0.000012, 0.000001)).toBe('0.000012')
  })
  it('hides invalid and negative price ticks', () => {
    expect(priceFormatter(NaN, 1)).toBe('')
    expect(priceFormatter(Infinity, 1)).toBe('')
    expect(priceFormatter(-0.05, 1)).toBe('')
  })
  it('keeps zero visible and trims trailing decimal zeros', () => {
    expect(priceFormatter(0, 1)).toBe('0')
    expect(priceFormatter(1.2, 1)).toBe('1.2')
  })
})
