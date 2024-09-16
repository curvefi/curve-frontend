import { checkGaugeValidity } from '@/entities/gauge/lib'
import { gaugeKeys as keys } from '@/entities/gauge/model'
import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'
import { queryClient } from '@/shared/api/query-client'

export const enabledGaugeStatus = (data: GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledIsDepositRewardAvailable = (data: GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledGaugeManager = (data: GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledGaugeDistributors = (data: GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledGaugeVersion = (data: GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledDepositRewardIsApproved = (data: DepositRewardApproveParams & GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledEstimateGasDepositRewardApprove = (data: DepositRewardApproveParams & GaugeQueryParams) => {
  return checkGaugeValidity(data)
}

export const enabledEstimateGasAddRewardToken = (data: AddRewardParams & GaugeQueryParams) => {
  return checkGaugeValidity(data) && !!queryClient.getQueryData(keys.isDepositRewardAvailable(data))
}

export const enabledEstimateGasDepositReward = (data: DepositRewardParams & GaugeQueryParams) => {
  return checkGaugeValidity(data) && !!queryClient.getQueryData(keys.depositRewardIsApproved(data))
}
