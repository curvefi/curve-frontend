import { useCallback } from 'react'
import { useConfig, useConnection } from 'wagmi'
import { usePoolMutation } from '@/dex/mutations/usePoolMutation'
import { fetchWithdrawIsApproved } from '@/dex/queries/withdraw/withdraw-approved.query'
import { getWithdrawImplementation } from '@/dex/queries/withdraw/withdraw-query.helpers'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { waitForApproval } from '@evm-ui/utils'
import type { Address, Hex } from '@primitives/address.utils'
import { wrappedMethod } from '@ui/features/pool-forms/pool-form.utils'
import {
  getAdvancedWithdrawParams,
  getOneCoinWithdrawParams,
  type AdvancedWithdrawFormValues,
  type OneCoinWithdrawFormValues,
} from '@ui/features/pool-forms/withdraw/withdraw-form.utils'
import { t } from '@ui/lib/i18n'
import type { WithdrawMutation } from './types'
import { userWithdrawParamsValidationSuite } from './withdraw.validation'

const approveWithdraw = async (pool: PoolTemplate, { isWrapped, ...params }: WithdrawMutation): Promise<Hex[]> => {
  if (isWrapped) return [] // Direct pool withdrawal needs no zap approval.
  const [type, impl, args] = getWithdrawImplementation(pool, params)
  switch (type) {
    case 'balanced':
      return (await impl.withdrawApprove(...args)) as Hex[]
    case 'imbalance':
      return (await impl.withdrawImbalanceApprove(...args)) as Hex[]
    case 'oneCoin':
      return (await impl.withdrawOneCoinApprove(args[0])) as Hex[]
  }
}

const withdraw = async (pool: PoolTemplate, { isWrapped, slippage, ...params }: WithdrawMutation): Promise<Hex> => {
  const [type, impl, args] = getWithdrawImplementation(pool, params)
  switch (type) {
    case 'balanced':
      return (await impl[`withdraw${wrappedMethod(isWrapped)}`](...args, +slippage)) as Hex
    case 'imbalance':
      // The SDK re-quotes LP burn using slippage; the displayed maximum is not a fixed execution cap.
      return (await impl[`withdrawImbalance${wrappedMethod(isWrapped)}`](...args, +slippage)) as Hex
    case 'oneCoin':
      return (await impl[`withdrawOneCoin${wrappedMethod(isWrapped)}`](...args, +slippage)) as Hex
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
    (values: OneCoinWithdrawFormValues | AdvancedWithdrawFormValues) =>
      mutate(
        ('tokenIndex' in values
          ? getOneCoinWithdrawParams(values)
          : getAdvancedWithdrawParams(values)) as WithdrawMutation,
      ),
    [mutate],
  )

  return { error, isPending, onSubmit, mutate }
}
