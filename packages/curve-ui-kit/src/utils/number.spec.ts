import { describe, it, expect, vi, afterEach } from 'vitest'
import type { Amount } from '@primitives/decimal.utils'
import {
  defaultNumberFormatter,
  formatNumber,
  decomposeNumber,
  abbreviateNumber,
  scaleSuffix,
  log10Exp,
} from './number'

describe('log10Exp', () => {
  describe('basic functionality', () => {
    it('calculates correct exponents for powers of 1000', () => {
      expect(log10Exp(1000)).toBe(1) // 10^3 = 1000
      expect(log10Exp(1000000)).toBe(2) // 10^6 = 1000000
      expect(log10Exp(1000000000)).toBe(3) // 10^9 = 1000000000
      expect(log10Exp(1000000000000)).toBe(4) // 10^12 = 1000000000000
    })

    it('returns 0 for numbers less than 1000', () => {
      expect(log10Exp(1)).toBe(0)
      expect(log10Exp(10)).toBe(0)
      expect(log10Exp(100)).toBe(0)
      expect(log10Exp(123)).toBe(0)
      expect(log10Exp(999)).toBe(0)
    })

    it('returns correct exponents for numbers between powers of 1000', () => {
      expect(log10Exp(1001)).toBe(1)
      expect(log10Exp(50000)).toBe(1)
      expect(log10Exp(999999)).toBe(1)
      expect(log10Exp(1000001)).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers using absolute value', () => {
      expect(log10Exp(-1000)).toBe(1)
      expect(log10Exp(-1000000)).toBe(2)
      expect(log10Exp(-123)).toBe(0)
    })

    it('handles zero', () => {
      expect(log10Exp(0)).toBe(-Infinity)
    })

    it('handles decimal numbers', () => {
      expect(log10Exp(0.5)).toBe(-1)
      expect(log10Exp(0.001)).toBe(-1)
      expect(log10Exp(0.0001)).toBe(-2)
    })

    it('handles very large numbers', () => {
      expect(log10Exp(1e15)).toBe(5)
      expect(log10Exp(1e18)).toBe(6)
    })

    it('handles Infinity', () => {
      expect(log10Exp(Infinity)).toBe(Infinity)
      expect(log10Exp(-Infinity)).toBe(Infinity)
    })

    it('handles NaN', () => {
      expect(log10Exp(NaN)).toBe(NaN)
    })
  })
})

describe('scaleSuffix', () => {
  describe('basic functionality', () => {
    it('returns empty string for numbers less than 1000', () => {
      expect(scaleSuffix(0)).toBe('')
      expect(scaleSuffix(1)).toBe('')
      expect(scaleSuffix(500)).toBe('')
      expect(scaleSuffix(999)).toBe('')
    })

    it('returns correct suffixes for different scales', () => {
      expect(scaleSuffix(1000)).toBe('k')
      expect(scaleSuffix(1500)).toBe('k')
      expect(scaleSuffix(999999)).toBe('k')
      expect(scaleSuffix(1000000)).toBe('m')
      expect(scaleSuffix(1500000)).toBe('m')
      expect(scaleSuffix(1000000000)).toBe('b')
      expect(scaleSuffix(1500000000)).toBe('b')
      expect(scaleSuffix(1000000000000)).toBe('t')
      expect(scaleSuffix(1500000000000)).toBe('t')
    })

    it('caps at trillion for very large numbers', () => {
      expect(scaleSuffix(1e15)).toBe('t')
      expect(scaleSuffix(1e18)).toBe('t')
      expect(scaleSuffix(1e21)).toBe('t')
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers using absolute value', () => {
      expect(scaleSuffix(-500)).toBe('')
      expect(scaleSuffix(-1500)).toBe('k')
      expect(scaleSuffix(-1500000)).toBe('m')
      expect(scaleSuffix(-1500000000)).toBe('b')
      expect(scaleSuffix(-1500000000000)).toBe('t')
    })

    it('handles decimal numbers', () => {
      expect(scaleSuffix(0.5)).toBe('')
      expect(scaleSuffix(999.9)).toBe('')
      expect(scaleSuffix(1000.1)).toBe('k')
    })

    it('handles zero', () => {
      expect(scaleSuffix(0)).toBe('')
      expect(scaleSuffix(-0)).toBe('')
    })

    it('handles special numeric values', () => {
      expect(scaleSuffix(Infinity)).toBe('t')
      expect(scaleSuffix(-Infinity)).toBe('t')
      expect(scaleSuffix(NaN)).toBe('') // log10Exp(NaN) is NaN, index becomes NaN, units[NaN] is undefined, need to handle
    })
  })
})

