import {
  sendStellarTransaction,
  type StellarTransaction,
  type StellarTransactionResponse,
} from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { assert } from '@primitives/objects.utils'
import {
  useTransactionMutation,
  type TransactionMutationOptions,
} from '@ui/features/queries/mutations/useTransactionMutation'
import { withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'

export type TransactionContext = { account: NonNullable<ReturnType<typeof useWallet>['address']> }

export type StellarMutationOptions<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
> = Omit<
  TransactionMutationOptions<TVariables, TContext, StellarTransactionResponse>,
  'buildContext' | 'mutationFn' | 'userAddress' | 'validationParams'
> & {
  /** Extend the wallet context. Called twice, so avoid side effects. */
  buildContext?: (variables: TVariables, baseContext: TransactionContext) => TContext
  validationParams?: Record<string, unknown>
  createTransaction: (variables: TVariables, context: TContext) => Promise<StellarTransaction>
  pendingMessage: (variables: TVariables, context: TContext) => string
  confirmingMessage?: (variables: TVariables, context: TContext) => string
}

/** Stellar transaction mutations with preparation and wallet submission. */
export function useStellarMutation<
  TVariables extends object,
  TContext extends TransactionContext = TransactionContext,
>({
  buildContext,
  validationParams = {},
  createTransaction,
  pendingMessage,
  confirmingMessage = () => t`Confirm in your wallet and wait for transaction confirmation`,
  ...options
}: StellarMutationOptions<TVariables, TContext>) {
  const { address } = useWallet()
  return useTransactionMutation({
    ...options,
    validationParams,
    userAddress: address,
    buildContext: (variables: TVariables) => {
      const baseContext: TransactionContext = { account: assert(address, 'Connect a Stellar wallet') }
      return buildContext ? buildContext(variables, baseContext) : (baseContext as TContext)
    },
    mutationFn: async (variables, context) => {
      const transaction = await withPendingToast(
        createTransaction(variables, context),
        pendingMessage(variables, context),
      )
      return withPendingToast(sendStellarTransaction(transaction), confirmingMessage(variables, context))
    },
  })
}
