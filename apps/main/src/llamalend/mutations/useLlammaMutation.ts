import { invalidateAllUserMarketDetails } from '@/llamalend/queries/validation/invalidation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useCurve } from '@ui-kit/features/connect-wallet'
import {
  type TransactionContext,
  useTransactionMutation,
  type TransactionMutationOptions,
} from '@ui-kit/lib/model/mutation/useTransactionMutation'
import { getLlamaMarket, updateUserEventsApi } from '../llama.utils'
import type { LlamaMarketTemplate } from '../llamalend.types'

/** Context created in onMutate, extends the base transaction context with llamma market and api */
type LlammaContext = TransactionContext & {
  llamaApi: NonNullable<ReturnType<typeof useCurve>['llamaApi']>
  market: LlamaMarketTemplate
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
  ...options
}: TransactionMutationOptions<TVariables, LlammaContext> & {
  /** The llamma market id */
  marketId: string | null | undefined
  /** The current network config */
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
}) {
  const { llamaApi, wallet } = useCurve()
  const userAddress = wallet?.address

  return useTransactionMutation<TVariables, LlammaContext>({
    ...options,
    validationParams: { chainId, marketId, userAddress },
    buildContext: (_variables, baseContext) => {
      if (!llamaApi) throw new Error('Missing llamalend api')
      if (!marketId) throw new Error('Missing llamma market id')

      const market = getLlamaMarket(marketId)
      return { ...baseContext, llamaApi, market }
    },
    onSuccess: async (data, receipt, variables, context) => {
      updateUserEventsApi(context.wallet, { id: networkId }, context.market, receipt.transactionHash)
      await invalidateAllUserMarketDetails({ chainId, marketId, userAddress })
      await onSuccess?.(data, receipt, variables, context)
    },
  })
}
