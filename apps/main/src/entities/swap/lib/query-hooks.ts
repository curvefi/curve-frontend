import type { PoolBase, SwapEstGasApproval, SwapExchangeDetails } from '@/entities/swap'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { createQueryHook } from '@/shared/lib/queries/factory'
import { keys } from '@/entities/swap/model'
import * as api from '@/entities/swap/api'
import * as conditions from '@/entities/swap/model/query-conditions'

export const useSwapIgnoreExchangeRateCheck = createQueryHook((params: PoolBase) =>
  queryOptions({
    queryKey: keys.ignoreExchangeRateCheck(params),
    queryFn: api.swapIgnoreExchangeRateCheck,
    staleTime: REFRESH_INTERVAL['Inf'],
    enabled: conditions.poolBaseBase(params),
  })
)

export const useSwapExchangeDetails = createQueryHook((params: SwapExchangeDetails) =>
  queryOptions({
    queryKey: keys.swapExchangeDetails(params),
    queryFn: api.swapExchangeDetails,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.swapExchangeDetails(params),
    refetchInterval: REFRESH_INTERVAL['15s'],
  })
)

export const useSwapEstGasApproval = createQueryHook((params: SwapEstGasApproval) =>
  queryOptions({
    queryKey: keys.swapEstGasApproval(params),
    queryFn: api.swapEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.swapEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['15s'],
  })
)
