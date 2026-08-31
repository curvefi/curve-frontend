import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { useWithdrawLockMutation } from '@/dao/components/PageVeCrv/mutations/withdraw-lock.mutation'
import { useWithdrawLockGasEstimate } from '@/dao/components/PageVeCrv/queries/withdraw-lock-estimate-gas.query'
import type { WithdrawLockFormValues } from '@/dao/components/PageVeCrv/queries/withdraw-lock.types'
import { invalidateVeCrvQueries, useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { networks } from '@/dao/networks'
import { useForm } from '@evm-ui/features/forms'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { maybe } from '@primitives/objects.utils'

const defaultValues: WithdrawLockFormValues = {}

export const useWithdrawLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<WithdrawLockFormValues>({ defaultValues })
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  const lock = lockedAmountAndUnlockTime.data

  const canUnlock = maybe(lock, ({ lockedAmount, unlockTime }) => getIsLockExpired(lockedAmount, unlockTime))
  const gas = useWithdrawLockGasEstimate(networks, { chainId, userAddress, ...lock })

  const {
    onSubmit: onSubmitWithdraw,
    error,
    isPending,
  } = useWithdrawLockMutation({
    chainId,
    userAddress,
    lockedAmount: lock?.lockedAmount,
    unlockTime: lock?.unlockTime,
    onReset: () => form.reset(defaultValues),
    onWithdrawn: useCallback(() => invalidateVeCrvQueries({ chainId, userAddress }), [chainId, userAddress]),
  })

  return {
    form,
    canUnlock,
    lockedAmountAndUnlockTime,
    gas,
    isPending,
    isDisabled: !canUnlock || isPending,
    error,
    onSubmit: form.handleSubmit(onSubmitWithdraw),
  }
}
