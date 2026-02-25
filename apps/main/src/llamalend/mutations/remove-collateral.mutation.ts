import { useCallback } from 'react'
import { type Address, Hex } from 'viem'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { type CollateralForm, collateralValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import type { OnTransactionSuccess } from '@ui-kit/lib/model/mutation/useTransactionMutation'

type RemoveCollateralMutation = { userCollateral: Decimal }

export type RemoveCollateralOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onSuccess?: OnTransactionSuccess<RemoveCollateralMutation>
  onReset: () => void
  userAddress: Address | undefined
}

export const useRemoveCollateralMutation = ({
  network,
  network: { chainId },
  marketId,
  onSuccess,
  onReset,
  userAddress,
}: RemoveCollateralOptions) => {
  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<RemoveCollateralMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'remove-collateral'] as const,
    mutationFn: async ({ userCollateral }, { market }) => ({
      hash: (await market.removeCollateral(userCollateral)) as Hex,
    }),
    validationSuite: collateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Removing collateral... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) =>
      t`Collateral removed successfully! ${formatTokenAmounts(market, mutation)}`,
    onSuccess,
    onReset,
  })

  const onSubmit = useCallback((form: CollateralForm) => mutate(form as RemoveCollateralMutation), [mutate])

  return { onSubmit, error, data, isPending, isSuccess, reset }
}
