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

export const useWithdrawLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<WithdrawLockFormValues>({ defaultValues })

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
    onReset: () => form.reset(defaultValues),
    onWithdrawn: async () => {
      if (!curve) return
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
    isDisabled: !canUnlock || isPending,
    error,
    onSubmit: form.handleSubmit(onSubmitWithdraw),
  }
}
