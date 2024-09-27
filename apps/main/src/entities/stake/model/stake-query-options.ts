import type { StakeApproval, StakeEstGas } from '@/entities/stake'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { stakeKeys } from '@/entities/stake/model'
import * as api from '@/entities/stake/api'
import * as conditions from '@/entities/stake/model/stake-query-conditions'

export const getStakeApproval = (params: StakeApproval) =>
  queryOptions({
    queryKey: stakeKeys.stakeApproval(params),
    queryFn: api.stakeApproval,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.stakeApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
export const getStakeEstGas = (params: StakeEstGas) =>
  queryOptions({
    queryKey: stakeKeys.stakeEstGas(params),
    queryFn: api.stakeEstGas,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.stakeEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
