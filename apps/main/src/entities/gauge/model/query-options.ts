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

import { queryOptions } from '@tanstack/react-query'
import { CB } from 'vest-utils'
import * as api from '@/entities/gauge/api'
import { gaugeKeys, gaugeKeys as keys } from '@/entities/gauge/model'
import * as conditions from '@/entities/gauge/model/enabled-conditions'
import { DepositRewardApproveParams, GaugeQueryKeyType, GaugeQueryParams } from '@/entities/gauge/types'
import { poolValidationGroup } from '@/entities/pool'
import { createValidationSuite, FieldName } from '@/shared/lib/validation'
import { queryFactory } from '@/shared/model/factory'
import { REFRESH_INTERVAL } from '@/constants'

type TField = FieldName<GaugeQueryParams>
type TCB = CB<GaugeQueryParams, TField[]>

export const gaugeStatus = queryFactory<GaugeQueryParams, GaugeQueryKeyType<'status'>, ReturnType<typeof api.queryGaugeStatus>, TField, string, TCB>({
  queryKey: gaugeKeys.status,
  queryParams: ([, chainId, , poolId, ,]) => ({ chainId, poolId }),
  query: api.queryGaugeStatus,
  staleTime: '5m',
  validationSuite: createValidationSuite(poolValidationGroup),
})

export const getIsDepositRewardAvailableQueryOptions = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.isDepositRewardAvailable(params),
    queryFn: api.queryIsDepositRewardAvailable,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enabledIsDepositRewardAvailable(params),
  })

export const getGaugeManagerQueryOptions = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.manager(params),
    queryFn: api.queryGaugeManager,
    staleTime: REFRESH_INTERVAL.Inf,
    enabled: conditions.enabledGaugeManager(params),
  })

export const getGaugeDistributorsQueryOptions = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.distributors(params),
    queryFn: api.queryGaugeDistributors,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enabledGaugeDistributors(params),
  })

export const getGaugeVersionQueryOptions = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.version(params),
    queryFn: api.queryGaugeVersion,
    staleTime: REFRESH_INTERVAL.Inf,
    enabled: conditions.enabledGaugeVersion(params),
  })

export const getDepositRewardIsApprovedQueryOptions = (params: DepositRewardApproveParams & GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.depositRewardIsApproved(params),
    queryFn: api.queryDepositRewardIsApproved,
    staleTime: REFRESH_INTERVAL['1h'],
    enabled: conditions.enabledDepositRewardIsApproved(params),
  })
