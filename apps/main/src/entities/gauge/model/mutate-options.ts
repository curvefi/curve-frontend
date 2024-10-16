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
import { gaugeKeys as keys } from '@/entities/gauge/model'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/entities/gauge/types'
import { GaugeParams } from '@/shared/model/root-keys'

export const getAddRewardTokenMutation = ({ chainId, poolId }: GaugeParams) => ({
  mutationFn: async ({ rewardTokenId, distributorId }: AddRewardParams) =>
    api.mutateAddRewardToken(keys.addRewardToken({ chainId, poolId, rewardTokenId, distributorId })),
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
  mutationFn: async ({ rewardTokenId, amount }: DepositRewardApproveParams) =>
    api.mutateDepositRewardApprove(keys.depositRewardApprove({ chainId, poolId, rewardTokenId, amount })),
  mutationKey: keys.depositRewardApprove({ chainId, poolId }),
  meta: {
    queryKeyFn: ({ rewardTokenId, amount }: DepositRewardApproveParams) =>
      keys.depositRewardApprove({ chainId, poolId, rewardTokenId, amount }),
  },
})

export const getDepositRewardMutation = ({ chainId, poolId }: GaugeParams) => ({
  mutationFn: async ({ rewardTokenId, amount, epoch }: DepositRewardParams) =>
    api.mutateDepositReward(keys.depositReward({ chainId, poolId, rewardTokenId, amount, epoch })),
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
