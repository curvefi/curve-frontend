import type { DepositApproval, DepositBalancedAmounts, DepositDetails, DepositEstGas } from '@/entities/deposit'

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

export const getDepositApproval = (params: DepositApproval) =>
  queryOptions({
    queryKey: depositKeys.depositApproval(params),
    queryFn: api.depositApproval,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.depositApproval(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })

export const getDepositEstGas = (params: DepositEstGas) =>
  queryOptions({
    queryKey: depositKeys.depositEstGas(params),
    queryFn: api.depositEstGas,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.depositEstGas(params),
    refetchInterval: REFRESH_INTERVAL['1m'],
  })
