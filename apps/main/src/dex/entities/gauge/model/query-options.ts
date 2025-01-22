/**
 * @description This file defines the data fetching and mutation logic for gauge-related operations in the Curve.fi DApp.
 * It's a core part of the 'gauge' entity in the FSD architecture.
 *
 * This module exports functions that create React Query options for various gauge operations
 *
 * These functions utilize the API methods from './api' and query keys from './query-keys',
 * providing a clean interface for components to interact with gauge data.
 * They encapsulate the data fetching logic, making it easier to manage and reuse across the application.
 */

import { poolValidationSuite } from '@ui-kit/lib/model/query/pool-validation'
import { GaugeParams, rootKeys } from '@ui-kit/lib/model/query'
import { queryFactory } from '@ui-kit/lib/model/query/factory'
import {
  queryGaugeStatus,
  queryGaugeVersion,
  queryDepositRewardIsApproved,
  queryGaugeManager,
  queryGaugeDistributors,
  queryIsDepositRewardAvailable,
} from '../api'
import type { DepositRewardApproveParams } from '../types'
import { gaugeDepositRewardApproveValidationSuite } from './gauge-validation'

export const gaugeStatus = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'gauge', 'status'] as const,
  queryFn: queryGaugeStatus,
  staleTime: '5m',
  validationSuite: poolValidationSuite,
})

export const depositRewardAvailable = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  queryFn: queryIsDepositRewardAvailable,
  staleTime: '5m',
  validationSuite: poolValidationSuite,
})

export const gaugeManager = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'manager'] as const,
  queryFn: queryGaugeManager,
  staleTime: 'Inf',
  validationSuite: poolValidationSuite,
})

export const gaugeDistributors = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'distributors'] as const,
  queryFn: queryGaugeDistributors,
  staleTime: '5m',
  validationSuite: poolValidationSuite,
})

export const gaugeVersion = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'version'] as const,
  queryFn: queryGaugeVersion,
  staleTime: 'Inf',
  validationSuite: poolValidationSuite,
})

export const depositRewardIsApproved = queryFactory({
  queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) =>
    [...rootKeys.gauge(gaugeParams), 'depositRewardIsApproved', { rewardTokenId }, { amount }] as const,
  queryFn: queryDepositRewardIsApproved,
  staleTime: '1h',
  validationSuite: gaugeDepositRewardApproveValidationSuite,
})
