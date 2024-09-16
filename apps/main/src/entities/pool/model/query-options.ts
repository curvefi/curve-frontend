import { poolKeys, PoolQueryParams } from '@/entities/pool'
import { queryOptions } from '@tanstack/react-query'
import { queryLiquidity, queryPoolMapping, queryVolume } from '@/entities/pool/api/pool-api'
import { REFRESH_INTERVAL } from '@/constants'
import { checkPoolsValidity, checkPoolValidity } from '@/entities/pool/lib/validation'
import { ChainQueryParams } from '@/entities/chain/types'


export const poolMappingQueryOptions = (params: ChainQueryParams) =>
  queryOptions({
    queryKey: poolKeys.root(params),
    queryFn: queryPoolMapping,
    staleTime: REFRESH_INTERVAL['1h'],
    enabled: checkPoolsValidity(params)
  })

export const volumeQueryOptions = (params: PoolQueryParams) =>
  queryOptions({
    queryKey: poolKeys.volume(params),
    queryFn: queryVolume,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: checkPoolValidity(params)
  })

export const liquidityQueryOptions = (params: PoolQueryParams) =>
  queryOptions({
    queryKey: poolKeys.liquidity(params),
    queryFn: queryLiquidity,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: checkPoolValidity(params),
  })