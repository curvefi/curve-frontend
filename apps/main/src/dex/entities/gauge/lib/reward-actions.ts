import { useConnection } from 'wagmi'
import * as models from '@/dex/entities/gauge/model'
import type { AddRewardMutation, DepositRewardApproveMutation, DepositRewardMutation } from '@/dex/entities/gauge/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { notify } from '@evm-ui/features/connect-wallet'
import { t } from '@evm-ui/lib/i18n'
import { GaugeParams } from '@evm-ui/lib/model/query'
import { useMutation, UseMutationResult } from '@tanstack/react-query'

export const useAddRewardToken = ({
  chainId,
  poolId,
}: GaugeParams): UseMutationResult<string, Error, AddRewardMutation> => {
  const { tokensMapper } = useTokensMapper(chainId)
  const { address: userAddress } = useConnection()

  return useMutation({
    ...models.getAddRewardTokenMutation({ chainId, poolId }),
    onSuccess: (resp, { rewardTokenId }) => {
      if (resp) {
        const txDescription = t`Added reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`
        notify(txDescription, 'success')
      }

      return Promise.all([
        models.gaugeDistributors.invalidate({ chainId, poolId, userAddress }),
        models.depositRewardAvailable.invalidate({ chainId, poolId }),
      ])
    },
    onError: error => {
      console.error('Error adding reward:', error)
      notify(t`Failed to add reward token`, 'error')
    },
  })
}

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
      return models.depositRewardIsApproved.invalidate({ chainId, poolId, rewardTokenId, amount })
    },
    onError: error => {
      console.error('Error approving deposit reward:', error)
      notify(t`Failed to approve deposit reward`, 'error')
    },
  })
}

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
      return models.depositRewardAvailable.invalidate({ chainId, poolId })
    },
    onError: error => {
      console.error('Error depositing reward:', error)
      notify(t`Failed to deposit reward`, 'error')
    },
  })
}
