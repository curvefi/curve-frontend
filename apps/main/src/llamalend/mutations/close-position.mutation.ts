import type { Hex } from 'viem'
// We need to invalidate all user loan details for lend when repaying.
// Ideally in the future the user-loan-details query will be split up
// and the lend app uses those split up queries from llamalend app.
// eslint-disable-next-line import/no-restricted-paths
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import type { LlamaNetwork } from '@/llamalend/llamalend.types'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys, type UserMarketParams } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

/**
 * Hook for closing a market position by self liquidating the user's position
 * @param params - The user market params to close the position for
 * @returns Mutation object for closing the position
 */
export function useClosePositionMutation({
  network,
  chainId,
  marketId,
  userAddress,
  onReset,
}: UserMarketParams<IChainId> & { network: LlamaNetwork; onReset?: () => void }) {
  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  return useLlammaMutation<{}>({
    network,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'close-position'] as const,
    marketId,
    mutationFn: async (_: {}, { market }) => ({ hash: (await market.selfLiquidate(+maxSlippage)) as Hex }),
    pendingMessage: () => t`Closing position...`,
    successMessage: () => t`Position closed successfully!`,
    onSuccess: () => invalidateAllUserBorrowDetails({ chainId, marketId, userAddress }),
    onReset,
    validationSuite: userMarketValidationSuite,
  })
}
