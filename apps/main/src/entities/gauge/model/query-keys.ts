/**
 * @file entities/gauge/query-keys.ts
 * @description This file defines the query keys used for React Query operations related to gauges in the Curve.fi DApp.
 * It's an integral part of the 'gauge' entity in the FSD architecture.
 *
 * The `gaugeKeys` object contains functions that generate consistent and type-safe query keys
 * for various gauge-related operations.
 *
 * These query keys are used throughout the application to ensure consistent caching,
 * refetching, and invalidation of gauge-related data in React Query.
 * They play a crucial role in maintaining a predictable and efficient data fetching strategy.
 */

import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/entities/gauge/types'
import { GaugeParams, rootKeys } from '@/shared/model/query'

export const gaugeKeys = {
  estimateGas: () => ['estimateGas'] as const,
  distributors: (params: GaugeParams) => [...rootKeys.gauge(params), 'distributors'] as const,
  isDepositRewardAvailable: (params: GaugeParams) =>
    [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  depositRewardIsApproved: (params: DepositRewardApproveParams & GaugeParams) =>
    [...rootKeys.gauge(params), 'depositRewardIsApproved', params.rewardTokenId, params.amount] as const,
  addRewardToken: ({ chainId, poolId, rewardTokenId, distributorId }: AddRewardParams & GaugeParams) =>
    [...rootKeys.gauge({ chainId, poolId }), 'addRewardToken', rewardTokenId, distributorId] as const,
  depositRewardApprove: ({ chainId, poolId, rewardTokenId, amount }: DepositRewardApproveParams & GaugeParams) =>
    [...rootKeys.gauge({ chainId, poolId }), 'depositRewardApprove', rewardTokenId, amount] as const,
  depositReward: ({ chainId, poolId, rewardTokenId, amount, epoch }: DepositRewardParams & GaugeParams) =>
    [...rootKeys.gauge({ chainId, poolId }), 'depositReward', rewardTokenId, amount, epoch] as const,
} as const
