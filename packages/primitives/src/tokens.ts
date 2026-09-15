import type { Address } from './address.utils'

export type TokenMetadata = {
  decimals: number
  symbol: string
  name: string
  lp?: true
}

/** Token metadata keyed by checksummed addresses. */
export type TokensResponse = Record<Address, TokenMetadata>