describe('abbreviateNumber', () => {
  describe('basic functionality', () => {
    it('does not abbreviate small numbers (< 1000)', () => {
      expect(abbreviateNumber(0)).toBe(0)
      expect(abbreviateNumber(1)).toBe(1)
      expect(abbreviateNumber(500)).toBe(500)
      expect(abbreviateNumber(999)).toBe(999)
    })

    it('abbreviates thousands correctly', () => {
      expect(abbreviateNumber(1000)).toBe(1)
      expect(abbreviateNumber(1234)).toBeCloseTo(1.234, 3)
      expect(abbreviateNumber(1234.5678)).toBeCloseTo(1.2345678, 6)
      expect(abbreviateNumber(5000)).toBe(5)
      expect(abbreviateNumber(999000)).toBe(999)
    })

    it('abbreviates millions correctly', () => {
      expect(abbreviateNumber(1000000)).toBe(1)
      expect(abbreviateNumber(1500000)).toBe(1.5)
      expect(abbreviateNumber(2000000)).toBe(2)
      expect(abbreviateNumber(2500000)).toBe(2.5)
    })

    it('abbreviates billions correctly', () => {
      expect(abbreviateNumber(1000000000)).toBe(1)
      expect(abbreviateNumber(2500000000)).toBe(2.5)
      expect(abbreviateNumber(999000000000)).toBe(999)
    })

    it('abbreviates trillions correctly', () => {
      expect(abbreviateNumber(1000000000000)).toBe(1)
      expect(abbreviateNumber(2500000000000)).toBe(2.5)
    })
  })

  describe('edge cases', () => {
    it('handles negative numbers correctly', () => {
      expect(abbreviateNumber(-1000)).toBe(-1)
      expect(abbreviateNumber(-1500000)).toBe(-1.5)
      expect(abbreviateNumber(-2500000000)).toBe(-2.5)
    })

    it('handles decimal input numbers', () => {
      expect(abbreviateNumber(1234.56)).toBeCloseTo(1.23456, 5)
      expect(abbreviateNumber(999.9)).toBeCloseTo(999.9, 1)
    })

    it('handles zero', () => {
      expect(abbreviateNumber(0)).toBe(0)
      expect(abbreviateNumber(-0)).toBe(-0)
    })

    it('handles very large numbers', () => {
      expect(abbreviateNumber(1e15)).toBe(1) // 1e15 / 10^15 = 1 (uses full exponent, not capped)
      expect(abbreviateNumber(1e18)).toBe(1) // 1e18 / 10^18 = 1 (uses full exponent, not capped)
    })

    it('handles special numeric values', () => {
      expect(abbreviateNumber(Infinity)).toBe(NaN) // log10Exp(Infinity) returns NaN, causing division issues
      expect(abbreviateNumber(-Infinity)).toBe(NaN) // Same for negative infinity
      expect(abbreviateNumber(NaN)).toBe(NaN)
    })
  })
})

