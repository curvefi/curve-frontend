import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { useWithdrawLockMutation } from '@/dao/components/PageVeCrv/mutations/withdraw-lock.mutation'
import type { WithdrawLockFormValues } from '@/dao/components/PageVeCrv/queries/withdraw-lock.types'
import { invalidateVeCrvQueries, useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { maybe } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'

const defaultValues: WithdrawLockFormValues = {}

export const useWithdrawLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<WithdrawLockFormValues>({ defaultValues })
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  const lock = lockedAmountAndUnlockTime.data

  const canUnlock = maybe(lock, ({ lockedAmount, unlockTime }) => getIsLockExpired(lockedAmount, unlockTime))

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
    params: { chainId, userAddress, ...lock },
    canUnlock,
    lockedAmountAndUnlockTime,
    isPending,
    isDisabled: !canUnlock || isPending,
    userAddress,
    error,
    onSubmit: form.handleSubmit(onSubmitWithdraw),
  }
}
