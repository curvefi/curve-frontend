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
import {
    depositRewardAvailable,
    depositRewardIsApproved,
    gaugeAddRewardTokenValidationGroup,
    gaugeDepositRewardValidationGroup,
    gaugeKeys
} from '@/entities/gauge/model'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/entities/gauge/types'
import { poolValidationGroup } from '@/entities/pool'
import { createValidationSuite } from '@/shared/lib/validation'
import { queryFactory, rootKeys } from '@/shared/model/query'

export const estimateGasDepositRewardApprove = queryFactory({
    queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) => [
        ...rootKeys.gauge({ ...gaugeParams }),
        ...gaugeKeys.estimateGas(),
        'depositRewardApprove',
        { rewardTokenId },
        { amount }
    ] as const,
    queryFn: api.queryEstimateGasDepositRewardApprove,
    refetchInterval: '1m',
    validationSuite: createValidationSuite((data: DepositRewardApproveParams) => {
        poolValidationGroup(data)
        gaugeDepositRewardValidationGroup(data)
    }),
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  })

export const estimateGasAddRewardToken = queryFactory({
    queryKey: ({ rewardTokenId, distributorId, ...gaugeParams }: AddRewardParams) => [
        ...rootKeys.gauge({ ...gaugeParams }),
        ...gaugeKeys.estimateGas(),
        'addRewardToken',
        { rewardTokenId },
        { distributorId }
    ] as const,
    queryFn: api.queryEstimateGasAddRewardToken,
    refetchInterval: '1m',
    validationSuite: createValidationSuite((data: AddRewardParams) => {
        poolValidationGroup(data)
        gaugeAddRewardTokenValidationGroup(data)
    }),
    dependencies: (params: AddRewardParams) => [depositRewardAvailable.queryKey(params)],
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  })

export const estimateGasDepositReward = queryFactory({
    queryKey: ({ rewardTokenId, amount, epoch, ...gaugeParams }: DepositRewardParams) => [
        ...rootKeys.gauge({ ...gaugeParams }),
        ...gaugeKeys.estimateGas(),
        'depositReward',
        { rewardTokenId },
        { amount },
        { epoch }
    ] as const,
    queryFn: api.queryEstimateGasDepositReward,
    refetchInterval: '1m',
    validationSuite: createValidationSuite((data: DepositRewardParams) => {
        poolValidationGroup(data)
        gaugeDepositRewardValidationGroup(data)
    }),
    dependencies: (params: DepositRewardParams) => [depositRewardIsApproved.queryKey(params)],
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  })
