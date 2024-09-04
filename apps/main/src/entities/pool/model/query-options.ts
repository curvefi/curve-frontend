import { poolKeys, PoolQueryParams } from '@/entities/pool'
import { queryOptions } from '@tanstack/react-query'
import { queryLiquidity, queryVolume } from '@/entities/pool/api/pool-api'
import { REFRESH_INTERVAL } from '@/constants'
import { checkPoolValidity } from '@/entities/pool/lib/validation'

export const volumeQueryOptions = (params: PoolQueryParams) =>
  queryOptions({
    queryKey: poolKeys.volume(params),
    queryFn: queryVolume,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: checkPoolValidity(params),
    gcTime: REFRESH_INTERVAL['1w'],
  })

export const liquidityQueryOptions = (params: PoolQueryParams) =>
  queryOptions({
    queryKey: poolKeys.liquidity(params),
    queryFn: queryLiquidity,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: checkPoolValidity(params),
    gcTime: REFRESH_INTERVAL['1w'],
  })
