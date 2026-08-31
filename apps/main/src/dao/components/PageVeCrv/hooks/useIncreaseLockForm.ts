import { useCallback, useMemo } from 'react'
import { useIncreaseLockMutation } from '@/dao/components/PageVeCrv/mutations/increase-lock.mutation'
import { useIncreaseLockIsApproved } from '@/dao/components/PageVeCrv/queries/increase-lock-approved.query'
import { useIncreaseLockGasEstimate } from '@/dao/components/PageVeCrv/queries/increase-lock-estimate-gas.query'
import type { IncreaseLockFormValues } from '@/dao/components/PageVeCrv/queries/increase-lock.types'
import { increaseLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/increase-lock.validation'
import type { VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { invalidateLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { invalidateLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { decimal } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

const defaultValues: IncreaseLockFormValues = { lockedAmount: undefined, maxLockedAmount: undefined }
const userDefaultValues = { lockedAmount: undefined }

export const useIncreaseLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<IncreaseLockFormValues>({ defaultValues, validation: increaseLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()

  useFormSync(form, { maxLockedAmount: decimal(vecrvInfo.crv) })
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId: curve?.chainId, userAddress: curve?.signerAddress, lockedAmount: values.lockedAmount }),
      [curve?.chainId, curve?.signerAddress, values.lockedAmount],
    ),
    userDefaultValues,
  )
  const isApproved = useIncreaseLockIsApproved(params)
  const gas = useIncreaseLockGasEstimate(networks, params)

  const invalidate = useCallback(async (currentCurve: CurveApi) => {
    await Promise.all([
      invalidateLockerVecrvInfo({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
      invalidateLockerVecrvUser({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
    ])
  }, [])

  const {
    onSubmit: onSubmitIncrease,
    error: increaseError,
    isPending: isIncreasing,
  } = useIncreaseLockMutation({
    chainId: curve?.chainId ?? 0,
    userAddress: curve?.signerAddress,
    onReset: () => form.reset(defaultValues),
    onIncreased: async () => curve && invalidate(curve),
  })

  const error = increaseError ?? isApproved.error ?? gas.error
  const isPending = isIncreasing
  const isDisabled = !form.formState.isValid || isPending || isDebouncing
  const onSubmit = form.handleSubmit(({ lockedAmount }) => {
    if (lockedAmount == null) return
    onSubmitIncrease({ lockedAmount })
  })

  return {
    form,
    values,
    gas,
    isApproved: isApproved.data,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateAmount: (lockedAmount: Decimal | undefined) => update({ lockedAmount }),
  }
}
