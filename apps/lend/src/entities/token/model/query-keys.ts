import type { ExtractQueryKeyType } from '@/shared/types/api'
import { TokenQueryParams } from '@/entities/token'

export const tokenKeys = {
  root: ({ chainId, tokenAddress }: TokenQueryParams) => ['chain', chainId, 'token', tokenAddress] as const,
  usdRate: (params: TokenQueryParams) => [...tokenKeys.root(params), 'usdRate'] as const,
} as const

export type TokenQueryKeyType<K extends keyof typeof tokenKeys> = ExtractQueryKeyType<typeof tokenKeys, K>
