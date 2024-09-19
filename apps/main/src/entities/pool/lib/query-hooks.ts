import type { PoolSeedAmounts, PoolCurrencyReserves, PoolBase, PoolTokensList } from '@/entities/pool'

import { REFRESH_INTERVAL } from '@/constants'
import { createQueryHook } from '@/shared/lib/queries/factory'
import { queryOptions } from '@tanstack/react-query'
import { poolKeys as keys } from '@/entities/pool/model'
import * as api from '@/entities/pool/api'
import * as conditions from '@/entities/pool/model/query-conditions'

export const usePoolTokenList = createQueryHook((params: PoolTokensList) =>
  queryOptions({
    queryKey: keys.poolTokensList(params),
    queryFn: api.poolTokensList,
    staleTime: REFRESH_INTERVAL['Inf'],
    enabled: conditions.enablePoolTokensList(params),
  })
)

export const usePoolSeedAmounts = createQueryHook((params: PoolSeedAmounts) =>
  queryOptions({
    queryKey: keys.poolSeedAmounts(params),
    queryFn: api.poolSeedAmounts,
    staleTime: REFRESH_INTERVAL['1h'],
    enabled: conditions.enablePoolSeedAmounts(params),
  })
)

export const usePoolDetails = createQueryHook((params: PoolBase) =>
  queryOptions({
    queryKey: keys.poolDetails(params),
    queryFn: api.poolDetails,
    staleTime: REFRESH_INTERVAL['3s'],
    enabled: conditions.enableBase(params),
    refetchInterval: REFRESH_INTERVAL['5m'],
  })
)

export const usePoolUnderlyingCurrencyReserves = createQueryHook((params: PoolBase) =>
  queryOptions({
    queryKey: keys.poolUnderlyingCurrencyReserves(params),
    queryFn: api.poolUnderlyingCurrencyReserves,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enableBase(params),
    refetchInterval: REFRESH_INTERVAL['5m'],
  })
)

export const usePoolWrappedCurrencyReserves = createQueryHook((params: PoolCurrencyReserves) =>
  queryOptions({
    queryKey: keys.poolWrappedCurrencyReserves(params),
    queryFn: api.poolWrappedCurrencyReserves,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enablePoolWrappedCurrencyReserves(params),
    refetchInterval: REFRESH_INTERVAL['5m'],
  })
)
