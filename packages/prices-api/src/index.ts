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
 * const host = getHost() // "https://prices.curve.finance"
 */
export const getHost = (options?: Options): Required<Options>['host'] => options?.host ?? 'https://prices.curve.finance'

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
  'xdai',
  'base',
  'polygon',
  'fraxtal',
  'sonic',
  'hyperliquid',
  'bsc',
  'taiko',
] as const

export type Chain = (typeof chains)[number]

/** Chains used for Prices API LlamaLend position lookups; app-supported networks may differ. */
export const LEND_CHAINS = ['ethereum', 'arbitrum', 'optimism', 'fraxtal', 'sonic'] as const satisfies Chain[]

/** Chains used for Prices API crvUSD position lookups; app-supported networks may differ. */
export const MINT_CHAINS = ['ethereum'] as const satisfies Chain[]

export const isPricesApiChain = (chain: string): chain is Chain => chains.includes(chain as Chain)
export const getBlockchainId = (networkId: string): Chain | undefined =>
  isPricesApiChain(networkId) ? networkId : undefined

export type PaginationMeta = {
  page: number
  /** items/events per page */
  per_page: number
  /** total number of items/events available on endpoint */
  count: number
}
