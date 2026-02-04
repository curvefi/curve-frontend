import { useCallback } from 'react'
import type { Address, Hex } from 'viem'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  UnstakeForm,
  UnstakeMutation,
  unstakeValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { formatTokenAmounts } from '../llama.utils'

export type UnstakeOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onUnstaked: LlammaMutationOptions<UnstakeMutation>['onSuccess'] | undefined
  onReset: () => void
  userAddress: Address | undefined
}

export const useUnstakeMutation = ({
  network,
  network: { chainId },
  marketId,
  onUnstaked,
  onReset,
  userAddress,
}: UnstakeOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<UnstakeMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'unstake'] as const,
    mutationFn: async (mutation, { market }) => {
      const lendMarket = requireVault(market)
      return { hash: (await lendMarket.vault.unstake(mutation.unstakeAmount)) as Hex }
    },
    validationSuite: unstakeValidationSuite,
    pendingMessage: (mutation, { market }) =>
      t`Unstaking... ${formatTokenAmounts(market, { userBorrowed: mutation.unstakeAmount })}`,
    successMessage: (mutation, { market }) =>
      t`Unstake successful! ${formatTokenAmounts(market, { userBorrowed: mutation.unstakeAmount })}`,
    onSuccess: onUnstaked,
    onReset,
  })

  const onSubmit = useCallback(async (form: UnstakeForm) => mutate(form as UnstakeMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess, reset }
}
