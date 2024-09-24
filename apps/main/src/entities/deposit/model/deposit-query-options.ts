import type {
  DepositBalancedAmounts,
  DepositDetails,
  DepositEstGasApproval,
  StakeEstGasApproval,
} from '@/entities/deposit'

import { queryOptions } from '@tanstack/react-query'

import { REFRESH_INTERVAL } from '@/constants'
import { depositKeys } from '@/entities/deposit/model'
import * as api from '@/entities/deposit/api'
import * as conditions from '@/entities/deposit/model/deposit-query-conditions'

export const getDepositDetails = (params: DepositDetails) =>
  queryOptions({
    queryKey: depositKeys.depositDetails(params),
    queryFn: api.depositDetails,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.depositDetails(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getDepositBalancedAmounts = (params: DepositBalancedAmounts) =>
  queryOptions({
    queryKey: depositKeys.depositBalancedAmounts(params),
    queryFn: api.depositBalancedAmounts,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.depositBalancedAmounts(params),
  })

export const getDepositEstGasApproval = (params: DepositEstGasApproval) =>
  queryOptions({
    queryKey: depositKeys.depositEstGasApproval(params),
    queryFn: api.depositEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.depositEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getStakeEstGasApproval = (params: StakeEstGasApproval) =>
  queryOptions({
    queryKey: depositKeys.stakeEstGasApproval(params),
    queryFn: api.stakeEstGasApproval,
    staleTime: REFRESH_INTERVAL['15s'],
    enabled: conditions.stakeEstGasApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
