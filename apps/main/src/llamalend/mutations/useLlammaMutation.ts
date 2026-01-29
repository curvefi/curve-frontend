import { useState } from 'react'
import type { FormattedTransactionReceipt, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { invalidateAllUserMarketDetails } from '@/llamalend/queries/validation/invalidation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { useMutation } from '@tanstack/react-query'
import { notify, useCurve } from '@ui-kit/features/connect-wallet'
import { withPendingToast } from '@ui-kit/features/connect-wallet/lib/notify'
import { assertValidity, logError, logMutation, logSuccess, type ValidationSuite } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { waitForTransactionReceipt } from '@wagmi/core'
import { getLlamaMarket, updateUserEventsApi } from '../llama.utils'
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
type Context = Pick<NonNullable<ReturnType<typeof useCurve>>, 'wallet' | 'llamaApi'> & {
  market: LlamaMarketTemplate
}

type Result = { hash: Hex }

export type LlammaMutationOptions<TVariables extends object, TData extends Result = Result> = {
  /** The llamma market id */
  marketId: string | null | undefined
  /** The current network config */
  network: { id: LlamaNetworkId; chainId: LlamaChainId }
  /** Unique key for the mutation */
  mutationKey: readonly unknown[]
  /**
   *  Function that performs the mutation operation.
   *  Usually, mutations functions don't have a context, but we inject it in our custom hook.
   **/
  mutationFn: (variables: TVariables, context: { market: LlamaMarketTemplate }) => Promise<TData>
  /**
   * Validation suite to validate variables before mutationFn is called.
   **/
  validationSuite: ValidationSuite
  /** Message to display while waiting for transaction submission */
  pendingMessage: (variables: TVariables, context: Pick<Context, 'market'>) => string
  /** Message to display while waiting for transaction confirmation */
  confirmingMessage?: (variables: TVariables, context: Pick<Context, 'market'>) => string
  /** Message to display on success */
  successMessage: (variables: TVariables, context: Context) => string
  /** Callback executed on successful mutation */
  onSuccess?: (
    data: TData,
    receipt: FormattedTransactionReceipt,
    variables: TVariables,
    context: Context,
  ) => unknown | Promise<unknown>
  /** Callback executed when mutation is reset */
  onReset?: () => void
}

/**
 * Custom hook for handling llamma-related mutations with automatic wallet and API validation
 * Could argue for a refactor to validate with vest like we do for queries, but I'd rather keep
 * it simple for now. Maybe another time, for now we're just doing a quick llamma specialization
 * with simple throwing errors.
 */
export function useLlammaMutation<TVariables extends object, TData extends Result = Result>({
  network: { chainId, id: networkId },
  marketId,
  mutationKey,
  mutationFn,
  validationSuite,
  pendingMessage,
  successMessage,
  confirmingMessage,
  onSuccess,
  onReset,
}: LlammaMutationOptions<TVariables, TData>) {
  const { llamaApi, wallet } = useCurve()
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
      if (!llamaApi) throw new Error('Missing llamalend api')
      if (!marketId) throw new Error('Missing llamma market id')

      assertValidity(validationSuite, { chainId, marketId, userAddress, ...variables })

      const market = getLlamaMarket(marketId)

      logMutation(mutationKey, { variables })
      // Return context to make it available in other callbacks
      return { wallet, llamaApi, market }
    },
    mutationFn: async (variables: TVariables) => {
      const market = getLlamaMarket(marketId!)
      const data = await withPendingToast(mutationFn(variables, { market }), pendingMessage(variables, { market }))
      throwIfError(data)

      // Validate that we have a valid transaction hash before waiting for receipt
      if (!data.hash) throw new Error('Transaction did not return a valid hash')
      return {
        data,
        receipt: await withPendingToast(
          waitForTransactionReceipt(config, data),
          confirmingMessage?.(variables, { market }) || t`Waiting for transaction confirmation...`,
        ),
      }
    },
    onSuccess: async ({ data, receipt }, variables, result) => {
      const { market, wallet } = result
      logSuccess(mutationKey, { data, variables, marketId: market.id })
      await onSuccess?.(data, receipt, variables, result)
      notify(successMessage(variables, result), 'success')
      updateUserEventsApi(wallet!, { id: networkId }, market, receipt.transactionHash)
      await invalidateAllUserMarketDetails({ chainId, marketId, userAddress })
      onReset?.()
    },
    onError: (error, variables, context) => {
      setError(error)
      logError(mutationKey, { error, variables, marketId: context?.market.id })
      notify(t`Transaction failed`, 'error') // hide the actual error message, it can be too long - display it in the form
    },
  })
  return { mutate, error, ...data, isPending, isSuccess, reset }
}
