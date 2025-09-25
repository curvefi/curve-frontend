import { BigNumber } from 'bignumber.js'
import { type PreciseNumber, toPrecise } from '@ui-kit/utils/precise-number'
import { getUnitOptions, type Unit } from './units'

// Sometimes API returns overflowed USD values. Don't show them!
export const MAX_USD_VALUE = 100_000_000_000_000 // $ 100T 🤑

/** Locale used for consistent number formatting across the application */
const LOCALE = 'en-US'

/**
 * Calculates the exponent (in base 10) divided by 3 for a given number.
 * Used to determine the scale/magnitude of a number in terms of thousands.
 * Corresponds to indices for an array of unit suffix like ['', 'k', 'm', 'b', 't'].
 *
 * @param value - The number to calculate the exponent for
 * @returns The floor of log10(abs(value))/3
 *
 * @example
 * log10Exp(1000) // Returns 1 (10^3 = 1000)
 * log10Exp(1000000) // Returns 2 (10^6 = 1000000)
 * log10Exp(1000000000) // Returns 3 (10^9 = 1000000000)
 * log10Exp(123) // Returns 0 (less than 1000)
 * log10Exp(-1000000) // Returns 2 (uses absolute value)
 */
export const log10Exp = (value: PreciseNumber): PreciseNumber =>
  // BigNumber.js doesn't support logarithms, use normal numbers for now
  ({ number: Math.floor(Math.log10(Math.abs(+value.number)) / 3).toString() })

/**
 * Returns the appropriate unit suffix for a given number value.
 *
 * @param value - The number to determine the unit for.
 * @returns The unit suffix as a string ('t' for trillion, 'b' for billion, 'm' for million, 'k' for thousand, or '' for smaller values).
 *
 * @example
 * scaleSuffix(1500000000000) // Returns 't'
 * scaleSuffix(2000000000) // Returns 'b'
 * scaleSuffix(3000000) // Returns 'm'
 * scaleSuffix(4000) // Returns 'k'
 * scaleSuffix(500) // Returns ''
 * scaleSuffix(-1000000) // Returns 'm'
 * scaleSuffix(0) // Returns ''
 */
export function scaleSuffix(value: PreciseNumber): string {
  const units = ['', 'k', 'm', 'b', 't']
  const exp = log10Exp(value)

  // Handle NaN case
  if (exp.number == 'NaN') return ''
  const index = BigNumber.max(0, BigNumber.min(units.length - 1, exp.number))
  return units[index.toNumber()]
}

/**
 * Abbreviates a number such that it can go along with a suffix like k, m, b or t.
 *
 * @example
 * abbreviateNumber(1234.5678) // Returns 1.2345678 (goes with suffix "k")
 * abbreviateNumber(1000000) // Returns 1 (goes with suffix "m")
 * abbreviateNumber(2500000000) // Returns 2.5 (goes with suffix "b")
 * abbreviateNumber(500) // Returns 500 (goes with suffix "")
 */
export function abbreviateNumber(value: PreciseNumber): PreciseNumber {
  const exp = new BigNumber(log10Exp(value).number).times(3)
  // Only apply the scaling if exp is positive
  const result = new BigNumber(value.number).div(exp.isPositive() ? BigNumber(10).exponentiatedBy(exp) : 1)
  return { number: result.toString() }
}

/**
 * We allow custom Intl.NumberFormatOptions options in our default number formatter,
 * but we have our own formatting with regards to units, style and abbreviation.
 * Hence we need to make sure those settings for Intl.NumberFormatOptions are disabled.
 */
const formatterReset = { style: undefined, currency: undefined, notation: undefined, unit: undefined }

/**
 * Default formatter for numeric values with comprehensive edge case handling.
 *
 * Formats numbers to a readable string representation with proper handling of:
 * - Invalid inputs (NaN, Infinity)
 * - Zero values and extremely small (negative) numbers that would display misleadingly as zero
 * - Conditional decimal display based on number magnitude
 *
 * @param value - The numeric value to format
 * @param options - Optional formatting configuration
 *
 * @returns Formatted number string or special indicators for edge cases
 *
 * @remarks
 * - Returns "NaN" for invalid numeric inputs (NaN, but not Infinity)
 * - Returns "∞" for positive infinity values
 * - Returns "-∞" for negative infinity values
 * - Returns "0" for exactly zero values regardless of decimal configuration
 * - For positive values smaller than 0.00001, returns "<0.00001"
 * - For negative values between -0.0001 and 0, returns ">-0.0001"
 * - True integer numbers will have no decimals, unless trailingZeroDisplay is set to 'auto'
 * - When formatted output would show "0.00", "1.00", or just "0"/"1" but value has more precision, switches to 6 significant digits
 * - Uses en-US locale for consistent number formatting (period as decimal separator, comma as thousands separator)
 */
