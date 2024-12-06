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
import type {
  AddRewardMutation,
  AddRewardParams,
  DepositRewardApproveMutation,
  DepositRewardApproveParams,
  DepositRewardMutation,
  DepositRewardParams,
} from '@/entities/gauge/types'
import { assertValidity } from '@/shared/lib/validation'
import { GaugeParams } from '@/shared/model/query'
import {
  gaugeAddRewardValidationSuite,
  gaugeDepositRewardApproveValidationSuite,
  gaugeDepositRewardValidationSuite,
} from './gauge-validation'
import { gaugeKeys as keys } from './query-keys'

export const getAddRewardTokenMutation = (gauge: GaugeParams) => ({
  mutationFn: async (params: AddRewardMutation) =>
    api.mutateAddRewardToken(assertValidity(gaugeAddRewardValidationSuite, { ...gauge, ...params })),
  mutationKey: keys.addRewardToken(gauge),
  meta: {
    queryKeyFn: ({ rewardTokenId, distributorId }: AddRewardParams) =>
      keys.addRewardToken({ rewardTokenId, distributorId, ...gauge }),
  },
})

export const getDepositRewardApproveMutation = (gauge: GaugeParams) => ({
  mutationFn: async (params: DepositRewardApproveMutation) =>
    api.mutateDepositRewardApprove(assertValidity(gaugeDepositRewardApproveValidationSuite, { ...gauge, ...params })),
  mutationKey: keys.depositRewardApprove(gauge),
  meta: {
    queryKeyFn: (params: DepositRewardApproveParams) => keys.depositRewardApprove({ ...gauge, ...params }),
  },
})

export const getDepositRewardMutation = (gauge: GaugeParams) => ({
  mutationFn: async (params: DepositRewardMutation) =>
    api.mutateDepositReward(assertValidity(gaugeDepositRewardValidationSuite, { ...gauge, ...params })),
  mutationKey: keys.depositReward(gauge),
  meta: {
    queryKeyFn: ({ rewardTokenId, amount, epoch }: DepositRewardParams) =>
      keys.depositReward({ rewardTokenId, amount, epoch, ...gauge }),
  },
})
