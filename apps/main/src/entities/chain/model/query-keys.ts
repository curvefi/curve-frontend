import type { ChainQueryParams } from '@/entities/chain/types'

export const chainKeys = {
  root: ({ chainId }: ChainQueryParams) => ['chain', chainId] as const,
} as const
