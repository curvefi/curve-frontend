import { describe, expect, it } from 'vitest'
import { aprToApy, apyToApr } from './rates'

describe('apyToApr', () => {
  it.each([null, undefined])('preserves a nullish APY value', apy => {
    expect(apyToApr(apy)).toBeNull()
  })

  it('preserves zero', () => {
    expect(apyToApr(0)).toBe(0)
  })

  it.each([
    { apr: 1, compoundingDays: 1 },
    { apr: 10, compoundingDays: 7 },
    { apr: 250, compoundingDays: 30 },
  ])('reverses APR compounding for $apr% APR every $compoundingDays days', ({ apr, compoundingDays }) => {
    const apy = aprToApy(apr, compoundingDays)

    expect(apyToApr(apy, compoundingDays)).toBeCloseTo(apr, 10)
  })

  it('uses the same default compounding window as aprToApy', () => {
    expect(apyToApr(aprToApy(10))).toBeCloseTo(10, 10)
  })
})
