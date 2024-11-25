/**
 * @description This file contains custom hooks and utility functions for gauge-related mutations in the Curve.fi DApp.
 * It's a crucial part of the 'gauge' entity in the FSD architecture.
 *
 * The hooks in this file provide an easy-to-use interface for components to interact with gauge data and operations.
 * They encapsulate the usage of React Query and the application's global state, offering a clean API
 *
 * These hooks abstract away the complexity of data mutation and state management,
 * allowing components to easily access and manipulate gauge-related data.
 */

import { t } from '@lingui/macro'
import { useIsMutating, useMutation, UseMutationResult } from '@tanstack/react-query'
import * as models from '@/entities/gauge/model'
import { gaugeKeys as keys } from '@/entities/gauge/model'
import type {
  AddRewardMutation,
  AddRewardParams,
  DepositRewardApproveMutation,
  DepositRewardApproveParams,
  DepositRewardMutation,
  DepositRewardParams
} from '@/entities/gauge/types'
import { queryClient } from '@/shared/api/query-client'
import { GaugeParams } from '@/shared/model/query'
import useTokensMapper from '@/hooks/useTokensMapper'
import useStore from '@/store/useStore'

export const useAddRewardToken = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, AddRewardMutation> => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const { tokensMapper } = useTokensMapper(chainId)

  return useMutation({
    ...models.getAddRewardTokenMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Added reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notifyNotification(txDescription, 'success')
      }

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.distributors({ chainId, poolId }) }),
        queryClient.invalidateQueries({ queryKey: keys.isDepositRewardAvailable({ chainId, poolId }) }),
      ])
    },
    onError: (error) => {
      console.error('Error adding reward:', error)
      notifyNotification(t`Failed to add reward token`, 'error')
    },
  })
}

export const useAddRewardTokenIsMutating = ({
  chainId,
  poolId,
  rewardTokenId,
  distributorId,
}: AddRewardParams): boolean =>
  Boolean(
    useIsMutating({
      mutationKey: keys.addRewardToken({ chainId, poolId }),
      predicate: ({ state }) =>
        state.variables?.rewardTokenId === rewardTokenId && state.variables?.distributorId === distributorId
    })
  )

export const useDepositRewardApprove = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<
  string[],
  Error,
  DepositRewardApproveMutation
> => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const { tokensMapper } = useTokensMapper(chainId)

  return useMutation({
    ...models.getDepositRewardApproveMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId, amount }) => {
      if (resp) {
        const notifyMessage = t`Approve spending ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notifyNotification(notifyMessage, 'success', 15000)
      }
      return queryClient.invalidateQueries({
        queryKey: keys.depositRewardIsApproved({ chainId, poolId, rewardTokenId, amount }),
      })
    },
    onError: (error) => {
      console.error('Error approving deposit reward:', error)
      notifyNotification(t`Failed to approve deposit reward`, 'error', 15000)
    },
  })
}

export const useDepositRewardApproveIsMutating = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
}: DepositRewardApproveParams): boolean =>
  Boolean(
    useIsMutating({
      mutationKey: keys.depositRewardIsApproved({ chainId, poolId }),
      predicate: ({ state }) => state.variables?.rewardTokenId === rewardTokenId && state.variables?.amount === amount
    })
  )

export const useDepositReward = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, DepositRewardMutation> => {
  const notifyNotification = useStore((state) => state.wallet.notifyNotification)
  const { tokensMapper } = useTokensMapper(chainId)

  return useMutation({
    ...models.getDepositRewardMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Deposited reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notifyNotification(txDescription, 'success', 15000)
      }
      return queryClient.invalidateQueries({ queryKey: keys.isDepositRewardAvailable({ chainId, poolId }) })
    },
    onError: (error) => {
      console.error('Error depositing reward:', error)
      notifyNotification(t`Failed to deposit reward`, 'error', 15000)
    },
  })
}

export const useDepositRewardIsMutating = ({
  chainId,
  poolId,
  rewardTokenId,
  amount,
  epoch,
}: DepositRewardParams): boolean =>
  Boolean(
    useIsMutating({
      mutationKey: keys.depositReward({ chainId, poolId }),
      predicate: ({ state }) =>
        state.variables?.rewardTokenId === rewardTokenId &&
        state.variables?.amount === amount &&
        state.variables?.epoch === epoch
    })
  )
