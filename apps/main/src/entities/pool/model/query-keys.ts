import type {
  PoolSignerBase,
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
  signerBase: ({ chainId, poolId, signerAddress }: PoolSignerBase) => {
    return [...poolKeys.root({ chainId, poolId }), signerAddress] as const
  },
  poolTokensList: ({ isWrapped, ...params }: PoolTokensList) => {
    return [...poolKeys.root(params), 'poolTokensList', isWrapped] as const
  },
  poolSeedAmounts: ({ isSeed, firstAmount, useUnderlying, ...params }: PoolSeedAmounts) => {
    return [...poolKeys.root(params), 'poolSeedAmounts', isSeed, firstAmount, useUnderlying] as const
  },
  poolUnderlyingCurrencyReserves: (params: PoolQueryParams) => {
    return [...poolKeys.root(params), 'poolCurrencyReserves'] as const
  },
  poolWrappedCurrencyReserves: ({ isWrapped, ...params }: PoolCurrencyReserves) => {
    return [...poolKeys.root(params), 'poolWrappedCurrencyReserves', isWrapped] as const
  },
  poolDetails: (params: PoolQueryParams) => {
    return [...poolKeys.root(params), 'poolDetails'] as const
  },
} as const
