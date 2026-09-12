import { useState } from 'react'
import {
  sendStellarTransaction,
  type StellarTransactionError,
  type StellarTransaction,
  type StellarTransactionResponse,
} from '@/features/connect-wallet/stellar-wallet-kit'
import { useMutation } from '@tanstack/react-query'
import { addBreadcrumb, captureError } from '@ui/features/sentry'
import { notify, withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'
import { logError, logMutation, logSuccess } from '@ui/lib/logging'
import { assertValidity, type ValidationSuite } from '@ui/lib/validation/lib'
import type { FieldsOf } from '@ui/lib/validation/types'

type TransactionMutationOptions<TVariables> = {
  mutationKey: readonly unknown[]
  createTransaction: (variables: TVariables) => Promise<StellarTransaction>
  validateTransaction?: (transaction: StellarTransaction, variables: TVariables) => unknown
  validationSuite: ValidationSuite
  pendingMessage: string
  successMessage: string
  onReset: (variables: TVariables) => void
  onSuccess?: (data: StellarTransactionResponse, variables: TVariables) => unknown
}

export function useStellarTransactionMutation<TVariables extends object>({
  mutationKey,
  createTransaction,
  validationSuite,
  validateTransaction,
  pendingMessage,
  successMessage,
  onSuccess,
  onReset,
}: TransactionMutationOptions<TVariables>) {
  const [error, setError] = useState<StellarTransactionError | null>(null)
  const { mutate, isPending, data } = useMutation({
    mutationKey,
    onMutate: (variables: FieldsOf<TVariables>) => {
      setError(null)
      assertValidity(validationSuite, variables)
      logMutation(mutationKey, variables)
      addBreadcrumb('Transaction mutation starting', 'mutation', variables)
    },
    mutationFn: async (variables: FieldsOf<TVariables>) => {
      const transaction = await withPendingToast(createTransaction(variables as TVariables), pendingMessage)
      await validateTransaction?.(transaction, variables as TVariables)
      return withPendingToast(
        sendStellarTransaction(transaction),
        t`Confirm in your wallet and wait for transaction confirmation`,
      )
    },
    onSuccess: async (data, variables) => {
      logSuccess(mutationKey, { data, variables })
      onReset(variables as TVariables)
      await onSuccess?.(data, variables as TVariables)
      notify(successMessage, 'success')
    },
    onError: (error, variables) => {
      setError(error)
      logError(mutationKey, { error, variables })
      captureError(error, { variables })
      notify(t`Transaction failed`, 'error')
    },
  })
  return { mutate, error, isPending, hash: data?.hash ?? error?.submission?.hash }
}
