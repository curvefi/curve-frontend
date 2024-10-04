import type { ChainQueryParams } from '@/entities/chain/types'
import type { ExtractQueryKeyType } from '@/shared/types/api'

export const chainKeys = {
  root: ({ chainId }: ChainQueryParams) => ['chain', chainId] as const,
  markets: ({ chainId }: ChainQueryParams) => ['chain', chainId, 'markets'] as const,
} as const

export type ChainQueryKeyType<K extends keyof typeof chainKeys> = ExtractQueryKeyType<typeof chainKeys, K>
