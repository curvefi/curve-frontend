import { useEffect, useRef, useState } from 'react'
import { useWithdrawLockMutation } from '@/dao/components/PageVeCrv/mutations/withdraw-lock.mutation'
import { useWithdrawLockGasEstimate } from '@/dao/components/PageVeCrv/queries/withdraw-lock-estimate-gas.query'
import type { WithdrawLockFormValues, WithdrawLockParams } from '@/dao/components/PageVeCrv/queries/withdraw-lock.types'
import type { VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { invalidateLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { invalidateLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { useForm } from '@evm-ui/features/forms'
import { getIsLockExpired } from '@evm-ui/utils/vecrv'

const defaultValues: WithdrawLockFormValues = {}

const getRequestKey = (curve: CurveApi | null) => `${curve?.chainId ?? ''}-${curve?.signerAddress ?? ''}`

export const useWithdrawLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<WithdrawLockFormValues>({ defaultValues })
  const { reset } = form
  const requestKey = getRequestKey(curve)
  const requestKeyRef = useRef(requestKey)
  const [success, setSuccess] = useState<{ requestKey: string; hash: string } | null>(null)

  useEffect(() => {
    requestKeyRef.current = requestKey
    reset(defaultValues)
  }, [requestKey, reset])
  const canUnlock = getIsLockExpired(
    vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
  )
  const params: WithdrawLockParams = curve?.signerAddress
    ? {
        chainId: curve.chainId,
        userAddress: curve.signerAddress,
        lockedAmount: vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
        unlockTime: vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
      }
    : {}
  const gas = useWithdrawLockGasEstimate(networks, params)

  const {
    onSubmit: onSubmitWithdraw,
    error,
    isPending,
  } = useWithdrawLockMutation({
    chainId: curve?.chainId ?? 0,
    userAddress: curve?.signerAddress,
    lockedAmount: vecrvInfo.lockedAmountAndUnlockTime.lockedAmount,
    unlockTime: vecrvInfo.lockedAmountAndUnlockTime.unlockTime,
    onWithdrawn: async ({ hash }) => {
      if (requestKeyRef.current !== requestKey || !curve) return
      setSuccess({ requestKey, hash })
      await Promise.all([
        invalidateLockerVecrvInfo({ chainId: curve.chainId, userAddress: curve.signerAddress }),
        invalidateLockerVecrvUser({ chainId: curve.chainId, userAddress: curve.signerAddress }),
      ])
    },
  })

  return {
    form,
    canUnlock,
    gas,
    isPending,
    isDisabled: !canUnlock || isPending || success?.requestKey === requestKey,
    error,
    success: success?.requestKey === requestKey ? success : null,
    onSubmit: form.handleSubmit(() => onSubmitWithdraw()),
  }
}
