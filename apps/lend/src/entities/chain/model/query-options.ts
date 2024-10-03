import { queryOptions } from '@tanstack/react-query'
import { chainKeys, ChainQueryParams } from '@/entities/chain'
import { queryTotalCrvUsd } from '@/entities/chain/api/query'
import { REFRESH_INTERVAL } from '@/constants'
import { checkChainValidity } from '@/entities/chain/lib/validation'

export const getTotalCrvUsdQueryOptions = (params: ChainQueryParams) =>
  queryOptions({
    queryKey: chainKeys.root(params),
    queryFn: queryTotalCrvUsd,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: checkChainValidity(params),
  })
