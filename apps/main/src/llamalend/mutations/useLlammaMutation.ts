import { useMutation } from '@tanstack/react-query'
import { useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { notify } from '@ui-kit/features/connect-wallet'
import { logSuccess, logMutation, logError } from '@ui-kit/lib'
import { getLlamaMarket } from '../llama.utils'
import type { LlamaMarketTemplate } from '../llamalend.types'

/**
 * Throws an error if the data contains an error string object.
 *
 * This function checks if the contract execution result contains an error object, which typically
 * indicates that the transaction failed even though the preceding operations succeeded
 * (a "failed successfully" scenario).
 *
 * @param data - The mutation result data to check for errors
 * @throws {Error} Throws an error if data contains an error string that is not a user rejection
 *
 * @remarks
 * - The error string content is not standardized and does not have a guaranteed form
 * - Making errors prettier is considered out of scope
 * - Successfully determining if an error was simply a user cancelling a transaction is out of scope
 * - User rejection errors (containing "User rejected the request") are ignored and do not throw
 */
function throwIfError(data: unknown) {
  // If the data contains an error object, it probably means the transaction failed even though nothing
  // before that was going wrong. In other words, 'failed successfully'.
  if (data != null && typeof data === 'object' && 'error' in data) {
    // Not fail proof, as the content of the error string is not standardized
    // and does not have a guaranteed form. Making errors prettier is out of scope and succesfully
    // determined if it was simple a user cancelling a transaction is out of scope as well.
    if (typeof data.error === 'string' && !data.error.includes('User rejected the request')) {
      throw new Error(data.error)
    }
  }
}

/** Context created in onMutate to all callbacks other than mutationFn that also validates */
type Context = {
  provider: NonNullable<ReturnType<typeof useWallet>['provider']>
  curve: NonNullable<ReturnType<typeof useConnection>['llamaApi']>
  market: LlamaMarketTemplate
  pendingNotification: ReturnType<typeof notify>
}

/**
 * Custom context specially for the mutation function.
 * Usually mutations don't have a context, but they do
 * when you use our specialized llamma mutation.
 */
type MutationFnContext = {
  market: LlamaMarketTemplate
}

type LlammaMutationOptions<TVariables, TData> = {
  /** The llamma market id */
  marketId: string | null | undefined
  mutationKey: readonly unknown[]
  /** Function that performs the mutation operation */
  mutationFn: (variables: TVariables, context: MutationFnContext) => Promise<TData>
  /** Message to display during pending state */
  pendingMessage: string | ((variables: TVariables, market: LlamaMarketTemplate) => string)
  /** Callback executed on successful mutation */
  onSuccess?: (data: TData, variables: TVariables, context: Context) => void
  /** Callback executed on mutation error */
  onError?: (error: Error, variables: TVariables, context: Context) => void
  /** Callback executed after mutation settles (success or error) */
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
    variables: TVariables,
    context: Context | undefined,
  ) => void
}

/**
 * Custom hook for handling llamma-related mutations with automatic wallet and API validation
 * Could argue for a refactor to validate with vest like we do for queries, but I'd rather keep
 * it simple for now. Maybe another time, for now we're just doing a quick llamma specialization
 * with simple throwing errors.
 */
export function useLlammaMutation<TVariables, TData>({
  marketId,
  mutationKey,
  mutationFn,
  pendingMessage,
  onSuccess,
  onError,
  onSettled,
}: LlammaMutationOptions<TVariables, TData>) {
  const { provider } = useWallet()
  const { llamaApi: curve } = useConnection()

  return useMutation({
    mutationKey,
    onMutate: (variables: TVariables) => {
      // Early validation - throwing here prevents mutationFn from running
      if (!provider) throw new Error('Missing provider')
      if (!curve) throw new Error('Missing lending api')
      if (!marketId) throw new Error('Missing llamma market id')

      const market = getLlamaMarket(marketId)

      logMutation(mutationKey, { variables })
      const pendingNotification = notify(
        typeof pendingMessage === 'function' ? pendingMessage(variables, market) : pendingMessage,
        'pending',
      )

      // Return context to make it available in all callbacks
      return { provider, curve, market, pendingNotification }
    },
    mutationFn: (variables: TVariables) => {
      const market = getLlamaMarket(marketId!)
      return mutationFn(variables, { market })
    },
    onSuccess: (data, variables, context) => {
      throwIfError(data)
      logSuccess(mutationKey, { data, variables, marketId: context.market.id })
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      logError(mutationKey, { error, variables, marketId: context?.market.id })
      onError?.(error, variables, context!)
    },
    onSettled: (data, error, variables, context) => {
      context?.pendingNotification?.dismiss()
      onSettled?.(data, error, variables, context!)
    },
  })
}
