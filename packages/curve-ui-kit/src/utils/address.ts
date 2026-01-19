import { getAddress, zeroAddress } from 'viem'

export type { Address } from 'viem'

type ShortenAddressOptions = {
  /** Number of digits to show on each side of the shortened address (default: 4) */
  digits?: number
}

/**
 * Shortens a hash (e.g., transaction hash or address) by displaying the first and last few characters
 */
export const shortenHash = (hash: string, { digits = 5 }: ShortenAddressOptions = {}) =>
  `${hash.slice(0, digits + 2)}...${hash.slice(-digits)}`

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
export const shortenAddress = (address: string | undefined, options?: ShortenAddressOptions): string =>
  shortenHash(getAddress(address || zeroAddress), options)

export const CRVUSD_ADDRESS = '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e' as const
export const CRV_ADDRESS = '0xd533a949740bb3306d119cc777fa900ba034cd52' as const

export const CRVUSD = {
  symbol: 'crvUSD',
  address: CRVUSD_ADDRESS,
  decimals: 18,
  name: 'crvUSD',
  chain: 'ethereum',
} as const
