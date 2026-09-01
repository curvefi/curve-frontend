import { describe, expect, it } from 'vitest'
import { getPriceImpactSeverity, isHighPriceImpact } from './price-impact.util'

describe('isHighPriceImpact', () => {
  it.each([
    { priceImpact: '0.5', expected: false },
    { priceImpact: '1', expected: false },
    { priceImpact: '1.01', expected: true },
  ] as const)('returns $expected for $priceImpact% impact', ({ priceImpact, expected }) => {
    expect(isHighPriceImpact(priceImpact)).toBe(expected)
  })
})

describe('getPriceImpactSeverity', () => {
  it.each([
    { priceImpact: '0.5', expected: null },
    { priceImpact: '1', expected: null },
    { priceImpact: '1.01', expected: 'warning' },
  ] as const)('returns $expected for $priceImpact% impact', ({ priceImpact, expected }) => {
    expect(getPriceImpactSeverity(priceImpact)).toBe(expected)
  })

  it('keeps the critical price impact severity', () => {
    expect(getPriceImpactSeverity('25.01')).toBe('error')
  })
})
