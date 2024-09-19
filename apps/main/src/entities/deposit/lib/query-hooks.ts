import type {
  DepositBalancedAmounts,
  DepositDetails,
  DepositEstGasApproval,
  StakeEstGasApproval,
} from '@/entities/deposit/types'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { createQueryHook } from '@/shared/lib/queries/factory'
import { keys } from '@/entities/deposit/model'
import * as api from '@/entities/deposit/api'
import * as conditions from '@/entities/deposit/model/query-conditions'

export const useDepositDetails = createQueryHook((params: DepositDetails) =>
  queryOptions({
    queryKey: keys.depositDetails(params),
    queryFn: api.depositDetails,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.depositDetails(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)

export const useDepositBalancedAmounts = createQueryHook((params: DepositBalancedAmounts) =>
  queryOptions({
    queryKey: keys.depositBalancedAmounts(params),
    queryFn: api.depositBalancedAmounts,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.depositBalancedAmounts(params),
  })
)

export const useDepositEstGasApproval = createQueryHook((params: DepositEstGasApproval) =>
  queryOptions({
    queryKey: keys.depositEstGasApproval(params),
    queryFn: api.depositEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.depositEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)

export const useStakeEstGasApproval = createQueryHook((params: StakeEstGasApproval) =>
  queryOptions({
    queryKey: keys.stakeEstGasApproval(params),
    queryFn: api.stakeEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.stakeEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)
