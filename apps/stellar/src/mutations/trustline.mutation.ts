import { noop } from 'lodash'
import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit'
import type { StellarNetwork } from '@/stellar/lib/networks'
import { rootKeys } from '@/stellar/queries/root-keys'
import { queryClient } from '@ui/features/queries/query-client'
import { t } from '@ui/lib/i18n'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { useStellarMutation, type TransactionContext } from './useStellarMutation'

type TrustlineMutation = { token: StellarContract }
type TrustlineMutationContext = TransactionContext & TrustlineMutation & { network: StellarNetwork }

/** Adds a trustline for one Stellar Asset Contract. Call mutations sequentially for multiple tokens. */
export const useTrustlineMutation = (network: StellarNetwork) =>
  useStellarMutation<TrustlineMutation, TrustlineMutationContext>({
    mutationKey: [...rootKeys.network({ network }), 'trustline'],
    buildContext: ({ token }, context) => ({ ...context, network, token }),
    createTransaction: (_, { account, network, token }) =>
      simulateContractCall<bigint>(network, token, 'trust', [account], account),
    validationSuite: EmptyValidationSuite,
    pendingMessage: () => t`Preparing trustline`,
    successMessage: () => t`Trustline added`,
    onReset: noop,
    onSuccess: async (_, { token }, { account }) =>
      await queryClient.invalidateQueries({
        queryKey: [...rootKeys.token({ network, token }), ...rootKeys.user({ account }), 'balance'],
      }),
  })
