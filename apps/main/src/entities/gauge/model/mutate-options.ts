/**
 * @file entities/gauge/model.ts
 * @description This file defines the data fetching and mutation logic for gauge-related operations in the Curve.fi DApp.
 * It's a core part of the 'gauge' entity in the FSD architecture.
 *
 * This module exports functions that create React Query options for various gauge operations
 *
 * These functions utilize the API methods from './api' and query keys from './query-keys',
 * providing a clean interface for components to interact with gauge data.
 * They encapsulate the data fetching logic, making it easier to manage and reuse across the application.
 */

import * as api from '@/entities/gauge/api'
import { gaugeKeys as keys, gaugeValidationSuite } from '@/entities/gauge/model'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/entities/gauge/types'
import { assertValidity } from '@/shared/lib/validation'
import { GaugeParams } from '@/shared/model/query'

export const getAddRewardTokenMutation = ({ chainId, poolId }: GaugeParams) => ({
  mutationFn: async (params: AddRewardParams) => api.mutateAddRewardToken(assertValidity(gaugeValidationSuite, params)),
  mutationKey: keys.addRewardToken({ chainId, poolId }),
  meta: {
    queryKeyFn: ({ rewardTokenId, distributorId }: AddRewardParams) =>
      keys.addRewardToken({
        chainId,
        poolId,
        rewardTokenId,
        distributorId,
      }),
  },
})

export const getDepositRewardApproveMutation = ({ chainId, poolId }: GaugeParams) => ({
  mutationFn: async (params: DepositRewardApproveParams) =>
    api.mutateDepositRewardApprove(assertValidity(gaugeValidationSuite, params)),
  mutationKey: keys.depositRewardApprove({ chainId, poolId }),
  meta: {
    queryKeyFn: ({ rewardTokenId, amount }: DepositRewardApproveParams) =>
      keys.depositRewardApprove({ chainId, poolId, rewardTokenId, amount }),
  },
})

export const getDepositRewardMutation = ({ chainId, poolId }: GaugeParams) => ({
  mutationFn: async (params: DepositRewardParams) =>
    api.mutateDepositReward(assertValidity(gaugeValidationSuite, params)),
  mutationKey: keys.depositReward({ chainId, poolId }),
  meta: {
    queryKeyFn: ({ rewardTokenId, amount, epoch }: DepositRewardParams) =>
      keys.depositReward({
        chainId,
        poolId,
        rewardTokenId,
        amount,
        epoch,
      }),
  },
})
