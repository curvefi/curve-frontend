import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/dex/entities/gauge/types'
import { GaugeParams, rootKeys } from '@ui-kit/lib/model/query'

export const gaugeKeys = {
  estimateGas: () => ['estimateGas'] as const,
  distributors: (params: GaugeParams) => [...rootKeys.gauge(params), 'distributors'] as const,
  isDepositRewardAvailable: (params: GaugeParams) => [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  depositRewardIsApproved: (params: DepositRewardApproveParams & GaugeParams) =>
    [...rootKeys.gauge(params), 'depositRewardIsApproved', params.rewardTokenId, params.amount] as const,
  addRewardToken: ({ rewardTokenId, distributorId, ...gaugeParams }: AddRewardParams & GaugeParams) =>
    [...rootKeys.gauge(gaugeParams), 'addRewardToken', rewardTokenId, distributorId] as const,
  depositRewardApprove: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams & GaugeParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositRewardApprove', rewardTokenId, amount] as const,
  depositReward: ({ rewardTokenId, amount, epoch, ...gaugeParams }: DepositRewardParams & GaugeParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositReward', rewardTokenId, amount, epoch] as const,
} as const
