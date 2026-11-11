import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { usePoolMutation } from '@/dex/mutations/usePoolMutation'
import { fetchWithdrawIsApproved } from '@/dex/queries/withdraw/withdraw-approved.query'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import {
  type AdvancedWithdrawFormValues,
  getAdvancedWithdrawParams,
  getOneCoinWithdrawParams,
  type OneCoinWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { t } from '@ui/lib/i18n'
import type { WithdrawMutation } from './types'
import { userWithdrawParamsValidationSuite } from './withdraw.validation'

const approveWithdraw = async (
  pool: PoolTemplate,
  { isWrapped, amounts, ...params }: WithdrawMutation,
): Promise<Hex[]> => {
  if (isWrapped) return [] // Direct pool withdrawal needs no zap approval.
  switch (params.mode) {
    case 'balanced':
      return (await pool.withdrawApprove(params.lpAmount)) as Hex[]
    case 'unbalanced':
      return (await pool.withdrawImbalanceApprove(amounts)) as Hex[]
    case 'one-coin':
      return (await pool.withdrawOneCoinApprove(params.lpAmount)) as Hex[]
  }
}

const withdraw = async (
  pool: PoolTemplate,
  { isWrapped, slippage, amounts, ...params }: WithdrawMutation,
): Promise<Hex> => {
  switch (params.mode) {
    case 'balanced':
      return (await pool[`withdraw${wrappedMethod(isWrapped)}`](params.lpAmount, +slippage)) as Hex
    case 'unbalanced':
      // The SDK re-quotes LP burn using slippage; the displayed maximum is not a fixed execution cap.
      return (await pool[`withdrawImbalance${wrappedMethod(isWrapped)}`](amounts, +slippage)) as Hex
    case 'one-coin': {
      const { tokenIndex, lpAmount } = params
      return (await pool[`withdrawOneCoin${wrappedMethod(isWrapped)}`](lpAmount, tokenIndex, +slippage)) as Hex
    }
  }
}

export const useWithdrawMutation = ({
  chainId,
  poolAddress,
  onReset,
}: {
  chainId: number
  poolAddress: Address
  onReset: () => void
}) => {
  const { address: userAddress } = useConnection()
  const config = useConfig()
  const { mutate, error, isPending } = usePoolMutation<WithdrawMutation>({
    chainId,
    poolAddress,
    mutationKey: [{ name: 'withdraw', chainId, poolAddress, userAddress }] as const,
    mutationFn: async (values, { pool, userAddress }) => {
      const params = { ...values, chainId, poolAddress, userAddress }
      await waitForApproval({
        isApproved: async () => await fetchWithdrawIsApproved(params, { staleTime: 0 }),
        onApprove: async () => await approveWithdraw(pool, values),
        message: t`Approved withdrawal`,
        config,
      })
      return { hash: await withdraw(pool, values) }
    },
    pendingMessage: () => t`Withdrawing...`,
    successMessage: () => t`Withdrawal successful!`,
    validationSuite: userWithdrawParamsValidationSuite,
    onReset,
  })

  const onSubmit = useCallback(
    (values: OneCoinWithdrawFormValues | AdvancedWithdrawFormValues) => {
      const { mode, amounts, decimals, isWrapped, maxLpAmount, slippage, lpAmount, tokenIndex } =
        'tokenIndex' in values ? getOneCoinWithdrawParams(values) : getAdvancedWithdrawParams(values)
      mutate({
        mode,
        amounts,
        decimals,
        isWrapped,
        maxLpAmount,
        slippage,
        ...{ balanced: { lpAmount }, unbalanced: {}, 'one-coin': { lpAmount, tokenIndex } }[mode],
      } as WithdrawMutation)
    },
    [mutate],
  )

  return { error, isPending, onSubmit, mutate }
}
