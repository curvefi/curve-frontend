import type { Claim, PoolSignerBase, UnstakeEstGas, WithdrawDetails, WithdrawEstGasApproval } from '@/entities/withdraw'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { createQueryHook } from '@/shared/lib/queries/factory'
import { keys } from '@/entities/withdraw/model'
import * as api from '@/entities/withdraw/api/query-api'
import * as conditions from '@/entities/withdraw/model/query-conditions'

export const useClaimableDetails = createQueryHook((params: PoolSignerBase) =>
  queryOptions({
    queryKey: keys.claimableDetails(params),
    queryFn: api.claimableDetails,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.claimableDetails(params),
  })
)

export const useClaimableEstGas = createQueryHook((params: Claim) =>
  queryOptions({
    queryKey: keys.claimEstGas(params),
    queryFn: api.claimEstGas,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.claimEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)

export const useWithdrawDetails = createQueryHook((params: WithdrawDetails) =>
  queryOptions({
    queryKey: keys.withdrawDetails(params),
    queryFn: api.withdrawDetails,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.withdrawBalancedDetails(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)

export const useWithdrawEstGasApproval = createQueryHook((params: WithdrawEstGasApproval) =>
  queryOptions({
    queryKey: keys.withdrawEstGasApproval(params),
    queryFn: api.withdrawEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.withdrawEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)

export const useUnstakeEstGas = createQueryHook((params: UnstakeEstGas) =>
  queryOptions({
    queryKey: keys.unstakeEstGas(params),
    queryFn: api.unstakeEstGas,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.unstakeEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
)
