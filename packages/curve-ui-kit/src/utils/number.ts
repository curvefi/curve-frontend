import { formatNumberWithPrecision } from 'ui'

const units = ['', 'K', 'M', 'B', 'T']

export function getAbbreviateExponent(value: number) {
  const exponent = Math.log10(Math.abs(value))
  const index = Math.floor(exponent / 3)
  return Math.max(0, Math.min(units.length - 1, index)) * 3
}

/**
 * Returns the appropriate unit suffix for a given number value.
 *
 * @param value - The number to determine the unit for.
 * @returns The unit suffix as a string ('t' for trillion, 'b' for billion, 'm' for million, 'k' for thousand, or '' for smaller values).
 *
 * @example
 * unit(1500000000000) // Returns 't'
 * unit(2000000000) // Returns 'b'
 * unit(3000000) // Returns 'm'
 * unit(4000) // Returns 'k'
 * unit(500) // Returns ''
 * unit(-1000000) // Returns 'm'
 * unit(0) // Returns ''
 */
const suffix = (value: number) => units[getAbbreviateExponent(value) / 3]

/**
 * Abbreviates a number such that it can go along with a suffix like k, m, b or t.
 *
 * @example
 * round(1234.5678) // Returns "1.23", goes with suffix "k"
 * round(1000000) // Returns "1.0", goes with suffix "m"
 */
export const abbr = (value: number): string =>
  formatNumberWithPrecision(value / Math.pow(10, getAbbreviateExponent(value))) + suffix(value)
