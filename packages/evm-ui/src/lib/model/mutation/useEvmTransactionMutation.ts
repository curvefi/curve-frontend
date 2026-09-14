import type { FormattedTransactionReceipt } from 'viem'
import { useConfig } from 'wagmi'
import { useCurve } from '@evm-ui/features/connect-wallet'
import type { Hex } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import {
  useTransactionMutation,
  type TransactionMutationOptions,
} from '@ui/features/queries/mutations/useTransactionMutation'
import { withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'
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

/** Base context provided to EVM transaction mutations. */
export type TransactionContext = { wallet: NonNullable<ReturnType<typeof useCurve>['wallet']> }

type TransactionResult = { hash: Hex }

export type EvmTransactionMutationOptions<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
> = Omit<TransactionMutationOptions<TVariables, TContext, TData>, 'buildContext' | 'onSuccess' | 'userAddress'> & {
  /** Extend the wallet context. Called twice, so avoid side effects. */
  buildContext?: (variables: TVariables, baseContext: TransactionContext) => TContext
  /** Message to display while waiting for transaction submission. */
  pendingMessage: (variables: TVariables, context: TContext) => string
  /** Message to display while waiting for transaction confirmation. */
  confirmingMessage?: (variables: TVariables, context: TContext) => string
  /** Callback executed on successful mutation, after receipt is available. */
  onSuccess?: (data: TData, receipt: FormattedTransactionReceipt, variables: TVariables, context: TContext) => unknown
}

/** Callback type for successful EVM transaction mutations. */
export type OnTransactionSuccess<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
> = NonNullable<EvmTransactionMutationOptions<TVariables, TContext, TData>['onSuccess']>

/** EVM transaction mutations with wallet validation, submission toasts, and receipt waiting. */
export function useEvmTransactionMutation<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
  TData extends TransactionResult = TransactionResult,
>({
  buildContext,
  mutationFn,
  pendingMessage,
  confirmingMessage,
  onSuccess,
  ...options
}: EvmTransactionMutationOptions<TVariables, TContext, TData>) {
  const { wallet } = useCurve()
  const config = useConfig()

  return useTransactionMutation({
    ...options,
    userAddress: wallet?.address,
    buildContext: (variables: TVariables) => {
      const baseContext: TransactionContext = { wallet: assert(wallet, 'Missing provider') }
      return buildContext ? buildContext(variables, baseContext) : (baseContext as TContext)
    },
    mutationFn: async (variables, context) => {
      const data = await withPendingToast(mutationFn(variables, context), pendingMessage(variables, context))
      throwIfError(data)

      if (!data.hash) throw new Error('Transaction did not return a valid hash')
      const receipt = await withPendingToast(
        waitForTransactionReceipt(config, data),
        confirmingMessage?.(variables, context) || t`Waiting for transaction confirmation...`,
      )
      return { data, receipt }
    },
    onSuccess: ({ data, receipt }, variables, context) => onSuccess?.(data, receipt, variables, context),
  })
}
