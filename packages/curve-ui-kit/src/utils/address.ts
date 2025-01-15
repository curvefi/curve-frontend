export type Address = `0x${string}`

/**
 * Shortens an Ethereum address by displaying first and last few characters
 *
 * @param address - Ethereum address to shorten
 * @param digits - Total number of address digits to show (default: 6)
 * @returns Shortened address string in format "0xAB...XY"
 * @example
 * addressShort("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
 * addressShort("0x1234567890abcdef1234567890abcdef12345678", 8) // "0x12345...5678"
 */
export function addressShort(address?: string, digits = 6): string {
  if (!address) {
    return '0x000...000'
  }

  const pre = digits / 2 + 2 // +2 for the "0x"
  const post = address.length - digits / 2

  return `${address.substring(0, pre)}...${address.substring(post)}`
}
