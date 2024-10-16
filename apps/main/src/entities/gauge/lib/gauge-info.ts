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
import { gaugeStatus } from '@/entities/gauge/model'
import { createQueryHook, useCombinedQueries } from '@/shared/lib/queries'
import { GaugeParams } from '@/shared/model/root-keys'

export const useGauge = ({ chainId, poolId }: GaugeParams) => {
  return useCombinedQueries([
    gaugeStatus.getQueryOptions({ chainId, poolId }),
    models.getIsDepositRewardAvailableQueryOptions({ chainId, poolId }),
  ])
}

export const useGaugeVersion = createQueryHook(models.getGaugeVersionQueryOptions)
export const useIsDepositRewardAvailable = createQueryHook(models.getIsDepositRewardAvailableQueryOptions)
export const useGaugeManager = createQueryHook(models.getGaugeManagerQueryOptions)
export const useGaugeRewardsDistributors = createQueryHook(models.getGaugeDistributorsQueryOptions)
export const useGaugeDepositRewardIsApproved = createQueryHook(models.getDepositRewardIsApprovedQueryOptions)
export const useEstimateGasAddRewardToken = createQueryHook(models.getEstimateGasAddRewardTokenQueryOptions)
export const useEstimateGasDepositRewardApprove = createQueryHook(models.getEstimateGasDepositRewardApproveQueryOptions)
export const useEstimateGasDepositReward = createQueryHook(models.getEstimateGasDepositRewardQueryOptions)
