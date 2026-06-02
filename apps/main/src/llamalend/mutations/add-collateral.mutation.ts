import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { getLoanImplementation } from '@/llamalend/queries/market/market.query-helpers'
import { type CollateralForm, collateralValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { type Address, type Hex } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { waitForApproval } from '@ui-kit/utils'

type AddCollateralMutation = { userCollateral: Decimal }

type AddCollateralOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset: () => void
  userAddress: Address | undefined
}

const approve = async (market: LlamaMarketTemplate, { userCollateral }: AddCollateralMutation) =>
  (await getLoanImplementation(market).addCollateralApprove(userCollateral)) as Hex[]

const addCollateral = async (market: LlamaMarketTemplate, { userCollateral }: AddCollateralMutation) =>
  (await getLoanImplementation(market).addCollateral(userCollateral)) as Hex

export const useAddCollateralMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  ...props
}: AddCollateralOptions) => {
  const config = useConfig()

  const { mutate, error, isPending } = useLlammaMutation<AddCollateralMutation>({
    network,
    marketId,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'add-collateral'] as const,
    mutationFn: async (variables, { market }) => {
      await waitForApproval({
        isApproved: () =>
          fetchAddCollateralIsApproved({ chainId, marketId, userAddress, ...variables }, { staleTime: 0 }),
        onApprove: () => approve(market, variables),
        message: t`Approved collateral addition`,
        config,
      })
      return { hash: await addCollateral(market, variables) }
    },
    validationSuite: collateralValidationSuite,
    pendingMessage: (mutation, { market }) => t`Adding collateral... ${formatTokenAmounts(market, mutation)}`,
    successMessage: (mutation, { market }) => t`Collateral added successfully! ${formatTokenAmounts(market, mutation)}`,
    ...props,
  })

  const onSubmit = useCallback((form: CollateralForm) => mutate(form as AddCollateralMutation), [mutate])

  return { onSubmit, error, isPending }
}
