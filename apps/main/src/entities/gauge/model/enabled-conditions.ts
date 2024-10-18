import { checkGaugeValidity } from '@/entities/gauge/lib'
import { gaugeKeys as keys } from '@/entities/gauge/model'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/entities/gauge/types'
import { queryClient } from '@/shared/api/query-client'
import { GaugeParams } from '@/shared/model/query'

export const enabledIsDepositRewardAvailable = (data: GaugeParams) => checkGaugeValidity(data)
export const enabledGaugeManager = (data: GaugeParams) => checkGaugeValidity(data)
export const enabledGaugeDistributors = (data: GaugeParams) => checkGaugeValidity(data)
export const enabledGaugeVersion = (data: GaugeParams) => checkGaugeValidity(data)
export const enabledDepositRewardIsApproved = (data: DepositRewardApproveParams & GaugeParams) =>
  checkGaugeValidity(data)
export const enabledEstimateGasDepositRewardApprove = (data: DepositRewardApproveParams & GaugeParams) =>
  checkGaugeValidity(data)
export const enabledEstimateGasAddRewardToken = (data: AddRewardParams & GaugeParams) =>
  checkGaugeValidity(data) && !!queryClient.getQueryData(keys.isDepositRewardAvailable(data))
export const enabledEstimateGasDepositReward = (data: DepositRewardParams & GaugeParams) =>
  checkGaugeValidity(data) && !!queryClient.getQueryData(keys.depositRewardIsApproved(data))
