import type { Amount } from '@primitives/decimal.utils'
import { getUnitOptions, type Unit } from './units'

// Sometimes API returns overflowed USD values. Don't show them!
const MAX_USD_VALUE = 100_000_000_000_000 // $ 100T 🤑

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
export function log10Exp(value: number): number {
  return Math.floor(Math.log10(Math.abs(value)) / 3)
}

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
export function scaleSuffix(value: Amount): string {
  const units = ['', 'k', 'm', 'b', 't']
  const exp = log10Exp(+value)

  // Handle NaN case
  if (isNaN(exp)) return ''

  const index = Math.max(0, Math.min(units.length - 1, exp))

  return units[index]
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
export function abbreviateNumber<T extends Amount>(value: T): T | number {
  const exp = log10Exp(+value) * 3
  // Only apply the scaling if exp is positive
  return exp > 0 ? +value / 10 ** exp : value
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
  value: Amount,
  {
    decimals = 2,
    trailingZeroDisplay = 'stripIfInteger',
    highPrecision = false,
    ...options
  }: Partial<NumberFormatOptions> = {},
): string => {
  if (typeof value !== 'number') value = Number(value)
  if (isNaN(value)) return 'NaN'
  if (value === Infinity) return '∞'
  if (value === -Infinity) return '-∞'
  if (value === 0) return '0'

  const usesSignificantDigits = options.minimumSignificantDigits != null || options.maximumSignificantDigits != null

  const absValue = Math.abs(value)
  if (!usesSignificantDigits && absValue > 0 && absValue < 0.00001) return value > 0 ? '<0.00001' : '>-0.00001'

  const formatted = value.toLocaleString(LOCALE, {
    ...(!usesSignificantDigits && {
      minimumFractionDigits: Math.min(decimals, options.maximumFractionDigits ?? Infinity),
      maximumFractionDigits: highPrecision ? Math.max(4, decimals) : decimals,
    }),
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
  if (value !== 0 && /^-?[01](?:\.0+)?$/.test(formatted)) {
    return value.toLocaleString(LOCALE, {
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
  /** Some use cases require high precision, like user input. When enabled, ensures at least a certain amount decimals are shown. */
  highPrecision?: boolean
  /** Optional formatter for value */
  formatter?: (value: Amount) => string
  /** Value returned when the input is nullish, an empty string, or numeric NaN */
  fallback?: string
} & Omit<Intl.NumberFormatOptions, 'unit' | 'style' | 'compact' | 'notation' | 'currency'>

const TOKEN_BALANCE_SIGNIFICANT_DIGITS = 5

const NUMBER_FORMAT_CATEGORIES = {
  'token.amount': { abbreviate: false, fallback: '-' },
  'token.compact': { abbreviate: true, fallback: '-' },
  'token.balance': {
    abbreviate: false,
    formatter: (value: Amount) => {
      const absValue = Math.abs(Number(value))
      const options: Partial<NumberFormatOptions> | undefined =
        absValue > 0 && absValue < 1
          ? { maximumSignificantDigits: TOKEN_BALANCE_SIGNIFICANT_DIGITS, trailingZeroDisplay: 'auto' }
          : absValue >= 1 && Number.isFinite(absValue)
            ? {
                maximumFractionDigits: Math.max(
                  2,
                  TOKEN_BALANCE_SIGNIFICANT_DIGITS - Math.floor(Math.log10(absValue)) - 1,
                ),
              }
            : undefined

      return defaultNumberFormatter(value, options)
    },
    fallback: '-',
  },
  'usd.amount': { unit: 'dollar', abbreviate: false, fallback: '-' },
  'usd.notional': { unit: 'dollar', abbreviate: true, fallback: '-' },
  'percent.value': { unit: 'percentage', abbreviate: false, fallback: '-' },
  'percent.rate': {
    unit: 'percentage',
    abbreviate: true,
    // Disregard the precision edge case around 0 and 1 and force using 2 decimals.
    minimumFractionDigits: 2,
    maximumSignificantDigits: undefined,
    fallback: '-',
  },
} as const satisfies Record<string, NumberFormatOptions & { fallback: string }>

type NumberFormatCategory = keyof typeof NUMBER_FORMAT_CATEGORIES

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
export const decomposeNumber = (value: Amount, options: NumberFormatOptions): DecomposedNumber => {
  const { abbreviate, formatter, unit } = options
  const { symbol = '', position = 'suffix' } = getUnitOptions(unit) ?? {}

  // Check for USD overflow
  const hasOverflowError = symbol === '$' && Number(value) > MAX_USD_VALUE
  if (hasOverflowError) {
    console.warn(`USD value is too large: ${value}`)

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

type MissingAmount = null | undefined | ''

/**
 * Formats a number according to the specified options by decomposing it into components
 * and reassembling them into a formatted string.
 *
 * @param value - The number to format. Nullish values and empty strings return `options.fallback` or `undefined`.
 * @param options - Formatting configuration options or semantic category preset
 * @param options.fallback - Returned for nullish values, empty strings, and numeric NaN values
 * @returns The formatted number as a string with prefix, main value, scale suffix, and suffix combined. Returns
 * `undefined` for nullish or empty values when no fallback is provided.
 *
 * @example
 * formatNumber(1234.56, { abbreviate: true })
 * // Returns "1.23k"
 *
 * formatNumber(1000000, { abbreviate: true, unit: { symbol: '$', position: 'prefix' } })
 * // Returns "$1m"
 *
 * formatNumber(500, { abbreviate: false })
 * // Returns "500"
 *
 * formatNumber(2500000000, { abbreviate: true, unit: { symbol: '%', position: 'suffix' }, decimals: 1 })
 * // Returns "2.5b%"
 *
 * formatNumber(-1000, { abbreviate: true, unit: 'dollar' })
 * // Returns "-$1k" (negative sign precedes the prefix symbol)
 *
 * formatNumber(1234567.89, { useGrouping: true, abbreviate: false })
 * // Returns "1,234,567.89"
 *
 * formatNumber(12.0, { decimals: 4 })
 * // Returns "12" (trailing zeros stripped because 12.0 is effectively an integer)
 *
 * formatNumber(12.0, { decimals: 4, trailingZeroDisplay: 'auto' })
 * // Returns "12.0000"
 *
 * formatNumber(undefined, { abbreviate: false, fallback: '-' })
 * // Returns "-"
 *
 * formatNumber(NaN, { abbreviate: false, fallback: '-' })
 * // Returns "-"
 *
 * formatNumber(NaN, { abbreviate: false })
 * // Returns "NaN"
 *
 * formatNumber(1000000, 'usd.notional')
 * // Returns "$1m"
 */
export function formatNumber(value: Amount | MissingAmount, category: NumberFormatCategory): string
export function formatNumber(value: Amount, options: NumberFormatOptions): string
export function formatNumber(value: Amount | MissingAmount, options: NumberFormatOptions & { fallback: string }): string
export function formatNumber(value: Amount | MissingAmount, options: NumberFormatOptions): string | undefined
export function formatNumber(value: Amount | MissingAmount, options: NumberFormatOptions | NumberFormatCategory) {
  options = typeof options === 'string' ? NUMBER_FORMAT_CATEGORIES[options] : options

  if (value == null || value === '' || (typeof value === 'number' && isNaN(value) && options.fallback !== undefined)) {
    return options.fallback
  }

  const decomposed = decomposeNumber(value, options)
  const isNegative = decomposed.mainValue.startsWith('-')
  const sign = isNegative ? '-' : ''
  const mainValue = isNegative ? decomposed.mainValue.slice(1) : decomposed.mainValue
  return [sign, decomposed.prefix, mainValue, decomposed.scaleSuffix, decomposed.suffix].filter(Boolean).join('')
}

export const formatNumberRange = (numbers: number[] | null | undefined) =>
  !numbers || numbers?.some(n => n == null) || numbers.every(n => !n)
    ? ''
    : numbers.map(n => formatNumber(n, { abbreviate: false })).join(' - ')

/**
 * Builds fraction digit options that preserve the precision already present in a source value.
 *
 * This exists for values that are derived from user-entered amounts or protocol calculations where the UI should not
 * always pad to the formatter's default decimal count. For example, a value of `1.2` with a default of `5` should render
 * with one decimal, while `1.234567` should be capped at five decimals.
 *
 * Returns an empty object for empty, nullish, zero, or negative values so `formatNumber` can keep its normal defaults.
 */
export function getFractionDigitsOptions(
  val: number | string | undefined | null,
  defaultDecimal: number,
): Partial<NumberFormatOptions> {
  function getDecimal(val: number | string, defaultDecimal: number) {
    const decimal = val.toString().split('.')[1]?.length ?? 0
    return decimal > defaultDecimal ? defaultDecimal : decimal
  }

  const formatOptions: Partial<NumberFormatOptions> = {}
  if (val && Number(val) >= 0) {
    const decimal = getDecimal(val, defaultDecimal)
    formatOptions.minimumFractionDigits = decimal
    formatOptions.maximumFractionDigits = decimal
  }
  return formatOptions
}
