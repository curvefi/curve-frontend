import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { formatTokenAmounts } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type LlammaMutationOptions, useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { fetchAddCollateralIsApproved } from '@/llamalend/queries/add-collateral/add-collateral-approved.query'
import { type CollateralForm, collateralValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { BaseConfig } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { type Decimal, waitForApproval } from '@ui-kit/utils'

type AddCollateralMutation = { userCollateral: Decimal }

export type AddCollateralOptions = {
  marketId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onAdded?: LlammaMutationOptions<AddCollateralMutation>['onSuccess']
}

const approve = async (market: LlamaMarketTemplate, { userCollateral }: AddCollateralMutation) =>
  (await market.addCollateralApprove(userCollateral)) as Hex[]

const addCollateral = async (market: LlamaMarketTemplate, { userCollateral }: AddCollateralMutation) =>
  (await market.addCollateral(userCollateral)) as Hex

export const useAddCollateralMutation = ({ network, marketId, onAdded }: AddCollateralOptions) => {
  const config = useConfig()
  const { wallet } = useConnection()
  const { chainId } = network
  const userAddress = wallet?.account.address
  const mutationKey = ['manage-loan', 'add-collateral', { chainId, marketId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<AddCollateralMutation>({
    network,
    marketId,
    mutationKey,
    mutationFn: async (mutation, { market }) => {
      await waitForApproval({
        isApproved: () => fetchAddCollateralIsApproved({ chainId, marketId, userAddress, ...mutation }),
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
  })

  const onSubmit = useCallback((form: CollateralForm) => mutateAsync(form as AddCollateralMutation), [mutateAsync])

  return { onSubmit, mutateAsync, error, txHash: data, isPending, isSuccess, reset }
}
