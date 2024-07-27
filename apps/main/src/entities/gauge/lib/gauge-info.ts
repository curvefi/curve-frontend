/**
 * @file entities/gauge/lib.ts
 * @description This file contains custom hooks and utility functions for gauge-related operations in the Curve.fi DApp.
 * It's a crucial part of the 'gauge' entity in the FSD architecture.
 *
 * The hooks in this file provide an easy-to-use interface for components to interact with gauge data and operations.
 * They encapsulate the usage of React Query and the application's global state, offering a clean API
 *
 * These hooks abstract away the complexity of data fetching and state management,
 * allowing components to easily access and manipulate gauge-related data.
 */

import * as models from '@/entities/gauge/model'
import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'
import { useCombinedQueries } from '@/shared/lib/queries'
import { useQuery } from '@tanstack/react-query'

export const useGauge = ({ chainId, poolId }: GaugeQueryParams) => {
  return useCombinedQueries([
    models.getGaugeStatusQuery({ chainId, poolId }),
    models.getIsDepositRewardAvailableQuery({ chainId, poolId }),
  ])
}

export const useGaugeVersion = ({ chainId, poolId }: GaugeQueryParams) => {
  return useQuery(models.getGaugeVersionQuery({ chainId, poolId }))
}

export const useIsDepositRewardAvailable = ({ chainId, poolId }: GaugeQueryParams) => {
  return useQuery(models.getIsDepositRewardAvailableQuery({ chainId, poolId }))
}

export const useGaugeManager = ({ chainId, poolId }: GaugeQueryParams) => {
  return useQuery(models.getGaugeManagerQuery({ chainId, poolId }))
}

export const useGaugeRewardsDistributors = ({ chainId, poolId }: GaugeQueryParams) => {
  return useQuery(models.getGaugeDistributorsQuery({ chainId, poolId }))
}

export const useGaugeDepositRewardIsApproved = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
}: GaugeQueryParams & DepositRewardApproveParams) => {
  return useQuery(models.getDepositRewardIsApprovedQuery({ chainId, poolId, rewardTokenId, amount }))
}

export const useEstimateGasAddRewardToken = ({
  chainId,
  poolId,
  rewardTokenId,
  distributorId,
}: GaugeQueryParams & AddRewardParams) => {
  return useQuery(models.getEstimateGasAddRewardTokenQuery({ chainId, poolId, rewardTokenId, distributorId }))
}

export const useEstimateGasDepositRewardApprove = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
}: GaugeQueryParams & DepositRewardApproveParams) => {
  return useQuery(models.getEstimateGasDepositRewardApproveQuery({ chainId, poolId, rewardTokenId, amount }))
}

export const useEstimateGasDepositReward = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
  epoch,
}: GaugeQueryParams & DepositRewardParams) => {
  return useQuery(models.getEstimateGasDepositRewardQuery({ chainId, poolId, rewardTokenId, amount, epoch }))
}
