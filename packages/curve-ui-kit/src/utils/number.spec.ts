import { describe, it, expect, vi, afterEach } from 'vitest'
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
      expect(defaultNumberFormatter(123.456, { decimals: 2 })).toBe('123.46')
      expect(defaultNumberFormatter(1000.5, { decimals: 2 })).toBe('1,000.50') // Default useGrouping is true in browsers
    })

    it('formats negative numbers', () => {
      expect(defaultNumberFormatter(-123.456, { decimals: 2 })).toBe('-123.46')
      expect(defaultNumberFormatter(-1000.5, { decimals: 2 })).toBe('-1,000.50') // Default useGrouping is true in browsers
    })

    it('respects custom decimal places', () => {
      expect(defaultNumberFormatter(123.456789, { decimals: 0 })).toBe('123')
      expect(defaultNumberFormatter(123.456789, { decimals: 1 })).toBe('123.5')
      expect(defaultNumberFormatter(123.456789, { decimals: 4 })).toBe('123.4568')
    })

    it('applies grouping when specified', () => {
      expect(defaultNumberFormatter(1234567.89, { decimals: 2, useGrouping: true })).toBe('1,234,567.89')
      expect(defaultNumberFormatter(1000, { decimals: 0, useGrouping: true })).toBe('1,000')
      expect(defaultNumberFormatter(1234567.89, { decimals: 2, useGrouping: false })).toBe('1234567.89')
    })
  })

  describe('edge case handling', () => {
    it('returns "0" for exactly zero regardless of decimal configuration', () => {
      expect(defaultNumberFormatter(0)).toBe('0')
      expect(defaultNumberFormatter(0, { decimals: 2 })).toBe('0')
      expect(defaultNumberFormatter(0, { decimals: 5 })).toBe('0')
      expect(defaultNumberFormatter(-0)).toBe('0')
    })

    it('returns "NaN" for NaN input only', () => {
      expect(defaultNumberFormatter(NaN)).toBe('NaN')
      // But not for Infinity (per JSDoc comment)
      expect(defaultNumberFormatter(Infinity)).not.toBe('NaN')
      expect(defaultNumberFormatter(-Infinity)).not.toBe('NaN')
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

    it('switches to significant digits when formatted result would misleadingly show zero', () => {
      // Very small number that would format to "0.00" with 2 decimals
      expect(defaultNumberFormatter(0.001, { decimals: 2 })).toBe('0.001')
      expect(defaultNumberFormatter(-0.001, { decimals: 2 })).toBe('-0.001')
      expect(defaultNumberFormatter(0.0001, { decimals: 2 })).toBe('0.0001')
    })
  })

  describe('Intl.NumberFormat options', () => {
    it('handles trailingZeroDisplay option', () => {
      expect(defaultNumberFormatter(12.5, { decimals: 4, trailingZeroDisplay: 'stripIfInteger' })).toBe('12.5000') // stripIfInteger only removes trailing zeros if result is integer
      expect(defaultNumberFormatter(12.0, { decimals: 4, trailingZeroDisplay: 'stripIfInteger' })).toBe('12')
    })

    it('handles useGrouping false', () => {
      expect(defaultNumberFormatter(1234567, { useGrouping: false })).toBe('1234567')
    })
  })

  describe('Infinity handling', () => {
    it('formats Infinity values', () => {
      const result = defaultNumberFormatter(Infinity)
      expect(result).not.toBe('NaN')
      expect(result).toBe('∞')
    })

    it('formats negative Infinity', () => {
      const result = defaultNumberFormatter(-Infinity)
      expect(result).not.toBe('NaN')
      expect(result).toBe('-∞')
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
        mainValue: '1,500.00',
        suffix: '',
        scaleSuffix: '',
      })
    })

    it('decomposes number with prefix unit', () => {
      const result = decomposeNumber(1000000, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })
      expect(result).toEqual({
        prefix: '$',
        mainValue: '1.00',
        suffix: '',
        scaleSuffix: 'm',
      })
    })

    it('decomposes number with suffix unit', () => {
      const result = decomposeNumber(50, { unit: { symbol: '%', position: 'suffix' }, abbreviate: false })
      expect(result).toEqual({
        prefix: '',
        mainValue: '50.00',
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
    it('applies custom formatter', () => {
      const customFormatter = (value: number) => `custom-${value}`
      const result = decomposeNumber(1500, { abbreviate: true, formatter: customFormatter })
      expect(result.mainValue).toBe('custom-1.5')
    })

    it('respects custom decimals', () => {
      const result = decomposeNumber(1234.5678, { decimals: 1, abbreviate: false })
      expect(result.mainValue).toBe('1,234.6')
    })

    it('handles useGrouping option', () => {
      const result = decomposeNumber(1234567, { abbreviate: false, useGrouping: false })
      expect(result.mainValue).toBe('1234567.00')
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

    it('only triggers overflow for exact "$" symbol', () => {
      const overflowValue = 200_000_000_000_000 // 200T
      const result = decomposeNumber(overflowValue, { abbreviate: true, unit: { symbol: 'USD', position: 'prefix' } })

      expect(result.mainValue).not.toBe('?')
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles zero value', () => {
      const result = decomposeNumber(0, { abbreviate: true })
      expect(result.mainValue).toBe('0')
      expect(result.scaleSuffix).toBe('')
    })

    it('handles negative values', () => {
      const result = decomposeNumber(-1500, { abbreviate: true })
      expect(result.mainValue).toBe('-1.50')
      expect(result.scaleSuffix).toBe('k')
    })

    it('handles NaN', () => {
      const result = decomposeNumber(NaN, { abbreviate: true })
      expect(result.mainValue).toBe('NaN')
    })

    it('handles Infinity', () => {
      const result = decomposeNumber(Infinity, { abbreviate: true })
      expect(result.mainValue).toBe('NaN') // defaultNumberFormatter returns 'NaN' for Infinity
    })

    it('handles undefined unit gracefully', () => {
      const result = decomposeNumber(1500, { abbreviate: true, unit: undefined })
      expect(result.prefix).toBe('')
      expect(result.suffix).toBe('')
    })
  })
})

describe('formatNumber', () => {
  describe('basic functionality', () => {
    it('formats with default options (abbreviation enabled)', () => {
      expect(formatNumber(1234.56, { abbreviate: true })).toBe('1.23k')
      expect(formatNumber(1000000, { abbreviate: true })).toBe('1.00m')
      expect(formatNumber(2500000000, { abbreviate: true })).toBe('2.50b')
    })

    it('formats without abbreviation', () => {
      expect(formatNumber(1500, { abbreviate: false })).toBe('1,500.00')
      expect(formatNumber(1234567.89, { abbreviate: false, useGrouping: true })).toBe('1,234,567.89')
    })

    it('formats with currency prefix', () => {
      expect(formatNumber(1000000, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })).toBe('$1.00m')
      expect(formatNumber(1000, { abbreviate: true, unit: 'dollar' })).toBe('$1.00k')
    })

    it('formats with percentage suffix', () => {
      expect(formatNumber(50, { unit: { symbol: '%', position: 'suffix' }, abbreviate: false })).toBe('50.00%')
      expect(formatNumber(50, { unit: 'percentage', abbreviate: false })).toBe('50.00%')
    })

    it('combines all components correctly', () => {
      expect(
        formatNumber(2500000000, { abbreviate: true, unit: { symbol: '%', position: 'suffix' }, decimals: 1 }),
      ).toBe('2.5b%')
      expect(formatNumber(1500000, { abbreviate: true, unit: 'dollar', decimals: 0 })).toBe('$2m')
    })
  })

  describe('formatting options', () => {
    it('handles custom decimals', () => {
      expect(formatNumber(1234.5678, { decimals: 3, abbreviate: false })).toBe('1,234.568')
      expect(formatNumber(1234.5678, { decimals: 0, abbreviate: false })).toBe('1,235')
    })

    it('handles trailingZeroDisplay', () => {
      expect(formatNumber(12.5, { decimals: 4, trailingZeroDisplay: 'stripIfInteger', abbreviate: false })).toBe(
        '12.5000',
      ) // stripIfInteger only removes trailing zeros if result is integer
      expect(formatNumber(12.0, { decimals: 4, trailingZeroDisplay: 'stripIfInteger', abbreviate: false })).toBe('12')
    })

    it('handles useGrouping', () => {
      expect(formatNumber(1234567, { abbreviate: false, useGrouping: false })).toBe('1234567.00')
      expect(formatNumber(1234567, { abbreviate: false, useGrouping: true })).toBe('1,234,567.00')
    })

    it('handles custom formatter', () => {
      const customFormatter = (value: number) => `[${value}]`
      expect(formatNumber(1500, { abbreviate: true, formatter: customFormatter })).toBe('[1.5]k')
    })
  })

  describe('edge cases', () => {
    it('handles zero', () => {
      expect(formatNumber(0, { abbreviate: true })).toBe('0')
      expect(formatNumber(0, { abbreviate: true, unit: 'dollar' })).toBe('$0') // Implementation adds unit prefix even for zero
    })

    it('handles negative numbers', () => {
      expect(formatNumber(-1500, { abbreviate: true })).toBe('-1.50k')
      expect(formatNumber(-1000000, { abbreviate: true, unit: 'dollar' })).toBe('$-1.00m')
    })

    it('handles very small numbers', () => {
      expect(formatNumber(0.0000000001, { abbreviate: true })).toBe('<0.00001')
      expect(formatNumber(-0.0000000001, { abbreviate: true })).toBe('>-0.00001')
    })

    it('handles NaN', () => {
      expect(formatNumber(NaN, { abbreviate: true })).toBe('NaN')
      expect(formatNumber(NaN, { abbreviate: true, unit: 'dollar' })).toBe('$NaN') // Implementation adds unit prefix even for NaN
    })

    it('handles Infinity', () => {
      expect(formatNumber(Infinity, { abbreviate: true })).toBe('NaNt') // Implementation returns 'NaNt' for Infinity due to trillions suffix
      expect(formatNumber(-Infinity, { abbreviate: true })).toBe('NaNt') // Negative Infinity also returns 'NaNt' (sign gets lost)
    })

    it('handles USD overflow', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const overflowValue = 200_000_000_000_000 // 200T

      expect(formatNumber(overflowValue, { abbreviate: true, unit: 'dollar' })).toBe('?')
      expect(consoleSpy).toHaveBeenCalledWith(`USD value is too large: ${overflowValue}`)

      consoleSpy.mockRestore()
    })
  })

  describe('unit types', () => {
    it('handles all predefined unit types', () => {
      expect(formatNumber(1000, { abbreviate: true, unit: 'none' })).toBe('1.00k')
      expect(formatNumber(1000, { abbreviate: true, unit: 'dollar' })).toBe('$1.00k')
      expect(formatNumber(50, { unit: 'percentage', abbreviate: false })).toBe('50.00%')
      expect(formatNumber(20000, { unit: 'multiplier', abbreviate: false })).toBe('20,000.00x')
    })

    it('handles custom unit objects', () => {
      expect(formatNumber(1000, { abbreviate: true, unit: { symbol: 'ETH', position: 'suffix' } })).toBe('1.00kETH')
      expect(formatNumber(1000, { abbreviate: true, unit: { symbol: '£', position: 'prefix' } })).toBe('£1.00k')
    })
  })

  describe('real-world examples from JSDoc', () => {
    it('matches JSDoc examples exactly', () => {
      expect(formatNumber(1234.56, { abbreviate: true })).toBe('1.23k')
      expect(formatNumber(1000000, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })).toBe('$1.00m')
      expect(formatNumber(500, { abbreviate: false })).toBe('500.00')
      expect(
        formatNumber(2500000000, { abbreviate: true, unit: { symbol: '%', position: 'suffix' }, decimals: 1 }),
      ).toBe('2.5b%')
      expect(formatNumber(1234567.89, { useGrouping: true, abbreviate: false })).toBe('1,234,567.89')
      expect(formatNumber(12.5, { decimals: 4, trailingZeroDisplay: 'stripIfInteger', abbreviate: false })).toBe(
        '12.5000',
      )
      expect(formatNumber(12.0, { decimals: 4, trailingZeroDisplay: 'stripIfInteger', abbreviate: false })).toBe('12')
      expect(formatNumber(12.5, { decimals: 4, trailingZeroDisplay: 'auto', abbreviate: false })).toBe('12.5000')
    })

    it('handles JSDoc examples with custom formatter', () => {
      const customFormatter = (value: number) => `[${value}]`
      expect(formatNumber(1500, { abbreviate: true, formatter: customFormatter })).toBe('[1.5]k')
    })
  })
})
