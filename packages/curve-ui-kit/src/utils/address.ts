import { getAddress, zeroAddress } from 'viem'

export type Address = `0x${string}`

type ShortenAddressOptions = {
  /** Number of digits to show on each side of the shortened address (default: 4) */
  digits?: number
}

/**
 * Shortens an Ethereum address by displaying first and last few characters
 *
 * @param address - Ethereum address to shorten
 * @param options - Configuration options for shortening
 * @returns Shortened address string in format for example "0xAB...XY"
 * @example
 * // With default parameters (4 digits)
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678") // "0x1234...5678"
 *
 * // With 6 digits on each side
 * shortenAddress("0x1234567890abcdef1234567890abcdef12345678", { digits: 6 }) // "0x123456...345678"
 *
 * @remarks
 * This function explicitly applies checksumming to the address for consistency.
 * We actively discourage non-checksummed addresses and therefore don't provide an option to bypass it.
 * The checksumming is applied as a precaution since we don't control the input address string.
 * The `getAddress` function from viem applies checksumming to the address and has a checksum cache
 * to optimize performance when the same address is used multiple times.
 * To enforce consistency, there's no option to include the 0x prefix on the starting digits length.
 */
export function shortenAddress(address: string | undefined, options?: ShortenAddressOptions): string {
  const { digits = 4 } = options || {}
  const addr = getAddress(address || zeroAddress)

  return `${addr.slice(0, digits + 2)}...${addr.slice(-digits)}`
}
