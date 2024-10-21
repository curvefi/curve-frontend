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
import { gaugeDepositRewardValidationGroup } from '@/entities/gauge/model'
import type { DepositRewardApproveParams, DepositRewardApproveQuery } from '@/entities/gauge/types'
import { poolValidationGroup } from '@/entities/pool'
import { createValidationSuite } from '@/shared/lib/validation'
import { GaugeParams, rootKeys } from '@/shared/model/query'
import { queryFactory } from '@/shared/model/query/factory'

export const gaugeStatus = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'gauge', 'status'] as const,
  queryFn: api.queryGaugeStatus,
  staleTime: '5m',
  validationSuite: createValidationSuite(poolValidationGroup)
})

export const depositRewardAvailable = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'isDepositRewardAvailable'] as const,
  queryFn: api.queryIsDepositRewardAvailable,
  staleTime: '5m',
  validationSuite: createValidationSuite(poolValidationGroup)
})

export const gaugeManager = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'manager'] as const,
  queryFn: api.queryGaugeManager,
  staleTime: 'Inf',
  validationSuite: createValidationSuite(poolValidationGroup)
})

export const gaugeDistributors = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'distributors'] as const,
  queryFn: api.queryGaugeDistributors,
  staleTime: '5m',
  validationSuite: createValidationSuite(poolValidationGroup)
})

export const gaugeVersion = queryFactory({
  queryKey: (params: GaugeParams) => [...rootKeys.gauge(params), 'version'] as const,
  queryFn: api.queryGaugeVersion,
  staleTime: 'Inf',
  validationSuite: createValidationSuite(poolValidationGroup)
})

export const depositRewardIsApproved = queryFactory({
  queryKey: ({ rewardTokenId, amount, ...gaugeParams }: DepositRewardApproveParams) => [...rootKeys.gauge(gaugeParams), 'depositRewardIsApproved', { rewardTokenId }, { amount }] as const,
  queryFn: api.queryDepositRewardIsApproved,
  staleTime: '1h',
  validationSuite: createValidationSuite((data: DepositRewardApproveParams) => {
    poolValidationGroup(data)
    gaugeDepositRewardValidationGroup(data)
  })
})
