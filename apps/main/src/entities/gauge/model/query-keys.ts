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

import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'
import { poolKeys } from '@/entities/pool'

export const gaugeKeys = {
  root: (params: GaugeQueryParams) => [...poolKeys.pool(params), 'gauge'] as const,
  estimateGas: () => ['estimateGas'] as const,
  gauge: (params: GaugeQueryParams) => [...gaugeKeys.root(params)] as const,
  version: (params: GaugeQueryParams) => [...gaugeKeys.root(params), 'version'] as const,
  status: (params: GaugeQueryParams) => [...gaugeKeys.root(params), 'status'] as const,
  manager: (params: GaugeQueryParams) => [...gaugeKeys.root(params), 'manager'] as const,
  distributors: (params: GaugeQueryParams) => [...gaugeKeys.root(params), 'distributors'] as const,
  isDepositRewardAvailable: (params: GaugeQueryParams) =>
    [...gaugeKeys.root(params), 'isDepositRewardAvailable'] as const,
  depositRewardIsApproved: (params: DepositRewardApproveParams & GaugeQueryParams) =>
    [...gaugeKeys.root(params), 'depositRewardIsApproved', params.rewardTokenId, params.amount] as const,
  addRewardToken: ({ chainId, poolId, rewardTokenId, distributorId }: AddRewardParams & GaugeQueryParams) =>
    [...gaugeKeys.root({ chainId, poolId }), 'addRewardToken', rewardTokenId, distributorId] as const,
  depositRewardApprove: ({ chainId, poolId, rewardTokenId, amount }: DepositRewardApproveParams & GaugeQueryParams) =>
    [...gaugeKeys.root({ chainId, poolId }), 'depositRewardApprove', rewardTokenId, amount] as const,
  depositReward: ({ chainId, poolId, rewardTokenId, amount, epoch }: DepositRewardParams & GaugeQueryParams) =>
    [...gaugeKeys.root({ chainId, poolId }), 'depositReward', rewardTokenId, amount, epoch] as const,
  estimateGasDepositRewardApprove: ({
    chainId,
    poolId,
    rewardTokenId,
    amount,
  }: DepositRewardApproveParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.root({ chainId, poolId }),
      ...gaugeKeys.estimateGas(),
      'depositRewardApprove',
      rewardTokenId,
      amount,
    ] as const,
  estimateGasAddRewardToken: ({ chainId, poolId, rewardTokenId, distributorId }: AddRewardParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.root({ chainId, poolId }),
      ...gaugeKeys.estimateGas(),
      'addRewardToken',
      rewardTokenId,
      distributorId,
    ] as const,
  estimateGasDepositReward: ({
    chainId,
    poolId,
    rewardTokenId,
    amount,
    epoch,
  }: DepositRewardParams & GaugeQueryParams) =>
    [
      ...gaugeKeys.root({ chainId, poolId }),
      ...gaugeKeys.estimateGas(),
      'depositReward',
      rewardTokenId,
      amount,
      epoch,
    ] as const,
} as const
