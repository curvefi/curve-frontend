import { useCallback } from 'react'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { type CollateralForm, collateralValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'

type RemoveCollateralMutation = { userCollateral: Decimal }

type RemoveCollateralOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}

export const useRemoveCollateralMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  ...props
}: RemoveCollateralOptions) => {
  const { mutate, error, isPending } = useLlammaMutation<RemoveCollateralMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'remove-collateral'] as const,
    mutationFn: async ({ userCollateral }, { market }) => ({
      hash: (await getLoanImplementation(market).removeCollateral(userCollateral)) as Hex,
    }),
    validationSuite: collateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Removing collateral... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) =>
      t`Collateral removed successfully! ${formatTokenAmounts(market, mutation)}`,
    ...props,
  })

  const onSubmit = useCallback((form: CollateralForm) => mutate(form as RemoveCollateralMutation), [mutate])

  return { onSubmit, error, isPending }
}
