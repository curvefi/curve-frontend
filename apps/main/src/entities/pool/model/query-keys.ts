import type {
  PoolBase,
  PoolQueryParams,
  PoolSeedAmounts,
  PoolCurrencyReserves,
  PoolTokensList,
} from '@/entities/pool/types'

import { chainKeys } from '@/entities/chain'

export const poolKeys = {
  root: ({ chainId, poolId }: PoolQueryParams) => [...chainKeys.root({ chainId }), 'pool', poolId] as const,
  lists: (params: PoolQueryParams) => [...poolKeys.root(params), 'list'] as const,
  list: (params: PoolQueryParams & { filters?: string }) => [...poolKeys.lists(params), params.filters] as const,
  poolBase: ({ chainId, poolId }: PoolBase) => {
    return ['poolBase', chainId, poolId] as const
  },
  poolTokensList: ({ isWrapped, ...params }: PoolTokensList) => {
    return ['poolTokensList', ...poolKeys.poolBase(params), isWrapped] as const
  },
  poolSeedAmounts: ({ isSeed, firstAmount, useUnderlying, ...params }: PoolSeedAmounts) => {
    return ['poolSeedAmounts', ...poolKeys.poolBase(params), isSeed, firstAmount, useUnderlying] as const
  },
  poolUnderlyingCurrencyReserves: (params: PoolBase) => {
    return ['poolCurrencyReserves', ...poolKeys.poolBase(params)] as const
  },
  poolWrappedCurrencyReserves: ({ isWrapped, ...params }: PoolCurrencyReserves) => {
    return ['poolWrappedCurrencyReserves', ...poolKeys.poolBase(params), isWrapped] as const
  },
  poolDetails: (params: PoolBase) => {
    return ['poolDetails', ...poolKeys.poolBase(params)] as const
  },
} as const
