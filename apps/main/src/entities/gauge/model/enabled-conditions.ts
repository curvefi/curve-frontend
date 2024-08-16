import { gaugeKeys as keys } from '@/entities/gauge/model'
import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'
import { queryClient } from '@/shared/api/query-client'
import { isNumber } from 'lodash'
import { isAddress, parseEther, zeroAddress } from 'viem'

export function enabledGaugeStatus({ chainId, poolId }: GaugeQueryParams) {
  return !!chainId && !!poolId
}

export const enabledIsDepositRewardAvailable = ({ chainId, poolId }: GaugeQueryParams) => {
  return !!chainId && !!poolId
}

export const enabledGaugeManager = ({ chainId, poolId }: GaugeQueryParams) => {
  return !!chainId && !!poolId
}

export const enabledGaugeDistributors = ({ chainId, poolId }: GaugeQueryParams) => {
  return !!chainId && !!poolId
}

export const enabledGaugeVersion = ({ chainId, poolId }: GaugeQueryParams) => {
  return !!chainId && !!poolId
}

export const enabledDepositRewardIsApproved = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveParams & GaugeQueryParams) => {
  return (
    !!chainId &&
    !!poolId &&
    !!rewardTokenId &&
    isAddress(rewardTokenId) &&
    rewardTokenId !== zeroAddress &&
    !!amount &&
    (typeof amount === 'string' ? parseEther(amount) > 0 : amount > 0)
  )
}

export const enabledEstimateGasDepositRewardApprove = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveParams & GaugeQueryParams) => {
  return (
    !!chainId &&
    !!poolId &&
    !!rewardTokenId &&
    isAddress(rewardTokenId) &&
    rewardTokenId !== zeroAddress &&
    !!amount &&
    (typeof amount === 'string' ? parseEther(amount) > 0 : amount > 0)
  )
}

export const enabledEstimateGasAddRewardToken = ({
  chainId,
  poolId,
  rewardTokenId,
  distributorId,
}: AddRewardParams & GaugeQueryParams) => {
  return (
    !!chainId &&
    !!poolId &&
    !!rewardTokenId &&
    isAddress(rewardTokenId) &&
    rewardTokenId !== zeroAddress &&
    !!distributorId &&
    isAddress(distributorId) &&
    distributorId !== zeroAddress &&
    !!queryClient.getQueryData(keys.isDepositRewardAvailable({ chainId, poolId }))
  )
}

export const enabledEstimateGasDepositReward = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
  epoch,
}: DepositRewardParams & GaugeQueryParams) => {
  return (
    !!chainId &&
    !!poolId &&
    !!rewardTokenId &&
    isAddress(rewardTokenId) &&
    rewardTokenId !== zeroAddress &&
    !!amount &&
    (typeof amount === 'string' ? parseEther(amount) > 0 : amount > 0) &&
    !!epoch &&
    isNumber(epoch) &&
    epoch > 0 &&
    !!queryClient.getQueryData(keys.depositRewardIsApproved({ chainId, poolId, rewardTokenId, amount }))
  )
}
