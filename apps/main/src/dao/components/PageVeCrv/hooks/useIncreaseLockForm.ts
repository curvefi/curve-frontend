import { useCallback, useEffect, useRef, useState } from 'react'
import { useIncreaseLockMutation } from '@/dao/components/PageVeCrv/mutations/increase-lock.mutation'
import { useIncreaseLockIsApproved } from '@/dao/components/PageVeCrv/queries/increase-lock-approved.query'
import { useIncreaseLockGasEstimate } from '@/dao/components/PageVeCrv/queries/increase-lock-estimate-gas.query'
import type { IncreaseLockFormValues, IncreaseLockParams } from '@/dao/components/PageVeCrv/queries/increase-lock.types'
import { increaseLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/increase-lock.validation'
import type { VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { invalidateLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { invalidateLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { decimal } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

const defaultValues: IncreaseLockFormValues = { lockedAmt: undefined, maxLockedAmt: undefined }

const getRequestKey = (curve: CurveApi | null) => `${curve?.chainId ?? ''}-${curve?.signerAddress ?? ''}`

export const useIncreaseLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<IncreaseLockFormValues>({ defaultValues, validation: increaseLockFormValidationSuite })
  const { reset, update } = form
  const values = form.watchValues()
  const requestKey = getRequestKey(curve)
  const requestKeyRef = useRef(requestKey)
  const [success, setSuccess] = useState<{ requestKey: string; hash: string } | null>(null)

  useEffect(() => {
    requestKeyRef.current = requestKey
    reset(defaultValues)
  }, [requestKey, reset])

  useFormSync(form, { maxLockedAmt: decimal(vecrvInfo.crv) })
  const isFormValid = form.formState.isValid
  const estimateParams: IncreaseLockParams =
    curve?.signerAddress && values.lockedAmt
      ? { chainId: curve.chainId, userAddress: curve.signerAddress, lockedAmt: values.lockedAmt }
      : {}
  const isApproved = useIncreaseLockIsApproved(estimateParams)
  const gas = useIncreaseLockGasEstimate(networks, estimateParams)

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
    onIncreased: async ({ hash }) => {
      if (requestKeyRef.current !== requestKey || !curve) return
      setSuccess({ requestKey, hash })
      reset(defaultValues)
      await invalidate(curve)
    },
  })

  const error = increaseError ?? isApproved.error ?? gas.error
  const isPending = isIncreasing
  const isDisabled = !isFormValid || isPending
  const onSubmit = form.handleSubmit(values => {
    if (!values.lockedAmt) return
    return onSubmitIncrease({ lockedAmt: values.lockedAmt })
  })

  return {
    form,
    values,
    gas,
    isApproved: isApproved.data,
    isPending,
    isDisabled,
    error,
    success: success?.requestKey === requestKey ? success : null,
    onSubmit,
    updateAmount: (lockedAmt: Decimal | undefined) => update({ lockedAmt }),
  }
}
