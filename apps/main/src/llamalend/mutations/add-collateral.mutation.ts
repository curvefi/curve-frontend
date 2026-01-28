import { useCallback } from 'react'
import { type Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { type CollateralForm, collateralValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { type Decimal, waitForApproval } from '@ui-kit/utils'

type AddCollateralMutation = { userCollateral: Decimal }

export type AddCollateralOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onAdded: LlammaMutationOptions<AddCollateralMutation>['onSuccess']
  onReset: () => void
  userAddress: Address | undefined
}

const approve = async (market: LlamaMarketTemplate, { userCollateral }: AddCollateralMutation) =>
  (await market.addCollateralApprove(userCollateral)) as Hex[]

const addCollateral = async (market: LlamaMarketTemplate, { userCollateral }: AddCollateralMutation) =>
  (await market.addCollateral(userCollateral)) as Hex

export const useAddCollateralMutation = ({
  network,
  network: { chainId },
  marketId,
  onAdded,
  onReset,
  userAddress,
}: AddCollateralOptions) => {
  const config = useConfig()

  const { mutate, error, data, isPending, isSuccess, reset } = useLlammaMutation<AddCollateralMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'add-collateral'] as const,
    mutationFn: async (mutation, { market }) => {
      await waitForApproval({
        isApproved: () =>
          fetchAddCollateralIsApproved({ chainId, marketId, userAddress, ...mutation }, { staleTime: 0 }),
        onApprove: () => approve(market, mutation),
        message: t`Approved collateral addition`,
        config,
      })
      return { hash: await addCollateral(market, mutation) }
    },
    validationSuite: collateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Adding collateral... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Collateral added successfully! ${formatTokenAmounts(market, mutation)}`,
    onSuccess: onAdded,
    onReset,
  })

  const onSubmit = useCallback((form: CollateralForm) => mutate(form as AddCollateralMutation), [mutate])

  return { onSubmit, error, data, isPending, isSuccess, reset }
}
