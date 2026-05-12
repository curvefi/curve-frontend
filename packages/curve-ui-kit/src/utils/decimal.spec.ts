import { BigNumber } from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { amount, decimal } from './decimal'

describe('decimal', () => {
  it('handles basic, normal numbers', () => {
    expect(decimal('1')).toBe('1')
    expect(decimal('3.14')).toBe('3.14')
    expect(decimal('-4.20')).toBe('-4.20')
    expect(decimal('1.55e20')).toBe('1.55e20')
    expect(decimal('1e-10')).toBe('1e-10')
  })

  it('handles zero and negative zero', () => {
    expect(decimal('0')).toBe('0')
    expect(decimal('0.00')).toBe('0.00')
    expect(decimal('-0')).toBe('-0')
  })

  it('handles incomplete numbers', () => {
    expect(decimal('5.')).toBe('5.') // trailing decimal still converts fine to numbers
  })

  it.each(['Infinity', '-Infinity', undefined, null, '', '?', '-', NaN])('handles edge cases', invalidCharacter => {
    expect(decimal(invalidCharacter as string | number | undefined | null)).toBe(undefined)
  })

  it('handles large and small numbers', () => {
    // Would be "Infinity" or with native number type
    const veryLargeNumber =
      '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.1'

    // Would be "0" or with native number type
    const verySmallNumber =
      '0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000123456789'

    expect(decimal(veryLargeNumber)).toBe(veryLargeNumber)
    expect(decimal(verySmallNumber)).toBe(verySmallNumber)
  })

  it('returns undefined for non-numeric strings', () => {
    expect(decimal('abc')).toBe(undefined)
    expect(decimal('12.34.56')).toBe(undefined)
    expect(decimal('12a34')).toBe(undefined)
  })

  it('accepts numbers as parameter', () => {
    expect(decimal(0)).toBe('0')
    expect(decimal(3.14)).toBe('3.14')
  })
})

describe('amount', () => {
  it('preserves valid numbers', () => {
    expect(amount(0)).toBe(0)
    expect(amount(3.14)).toBe(3.14)
    expect(amount(Infinity)).toBe(Infinity)
  })

  it('accepts numeric strings without normalizing them', () => {
    expect(amount('0')).toBe('0')
    expect(amount('1')).toBe('1')
    expect(amount('3.14')).toBe('3.14')
    expect(amount('-4.20')).toBe('-4.20')
    expect(amount('1.55e20')).toBe('1.55e20')
  })

  it('converts BigNumber and bigint inputs to decimal strings', () => {
    expect(amount(new BigNumber('123.45'))).toBe('123.45')
    expect(amount(123n)).toBe('123')
  })

  it.each([undefined, null, '', '?', '-', NaN, 'abc', '12.34.56', '12a34', 'Infinity'])(
    'returns undefined for invalid values',
    invalidValue => {
      expect(amount(invalidValue as string | number | undefined | null)).toBe(undefined)
    },
  )
})
