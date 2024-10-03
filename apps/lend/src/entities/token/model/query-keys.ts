import type { ChainQueryParams } from '@/entities/chain/types'
import type { ExtractQueryKeyType } from '@/shared/types/api'
import { TokenQueryParams } from '@/entities/token'

export const tokenKeys = {
  root: ({ chainId, address }: TokenQueryParams) => ['chain', chainId, 'token', address] as const,
} as const

export type TokenQueryKeyType<K extends keyof typeof tokenKeys> = ExtractQueryKeyType<typeof tokenKeys, K>