describe('defaultNumberFormatter', () => {
  describe('basic functionality', () => {
    it('formats positive numbers with default 2 decimals', () => {
      expect(defaultNumberFormatter(123.456)).toBe('123.46')
      expect(defaultNumberFormatter(1000.5)).toBe('1,000.50')
    })

    it('formats negative numbers', () => {
      expect(defaultNumberFormatter(-123.456)).toBe('-123.46')
      expect(defaultNumberFormatter(-1000.5)).toBe('-1,000.50')
    })

    it('respects custom decimal places', () => {
      expect(defaultNumberFormatter(123.456789, { decimals: 0 })).toBe('123')
      expect(defaultNumberFormatter(123.456789, { decimals: 1 })).toBe('123.5')
      expect(defaultNumberFormatter(123.456789, { decimals: 4 })).toBe('123.4568')
    })
  })

  describe('edge case handling', () => {
    it('returns "0" for exactly zero regardless of decimal configuration', () => {
      expect(defaultNumberFormatter(0)).toBe('0')
      expect(defaultNumberFormatter(0, { decimals: 5 })).toBe('0')
      expect(defaultNumberFormatter(-0)).toBe('0')
    })

    it('returns "NaN" for NaN', () => {
      expect(defaultNumberFormatter(NaN)).toBe('NaN')
    })

    it('formats Infinity values', () => {
      expect(defaultNumberFormatter(Infinity)).toBe('∞')
    })

    it('formats negative Infinity', () => {
      expect(defaultNumberFormatter(-Infinity)).toBe('-∞')
    })

    it('handles extremely small positive numbers', () => {
      expect(defaultNumberFormatter(0.000005)).toBe('<0.00001')
      expect(defaultNumberFormatter(0.00001)).not.toBe('<0.00001')
      expect(defaultNumberFormatter(1e-10)).toBe('<0.00001')
    })

    it('handles extremely small negative numbers', () => {
      expect(defaultNumberFormatter(-0.000005)).toBe('>-0.00001')
      expect(defaultNumberFormatter(-0.00001)).not.toBe('>-0.00001')
      expect(defaultNumberFormatter(-1e-10)).toBe('>-0.00001')
    })

    it('switches to significant digits when formatted result would misleadingly show zero or one', () => {
      // Values that would format to "0.00" with 2 decimals should use significant digits
      expect(defaultNumberFormatter(0.001, { decimals: 2 })).toBe('0.001')
      expect(defaultNumberFormatter(-0.001, { decimals: 2 })).toBe('-0.001')
      expect(defaultNumberFormatter(0.0001, { decimals: 2 })).toBe('0.0001')
      expect(defaultNumberFormatter(-0.0001, { decimals: 2 })).toBe('-0.0001')

      // Values that would format to "0.000" with 3 decimals should use significant digits
      expect(defaultNumberFormatter(0.0001, { decimals: 3 })).toBe('0.0001')
      expect(defaultNumberFormatter(-0.000123, { decimals: 3 })).toBe('-0.000123')

      // Values just below 1 that would format to "1.00" but have more precision
      expect(defaultNumberFormatter(0.99997, { decimals: 2 })).toBe('0.99997')
      expect(defaultNumberFormatter(-0.99997, { decimals: 2 })).toBe('-0.99997')
      expect(defaultNumberFormatter(0.999999, { decimals: 3 })).toBe('0.999999')
      expect(defaultNumberFormatter(-0.999999, { decimals: 3 })).toBe('-0.999999')

      // Values that would format to "1.00" but have more precision
      expect(defaultNumberFormatter(1.0001, { decimals: 2 })).toBe('1.0001')
      expect(defaultNumberFormatter(-1.0001, { decimals: 2 })).toBe('-1.0001')

      // Values that would format to "1" with 0 decimals but have fractional parts
      expect(defaultNumberFormatter(1.0001, { decimals: 0 })).toBe('1.0001')
      expect(defaultNumberFormatter(-1.0001, { decimals: 0 })).toBe('-1.0001')
      expect(defaultNumberFormatter(0.99997, { decimals: 0 })).toBe('0.99997')
      expect(defaultNumberFormatter(-0.99997, { decimals: 0 })).toBe('-0.99997')

      // Values that would format to "1.000" with 3 decimals but have more precision
      expect(defaultNumberFormatter(1.00001, { decimals: 3 })).toBe('1.00001')
      expect(defaultNumberFormatter(-1.00001, { decimals: 3 })).toBe('-1.00001')
    })
  })

  describe('Intl.NumberFormat options', () => {
    it('handles trailingZeroDisplay option', () => {
      expect(defaultNumberFormatter(12.5, { decimals: 4 })).toBe('12.5000')
      expect(defaultNumberFormatter(12.0, { decimals: 4 })).toBe('12')
      expect(defaultNumberFormatter(12.0, { decimals: 4, trailingZeroDisplay: 'auto' })).toBe('12.0000')
    })

    it('handles useGrouping', () => {
      expect(defaultNumberFormatter(1234567, { useGrouping: false })).toBe('1234567')
      expect(defaultNumberFormatter(1234567.89, { useGrouping: false })).toBe('1234567.89')
      expect(defaultNumberFormatter(1234567.89, { useGrouping: true })).toBe('1,234,567.89')
      expect(defaultNumberFormatter(1000, { decimals: 0, useGrouping: true })).toBe('1,000')
    })
  })
})

