/**
 * @file entities/gauge/lib.ts
 * @description This file contains custom hooks and utility functions for gauge-related operations in the Curve.fi DApp.
 * It's a crucial part of the 'gauge' entity in the FSD architecture.
 *
 * The hooks in this file provide an easy-to-use interface for components to interact with gauge data and operations.
 * They encapsulate the usage of React Query and the application's global state, offering a clean API
 *
 * These hooks abstract away the complexity of data fetching and state management,
 * allowing components to easily access and manipulate gauge-related data.
 */

import { queryClient } from '@/shared/api/query-client'
import { useCombinedQueries } from '@/shared/lib/queries'
import useStore from '@/store/useStore'
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query'
import * as models from './model'
import { gaugeKeys as keys } from './query-keys'
import type { AddRewardTokenParams } from './types'
import { useChainId } from '../chain'

export const useGauge = (poolId: string) => {
  const chainId = useChainId()
  return useCombinedQueries([
    models.getGaugeStatusQuery(chainId, poolId),
    models.getIsDepositRewardAvailableQuery(chainId, poolId),
  ])
}

export const useIsDepositRewardAvailable = (poolId: string) => {
  const chainId = useChainId()
  return useQuery(models.getIsDepositRewardAvailableQuery(chainId, poolId))
}

export const useGaugeManager = (poolId: string) => {
  const chainId = useChainId()
  return useQuery(models.getGaugeManagerQuery(chainId, poolId))
}

export const useGaugeRewardsDistributors = (poolId: string) => {
  const chainId = useChainId()
  return useQuery(models.getGaugeDistributorsQuery(chainId, poolId))
}

export const useGaugeDepositRewardIsApproved = (poolId: string, token: string, amount: number | string) => {
  const chainId = useChainId()
  return useQuery(models.getDepositRewardIsApprovedQuery(chainId, poolId, token, amount))
}

export const useEstimateGasDepositRewardApprove = (poolId: string, token: string, amount: number | string) => {
  const chainId = useChainId()
  return useQuery(models.getEstimateGasDepositRewardApproveQuery(chainId, poolId, token, amount))
}

export const useEstimateGasAddRewardToken = (poolId: string, token?: string, distributor?: string) => {
  const chainId = useChainId()
  return useQuery(models.getEstimateGasAddRewardTokenQuery(chainId, poolId, token, distributor))
}

export const useAddRewardToken = (
  poolId: string,
  onSuccess: (resp: string, variables: AddRewardTokenParams) => void = () => {},
  onError: (error: Error) => void = () => {}
): UseMutationResult<string, Error, AddRewardTokenParams> => {
  const chainId = useChainId()
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)

  return useMutation({
    ...models.getAddRewardTokenMutation(chainId, poolId),
    onSuccess: (resp, variables) => {
      if (resp) {
        const txDescription = `Added reward token ${variables.token}.`
        notifyNotification(txDescription, 'success')
        onSuccess(resp, variables)
      }

      queryClient.invalidateQueries({ queryKey: keys.distributors(chainId, poolId) })
      queryClient.invalidateQueries({ queryKey: keys.isDepositRewardAvailable(chainId, poolId) })
    },
    onError: (error) => {
      console.error('Error adding reward:', error)
      notifyNotification('Failed to add reward token', 'error')
      onError(error)
    },
  })
}
