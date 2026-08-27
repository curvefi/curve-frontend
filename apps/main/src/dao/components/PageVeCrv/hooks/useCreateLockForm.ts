import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useCreateLockMutation } from '@/dao/components/PageVeCrv/mutations/create-lock.mutation'
import { useCreateLockIsApproved } from '@/dao/components/PageVeCrv/queries/create-lock-approved.query'
import { useCreateLockGasEstimate } from '@/dao/components/PageVeCrv/queries/create-lock-estimate-gas.query'
import type { CreateLockFormValues, CreateLockParams } from '@/dao/components/PageVeCrv/queries/create-lock.types'
import { createLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/create-lock.validation'
import type { VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { invalidateLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { invalidateLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { dayjs } from '@evm-ui/lib/dayjs'
import { decimal } from '@evm-ui/utils'
import type { CalendarDate } from '@internationalized/date'
import { formatDate } from '@legacy-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'

const defaultValues: CreateLockFormValues = { lockedAmt: undefined, maxLockedAmt: undefined, utcDate: null, days: 0 }

const getRequestKey = (curve: CurveApi | null) => `${curve?.chainId ?? ''}-${curve?.signerAddress ?? ''}`

export const useCreateLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<CreateLockFormValues>({ defaultValues, validation: createLockFormValidationSuite })
  const { reset, update } = form
  const values = form.watchValues()
  const requestKey = getRequestKey(curve)
  const requestKeyRef = useRef(requestKey)

  useEffect(() => {
    requestKeyRef.current = requestKey
    reset(defaultValues)
  }, [requestKey, reset])

  const crvBalance = decimal(vecrvInfo.crv)
  useFormSync(form, { maxLockedAmt: crvBalance })
  const isFormValid = form.formState.isValid
  const estimateParams: CreateLockParams =
    curve?.signerAddress && values.lockedAmt
      ? { chainId: curve.chainId, userAddress: curve.signerAddress, lockedAmt: values.lockedAmt, days: values.days }
      : {}
  const isApproved = useCreateLockIsApproved(estimateParams)
  const gas = useCreateLockGasEstimate(networks, estimateParams)

  const invalidate = useCallback(async (currentCurve: CurveApi) => {
    await Promise.all([
      invalidateLockerVecrvInfo({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
      invalidateLockerVecrvUser({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
    ])
  }, [])

  const currUtcDate = dayjs.utc(useCurrentDate())
  const minUtcDate = currUtcDate
  const maxUtcDate = currUtcDate.add(4, 'year')
  const calculatedUtcDate = useMemo(
    () => (curve && values.days > 0 ? dayjs.utc(curve.boosting.calcUnlockTime(values.days)) : null),
    [curve, values.days],
  )
  const calculatedDateLabel =
    values.utcDate && calculatedUtcDate && !dayjs.utc(values.utcDate.toString()).isSame(calculatedUtcDate)
      ? formatDate(calculatedUtcDate.valueOf())
      : ''
  const updateUnlockDate = useCallback(
    (unlockDate: CalendarDate) => {
      if (!curve) return
      const utcDate = dayjs.utc(unlockDate.toString())
      update({ utcDate: toCalendarDate(utcDate), days: utcDate.diff(currUtcDate, 'd') })
    },
    [currUtcDate, curve, update],
  )
  const selectQuickDate = useCallback(
    (value?: number, unit?: dayjs.ManipulateType) => {
      if (!curve) return currUtcDate
      const targetDate = value && unit ? dayjs.utc().add(value, unit) : maxUtcDate
      updateUnlockDate(toCalendarDate(targetDate))
      return targetDate
    },
    [currUtcDate, curve, maxUtcDate, updateUnlockDate],
  )

  const {
    onSubmit: onSubmitCreate,
    error: createError,
    isPending: isCreating,
  } = useCreateLockMutation({
    chainId: curve?.chainId ?? 0,
    userAddress: curve?.signerAddress,
    onCreated: async () => {
      if (requestKeyRef.current !== requestKey || !curve) return
      reset(defaultValues)
      await invalidate(curve)
    },
  })
  const error = createError ?? isApproved.error ?? gas.error
  const isPending = isCreating
  const isDisabled = !isFormValid || isPending
  const onSubmit = form.handleSubmit(values => {
    if (values.lockedAmt && values.utcDate) {
      return onSubmitCreate({ lockedAmt: values.lockedAmt, utcDate: values.utcDate, days: values.days })
    }
  })

  return {
    form,
    values,
    currUtcDate,
    minUtcDate,
    maxUtcDate,
    calculatedDateLabel,
    gas,
    isApproved: isApproved.data,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateAmount: (lockedAmt: Decimal | undefined) => update({ lockedAmt }),
    updateUnlockDate,
    selectQuickDate,
  }
}
