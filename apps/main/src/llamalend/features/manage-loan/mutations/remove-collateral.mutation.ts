import { useCallback } from 'react'
import { Hex } from 'viem'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { type CollateralForm, collateralValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'

type RemoveCollateralMutation = { userCollateral: Decimal }

export type RemoveCollateralOptions = {
  marketId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onRemoved?: LlammaMutationOptions<RemoveCollateralMutation>['onSuccess']
}

export const useRemoveCollateralMutation = ({ network, marketId, onRemoved }: RemoveCollateralOptions) => {
  const { chainId } = network
  const { mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<RemoveCollateralMutation>({
    network,
    marketId,
    mutationKey: ['manage-loan', 'remove-collateral', { chainId, marketId }] as const,
    mutationFn: async ({ userCollateral }, { market }) => ({
      hash: (await market.removeCollateral(userCollateral)) as Hex,
    }),
    validationSuite: collateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Removing collateral... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (_result, mutation, { market }) =>
      t`Collateral removed successfully! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onRemoved,
  })

  const onSubmit = useCallback((form: CollateralForm) => mutateAsync(form as RemoveCollateralMutation), [mutateAsync])

  return { onSubmit, mutateAsync, error, txHash: data, isPending, isSuccess, reset }
}
