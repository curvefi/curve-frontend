import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { fetchDepositIsApproved } from '@/dex/queries/deposit/deposit-approved.query'
import { invalidatePoolInfo, invalidateUserPoolInfo } from '@/dex/queries/invalidation'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { type TransactionContext, useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { t } from '@ui/lib/i18n'
import { depositQueryValidationSuite } from './deposit.validation'
import type { DepositFormValues, DepositMutation } from './types'

type Options = { chainId: number; poolId: string; tokenCount: number; onReset: () => void }

type DepositContext = TransactionContext & { pool: PoolTemplate; userAddress: Address }

const approveDeposit = async (pool: PoolTemplate, { isWrapped, amounts }: DepositMutation): Promise<Hex[]> =>
  (isWrapped ? await pool.depositWrappedApprove(amounts) : await pool.depositApprove(amounts)) as Hex[]

const deposit = async (pool: PoolTemplate, { isWrapped, amounts, slippage }: DepositMutation): Promise<Hex> =>
  (isWrapped
    ? await pool.depositWrapped(amounts, Number(slippage))
    : await pool.deposit(amounts, Number(slippage))) as Hex

export const useDepositMutation = ({ chainId, poolId, tokenCount, onReset }: Options) => {
  const { address: userAddress } = useConnection()
  const config = useConfig()
  const { mutate, error, isPending } = useEvmMutation<DepositMutation, DepositContext>({
    mutationKey: [{ ...rootKeys.userPool({ chainId, poolId, userAddress }), name: 'deposit' }] as const,
    buildContext: (variables, baseContext) => ({
      ...baseContext,
      pool: requireLib('curveApi').getPool(variables.poolId),
      userAddress: assert(userAddress, 'Missing userAddress'),
    }),
    mutationFn: async (variables, { pool, userAddress }) => {
      await waitForApproval({
        isApproved: async () => await fetchDepositIsApproved({ ...variables, userAddress }, { staleTime: 0 }),
        onApprove: async () => await approveDeposit(pool, variables),
        message: t`Approved deposit`,
        config,
      })
      return { hash: await deposit(pool, variables) }
    },
    pendingMessage: () => t`Depositing...`,
    successMessage: () => t`Deposit successful!`,
    validationSuite: depositQueryValidationSuite,
    validationParams: { chainId, poolId, userAddress },
    onReset,
    onSuccess: async (_data, _receipt, { chainId, poolId }, { userAddress }) => {
      await Promise.all([
        invalidatePoolInfo({ chainId, poolId }),
        invalidateUserPoolInfo({ chainId, poolId, userAddress }),
      ])
    },
  })

  const onSubmit = useCallback(
    (values: DepositFormValues) =>
      mutate({ ...values, amounts: getPoolAmounts(values, tokenCount) } as DepositMutation),
    [mutate, tokenCount],
  )

  return { error, isPending, onSubmit }
}
