import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import {
  fetchDepositRewardIsApproved,
  getAddRewardTokenMutation,
  getDepositRewardApproveMutation,
  getDepositRewardMutation,
  invalidateDepositRewardAvailable,
  invalidateGaugeDistributors,
} from '@/dex/entities/gauge/model'
import {
  gaugeAddRewardValidationSuite,
  gaugeDepositRewardValidationSuite,
} from '@/dex/entities/gauge/model/gauge-validation'
import type { AddRewardMutation, DepositRewardMutation } from '@/dex/entities/gauge/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { t } from '@evm-ui/lib/i18n'
import { useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { GaugeParams } from '@evm-ui/lib/model/query'
import { waitForApproval } from '@evm-ui/utils'
import type { Hex } from '@primitives/address.utils'

export const useAddRewardToken = ({ chainId, poolId }: GaugeParams) => {
  const { tokensMapper } = useTokensMapper(chainId)
  const { address: userAddress } = useConnection()
  const addRewardTokenMutation = getAddRewardTokenMutation({ chainId, poolId })

  const { mutate, error, isPending } = useTransactionMutation<AddRewardMutation>({
    mutationKey: addRewardTokenMutation.mutationKey,
    mutationFn: async params => ({ hash: (await addRewardTokenMutation.mutationFn(params)) as Hex }),
    validationSuite: gaugeAddRewardValidationSuite,
    validationParams: { chainId, poolId },
    pendingMessage: ({ rewardTokenId }) =>
      t`Adding reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`,
    successMessage: ({ rewardTokenId }) =>
      t`Added reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`,
    onSuccess: () =>
      Promise.all([
        invalidateGaugeDistributors({ chainId, poolId, userAddress }),
        invalidateDepositRewardAvailable({ chainId, poolId }),
      ]),
    onReset: () => undefined, //todo: why empty, is this correct? If so, comment is needed
  })

  const onSubmit = useCallback((form: AddRewardMutation) => mutate(form), [mutate])

  return { onSubmit, mutate, error, isPending }
}

export const useDepositReward = ({ chainId, poolId }: GaugeParams) => {
  const { tokensMapper } = useTokensMapper(chainId)
  const config = useConfig()
  const depositRewardMutation = getDepositRewardMutation({ chainId, poolId })
  const depositRewardApproveMutation = getDepositRewardApproveMutation({ chainId, poolId })

  const { mutate, error, isPending } = useTransactionMutation<DepositRewardMutation>({
    mutationKey: depositRewardMutation.mutationKey,
    mutationFn: async params => {
      await waitForApproval({
        isApproved: async () => await fetchDepositRewardIsApproved({ chainId, poolId, ...params }, { staleTime: 0 }),
        onApprove: async () => (await depositRewardApproveMutation.mutationFn(params)) as Hex[],
        message: t`Approved deposit reward`,
        config,
      })
      return { hash: (await depositRewardMutation.mutationFn(params)) as Hex }
    },
    validationSuite: gaugeDepositRewardValidationSuite,
    validationParams: { chainId, poolId },
    pendingMessage: ({ rewardTokenId }) =>
      t`Depositing reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`,
    successMessage: ({ rewardTokenId }) =>
      t`Deposited reward token ${rewardTokenId ? tokensMapper[rewardTokenId]?.symbol : ''}`,
    onSuccess: () => invalidateDepositRewardAvailable({ chainId, poolId }),
    onReset: () => undefined, //todo: why empty, is this correct? If so, comment is needed
  })

  const onSubmit = useCallback((form: DepositRewardMutation) => mutate(form), [mutate])

  return { onSubmit, mutate, error, isPending }
}
