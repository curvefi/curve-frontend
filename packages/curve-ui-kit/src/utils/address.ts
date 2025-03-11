import { getAddress, zeroAddress } from 'viem'

export type Address = `0x${string}`

/**
 * Shortens an Ethereum address by displaying first and last few characters
 *
 * @param address - Ethereum address to shorten
 * @param digits - Number of digits to show on each side of the shortened address (default: 4)
 * @param includePrefix - Whether to count the "0x" prefix as part of the starting digits (default: true)
 * @returns Shortened address string in format for example "0xAB...XY"
 * @example
 * // With default parameters (4 digits, prefix included)
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678") // "0x12...5678"
 *
 * // With 4 digits on each side, but not counting prefix (showing 6 chars after 0x at start)
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678", 4, false) // "0x1234...5678"
 *
 * @remarks
 * This function explicitly applies checksumming to the address for consistency.
 * We actively discourage non-checksummed addresses and therefore don't provide an option to bypass it.
 * The checksumming is applied as a precaution since we don't control the input address string.
 * The `getAddress` function from viem applies checksumming to the address and has a checksum cache
 * to optimize performance when the same address is used multiple times.
 */
export function shortenAddress(address: string | undefined, digits = 4, includePrefix = true): string {
  const addr = getAddress(address || zeroAddress)
  const startChars = includePrefix ? digits : digits + 2

  return `${addr.slice(0, startChars)}...${addr.slice(-digits)}`
}
