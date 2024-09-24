import type { PoolSeedAmounts, PoolCurrencyReserves, PoolBase, PoolTokensList } from '@/entities/pool'

import { REFRESH_INTERVAL } from '@/constants'
import { queryOptions } from '@tanstack/react-query'
import { poolKeys as keys } from '@/entities/pool/model'
import * as api from '@/entities/pool/api'
import * as conditions from '@/entities/pool/model/pool-query-conditions'

export const getPoolTokenList = (params: PoolTokensList) =>
  queryOptions({
    queryKey: keys.poolTokensList(params),
    queryFn: api.poolTokensList,
    staleTime: REFRESH_INTERVAL['Inf'],
    enabled: conditions.enablePoolTokensList(params),
  })

export const getPoolSeedAmounts = (params: PoolSeedAmounts) =>
  queryOptions({
    queryKey: keys.poolSeedAmounts(params),
    queryFn: api.poolSeedAmounts,
    staleTime: REFRESH_INTERVAL['1h'],
    enabled: conditions.enablePoolSeedAmounts(params),
  })

export const getPoolDetails = (params: PoolBase) =>
  queryOptions({
    queryKey: keys.poolDetails(params),
    queryFn: api.poolDetails,
    staleTime: REFRESH_INTERVAL['3s'],
    enabled: conditions.enableBase(params),
    refetchInterval: REFRESH_INTERVAL['5m'],
  })

export const getPoolUnderlyingCurrencyReserves = (params: PoolBase) =>
  queryOptions({
    queryKey: keys.poolUnderlyingCurrencyReserves(params),
    queryFn: api.poolUnderlyingCurrencyReserves,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enableBase(params),
    refetchInterval: REFRESH_INTERVAL['5m'],
  })

export const getPoolWrappedCurrencyReserves = (params: PoolCurrencyReserves) =>
  queryOptions({
    queryKey: keys.poolWrappedCurrencyReserves(params),
    queryFn: api.poolWrappedCurrencyReserves,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enablePoolWrappedCurrencyReserves(params),
    refetchInterval: REFRESH_INTERVAL['5m'],
  })
