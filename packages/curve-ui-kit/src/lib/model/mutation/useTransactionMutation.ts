import { useState } from 'react'
import type { FormattedTransactionReceipt, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { useMutation } from '@tanstack/react-query'
import { notify, useCurve } from '@ui-kit/features/connect-wallet'
import { withPendingToast } from '@ui-kit/features/connect-wallet/lib/notify'
import { addBreadcrumb, captureError } from '@ui-kit/features/sentry'
import { assertValidity, logError, logMutation, logSuccess, type ValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { waitForTransactionReceipt } from '@wagmi/core'

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

/** Base context provided to all transaction mutations */
export type TransactionContext = {
  wallet: NonNullable<ReturnType<typeof useCurve>['wallet']>
}

export type TransactionResult = { hash: Hex }

type TransactionMutationOptionsBase<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
> = {
  /** Unique key for the mutation */
  mutationKey: readonly unknown[]
  /**
   * Called during onMutate to build any additional context beyond the base wallet context.
   * Throw here to prevent the mutation from running.
   *
   * @remarks Because `mutationFn` does not get the context, it has to rebuild the context.
   * Therefore, avoid side-effects when calling this function.
   */
  buildContext?: (variables: TVariables, baseContext: TransactionContext) => TContext
  /**
   * Function that performs the mutation operation.
   * Receives the variables and the full context (including any custom context from buildContext).
   * Usually, mutations functions don't have a context, but we inject it in our custom hook.
   */
  mutationFn: (variables: TVariables, context: TContext) => Promise<TData>
  /** Validation suite to validate variables before mutationFn is called. */
  validationSuite: ValidationSuite
  /** Additional fields to pass to the validation suite beyond the variables. */
  validationParams?: Record<string, unknown>
  /** Message to display while waiting for transaction submission */
  pendingMessage: (variables: TVariables, context: TContext) => string
  /** Message to display while waiting for transaction confirmation */
  confirmingMessage?: (variables: TVariables, context: TContext) => string
  /** Message to display on success */
  successMessage: (variables: TVariables, context: TContext) => string
  /** Callback executed on successful mutation, after receipt is available */
  onSuccess?: (
    data: TData,
    receipt: FormattedTransactionReceipt,
    variables: TVariables,
    context: TContext,
  ) => unknown | Promise<unknown>
  /** Callback executed when mutation is reset */
  onReset?: () => void
}

/**
 * Consumer-facing subset of `TransactionMutationOptionsBase` — omits fields handled by wrapper hooks.
 * Useful if you want to extend `useTransactionMutation`, like `useLlammaMutation` for example.
 */
export type TransactionMutationOptions<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
> = Omit<TransactionMutationOptionsBase<TVariables, TContext, TData>, 'buildContext' | 'validationParams'>

/** Callback type for successful transaction mutations */
export type OnTransactionSuccess<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
> = NonNullable<TransactionMutationOptionsBase<TVariables, TContext, TData>['onSuccess']>

/**
 * Generic hook for blockchain transaction mutations with automatic wallet validation,
 * toast notifications, transaction receipt waiting, and error handling.
 *
 * For llamma-specific mutations, use `useLlammaMutation` which wraps this hook
 * and adds market context.
 */
export function useTransactionMutation<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
>({
  mutationKey,
  buildContext,
  mutationFn,
  validationSuite,
  validationParams,
  pendingMessage,
  successMessage,
  confirmingMessage,
  onSuccess,
  onReset,
}: TransactionMutationOptionsBase<TVariables, TContext, TData>) {
  const { wallet } = useCurve()
  const userAddress = wallet?.address
  const config = useConfig()

  // Track our own error state because errors thrown in onMutate don't populate React Query's error.
  const [error, setError] = useState<Error | null>(null)

  // we use `mutate` instead of `mutateAsync` so that `onSuccess`/`onError` can be handled here
  const { mutate, data, isPending, isSuccess, reset } = useMutation({
    mutationKey,
    onMutate: (variables: TVariables) => {
      setError(null) // Clear local error at the start of a new mutation attempt.

      // Early validation - throwing here prevents mutationFn from running
      if (!wallet) throw new Error('Missing provider')

      assertValidity(validationSuite, { userAddress, ...validationParams, ...variables })

      logMutation(mutationKey, { variables })
      const baseContext = { wallet } as TransactionContext
      const context = buildContext ? buildContext(variables, baseContext) : (baseContext as TContext)

      addBreadcrumb('Transaction mutation starting', 'mutation', { variables, userAddress, mutationKey })

      // Return context to make it available in all callbacks (except mutationFn, we have to reconstruct there)
      return context
    },
    mutationFn: async (variables: TVariables) => {
      // We need to reconstruct context here since mutationFn doesn't receive onMutate's return.
      // buildContext is called again, which is fine since it should be deterministic. No side-effect please though.
      const baseContext = { wallet: wallet! } as TransactionContext
      const context = buildContext ? buildContext(variables, baseContext) : (baseContext as TContext)

      const data = await withPendingToast(mutationFn(variables, context), pendingMessage(variables, context))
      throwIfError(data)

      // Validate that we have a valid transaction hash before waiting for receipt
      if (!data.hash) throw new Error('Transaction did not return a valid hash')
      return {
        data,
        receipt: await withPendingToast(
          waitForTransactionReceipt(config, data),
          confirmingMessage?.(variables, context) || t`Waiting for transaction confirmation...`,
        ),
      }
    },
    onSuccess: async ({ data, receipt }, variables, context) => {
      logSuccess(mutationKey, { data, variables, context })
      onReset?.()
      await onSuccess?.(data, receipt, variables, context)
      notify(successMessage(variables, context), 'success')
    },
    onError: (error, variables, context) => {
      // Be aware that context may be undefined if onMutate threw before returning
      console.error(`Error in mutation ${JSON.stringify({ mutationKey, variables })}:`, error)
      setError(error)
      logError(mutationKey, { error, variables, context })
      captureError(error, { variables, userAddress })
      notify(t`Transaction failed`, 'error') // hide the actual error message, it can be too long - display it in the form
    },
  })

  return { mutate, error, ...data, isPending, isSuccess, reset }
}
