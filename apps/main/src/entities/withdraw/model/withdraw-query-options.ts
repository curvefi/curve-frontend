import type { Claim, PoolSignerBase, UnstakeEstGas, WithdrawDetails, WithdrawEstGasApproval } from '@/entities/withdraw'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { withdrawKeys } from '@/entities/withdraw/model'
import * as api from '@/entities/withdraw/api/withdraw-query'
import * as conditions from '@/entities/withdraw/model/withdraw-query-conditions'

export const getClaimableDetails = (params: PoolSignerBase) =>
  queryOptions({
    queryKey: withdrawKeys.claimableDetails(params),
    queryFn: api.claimableDetails,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.claimableDetails(params),
  })

export const getClaimableEstGas = (params: Claim) =>
  queryOptions({
    queryKey: withdrawKeys.claimEstGas(params),
    queryFn: api.claimEstGas,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.claimEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getWithdrawDetails = (params: WithdrawDetails) =>
  queryOptions({
    queryKey: withdrawKeys.withdrawDetails(params),
    queryFn: api.withdrawDetails,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.withdrawBalancedDetails(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getWithdrawEstGasApproval = (params: WithdrawEstGasApproval) =>
  queryOptions({
    queryKey: withdrawKeys.withdrawEstGasApproval(params),
    queryFn: api.withdrawEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.withdrawEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getUnstakeEstGas = (params: UnstakeEstGas) =>
  queryOptions({
    queryKey: withdrawKeys.unstakeEstGas(params),
    queryFn: api.unstakeEstGas,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.unstakeEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
