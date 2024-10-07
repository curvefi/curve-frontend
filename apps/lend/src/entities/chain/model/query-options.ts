import { queryOptions } from '@tanstack/react-query'
import { REFRESH_INTERVAL } from '@/constants'
import { ChainQueryParams, checkChainValidity } from '@/entities/chain'
import { queryOneWayMarketNames } from '@/entities/chain/api/markets-api'
import { chainKeys } from '@/entities/chain/model/query-keys'

export const getOneWayMarketNames = (params: ChainQueryParams) =>
  queryOptions({
    queryKey: chainKeys.markets(params),
    queryFn: queryOneWayMarketNames,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: checkChainValidity(params),
  })
