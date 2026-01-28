import * as models from '@/dex/entities/gauge/model'
import { gaugeKeys as keys } from '@/dex/entities/gauge/model'
import type {
  AddReward,
  AddRewardMutation,
  AddRewardParams,
  DepositReward,
  DepositRewardApprove,
  DepositRewardApproveMutation,
  DepositRewardApproveParams,
  DepositRewardMutation,
  DepositRewardParams,
} from '@/dex/entities/gauge/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { DefaultError, Mutation, useIsMutating, useMutation, UseMutationResult } from '@tanstack/react-query'
import { notify } from '@ui-kit/features/connect-wallet'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { t } from '@ui-kit/lib/i18n'
import { GaugeParams } from '@ui-kit/lib/model/query'

// we cannot use a proper T here because `useIsMutating` expects `unknown` for some reason
type QueryMutation = Mutation<unknown, DefaultError, unknown>

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
      predicate: ({ state }: QueryMutation) => {
        const vars = state.variables as AddReward | undefined
        return vars?.rewardTokenId === rewardTokenId && vars?.distributorId === distributorId
      },
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
        notify(notifyMessage, 'success')
      }
      return queryClient.invalidateQueries({
        queryKey: keys.depositRewardIsApproved({ chainId, poolId, rewardTokenId, amount }),
      })
    },
    onError: (error) => {
      console.error('Error approving deposit reward:', error)
      notify(t`Failed to approve deposit reward`, 'error')
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
      predicate: ({ state }: QueryMutation) => {
        const vars = state.variables as DepositRewardApprove | undefined
        return vars?.rewardTokenId === rewardTokenId && vars?.amount === amount
      },
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
        notify(txDescription, 'success')
      }
      return queryClient.invalidateQueries({ queryKey: keys.isDepositRewardAvailable({ chainId, poolId }) })
    },
    onError: (error) => {
      console.error('Error depositing reward:', error)
      notify(t`Failed to deposit reward`, 'error')
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
      predicate: ({ state }: QueryMutation) => {
        const vars = state.variables as DepositReward | undefined
        return vars?.rewardTokenId === rewardTokenId && vars?.amount === amount && vars?.epoch === epoch
      },
    }),
  )
