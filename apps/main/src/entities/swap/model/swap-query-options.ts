import type { PoolQueryParams } from '@/entities/pool'
import type { SwapApproval, SwapEstGas, SwapExchangeDetails } from '@/entities/swap'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { swapKeys } from '@/entities/swap/model'
import * as api from '@/entities/swap/api'
import * as conditions from '@/entities/swap/model/swap-query-conditions'

export const getSwapIgnoreExchangeRateCheck = (params: PoolQueryParams) =>
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

export const getSwapApproval = (params: SwapApproval) =>
  queryOptions({
    queryKey: swapKeys.swapApproval(params),
    queryFn: api.swapApproval,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.swapApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getSwapEstGas = (params: SwapEstGas) =>
  queryOptions({
    queryKey: swapKeys.swapEstGas(params),
    queryFn: api.swapEstGas,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.swapEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
