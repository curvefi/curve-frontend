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

import { REFRESH_INTERVAL } from '@/constants'
import * as api from '@/entities/gauge/api'
import * as conditions from '@/entities/gauge/model/enabled-conditions'
import { gaugeKeys as keys } from '@/entities/gauge/query-keys'
import { queryOptions } from '@tanstack/react-query'
import type {
  AddRewardParams,
  DepositRewardApproveParams,
  DepositRewardParams,
  GaugeQueryParams,
} from '@/entities/gauge/types'

export const getGaugeStatusQuery = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.status(params),
    queryFn: api.queryGaugeStatus,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enabledGaugeStatus(params),
  })

export const getIsDepositRewardAvailableQuery = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.isDepositRewardAvailable(params),
    queryFn: api.queryIsDepositRewardAvailable,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enabledIsDepositRewardAvailable(params),
  })

export const getGaugeManagerQuery = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.manager(params),
    queryFn: api.queryGaugeManager,
    staleTime: REFRESH_INTERVAL.Inf,
    enabled: conditions.enabledGaugeManager(params),
  })

export const getGaugeDistributorsQuery = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.distributors(params),
    queryFn: api.queryGaugeDistributors,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: conditions.enabledGaugeDistributors(params),
  })

export const getGaugeVersionQuery = (params: GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.version(params),
    queryFn: api.queryGaugeVersion,
    staleTime: REFRESH_INTERVAL.Inf,
    enabled: conditions.enabledGaugeVersion(params),
  })

export const getDepositRewardIsApprovedQuery = (params: DepositRewardApproveParams & GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.depositRewardIsApproved(params),
    queryFn: api.queryDepositRewardIsApproved,
    staleTime: REFRESH_INTERVAL['1h'],
    enabled: conditions.enabledDepositRewardIsApproved(params),
  })

export const getEstimateGasDepositRewardApproveQuery = (params: DepositRewardApproveParams & GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.estimateGasDepositRewardApprove(params),
    queryFn: api.queryEstimateGasDepositRewardApprove,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.enabledEstimateGasDepositRewardApprove(params),
  })

export const getEstimateGasAddRewardTokenQuery = (params: AddRewardParams & GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.estimateGasAddRewardToken(params),
    queryFn: api.queryEstimateGasAddRewardToken,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.enabledEstimateGasAddRewardToken(params),
  })

export const getEstimateGasDepositRewardQuery = (params: DepositRewardParams & GaugeQueryParams) =>
  queryOptions({
    queryKey: keys.estimateGasDepositReward(params),
    queryFn: api.queryEstimateGasDepositReward,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: conditions.enabledEstimateGasDepositReward(params),
  })
