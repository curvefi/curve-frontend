import { describe, expect, it } from 'vitest'
import { formatDistanceToRange, formatRangePrices, getBandCount } from './health.utils'

describe('formatDistanceToRange', () => {
  it('shows "In range" at zero, whatever the type', () => {
    expect(formatDistanceToRange(0)).toBe('In range')
    expect(formatDistanceToRange('0')).toBe('In range')
  })

  it('shows the signed percentage outside the range', () => {
    expect(formatDistanceToRange('-12.5')).toBe('-12.50%')
    expect(formatDistanceToRange(3)).toBe('+3%')
  })

  it('shows a placeholder without a value', () => {
    expect(formatDistanceToRange(undefined)).toBe('-')
  })
})

describe('formatRangePrices', () => {
  it('joins the low and high price', () => {
    expect(formatRangePrices(['0.8', '0.9'])).toBe('0.8 – 0.9')
  })
})

describe('getBandCount', () => {
  it('counts both ends, in either order', () => {
    expect(getBandCount([69, 118])).toBe(50)
    expect(getBandCount([118, 69])).toBe(50)
    expect(getBandCount([5, 5])).toBe(1)
  })
})
