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

import * as models from '@/dex/entities/gauge/model'

export const { useQuery: useIsDepositRewardAvailable } = models.depositRewardAvailable
export const { useQuery: useGaugeManager } = models.gaugeManager
export const { useQuery: useGaugeRewardsDistributors } = models.gaugeDistributors
export const { useQuery: useGaugeDepositRewardIsApproved } = models.depositRewardIsApproved
export const { useQuery: useEstimateGasAddRewardToken } = models.estimateGasAddRewardToken
export const { useQuery: useEstimateGasDepositRewardApprove } = models.estimateGasDepositRewardApprove
export const { useQuery: useEstimateGasDepositReward } = models.estimateGasDepositReward
