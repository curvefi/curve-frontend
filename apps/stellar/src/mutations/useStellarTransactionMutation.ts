import { useState } from 'react'
import {
  sendStellarTransaction,
  type StellarTransaction,
  type StellarTransactionResponse,
} from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { useMutation } from '@tanstack/react-query'
import { addBreadcrumb, captureError } from '@ui/features/sentry'
import { notify, withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'
import { logError, logMutation, logSuccess } from '@ui/lib/logging'
import { assertValidity, type ValidationSuite } from '@ui/lib/validation/lib'

type TransactionMutationOptions<TVariables> = {
  mutationKey: readonly unknown[]
  createTransaction: (variables: TVariables) => Promise<StellarTransaction>
  validateTransaction?: (transaction: StellarTransaction, variables: TVariables) => unknown
  validationSuite: ValidationSuite
  pendingMessage: (variables: TVariables) => string
  confirmingMessage?: (variables: TVariables) => string
  successMessage: (variables: TVariables) => string
  onReset: () => void
  onSuccess?: (data: StellarTransactionResponse, variables: TVariables) => unknown
}

export function useStellarTransactionMutation<TVariables extends object>({
  mutationKey,
  createTransaction,
  validationSuite,
  validateTransaction,
  pendingMessage,
  confirmingMessage,
  successMessage,
  onSuccess,
  onReset,
}: TransactionMutationOptions<TVariables>) {
  // Errors thrown in onMutate also need to be available to the form.
  const [error, setError] = useState<Error | null>(null)
  const { mutate, isPending } = useMutation({
    mutationKey,
    onMutate: (variables: TVariables) => {
      setError(null)
      assertValidity(validationSuite, variables)
      logMutation(mutationKey, variables)
      addBreadcrumb('Transaction mutation starting', 'mutation', { variables })
    },
    mutationFn: async (variables: TVariables) => {
      const transaction = await withPendingToast(createTransaction(variables), pendingMessage(variables))
      await validateTransaction?.(transaction, variables)
      return withPendingToast(
        sendStellarTransaction(transaction),
        confirmingMessage?.(variables) || t`Confirm in your wallet and wait for transaction confirmation`,
      )
    },
    onSuccess: async (data, variables) => {
      logSuccess(mutationKey, { data, variables })
      onReset()
      await onSuccess?.(data, variables)
      notify(successMessage(variables), 'success')
    },
    onError: (error, variables) => {
      setError(error)
      logError(mutationKey, { error, variables })
      captureError(error, { variables })
      notify(t`Transaction failed`, 'error')
    },
  })
  return { mutate, error, isPending }
}
