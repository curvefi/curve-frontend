import { ChainQueryParams } from '@/entities/chain/types'

export type TokenQueryParams = ChainQueryParams & {
  tokenAddress?: string
}

export type CombinedTokenParams = TokenQueryParams
