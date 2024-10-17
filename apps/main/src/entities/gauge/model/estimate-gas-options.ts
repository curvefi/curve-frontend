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
import { gaugeKeys as keys } from '@/entities/gauge/model'
import type { AddRewardParams, DepositRewardApproveParams, DepositRewardParams } from '@/entities/gauge/types'
import { queryOptions } from '@tanstack/react-query'
import { GaugeParams } from '@/shared/model/query'

export const getEstimateGasDepositRewardApproveQueryOptions = (
  params: DepositRewardApproveParams & GaugeParams,
  condition: boolean = true
) =>
  queryOptions({
    queryKey: keys.estimateGasDepositRewardApprove(params),
    queryFn: api.queryEstimateGasDepositRewardApprove,
    refetchInterval: REFRESH_INTERVAL['1m'],
    enabled: conditions.enabledEstimateGasDepositRewardApprove(params) && condition,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  })

export const getEstimateGasAddRewardTokenQueryOptions = (
  params: AddRewardParams & GaugeParams,
  condition: boolean = true
) =>
  queryOptions({
    queryKey: keys.estimateGasAddRewardToken(params),
    queryFn: api.queryEstimateGasAddRewardToken,
    refetchInterval: REFRESH_INTERVAL['1m'],
    enabled: conditions.enabledEstimateGasAddRewardToken(params) && condition,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  })

export const getEstimateGasDepositRewardQueryOptions = (
  params: DepositRewardParams & GaugeParams,
  condition: boolean = true
) =>
  queryOptions({
    queryKey: keys.estimateGasDepositReward(params),
    queryFn: api.queryEstimateGasDepositReward,
    refetchInterval: REFRESH_INTERVAL['1m'],
    enabled: conditions.enabledEstimateGasDepositReward(params) && condition,
    refetchOnWindowFocus: 'always',
    refetchOnMount: 'always',
  })
