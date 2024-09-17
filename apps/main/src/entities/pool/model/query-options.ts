import { ChainQueryParams } from '@/entities/chain/types'
import { queryOptions } from '@tanstack/react-query'
import { poolKeys } from '@/entities/pool'
import { REFRESH_INTERVAL } from '@/constants'
import { enabledPools } from '@/entities/pool/model/enabled-conditions'
import { queryPools } from '@/entities/pool/api/pools-api'

export const getPoolsQueryOptions = (params: ChainQueryParams) =>
  queryOptions({
    queryKey: poolKeys.root(params),
    queryFn: queryPools,
    staleTime: REFRESH_INTERVAL['1s'],  // The function is memoized on the curvejs side, so we don't need to worry about caching
    enabled: enabledPools(params),
  })
