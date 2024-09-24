import type { PoolBase, SwapEstGasApproval, SwapExchangeDetails } from '@/entities/swap'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { swapKeys } from '@/entities/swap/model'
import * as api from '@/entities/swap/api'
import * as conditions from '@/entities/swap/model/swap-query-conditions'

export const getSwapIgnoreExchangeRateCheck = (params: PoolBase) =>
  queryOptions({
    queryKey: swapKeys.ignoreExchangeRateCheck(params),
    queryFn: api.swapIgnoreExchangeRateCheck,
    staleTime: REFRESH_INTERVAL['Inf'],
    enabled: conditions.poolBaseBase(params),
  })

export const getSwapExchangeDetails = (params: SwapExchangeDetails) =>
  queryOptions({
    queryKey: swapKeys.swapExchangeDetails(params),
    queryFn: api.swapExchangeDetails,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.swapExchangeDetails(params),
    refetchInterval: REFRESH_INTERVAL['15s'],
  })

export const getSwapEstGasApproval = (params: SwapEstGasApproval) =>
  queryOptions({
    queryKey: swapKeys.swapEstGasApproval(params),
    queryFn: api.swapEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.swapEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['15s'],
  })
