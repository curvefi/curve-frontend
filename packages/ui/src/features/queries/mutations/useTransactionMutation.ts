import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { addBreadcrumb, captureError } from '@ui/features/sentry'
import { notify } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'
import { logError, logMutation, logSuccess } from '@ui/lib/logging'
import { assertValidity, type ValidationSuite } from '@ui/lib/validation/lib'

export type TransactionMutationOptions<TVariables extends object, TContext extends object = object, TData = unknown> = {
  /** Unique key for the mutation */
  mutationKey: readonly unknown[]
  /**
   * Called during onMutate to build the transaction context.
   * Throw here to prevent the mutation from running.
   *
   * @remarks Because `mutationFn` does not get the context, it has to rebuild the context.
   * Therefore, avoid side-effects when calling this function.
   */
  buildContext: (variables: TVariables) => TContext
  /**
   * Function that performs the mutation operation.
   * Receives the variables and the full context (including any custom context from buildContext).
   * Usually, mutations functions don't have a context, but we inject it in our custom hook.
   */
  mutationFn: (variables: TVariables, context: TContext) => Promise<TData>
  /** Validation suite to validate variables before mutationFn is called. */
  validationSuite: ValidationSuite
  /** Additional fields to pass to the validation suite beyond the variables. */
  validationParams: Record<string, unknown>
  /** Wallet address included in validation and error reporting, when available. */
  userAddress?: string
  /** Message to display on success */
  successMessage: (variables: TVariables, context: TContext) => string
  /** Callback executed on successful mutation */
  onSuccess?: (data: TData, variables: TVariables, context: TContext) => unknown
  /** Callback executed to reset the form when mutation is finished successfully */
  onReset: () => void
}

/** Shared transaction lifecycle with validation, context, success notifications, and error handling. */
export function useTransactionMutation<TVariables extends object, TContext extends object = object, TData = unknown>({
  mutationKey,
  buildContext,
  mutationFn,
  validationSuite,
  validationParams,
  userAddress,
  successMessage,
  onSuccess,
  onReset,
}: TransactionMutationOptions<TVariables, TContext, TData>) {
  // Track our own error state because errors thrown in onMutate don't populate React Query's error.
  const [error, setError] = useState<Error | null>(null)

  // we use `mutate` instead of `mutateAsync` so that `onSuccess`/`onError` can be handled here
  const { mutate, isPending } = useMutation({
    mutationKey,
    onMutate: (variables: TVariables) => {
      setError(null) // Clear local error at the start of a new mutation attempt.

      const params = { userAddress, ...validationParams, ...variables, mutationKey }
      assertValidity(validationSuite, params)
      const context = buildContext(variables) // throws before logging if context requirements are not met

      logMutation(mutationKey, params)
      addBreadcrumb('Transaction mutation starting', 'mutation', params)

      // Return context to make it available in all callbacks (except mutationFn, we have to reconstruct there)
      return context
    },
    // Reconstruct context because mutationFn doesn't receive onMutate's return. buildContext must be deterministic and have no side effects.
    mutationFn: async (variables: TVariables) => await mutationFn(variables, buildContext(variables)),
    onSuccess: async (data, variables, context) => {
      logSuccess(mutationKey, { data, variables })
      onReset?.()
      await onSuccess?.(data, variables, context)
      notify(successMessage(variables, context), 'success')
    },
    onError: (error, variables, _context) => {
      // Be aware that context may be undefined if onMutate threw before returning.
      // Context also isn't always serializable and may contain class instances, so don't just log it.
      // But usually all info you need for debugging resides in the mutation key and variables anyway.
      console.error(`Error in mutation ${JSON.stringify({ mutationKey, variables })}:`, error)
      setError(error)
      logError(mutationKey, { error, variables })
      captureError(error, { variables, userAddress })
      notify(t`Transaction failed`, 'error') // hide the actual error message, it can be too long - display it in the form
    },
  })

  return { mutate, error, isPending }
}
