import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getLlamaMarket, updateUserEventsApi } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { invalidateUserMarketQueries } from '@/llamalend/queries/query.utils'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useMutation } from '@tanstack/react-query'
import type { BaseConfig } from '@ui/utils'
import { notify, useConnection } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { waitForApproval } from '@ui-kit/utils/time.utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { collateralValidationSuite } from '../queries/manage-loan.validation'

type AddCollateralMutation = { userCollateral: Decimal }

export type AddCollateralOptions = {
  marketId: string | null | undefined
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

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: AddCollateralMutation) => {
        assertValidity(collateralValidationSuite, { chainId, marketId, ...mutation })
        const market = getLlamaMarket(marketId!)
        await waitForApproval({
          isApproved: () => market.addCollateralIsApproved(mutation.userCollateral),
          onApprove: () => approve(market, mutation),
          message: t`Approved collateral addition`,
          config,
        })

        const hash = await addCollateral(market, mutation)
        await waitForTransactionReceipt(config, { hash })
        return hash
      },
      [chainId, config, marketId],
    ),
    onSuccess: async (txHash, mutation) => {
      logSuccess(mutationKey, txHash)
      notify(t`Collateral added successfully`, 'success')
      await invalidateUserMarketQueries({ marketId, userAddress })
      updateUserEventsApi(wallet!, network, getLlamaMarket(marketId!), txHash)
      onAdded?.(txHash, { ...mutation, txHash })
    },
  })

  return { mutateAsync, error, txHash: data, isPending, isSuccess, reset }
}
