import { useCallback } from 'react'
import { useConnection } from 'wagmi'
import { useWithdrawLockMutation } from '@/dao/components/PageVeCrv/mutations/withdraw-lock.mutation'
import type { WithdrawLockFormValues } from '@/dao/components/PageVeCrv/queries/withdraw-lock.types'
import { invalidateVeCrvQueries, useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'
import { maybe } from '@primitives/objects.utils'
import { useForm } from '@ui/features/forms'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'

const defaultValues: WithdrawLockFormValues = {}

export const useWithdrawLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<WithdrawLockFormValues>({ defaultValues })
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  const lock = lockedAmountAndUnlockTime.data

  const currentDate = useCurrentDate('1h')
  const canUnlock = maybe(lock, ({ lockedAmount, unlockTime }) =>
    getIsLockExpired(lockedAmount, unlockTime, currentDate),
  )

  const {
    onSubmit: onSubmitWithdraw,
    error,
    isPending,
  } = useWithdrawLockMutation({
    chainId,
    userAddress,
    lockedAmount: lock?.lockedAmount,
    unlockTime: lock?.unlockTime,
    currentDate,
    onReset: () => form.reset(defaultValues),
    onWithdrawn: useCallback(() => invalidateVeCrvQueries({ chainId, userAddress }), [chainId, userAddress]),
  })

  return {
    form,
    params: { chainId, userAddress, ...lock, currentDate },
    canUnlock,
    lockedAmountAndUnlockTime,
    isPending,
    isDisabled: !canUnlock || isPending,
    userAddress,
    error,
    onSubmit: form.handleSubmit(onSubmitWithdraw),
  }
}
