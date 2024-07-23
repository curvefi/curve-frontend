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
import * as api from './api'
import { gaugeKeys as keys } from './query-keys'
import { REFRESH_INTERVAL } from '@/constants'
import { queryClient } from '@/shared/api/query-client'
import { zeroAddress } from 'viem'
import type { AddRewardTokenParams } from './types'

export const getGaugeStatusQuery = (chain: ChainId, poolId: string) =>
  queryOptions({
    queryKey: keys.status(chain, poolId),
    queryFn: api.fetchGaugeStatus,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: () => !!chain && !!poolId,
  })

export const getIsDepositRewardAvailableQuery = (chain: ChainId, poolId: string) =>
  queryOptions({
    queryKey: keys.isDepositRewardAvailable(chain, poolId),
    queryFn: api.fetchIsDepositRewardAvailable,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: () => !!chain && !!poolId,
  })

export const getGaugeManagerQuery = (chain: ChainId, poolId: string) =>
  queryOptions({
    queryKey: keys.manager(chain, poolId),
    queryFn: api.fetchGaugeManager,
    staleTime: REFRESH_INTERVAL.Inf,
    enabled: () => !!chain && !!poolId,
  })

export const getGaugeDistributorsQuery = (chain: ChainId, poolId: string) =>
  queryOptions({
    queryKey: keys.distributors(chain, poolId),
    queryFn: api.fetchGaugeDistributors,
    staleTime: REFRESH_INTERVAL['5m'],
    enabled: () => !!chain && !!poolId,
  })

export const getGaugeVersionQuery = (chain: ChainId, poolId: string) =>
  queryOptions({
    queryKey: keys.version(chain, poolId),
    queryFn: api.fetchGaugeVersion,
    staleTime: REFRESH_INTERVAL.Inf,
    enabled: () => !!chain && !!poolId,
  })

export const getDepositRewardIsApprovedQuery = (
  chain: ChainId,
  poolId: string,
  token: string,
  amount: number | string
) =>
  queryOptions({
    queryKey: keys.depositRewardIsApproved(chain, poolId, token, amount),
    queryFn: api.fetchDepositRewardIsApproved,
    staleTime: REFRESH_INTERVAL['1h'],
    enabled: () => !!chain && !!poolId,
  })

export const getEstimateGasDepositRewardApproveQuery = (
  chain: ChainId,
  poolId: string,
  token: string,
  amount: number | string
) =>
  queryOptions({
    queryKey: keys.estimateGasDepositRewardApprove(chain, poolId, token, amount),
    queryFn: api.fetchEstimateGasDepositRewardApprove,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: () => !!chain && !!poolId,
  })

export const getEstimateGasAddRewardTokenQuery = (
  chain: ChainId,
  poolId: string,
  token?: string,
  distributor?: string
) =>
  queryOptions({
    queryKey: keys.estimateGasAddRewardToken(chain, poolId, token, distributor),
    queryFn: api.fetchEstimateGasAddRewardToken,
    staleTime: REFRESH_INTERVAL['1m'],
    enabled: () =>
      !!chain &&
      !!poolId &&
      !!token &&
      token !== zeroAddress &&
      !!distributor &&
      distributor !== zeroAddress &&
      !!queryClient.getQueryData(keys.isDepositRewardAvailable(chain, poolId)),
  })

export const getAddRewardTokenMutation = (chainId: ChainId, poolId: string) => ({
  mutationFn: async ({ token, distributor }: AddRewardTokenParams) =>
    api.postAddRewardToken(keys.addRewardToken(chainId, poolId, token, distributor)),
  mutationKey: keys.addRewardToken(chainId, poolId, '', ''),
})
