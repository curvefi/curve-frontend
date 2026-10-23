import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { usePoolMutation } from '@/dex/mutations/usePoolMutation'
import { fetchDepositIsApproved } from '@/dex/queries/deposit/deposit-approved.query'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { depositMethod, getPoolAmounts } from '@ui/features/pool-forms/pool-form.utils'
import { t } from '@ui/lib/i18n'
import { userDepositParamsValidationSuite } from './deposit.validation'
import type { DepositFormValues, DepositMutation } from './types'

export const useDepositMutation = ({
  chainId,
  poolAddress,
  tokenCount,
  onReset,
}: {
  chainId: number
  poolAddress: Address
  tokenCount: number
  onReset: () => void
}) => {
  const { address: userAddress } = useConnection()
  const config = useConfig()
  const { mutate, error, isPending } = usePoolMutation<DepositMutation>({
    chainId,
    poolAddress,
    mutationKey: [{ name: 'deposit', chainId, poolAddress, userAddress }] as const,
    mutationFn: async ({ amounts, slippage, isWrapped, decimals }, { pool, userAddress }) => {
      await waitForApproval({
        isApproved: async () =>
          await fetchDepositIsApproved(
            { chainId, poolAddress, userAddress, isWrapped, decimals, slippage, amounts },
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
    validationSuite: userDepositParamsValidationSuite,
    onReset,
  })

  const onSubmit = useCallback(
    (values: DepositFormValues) =>
      mutate({ ...values, amounts: getPoolAmounts(values, tokenCount) } as DepositMutation),
    [mutate, tokenCount],
  )

  return { error, isPending, onSubmit, mutate }
}
