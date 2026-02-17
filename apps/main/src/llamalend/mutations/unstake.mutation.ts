import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  UnstakeForm,
  UnstakeMutation,
  unstakeValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { formatTokenAmounts } from '../llama.utils'

export type UnstakeOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: OnTransactionSuccess<UnstakeMutation>
  onReset: () => void
  userAddress: Address | undefined
}

export const useUnstakeMutation = ({
  network,
  network: { chainId },
  marketId,
  onSuccess,
  onReset,
  userAddress,
}: UnstakeOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<UnstakeMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'unstake'] as const,
    mutationFn: async (variables, { market }) => {
      const lendMarket = requireVault(market)
      return { hash: (await lendMarket.vault.unstake(variables.unstakeAmount)) as Hex }
    },
    validationSuite: unstakeValidationSuite,
    pendingMessage: (mutation, { market }) =>
      t`Unstaking... ${formatTokenAmounts(market, { userBorrowed: mutation.unstakeAmount })}`,
    successMessage: (mutation, { market }) =>
      t`Unstake successful! ${formatTokenAmounts(market, { userBorrowed: mutation.unstakeAmount })}`,
    onSuccess,
    onReset,
  })

  const onSubmit = useCallback(async (form: UnstakeForm) => mutate(form as UnstakeMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
