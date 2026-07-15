import { useConfig, useConnection } from 'wagmi'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import {
  type TransactionContext,
  useTransactionMutation,
  type TransactionMutationOptions,
} from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { getControllerAddress, getMarket, getTokens, updateUserEventsApi } from '../llama.utils'
import type { MarketTemplate } from '../llamalend.types'

/** Context created in onMutate, extends the base transaction context with llamma market and api */
type MarketContext = TransactionContext & {
  llamaApi: NonNullable<ReturnType<typeof useCurve>['llamaApi']>
  market: MarketTemplate
  userAddress: Address
}

// Default market's collateral and borrow token addresses to invalidate after mutations.
const getDefaultAddresses = (market: MarketTemplate) => {
  const { collateralToken, borrowToken } = getTokens(market)
  return [collateralToken.address, borrowToken.address]
}
/**
 * Custom hook for handling market-related mutations with automatic wallet and API validation.
 * Wraps `useTransactionMutation` and adds llamma market context, cache invalidation,
 * and user event tracking.
 */
export function useMarketMutation<TVariables extends object>({
  network: { chainId, id: networkId },
  marketId,
  onSuccess,
  mutationTokenAddresses,
  ...options
}: TransactionMutationOptions<TVariables, MarketContext> & {
  /** The llamma market id */
  marketId: string | null | undefined
  /** The current network config */
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  /** Token balances affected by the mutation that should be refetched after success. Defaults to market collateral + borrow tokens. */
  mutationTokenAddresses?: (variables: TVariables, context: MarketContext) => Address[] | undefined
}) {
  const { llamaApi } = useCurve()
  const { address: userAddress } = useConnection()
  const config = useConfig()

  return useTransactionMutation<TVariables, MarketContext>({
    ...options,
    validationParams: { chainId, marketId, userAddress },
    buildContext: (_variables, baseContext) => ({
      ...baseContext,
      llamaApi: assert(llamaApi, 'Missing llamalend api'),
      market: getMarket(assert(marketId, 'Missing llama market ID')),
      userAddress: assert(userAddress, 'Missing userAddress'),
    }),
    onSuccess: async (data, receipt, variables, context) => {
      const { market, wallet, userAddress } = context
      const tokenAddresses = mutationTokenAddresses?.(variables, context) ?? getDefaultAddresses(market)

      await Promise.allSettled([
        updateUserEventsApi(wallet, { id: networkId }, market, receipt.transactionHash),
        invalidateAllUserMarketDetails({
          chainId,
          marketId: market.id,
          userAddress,
          contractAddress: getControllerAddress(market),
          blockchainId: networkId,
        }),
        invalidateTokenBalances(config, {
          chainId,
          userAddress,
          tokenAddresses,
        }),
      ])

      await onSuccess?.(data, receipt, variables, context)
    },
  })
}
