import { useCallback } from 'react'
import { Hex } from 'viem'
import { useConfig } from 'wagmi'
import { getLlamaMarket, updateUserEventsApi } from '@/llamalend/llama.utils'
import { invalidateUserMarketQueries } from '@/llamalend/queries/query.utils'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useMutation } from '@tanstack/react-query'
import type { BaseConfig } from '@ui/utils'
import { notify, useConnection } from '@ui-kit/features/connect-wallet'
import { assertValidity, logSuccess } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import type { Decimal } from '@ui-kit/utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import { collateralValidationSuite } from '../queries/manage-loan.validation'

type RemoveCollateralMutation = { userCollateral: Decimal }

export type RemoveCollateralOptions = {
  marketId: string | null | undefined
  network: BaseConfig<LlamaNetworkId, LlamaChainId>
  onRemoved?: (hash: Hex, mutation: RemoveCollateralMutation & { txHash: Hex }) => void
}

const removeCollateral = async (marketId: string, { userCollateral }: RemoveCollateralMutation) => {
  const market = getLlamaMarket(marketId)
  return (await market.removeCollateral(userCollateral)) as Hex
}

export const useRemoveCollateralMutation = ({ network, marketId, onRemoved }: RemoveCollateralOptions) => {
  const config = useConfig()
  const { wallet } = useConnection()
  const { chainId } = network
  const userAddress = wallet?.account.address
  const mutationKey = ['manage-loan', 'remove-collateral', { chainId, marketId }] as const

  const { mutateAsync, error, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    mutationFn: useCallback(
      async (mutation: RemoveCollateralMutation) => {
        if (!marketId) throw new Error('Missing marketId')
        const { userCollateral } = mutation
        assertValidity(collateralValidationSuite, { chainId, marketId, userAddress, userCollateral })
        const hash = await removeCollateral(marketId, mutation)
        await waitForTransactionReceipt(config, { hash })
        return hash
      },
      [chainId, config, marketId, userAddress],
    ),
    onSuccess: async (txHash, mutation) => {
      logSuccess(mutationKey, txHash)
      notify(t`Collateral removed successfully`, 'success')
      await invalidateUserMarketQueries({ marketId, userAddress })
      updateUserEventsApi(wallet!, network, getLlamaMarket(marketId!), txHash)
      onRemoved?.(txHash, { ...mutation, txHash })
    },
  })

  return { mutateAsync, error, txHash: data, isPending, isSuccess, reset }
}