describe('decomposeNumber', () => {
  // Mock console.warn for USD overflow tests
  const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  afterEach(() => {
    consoleSpy.mockClear()
  })

  describe('basic functionality', () => {
    it('decomposes number with default options', () => {
      const result = decomposeNumber(1500, { abbreviate: true })
      expect(result).toEqual({
        prefix: '',
        mainValue: '1.50',
        suffix: '',
        scaleSuffix: 'k',
      })
    })

    it('decomposes number without abbreviation', () => {
      const result = decomposeNumber(1500, { abbreviate: false })
      expect(result).toEqual({
        prefix: '',
        mainValue: '1,500',
        suffix: '',
        scaleSuffix: '',
      })
    })

    it('decomposes number with prefix unit', () => {
      const result = decomposeNumber(1000000, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })
      expect(result).toEqual({
        prefix: '$',
        mainValue: '1',
        suffix: '',
        scaleSuffix: 'm',
      })
    })

    it('decomposes number with suffix unit', () => {
      const result = decomposeNumber(50, { unit: { symbol: '%', position: 'suffix' }, abbreviate: false })
      expect(result).toEqual({
        prefix: '',
        mainValue: '50',
        suffix: '%',
        scaleSuffix: '',
      })
    })

    it('decomposes number with string unit types', () => {
      const dollarResult = decomposeNumber(1000, { abbreviate: true, unit: 'dollar' })
      expect(dollarResult.prefix).toBe('$')
      expect(dollarResult.suffix).toBe('')

      const percentResult = decomposeNumber(50, { abbreviate: false, unit: 'percentage' })
      expect(percentResult.prefix).toBe('')
      expect(percentResult.suffix).toBe('%')
    })
  })

  describe('custom formatting', () => {
    it('applies custom formatter 1', () => {
      const customFormatter = (value: Amount) => `custom-${value}`
      const result = decomposeNumber(1500, { abbreviate: true, formatter: customFormatter })
      expect(result.mainValue).toBe('custom-1.5')
    })
  })

  describe('USD overflow handling', () => {
    // MAX_USD_VALUE is 100_000_000_000_000 (100T)
    it('handles USD values over MAX_USD_VALUE', () => {
      const overflowValue = 200_000_000_000_000 // 200T
      const result = decomposeNumber(overflowValue, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })

      expect(result).toEqual({
        prefix: '',
        mainValue: '?',
        suffix: '',
        scaleSuffix: '',
      })
      expect(consoleSpy).toHaveBeenCalledWith(`USD value is too large: ${overflowValue}`)
    })

    it('handles USD values exactly at MAX_USD_VALUE', () => {
      const maxValue = 100_000_000_000_000 // Exactly 100T
      const result = decomposeNumber(maxValue, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })

      expect(result.mainValue).not.toBe('?')
      expect(result.prefix).toBe('$')
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    it('does not trigger overflow for non-USD currencies', () => {
      const overflowValue = 200_000_000_000_000 // 200T
      const result = decomposeNumber(overflowValue, { abbreviate: true, unit: { symbol: '€', position: 'prefix' } })

      expect(result.mainValue).not.toBe('?')
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })
})

describe('formatNumber', () => {
  describe('basic functionality', () => {
    it('formats with default options (abbreviation enabled)', () => {
      expect(formatNumber(1234.56, { abbreviate: true })).toBe('1.23k')
      expect(formatNumber(1000000, { abbreviate: true })).toBe('1m')
      expect(formatNumber(2500000000, { abbreviate: true })).toBe('2.50b')
    })

    it('formats without abbreviation', () => {
      expect(formatNumber(1500, { abbreviate: false })).toBe('1,500')
      expect(formatNumber(1234567.89, { abbreviate: false, useGrouping: true })).toBe('1,234,567.89')
    })

    it('formats with currency prefix', () => {
      expect(formatNumber(1000000, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })).toBe('$1m')
      expect(formatNumber(1000, { abbreviate: true, unit: 'dollar' })).toBe('$1k')
    })

    it('formats with percentage suffix', () => {
      expect(formatNumber(50, { unit: { symbol: '%', position: 'suffix' }, abbreviate: false })).toBe('50%')
      expect(formatNumber(50, { unit: 'percentage', abbreviate: false })).toBe('50%')
    })

    it('combines all components correctly', () => {
      expect(
        formatNumber(2500000000, { abbreviate: true, unit: { symbol: '%', position: 'suffix' }, decimals: 1 }),
      ).toBe('2.5b%')
      expect(formatNumber(1500000, { abbreviate: true, unit: 'dollar', decimals: 0 })).toBe('$2m')
    })
  })

  describe('unit types', () => {
    it('handles all predefined unit types', () => {
      expect(formatNumber(1000, { abbreviate: true, unit: 'none' })).toBe('1k')
      expect(formatNumber(1000, { abbreviate: true, unit: 'dollar' })).toBe('$1k')
      expect(formatNumber(50, { unit: 'percentage', abbreviate: false })).toBe('50%')
      expect(formatNumber(20000, { unit: 'multiplier', abbreviate: false })).toBe('20,000x')
    })

    it('handles custom unit objects', () => {
      expect(formatNumber(1000, { abbreviate: true, unit: { symbol: ' ETH', position: 'suffix' } })).toBe('1k ETH')
      expect(formatNumber(1000, { abbreviate: true, unit: { symbol: '£', position: 'prefix' } })).toBe('£1k')
    })
  })
})
