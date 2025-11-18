import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getLlamaMarket, updateUserEventsApi } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { invalidateUserMarketQueries } from '@/llamalend/queries/query.utils'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import type { BaseConfig } from '@ui/utils'
import { notify, useConnection } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { waitForApproval } from '@ui-kit/utils/time.utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { fetchAddCollateralIsApproved } from '../queries/add-collateral/add-collateral-approved.query'
import { collateralValidationSuite, type CollateralForm } from '../queries/manage-loan.validation'

type AddCollateralMutation = { userCollateral: Decimal }

export type AddCollateralOptions = {
  marketId: string | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onAdded?: (hash: Hex, mutation: AddCollateralMutation & { txHash: Hex }) => void
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

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useLlammaMutation<AddCollateralMutation, Hex>({
    marketId,
    mutationKey,
    mutationFn: async (mutation, { market }) => {
      assertValidity(collateralValidationSuite, { chainId, marketId, ...mutation })

      await waitForApproval({
        isApproved: () => fetchAddCollateralIsApproved({ chainId, marketId, userAddress, ...mutation }),
        onApprove: () => approve(market, mutation),
        message: t`Approved collateral addition`,
        config,
      })

      const hash = await addCollateral(market, mutation)
      await waitForTransactionReceipt(config, { hash })
      return hash
    },
    pendingMessage: t`Adding collateral`,
    onSuccess: async (txHash, mutation, { market }) => {
      logSuccess(mutationKey, txHash)
      notify(t`Collateral added successfully`, 'success')
      await invalidateUserMarketQueries({ marketId, userAddress })
      updateUserEventsApi(wallet!, network, market, txHash)
      onAdded?.(txHash, { ...mutation, txHash })
    },
    onError: (error) => notify(error.message, 'error'),
  })

  const onSubmit = useCallback((form: CollateralForm) => mutateAsync(form as AddCollateralMutation), [mutateAsync])

  return { onSubmit, mutateAsync, error, txHash: data, isPending, isSuccess, reset }
}
