import { TokenQueryParams } from '@/entities/token'

export const tokenKeys = {
  root: ({ chainId, tokenAddress }: TokenQueryParams) => ['chain', chainId, 'token', tokenAddress] as const,
  usdRate: (params: TokenQueryParams) => [...tokenKeys.root(params), 'usdRate'] as const,
} as const
