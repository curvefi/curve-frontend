import { useConfig, useConnection } from 'wagmi'
import {
  fetchDepositRewardIsApproved,
  getAddRewardTokenMutation,
  getDepositRewardApproveMutation,
  getDepositRewardMutation,
  invalidateDepositRewardAvailable,
  invalidateGaugeDistributors,
} from '@/dex/entities/gauge/model'
import type { AddRewardMutation, DepositRewardMutation } from '@/dex/entities/gauge/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { notify } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { GaugeParams } from '@evm-ui/lib/model/query'
import { waitForApproval } from '@evm-ui/utils'
import type { Hex } from '@primitives/address.utils'
import { useMutation, UseMutationResult } from '@tanstack/react-query'

export const useAddRewardToken = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, AddRewardMutation> => {
  const { tokensMapper } = useTokensMapper(chainId)
  const { address: userAddress } = useConnection()

  return useMutation({
    ...getAddRewardTokenMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Added reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notify(txDescription, 'success')
      }

      return Promise.all([
        invalidateGaugeDistributors({ chainId, poolId, userAddress }),
        invalidateDepositRewardAvailable({ chainId, poolId }),
      ])
    },
    onError: error => {
      console.error('Error adding reward:', error)
      notify(t`Failed to add reward token`, 'error')
    },
  })
}

export const useDepositReward = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, DepositRewardMutation> => {
  const { tokensMapper } = useTokensMapper(chainId)
  const config = useConfig()
  const depositRewardMutation = getDepositRewardMutation({ chainId, poolId })
  const depositRewardApproveMutation = getDepositRewardApproveMutation({ chainId, poolId })

  return useMutation({
    ...depositRewardMutation,
    mutationFn: async params => {
      await waitForApproval({
        isApproved: async () => await fetchDepositRewardIsApproved({ chainId, poolId, ...params }, { staleTime: 0 }),
        onApprove: async () => (await depositRewardApproveMutation.mutationFn(params)) as Hex[],
        message: t`Approved deposit reward`,
        config,
      })
      return await depositRewardMutation.mutationFn(params)
    },
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Deposited reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notify(txDescription, 'success')
      }
      return invalidateDepositRewardAvailable({ chainId, poolId })
    },
    onError: error => {
      console.error('Error depositing reward:', error)
      notify(t`Failed to deposit reward`, 'error')
    },
  })
}
