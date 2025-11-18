import type { Hex } from 'viem'
import { useConfig } from 'wagmi'
// We need to invalidate all user loan details for lend when repaying.
// Ideally in the future the user-loan-details query will be split up
// and the lend app uses those split up queries from llamalend app.
// eslint-disable-next-line import/no-restricted-paths
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/invalidation'
import { notify } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys, type UserMarketParams } from '@ui-kit/lib/model'
import { waitForTransactionReceipt } from '@wagmi/core'

/**
 * Hook for closing a market position by self liquidating the user's position
 * @param market - The llama market template to close the position for
 * @returns Mutation object for closing the position
 */
export function useClosePosition(params: UserMarketParams) {
  const { marketId } = params
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  const config = useConfig()

  return useLlammaMutation({
    mutationKey: [...rootKeys.userMarket(params), 'close-position'] as const,
    marketId,
    mutationFn: async (_: void, { market }) => {
      const hash = (await market.selfLiquidate(+maxSlippage)) as Hex
      await waitForTransactionReceipt(config, { hash })

      return { hash }
    },
    pendingMessage: t`Closing position`,
    onSuccess: () => {
      notify(t`Position closed`, 'success')
      invalidateAllUserMarketDetails(params) //TODO: There's no nice and easy way to reset mint market user state yet
      invalidateAllUserBorrowDetails(params)
    },
    onError: (error: Error) => notify(error.message, 'error'),
  })
}
