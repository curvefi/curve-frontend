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
 * unit(1500000000000) // Returns 't'
 * unit(2000000000) // Returns 'b'
 * unit(3000000) // Returns 'm'
 * unit(4000) // Returns 'k'
 * unit(500) // Returns ''
 * unit(-1000000) // Returns 'm'
 * unit(0) // Returns ''
 */
export function scaleSuffix(value: number): string {
  const units = ['', 'k', 'm', 'b', 't']
  const index = Math.max(0, Math.min(units.length - 1, log10Exp(value)))

  return units[index]
}

/**
 * Abbreviates a number such that it can go along with a suffix like k, m, b or t.
 *
 * @example
 * round(1234.5678) // Returns "1.23", goes with suffix "k"
 * round(1000000) // Returns "1.0", goes with suffix "m"
 */
export function abbreviateNumber(value: number): number {
  const exp = log10Exp(value) * 3
  // Only apply the scaling if exp is positive
  value /= exp > 0 ? 10 ** exp : 1

  return value
}
