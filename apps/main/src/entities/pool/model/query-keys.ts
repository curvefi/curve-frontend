import { PoolParams, rootKeys } from '@/shared/model/root-keys'

export const poolKeys = {
  root: ({ chainId, poolId }: PoolParams) => [...rootKeys.chain({ chainId }), 'pool', poolId] as const,
  lists: (params: PoolParams) => [...rootKeys.pool(params), 'list'] as const,
  list: (params: PoolParams & { filters?: string }) => [...poolKeys.lists(params), params.filters] as const,
} as const
