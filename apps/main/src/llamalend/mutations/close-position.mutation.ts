import type { Address, Hex } from 'viem'
// We need to invalidate all user loan details for lend when repaying.
// Ideally in the future the user-loan-details query will be split up
// and the lend app uses those split up queries from llamalend app.
// eslint-disable-next-line import/no-restricted-paths
import { invalidateAllUserBorrowDetails } from '@/lend/entities/user-loan-details'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { rootKeys } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

type ClosePositionOptions = {
  marketId: string | undefined
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  onReset?: () => void
  userAddress: Address | undefined
}

/**
 * Hook for closing a market position by self liquidating the user's position
 * @param params - The user market params to close the position for
 * @returns Mutation object for closing the position
 */
export const useClosePositionMutation = ({
  network,
  network: { chainId },
  marketId,
  userAddress,
  onReset,
}: ClosePositionOptions) =>
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  useLlammaMutation<{}>({
    network,
    mutationKey: [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'close-position'] as const,
    marketId,
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    mutationFn: async (_: {}, { market }) => ({
      hash: (await market.selfLiquidate(+useUserProfileStore.getState().maxSlippage.crypto)) as Hex,
    }),
    pendingMessage: () => t`Closing position...`,
    successMessage: () => t`Position closed successfully!`,
    onSuccess: () => invalidateAllUserBorrowDetails({ chainId, marketId, userAddress }),
    onReset,
    validationSuite: userMarketValidationSuite,
  })
