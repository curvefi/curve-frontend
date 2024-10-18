import { queryOptions } from '@tanstack/react-query'
import { REFRESH_INTERVAL } from '@/constants'
import { checkChainValidity } from '../lib/validation'
import { queryOneWayMarketNames } from '../api/markets-api'
import { chainKeys } from './query-keys'
import { ChainQueryParams } from '../types'

export const getOneWayMarketNames = (params: ChainQueryParams, condition = true) =>
  queryOptions({
    queryKey: chainKeys.markets(params),
    queryFn: queryOneWayMarketNames,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: condition && checkChainValidity(params),
  })
