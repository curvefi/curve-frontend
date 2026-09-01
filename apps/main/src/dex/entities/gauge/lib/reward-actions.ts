import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { getGauge } from '@/dex/entities/gauge/lib/gauge-info'
import {
  gaugeAddRewardValidationSuite,
  gaugeDepositRewardValidationSuite,
} from '@/dex/entities/gauge/model/gauge-validation'
import {
  fetchDepositRewardIsApproved,
  invalidateDepositRewardAvailable,
  invalidateGaugeDistributors,
} from '@/dex/entities/gauge/model/gauge.query'
import type { AddRewardMutation, DepositRewardMutation } from '@/dex/entities/gauge/types'
import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import type { DepositRewardFormValues } from '@/dex/features/deposit-gauge-reward/types'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { t } from '@evm-ui/lib/i18n'
import { useTransactionMutation } from '@evm-ui/lib/model/mutation/useTransactionMutation'
import { type GaugeQuery, rootKeys } from '@evm-ui/lib/model/query'
import { waitForApproval } from '@evm-ui/utils'
import type { Hex } from '@primitives/address.utils'

type GaugeRewardMutationOptions = GaugeQuery & {
  onReset: () => void
}

export const useAddRewardToken = ({ chainId, poolId, onReset }: GaugeRewardMutationOptions) => {
  const { tokensMapper } = useTokensMapper(chainId)
  const { address: userAddress } = useConnection()
  const getRewardTokenSymbol = ({ rewardTokenId }: AddRewardMutation) =>
    rewardTokenId ? tokensMapper[rewardTokenId.toLowerCase()]?.symbol : ''

  const { mutate, error, isPending } = useTransactionMutation<AddRewardMutation>({
    mutationKey: [...rootKeys.gauge({ chainId, poolId }), 'addRewardToken'] as const,
    mutationFn: async ({ rewardTokenId, distributorId }) => ({
      hash: (await getGauge(poolId).addReward(rewardTokenId, distributorId)) as Hex,
    }),
    validationSuite: gaugeAddRewardValidationSuite,
    validationParams: { chainId, poolId },
    pendingMessage: mutation => t`Adding reward token ${getRewardTokenSymbol(mutation)}`,
    successMessage: mutation => t`Added reward token ${getRewardTokenSymbol(mutation)}`,
    onSuccess: () =>
      Promise.all([
        invalidateGaugeDistributors({ chainId, poolId, userAddress }),
        invalidateDepositRewardAvailable({ chainId, poolId }),
      ]),
    onReset,
  })

  const onSubmit = useCallback((form: AddRewardFormValues) => mutate(form as AddRewardMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}

export const useDepositReward = ({ chainId, poolId, onReset }: GaugeRewardMutationOptions) => {
  const { tokensMapper } = useTokensMapper(chainId)
  const config = useConfig()
  const getRewardTokenSymbol = ({ rewardTokenId }: DepositRewardMutation) =>
    rewardTokenId ? tokensMapper[rewardTokenId.toLowerCase()]?.symbol : ''

  const { mutate, error, isPending } = useTransactionMutation<DepositRewardMutation>({
    mutationKey: [...rootKeys.gauge({ chainId, poolId }), 'depositReward'] as const,
    mutationFn: async ({ amount, rewardTokenId, epoch, userBalance }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchDepositRewardIsApproved({ chainId, poolId, amount, rewardTokenId, userBalance }, { staleTime: 0 }),
        onApprove: async () => (await getGauge(poolId).depositRewardApprove(rewardTokenId, amount)) as Hex[],
        message: t`Approved deposit reward`,
        config,
      })
      return {
        hash: (await getGauge(poolId).depositReward(rewardTokenId, amount, epoch)) as Hex,
      }
    },
    validationSuite: gaugeDepositRewardValidationSuite,
    validationParams: { chainId, poolId },
    pendingMessage: mutation => t`Depositing reward token ${getRewardTokenSymbol(mutation)}`,
    successMessage: mutation => t`Deposited reward token ${getRewardTokenSymbol(mutation)}`,
    onSuccess: () => invalidateDepositRewardAvailable({ chainId, poolId }),
    onReset,
  })

  const onSubmit = useCallback((form: DepositRewardFormValues) => mutate(form as DepositRewardMutation), [mutate])

  return { onSubmit, mutate, error, isPending }
}
