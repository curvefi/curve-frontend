import { checkGaugeValidity } from '@/entities/gauge/lib'
import { gaugeKeys as keys } from '@/entities/gauge/model'
import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'
import { queryClient } from '@/shared/curve-lib'

export const enabledGaugeStatus = (data: GaugeQueryParams) => checkGaugeValidity(data)
export const enabledIsDepositRewardAvailable = (data: GaugeQueryParams) => checkGaugeValidity(data)
export const enabledGaugeManager = (data: GaugeQueryParams) => checkGaugeValidity(data)
export const enabledGaugeDistributors = (data: GaugeQueryParams) => checkGaugeValidity(data)
export const enabledGaugeVersion = (data: GaugeQueryParams) => checkGaugeValidity(data)
export const enabledDepositRewardIsApproved = (data: DepositRewardApproveParams & GaugeQueryParams) =>
  checkGaugeValidity(data)
export const enabledEstimateGasDepositRewardApprove = (data: DepositRewardApproveParams & GaugeQueryParams) =>
  checkGaugeValidity(data)
export const enabledEstimateGasAddRewardToken = (data: AddRewardParams & GaugeQueryParams) =>
  checkGaugeValidity(data) && !!queryClient.getQueryData(keys.isDepositRewardAvailable(data))
export const enabledEstimateGasDepositReward = (data: DepositRewardParams & GaugeQueryParams) =>
  checkGaugeValidity(data) && !!queryClient.getQueryData(keys.depositRewardIsApproved(data))
