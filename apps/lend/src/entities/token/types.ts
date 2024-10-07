import { ChainQueryParams } from '@/entities/chain/types'
import type { ExtractQueryKeyType } from '@/shared/types/api'
import { tokenKeys } from '@/entities/token/model'

export type TokenQueryParams = ChainQueryParams & {
  tokenAddress?: string
}

export type CombinedTokenParams = TokenQueryParams

export type TokenQueryKeyType<K extends keyof typeof tokenKeys> = ExtractQueryKeyType<typeof tokenKeys, K>
