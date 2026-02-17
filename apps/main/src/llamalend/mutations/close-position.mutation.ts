import type { Address, Hex } from 'viem'
import { useLlammaMutation } from '@/llamalend/mutations/useLlammaMutation'
import { invalidateBorrowPositionQueries } from '@/llamalend/queries/validation/invalidation'
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
    onSuccess: () => invalidateBorrowPositionQueries({ chainId, marketId, userAddress }),
    onReset,
    validationSuite: userMarketValidationSuite,
  })
