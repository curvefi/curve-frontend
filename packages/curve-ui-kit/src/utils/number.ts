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
 * Returns the appropriate scale suffix for a given number value.
 * Uses log10Exp to determine the magnitude and returns the corresponding suffix.
 *
 * @param value - The number to determine the scale suffix for.
 * @returns The scale suffix as a string ('t' for trillion, 'b' for billion, 'm' for million, 'k' for thousand, or '' for smaller values).
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
export function scaleSuffix(value: number): string {
  const units = ['', 'k', 'm', 'b', 't']
  const index = Math.max(0, Math.min(units.length - 1, log10Exp(value)))

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
export function abbreviateNumber(value: number): number {
  const exp = log10Exp(value) * 3
  // Only apply the scaling if exp is positive
  value /= exp > 0 ? 10 ** exp : 1

  return value
}
