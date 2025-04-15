type ShortenStringOptions = {
  /** Number of digits to show on each side of the shortened string (default: 4) */
  digits?: number
}

/**
 * Shortens a string by displaying first and last few characters
 *
 * @param string - String to shorten
 * @param options - Configuration options for shortening
 * @returns Shortened string in format for example "0xAB...XY"
 * @example
 * // With default parameters (4 digits)
 * shortenString("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
 *
 * // With 6 digits on each side
 * shortenHash("0x1234567890abcdef1234567890abcdef12345678", { digits: 6 }) // "0x123456...345678"
 *
 */
export function shortenString(string: string | undefined, options?: ShortenStringOptions): string {
  const { digits = 4 } = options || {}

  if (!string) {
    return '-'
  }

  return `${string.slice(0, digits + 2)}...${string.slice(-digits)}`
}
