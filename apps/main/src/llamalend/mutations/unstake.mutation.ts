import { useCallback } from 'react'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import {
  UnstakeForm,
  UnstakeMutation,
  unstakeValidationSuite,
  requireVault,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { formatTokenAmounts } from '../llama.utils'

export type UnstakeOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  isDirty: boolean
  userAddress: Address | undefined
}

export const useUnstakeMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  ...props
}: UnstakeOptions) => {
  const { mutate, error, data, isPending, isSuccess } = useLlammaMutation<UnstakeMutation>({
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
    mutationTokenAddresses: (_variables, { market }) => [requireVault(market).addresses.vault] as Address[],
    ...props,
  })

  const onSubmit = useCallback(async (form: UnstakeForm) => mutate(form as UnstakeMutation), [mutate])

  return { onSubmit, mutate, error, data, isPending, isSuccess }
}
