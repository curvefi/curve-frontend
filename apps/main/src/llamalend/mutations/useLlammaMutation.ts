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
import { getLlamaMarket, getTokens, updateUserEventsApi } from '../llama.utils'
import type { LlamaMarketTemplate } from '../llamalend.types'

/** Context created in onMutate, extends the base transaction context with llamma market and api */
type LlammaContext = TransactionContext & {
  llamaApi: NonNullable<ReturnType<typeof useCurve>['llamaApi']>
  market: LlamaMarketTemplate
  userAddress: Address
}

// Default market's collateral and borrow token addresses to invalidate after mutations.
const getDefaultAddresses = (market: LlamaMarketTemplate) => {
  const { collateralToken, borrowToken } = getTokens(market)
  return [collateralToken.address, borrowToken.address]
}
/**
 * Custom hook for handling llamma-related mutations with automatic wallet and API validation.
 * Wraps `useTransactionMutation` and adds llamma market context, cache invalidation,
 * and user event tracking.
 */
export function useLlammaMutation<TVariables extends object>({
  network: { chainId, id: networkId },
  marketId,
  onSuccess,
  mutationTokenAddresses,
  ...options
}: TransactionMutationOptions<TVariables, LlammaContext> & {
  /** The llamma market id */
  marketId: string | null | undefined
  /** The current network config */
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  /** Token balances affected by the mutation that should be refetched after success. Defaults to market collateral + borrow tokens. */
  mutationTokenAddresses?: (variables: TVariables, context: LlammaContext) => Address[] | undefined
}) {
  const { llamaApi } = useCurve()
  const { address: userAddress } = useConnection()
  const config = useConfig()

  return useTransactionMutation<TVariables, LlammaContext>({
    ...options,
    validationParams: { chainId, marketId, userAddress },
    buildContext: (_variables, baseContext) => ({
      ...baseContext,
      llamaApi: assert(llamaApi, 'Missing llamalend api'),
      market: getLlamaMarket(assert(marketId, 'Missing llama market ID')),
      userAddress: assert(userAddress, 'Missing userAddress'),
    }),
    onSuccess: async (data, receipt, variables, context) => {
      const { market, wallet, userAddress } = context
      const tokenAddresses = mutationTokenAddresses?.(variables, context) ?? getDefaultAddresses(market)
      updateUserEventsApi(wallet, { id: networkId }, market, receipt.transactionHash)

      await Promise.all([
        invalidateAllUserMarketDetails({ chainId, marketId: market.id, userAddress }),
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
