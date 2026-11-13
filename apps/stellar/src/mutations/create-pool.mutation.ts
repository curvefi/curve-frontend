import { asAddress, type StellarContract } from '@/stellar/features/connect-wallet/address'
import { sendStellarTransaction } from '@/stellar/features/connect-wallet/stellar-wallet-kit/transaction'
import { waitForFeeBump } from '@/stellar/features/connect-wallet/stellar-wallet-kit/waitForFeeBump'
import { useWallet } from '@/stellar/features/connect-wallet/useWallet'
import { getCreatePoolValues } from '@/stellar/features/create-pool/create-pool.utils'
import type { CreatedPool, CreatePoolMutation } from '@/stellar/features/create-pool/types'
import { STELLAR_NETWORKS } from '@/stellar/lib/networks'
import { fetchCreatePoolSimulation } from '@/stellar/queries/create-pool/create-pool-simulation.query'
import type { NetworkQuery } from '@/stellar/queries/query-types'
import { createPoolValidationSuite } from '@/stellar/queries/validation/create-pool.validation'
import { assert } from '@primitives/objects.utils'
import type { CreatePoolFormValues } from '@ui/features/create-pool/types'
import { invalidateLitePoolList } from '@ui/features/pool-list/lite-pool-list.query'
import { useTransactionMutation } from '@ui/features/queries/mutations/useTransactionMutation'
import { useCreatedPools } from '@ui/features/storage/useSessionStorage'
import { withPendingToast } from '@ui/features/toast/Toast/notify'
import { t } from '@ui/lib/i18n'

export const useCreatePoolMutation = ({
  network,
  factory,
  implementationIndex,
  wasmHash,
}: NetworkQuery & {
  factory: StellarContract | undefined
  implementationIndex: number | undefined
  wasmHash: number[] | undefined
}) => {
  const { address: account } = useWallet()
  const [, setCreatedPools] = useCreatedPools(network)
  const { mutate, data, error, isPending, status } = useTransactionMutation({
    mutationKey: [{ name: 'createPool', network, factory, implementationIndex, account }],
    userAddress: account,
    buildContext: () => ({
      network,
      factory,
      implementationIndex,
      wasmHash,
      account: assert(account, t`Connect a Stellar wallet`),
    }),
    validationSuite: createPoolValidationSuite,
    validationParams: { network, factory, implementationIndex, account, wasmHash },
    mutationFn: async ({ values, ...params }: CreatePoolMutation, context): Promise<CreatedPool> => {
      const transaction = await withPendingToast(
        fetchCreatePoolSimulation({ ...params, ...context }, { staleTime: 0 }),
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
    onSuccess: ({ pool }) => {
      setCreatedPools(pools => [...pools, asAddress(pool)])
      return invalidateLitePoolList({ chainId: STELLAR_NETWORKS[network].chainId })
    },
  })
  return {
    data,
    error,
    isPending,
    status,
    onSubmit: (values: CreatePoolFormValues) =>
      mutate({ ...getCreatePoolValues(values), values } as CreatePoolMutation),
  }
}
