import { useConnection } from 'wagmi'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/user/invalidation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import { assert, notFalsy } from '@primitives/objects.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { invalidateTokenBalances } from '@ui-kit/hooks/useTokenBalance'
import {
  type TransactionContext,
  useTransactionMutation,
  type TransactionMutationOptions,
} from '@ui-kit/lib/model/mutation/useTransactionMutation'
import type { Config } from '@wagmi/core'
import { getLlamaMarket, updateUserEventsApi } from '../llama.utils'
import type { LlamaMarketTemplate } from '../llamalend.types'

/** Context created in onMutate, extends the base transaction context with llamma market and api */
type LlammaContext = TransactionContext & {
  llamaApi: NonNullable<ReturnType<typeof useCurve>['llamaApi']>
  market: LlamaMarketTemplate
  userAddress: Address
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
  tokenBalancesToInvalidate,
  ...options
}: TransactionMutationOptions<TVariables, LlammaContext> & {
  /** The llamma market id */
  marketId: string | null | undefined
  /** The current network config */
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  /** Token balances affected by the mutation that should be refetched after success */
  tokenBalancesToInvalidate?: (
    variables: TVariables,
    context: LlammaContext,
  ) => { tokenAddresses: Address[] | undefined; config: Config }
}) {
  const { llamaApi } = useCurve()
  const { address: userAddress } = useConnection()

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
      const { config, tokenAddresses } = tokenBalancesToInvalidate?.(variables, context) ?? {}
      updateUserEventsApi(wallet, { id: networkId }, market, receipt.transactionHash)

      await Promise.all(
        notFalsy(
          invalidateAllUserMarketDetails({ chainId, marketId: market.id, userAddress }),
          config &&
            tokenAddresses &&
            invalidateTokenBalances(config, {
              chainId,
              userAddress,
              tokenAddresses,
            }),
        ),
      )

      await onSuccess?.(data, receipt, variables, context)
    },
  })
}
