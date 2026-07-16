import { useCallback } from 'react'
import { useMarketMutation } from '@/llamalend/mutations/useMarketMutation'
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
import { formatNumber } from '@ui-kit/utils'

type UnstakeOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}

export const useUnstakeMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  ...props
}: UnstakeOptions) => {
  const { mutate, error, isPending } = useMarketMutation<UnstakeMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'unstake'] as const,
    mutationFn: async (variables, { market }) => {
      const lendMarket = requireVault(market)
      return { hash: (await lendMarket.vault.unstake(variables.unstakeShares)) as Hex }
    },
    validationSuite: unstakeValidationSuite,
    pendingMessage: ({ unstakeShares }) => t`Unstaking... ${formatNumber(unstakeShares, 'token.amount')} vault shares`,
    successMessage: ({ unstakeShares }) =>
      t`Unstake successful! ${formatNumber(unstakeShares, 'token.amount')} vault shares`,
    mutationTokenAddresses: (_variables, { market }) => [requireVault(market).addresses.vault] as Address[],
    ...props,
  })

  const onSubmit = useCallback(
    ({ isFull = false, unstakeShares = '0' }: UnstakeForm) => mutate({ isFull, unstakeShares }),
    [mutate],
  )

  return { onSubmit, mutate, error, isPending }
}
