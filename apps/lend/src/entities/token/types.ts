import { ChainQueryParams } from '@/entities/chain/types'

export type TokenQueryParams = ChainQueryParams & {
  address?: string
}

export type CombinedTokenParams = TokenQueryParams