export const defaultNumberFormatter = (
  value: PreciseNumber,
  { decimals = 2, trailingZeroDisplay = 'stripIfInteger', ...options }: Partial<NumberFormatOptions> = {},
): string => {
  const number = new BigNumber(value.number)
  if (number.isNaN()) return 'NaN'
  if (!number.isFinite()) return number.isPositive() ? '∞' : '-∞'
  if (number.isZero()) return '0'

  const absValue = number.abs()
  if (absValue.isPositive() && absValue.lt(0.00001)) return number.isPositive() ? '<0.00001' : '>-0.00001'

  const formatted = number.toNumber().toLocaleString(LOCALE, {
    minimumFractionDigits: Math.min(decimals, options.maximumFractionDigits ?? Infinity),
    maximumFractionDigits: decimals,
    trailingZeroDisplay,
    ...options,
    ...formatterReset,
  })

  /*
   * If the formatted result loses important precision for small values, we need to show more digits.
   * This happens when the value is non-zero but the formatted result shows as "0", "-0", or has only zeros
   * after the decimal point (e.g., "0.00", "-0.000", "1.00" when the actual value is 1.0001).
   * This is common with stablecoin values where precision matters.
   *
   * Examples:
   * - formatNumber(0.0001, { decimals: 2 }) would show "0.00" but we want "0.0001"
   * - formatNumber(-0.000123, { decimals: 3 }) would show "-0.000" but we want "-0.000123"
   * - formatNumber(1.0001, { decimals: 2 }) would show "1.00" but we want "1.0001"
   * - formatNumber(1.0001, { decimals: 0 }) would show "1" but we want "1.0001"
   */
  if (!number.isZero() && /^-?[01](?:\.0+)?$/.test(formatted)) {
    return number.toNumber().toLocaleString(LOCALE, {
      maximumSignificantDigits: 6,
      ...options,
      ...formatterReset,
    })
  }

  return formatted
}

/** Parsed components of a decomposed number */
type DecomposedNumber = {
  /** Symbol to display before the number */
  prefix: string
  /** The formatted numeric value */
  mainValue: string
  /** Symbol to display after the number */
  suffix: string
  /** Scale indicator for abbreviated numbers (e.g., 'K', 'M', 'B') */
  scaleSuffix: string
}

/** Options for formatting any numeric value */
export type NumberFormatOptions = {
  /** A unit can be a currency symbol or percentage, prefix or suffix */
  unit?: Unit | undefined
  /** The number of decimals the value should contain (when no custom formatter is given) */
  decimals?: number
  /** If the value should be abbreviated to 1.23k or 3.45m */
  abbreviate: boolean
  /** Optional formatter for value */
  formatter?: (value: PreciseNumber) => string
} & Omit<Intl.NumberFormatOptions, 'unit' | 'style' | 'compact' | 'notation'>

/**
 * Decomposes a number into its formatted parts including prefix, main value, suffix, and scale suffix.
 *
 * This function takes a numeric value and formatting options to break down the number into
 * separate components that can be styled or displayed independently. It handles unit symbols,
 * abbreviation, and custom formatting while checking for USD overflow conditions.
 *
 * @param value - The numeric value to decompose
 * @param options - Optional formatting configuration object
 * @param options.abbreviate - Whether to abbreviate large numbers (e.g., 1000 → 1K)
 * @param options.formatter - Custom formatting function for the numeric value
 * @param options.unit - Unit configuration for symbol and position
 *
 * @returns A DecomposedNumber object containing the formatted number parts
 *
 * @example
 * ```typescript
 * decomposeNumber(1500, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })
 * // Returns: { prefix: '$', mainValue: '1.5', suffix: '', scaleSuffix: 'K' }
 * ```
 *
 * @remarks
 * - If the value exceeds MAX_USD_VALUE for USD currency, returns an error state with '?' as mainValue
 * - Logs a warning to console when USD overflow occurs
 * - Uses default formatting options when not specified
 */
export const decomposeNumber = (value: PreciseNumber, options: NumberFormatOptions): DecomposedNumber => {
  const { abbreviate, formatter, unit } = options
  const { symbol = '', position = 'suffix' } = getUnitOptions(unit) ?? {}

  // Check for USD overflow
  const hasOverflowError = symbol === '$' && +value.number > MAX_USD_VALUE
  if (hasOverflowError) {
    console.warn(`USD value is too large: ${value.number}`)

    return {
      prefix: '',
      mainValue: '?',
      suffix: '',
      scaleSuffix: '',
    }
  }

  const abbreviatedValue = abbreviate ? abbreviateNumber(value) : value
  const mainValue = formatter ? formatter(abbreviatedValue) : defaultNumberFormatter(abbreviatedValue, options)

  return {
    prefix: position === 'prefix' ? symbol : '',
    mainValue,
    suffix: position === 'suffix' ? symbol : '',
    scaleSuffix: abbreviate ? scaleSuffix(value) : '',
  }
}

/**
 * Formats a number according to the specified options by decomposing it into components
 * and reassembling them into a formatted string.
 *
 * @param value - The number to format
 * @param options - Optional formatting configuration options
 * @returns The formatted number as a string with prefix, main value, scale suffix, and suffix combined
 *
 * @example
 * formatNumber(1234.56)
 * // Returns "1.23K" (default abbreviation enabled)
 *
 * formatNumber(1000000, { unit: { symbol: '$', position: 'prefix' } })
 * // Returns "$1M"
 *
 * formatNumber(500, { abbreviate: false })
 * // Returns "500.00"
 *
 * formatNumber(2500000000, { unit: { symbol: '%', position: 'suffix' }, decimals: 1 })
 * // Returns "2.5B%"
 *
 * formatNumber(1234567.89, { useGrouping: true, abbreviate: false })
 * // Returns "1,234,567.89"
 *
 * formatNumber(12.0, { decimals: 4 })
 * // Returns "12" (trailing zeros stripped because 12.0 is effectively an integer)
 *
 * formatNumber(12.0, { decimals: 4, trailingZeroDisplay: 'auto' })
 * // Returns "12.0000"
 */
export const formatNumber = (value: number | PreciseNumber, options: NumberFormatOptions) => {
  const nr = typeof value == 'number' ? toPrecise(value)! : value
  const { mainValue, prefix, scaleSuffix, suffix } = decomposeNumber(nr, options)
  return [prefix, mainValue, scaleSuffix, suffix].filter(Boolean).join('')
}
