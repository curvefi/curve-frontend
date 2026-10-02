import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { fetchDepositIsApproved } from '@/dex/queries/deposit/deposit-approved.query'
import { invalidatePoolInfo, invalidateUserPoolInfo } from '@/dex/queries/invalidation'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { invalidateTokenBalances } from '@evm-ui/hooks/useTokenBalance'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { type TransactionContext, useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { assert } from '@primitives/objects.utils'
import { depositMethod, getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { t } from '@ui/lib/i18n'
import { depositQueryValidationSuite } from './deposit.validation'
import type { DepositFormValues, DepositMutation } from './types'

type DepositContext = TransactionContext & { pool: PoolTemplate; userAddress: Address }

export const useDepositMutation = ({
  chainId,
  poolId,
  tokenCount,
  onReset,
}: {
  chainId: number
  poolId: string
  tokenCount: number
  onReset: () => void
}) => {
  const { address: userAddress } = useConnection()
  const config = useConfig()
  const { mutate, error, isPending } = useEvmMutation<DepositMutation, DepositContext>({
    mutationKey: [{ ...rootKeys.userPool({ chainId, poolId, userAddress }), name: 'deposit' }] as const,
    validationParams: { chainId, poolId, userAddress },
    buildContext: (_variables, baseContext) => ({
      ...baseContext,
      pool: requireLib('curveApi').getPool(poolId),
      userAddress: assert(userAddress, 'Missing userAddress'),
    }),
    mutationFn: async ({ amounts, slippage, isWrapped, decimals }, { pool, userAddress }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchDepositIsApproved(
            { chainId, poolId, userAddress, isWrapped, decimals, slippage },
            { staleTime: 0 },
          ),
        onApprove: async () => (await pool[`${depositMethod(isWrapped)}Approve`](amounts)) as Hex[],
        message: t`Approved deposit`,
        config,
      })
      return { hash: (await pool[depositMethod(isWrapped)](amounts, +slippage)) as Hex }
    },
    pendingMessage: () => t`Depositing...`,
    successMessage: () => t`Deposit successful!`,
    validationSuite: depositQueryValidationSuite,
    onReset,
    onSuccess: async (_data, _receipt, _variables, { userAddress, pool }) =>
      await Promise.allSettled([
        // todo: send hash to prices api
        invalidatePoolInfo({ chainId, poolId }),
        invalidateUserPoolInfo({ chainId, poolId, userAddress }),
        invalidateTokenBalances(config, {
          chainId,
          userAddress,
          tokenAddresses: [pool.lpToken, ...pool.underlyingCoinAddresses, ...pool.wrappedCoinAddresses] as Address[],
        }),
      ]),
  })

  const onSubmit = useCallback(
    (values: DepositFormValues) =>
      mutate({ ...values, amounts: getPoolAmounts(values, tokenCount) } as DepositMutation),
    [mutate, tokenCount],
  )

  return { error, isPending, onSubmit }
}
