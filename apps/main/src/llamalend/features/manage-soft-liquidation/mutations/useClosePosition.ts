import type { Address } from 'viem'
import { useConfig } from 'wagmi'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { waitForTransactionReceipt } from '@wagmi/core'

type ClosePositionOptions = {
  market: LlamaMarketTemplate | undefined
}

/**
 * Hook for closing a market position by self liquidating the user's position
 * @param market - The llama market template to close the position for
 * @returns Mutation object for closing the position
 */
export function useClosePosition({ market }: ClosePositionOptions) {
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  const config = useConfig()

  return useLlammaMutation({
    mutationKey: ['close-position', { marketId: market?.id }] as const,
    market,
    mutationFn: async (_: void, { market }) => {
      const hash = (await market.selfLiquidate(+maxSlippage)) as Address
      await waitForTransactionReceipt(config, { hash })
      return { hash }
    },
    pendingMessage: 'Closing position',
    onSuccess: ({ hash }) => {
      notify('Position closed', 'success')
      // TODO: invalidate specific queries to update the values in close position tab
    },
    onError: (error: Error) => notify(error.message, 'error'),
  })
}
