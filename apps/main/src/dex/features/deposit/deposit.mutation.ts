import { useCallback } from 'react'
import { useConfig } from 'wagmi'
import { fetchDepositIsApproved } from '@/dex/queries/deposit/deposit-approved.query'
import { invalidatePoolInfo, invalidateUserPoolInfo } from '@/dex/queries/invalidation'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { rootKeys } from '@evm-ui/queries/root-keys'
import { useEvmMutation } from '@evm-ui/queries/useEvmMutation'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { t } from '@ui/lib/i18n'
import { depositQueryValidationSuite } from './deposit.validation'
import type { DepositFormState, DepositMutation } from './types'

type Options = {
  chainId: number
  poolId: string
  userAddress: Address | undefined
  isWrapped: boolean
  tokenCount: number
  onReset: () => void
}

const approveDeposit = async (pool: PoolTemplate, { isWrapped, amounts }: DepositMutation): Promise<Hex[]> =>
  (isWrapped ? await pool.depositWrappedApprove(amounts) : await pool.depositApprove(amounts)) as Hex[]

const deposit = async (pool: PoolTemplate, { isWrapped, amounts, slippage }: DepositMutation): Promise<Hex> =>
  (isWrapped
    ? await pool.depositWrapped(amounts, Number(slippage))
    : await pool.deposit(amounts, Number(slippage))) as Hex

export const useDepositMutation = ({ chainId, poolId, userAddress, isWrapped, tokenCount, onReset }: Options) => {
  const config = useConfig()
  const { mutate, error, isPending } = useEvmMutation<DepositMutation>({
    mutationKey: [{ ...rootKeys.userPool({ chainId, poolId, userAddress }), name: 'deposit' }] as const,
    mutationFn: async variables => {
      const pool = requireLib('curveApi').getPool(variables.poolId)
      await waitForApproval({
        isApproved: async () => await fetchDepositIsApproved(variables, { staleTime: 0 }),
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
    onSuccess: async () => {
      await Promise.all([
        invalidatePoolInfo({ chainId, poolId }),
        invalidateUserPoolInfo({ chainId, poolId, userAddress }),
      ])
    },
  })

  const onSubmit = useCallback(
    (values: DepositFormState) =>
      mutate({
        ...values,
        chainId,
        poolId,
        userAddress: userAddress!,
        isWrapped,
        // undefined and 0 are different things. Don't use !
        amounts: getPoolAmounts(values, tokenCount)!.map(amount => amount ?? '0'),
        slippage: values.slippage,
      }),
    [chainId, isWrapped, mutate, poolId, tokenCount, userAddress],
  )

  return { error, isPending, onSubmit }
}
