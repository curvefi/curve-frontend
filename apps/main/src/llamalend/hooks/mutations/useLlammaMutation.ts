import { useMutation } from '@tanstack/react-query'
import { useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { notify } from '@ui-kit/features/connect-wallet'
import type { Market } from '../../llamalend.types'

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

/**
 * Custom context specially for the mutation function.
 * Usually mutations don't have a context, but they do
 * when you use our specialized llamma mutation.
 */
type MutationFnContext<TMarket extends Market> = {
  provider: NonNullable<ReturnType<typeof useWallet>['provider']>
  curve: NonNullable<ReturnType<typeof useConnection>['llamaApi']>
  llamma: TMarket
}

/** Normal mutation context outside of the special context for mutation functions (MutationFnContext) */
type Context = {
  pendingNotification: ReturnType<typeof notify>
}

type LlammaMutationOptions<TMarket extends Market, TVariables, TData, TContext extends Context> = {
  /** The llamma market instance */
  llamma: TMarket | null
  /** Function that performs the mutation operation */
  mutationFn: (variables: TVariables, context: MutationFnContext<TMarket>) => Promise<TData>
  /** Message to display during pending state */
  pendingMessage: string | ((variables: TVariables) => string)
  /** Callback executed on successful mutation */
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => void
  /** Callback executed on mutation error */
  onError?: (error: Error, variables: TVariables, context: TContext) => void
  /** Callback executed before mutation starts */
  onMutate?: (variables: TVariables) => TContext
  /** Callback executed after mutation settles (success or error) */
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: TContext) => void
}

/**
 * Custom hook for handling llamma-related mutations with automatic wallet and API validation
 * Could argue for a refactor to validate with vest like we do for queries, but I'd rather keep
 * it simple for now. Maybe another time, for now we're just doing a quick llamma specialization
 * with simple throwing errors.
 */
export function useLlammaMutation<TMarket extends Market, TVariables, TData, TContext extends Context>({
  llamma,
  mutationFn,
  pendingMessage,
  onSuccess,
  onError,
  onMutate,
  onSettled,
}: LlammaMutationOptions<TMarket, TVariables, TData, TContext>) {
  const { provider } = useWallet()
  const { llamaApi: curve } = useConnection()

  return useMutation({
    mutationFn: (variables: TVariables) => {
      if (!provider) throw new Error('Missing provider')
      if (!curve) throw new Error('Missing lending api')
      if (!llamma) throw new Error('Missing llamma market')

      return mutationFn(variables, { provider, curve, llamma })
    },
    onMutate: (variables) => {
      const pendingNotification = notify(
        typeof pendingMessage === 'function' ? pendingMessage(variables) : pendingMessage,
        'pending',
      )

      const userContext = onMutate?.(variables)
      return { pendingNotification, ...userContext } as TContext
    },
    onSuccess: (data, variables, context) => {
      throwIfError(data)
      onSuccess?.(data, variables, context!)
    },
    onError: (error, variables, context) => {
      // Log the full error, otherwise we lose the original stack trace
      console.error('Llamma mutation error:', error)
      onError?.(error, variables, context!)
    },
    onSettled: (data, error, variables, context) => {
      context?.pendingNotification?.dismiss()
      onSettled?.(data, error, variables, context!)
    },
  })
}
