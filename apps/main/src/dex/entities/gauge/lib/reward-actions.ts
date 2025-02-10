import { t } from '@lingui/macro'
import { DefaultError, Mutation, useIsMutating, useMutation, UseMutationResult } from '@tanstack/react-query'
import * as models from '@/dex/entities/gauge/model'
import { gaugeKeys as keys } from '@/dex/entities/gauge/model'
import type {
  AddRewardMutation,
  AddRewardParams,
  DepositRewardApproveMutation,
  DepositRewardApproveParams,
  DepositRewardMutation,
  DepositRewardParams,
} from '@/dex/entities/gauge/types'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { GaugeParams } from '@ui-kit/lib/model/query'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import { notify } from '@ui-kit/features/connect-wallet'

type QueryMutation = Mutation<unknown, DefaultError, any> // todo: type got converted from any to unknown in v5.60

export const useAddRewardToken = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, AddRewardMutation> => {
  const { tokensMapper } = useTokensMapper(chainId)

  return useMutation({
    ...models.getAddRewardTokenMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Added reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notify(txDescription, 'success')
      }

      return Promise.all([
        queryClient.invalidateQueries({ queryKey: keys.distributors({ chainId, poolId }) }),
        queryClient.invalidateQueries({ queryKey: keys.isDepositRewardAvailable({ chainId, poolId }) }),
      ])
    },
    onError: (error) => {
      console.error('Error adding reward:', error)
      notify(t`Failed to add reward token`, 'error')
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
      predicate: ({ state }: QueryMutation) =>
        state.variables?.rewardTokenId === rewardTokenId && state.variables?.distributorId === distributorId,
    }),
  )

export const useDepositRewardApprove = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string[], Error, DepositRewardApproveMutation> => {
  const { tokensMapper } = useTokensMapper(chainId)

  return useMutation({
    ...models.getDepositRewardApproveMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId, amount }) => {
      if (resp) {
        const notifyMessage = t`Approve spending ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notify(notifyMessage, 'success', 15000)
      }
      return queryClient.invalidateQueries({
        queryKey: keys.depositRewardIsApproved({ chainId, poolId, rewardTokenId, amount }),
      })
    },
    onError: (error) => {
      console.error('Error approving deposit reward:', error)
      notify(t`Failed to approve deposit reward`, 'error', 15000)
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
      predicate: ({ state }: QueryMutation) =>
        state.variables?.rewardTokenId === rewardTokenId && state.variables?.amount === amount,
    }),
  )

export const useDepositReward = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, DepositRewardMutation> => {
  const { tokensMapper } = useTokensMapper(chainId)

  return useMutation({
    ...models.getDepositRewardMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Deposited reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notify(txDescription, 'success', 15000)
      }
      return queryClient.invalidateQueries({ queryKey: keys.isDepositRewardAvailable({ chainId, poolId }) })
    },
    onError: (error) => {
      console.error('Error depositing reward:', error)
      notify(t`Failed to deposit reward`, 'error', 15000)
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
      predicate: ({ state }: QueryMutation) =>
        state.variables?.rewardTokenId === rewardTokenId &&
        state.variables?.amount === amount &&
        state.variables?.epoch === epoch,
    }),
  )
