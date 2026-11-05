import { asStellarContract, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { sendStellarTransaction } from '@/stellar/features/connect-wallet/stellar-wallet-kit/transaction'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import type { CreatedPool } from '@/stellar/features/create-pool/types'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { waitForFeeBump } from '@/stellar/lib/waitForFeeBump'
import { fetchCreatePoolSimulation } from '@/stellar/queries/create-pool/create-pool-simulation.query'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { createPoolValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { assert } from '@primitives/objects.utils'
import { getCreatePoolTokens } from '@ui/features/create-pool/create-pool.utils'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import { invalidateLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { useTransactionMutation } from '@ui/features/queries/mutations/useTransactionMutation'
import { withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'

export const useCreatePoolMutation = ({
  network,
  factory,
  implementationIndex,
}: NetworkQuery & { factory: StellarContract | undefined; implementationIndex: number | undefined }) => {
  const { address: account } = useWallet()
  return useTransactionMutation({
    mutationKey: [{ name: 'createPool', network, factory, implementationIndex, account }],
    userAddress: account,
    buildContext: () => ({
      network,
      factory,
      implementationIndex,
      account: assert(account, t`Connect a Stellar wallet`),
    }),
    validationSuite: createPoolValidationSuite,
    validationParams: { network, factory, implementationIndex, account },
    mutationFn: async (values: CreatePoolFormValues, context): Promise<CreatedPool> => {
      const transaction = await withPendingToast(
        fetchCreatePoolSimulation(
          {
            ...values,
            ...context,
            coins: getCreatePoolTokens(values, values.tokenCount).map(token => asStellarContract(token!.address)),
          },
          { staleTime: 0 },
        ),
        t`Preparing pool deployment`,
      )
      // A confirmed fee bump already executed the deployment.
      const { result } =
        (await waitForFeeBump(transaction)) ??
        (await withPendingToast(
          sendStellarTransaction(transaction),
          t`Confirm in your wallet and wait for transaction confirmation`,
        ))
      return { pool: result.pool, values }
    },
    successMessage: () => t`Pool deployment confirmed`,
    onSuccess: () => invalidateLitePoolList({ chainId: STELLAR_NETWORKS[network].chainId }),
  })
}
