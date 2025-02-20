/**
 * Options for making API requests
 * @example
 * const options: Options = {
 *   host: "http://localhost:3000", // Custom host for local testing
 *   signal: new AbortController().signal // For request cancellation
 * }
 */
export type Options = {
  host?: string
  signal?: AbortSignal
}

/**
 * Gets the API host URL, using the provided host or falling back to default
 * @param options - Optional configuration options
 * @returns Promise that resolves to the host URL
 * @example
 * const host = getHost() // "https://prices.curve.fi"
 */
export const getHost = (options?: Options): Required<Options>['host'] => options?.host ?? 'https://prices.curve.fi'

/**
 * List of supported blockchain networks
 * @example
 * const chain: Chain = "ethereum"
 */
export const chains = [
  'ethereum',
  'arbitrum',
  'optimism',
  'fantom',
  'avalanche',
  'xdai',
  'matic',
  'harmony',
  'moonbeam',
  'base',
  'polygon',
  'fraxtal',
] as const

export type Chain = (typeof chains)[number]

export function isChain(chain: string): chain is Chain {
  return chains.includes(chain as Chain)
}

// Copied from Viem such that you don't actually need a Viem dependency but may also use Ethers.
export type Address = `0x${string}`

export const CHAIN_IDS: Record<Chain, number> = {
  ethereum: 1,
  optimism: 10,
  xdai: 100,
  polygon: 137,
  fantom: 250,
  fraxtal: 252,
  moonbeam: 1284,
  base: 8453,
  arbitrum: 42161,
  avalanche: 43114,
  matic: 137,
  harmony: 1666600000,
}

export const CHAIN_ID_NAMES: Record<number, Chain> = Object.fromEntries(
  Object.entries(CHAIN_IDS).map(([chain, id]) => [id, chain as Chain]),
)
