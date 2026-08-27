import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useExtendLockMutation } from '@/dao/components/PageVeCrv/mutations/extend-lock.mutation'
import { useExtendLockGasEstimate } from '@/dao/components/PageVeCrv/queries/extend-lock-estimate-gas.query'
import type { ExtendLockFormValues, ExtendLockParams } from '@/dao/components/PageVeCrv/queries/extend-lock.types'
import { extendLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/extend-lock.validation'
import type { VecrvInfo } from '@/dao/components/PageVeCrv/types'
import { invalidateLockerVecrvInfo } from '@/dao/entities/locker-vecrv-info'
import { invalidateLockerVecrvUser } from '@/dao/entities/locker-vecrv-user'
import { networks } from '@/dao/networks'
import type { CurveApi } from '@/dao/types/dao.types'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { dayjs } from '@evm-ui/lib/dayjs'
import type { CalendarDate } from '@internationalized/date'
import { formatDate } from '@legacy-ui/utils'

const defaultValues: ExtendLockFormValues = { utcDate: null, days: 0, minUnlockDate: null, maxUnlockDate: null }

const getRequestKey = (curve: CurveApi | null) => `${curve?.chainId ?? ''}-${curve?.signerAddress ?? ''}`

export const useExtendLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<ExtendLockFormValues>({ defaultValues, validation: extendLockFormValidationSuite })
  const { reset, update } = form
  const values = form.watchValues()
  const requestKey = getRequestKey(curve)
  const requestKeyRef = useRef(requestKey)
  const currUnlockTime = vecrvInfo.lockedAmountAndUnlockTime.unlockTime
  const currUnlockUtcTime = dayjs.utc(currUnlockTime)
  const currentUtcDate = dayjs.utc(useCurrentDate())
  const remainingLockedDays = dayjs(currUnlockUtcTime.format('YYYY-MM-DD')).diff(
    currentUtcDate.format('YYYY-MM-DD'),
    'day',
    false,
  )
  const maxDays = 365 * 4 - remainingLockedDays
  const maxUtcDate = useMemo(
    () => (curve ? dayjs.utc(curve.boosting.calcUnlockTime(maxDays, currUnlockTime)) : currUnlockUtcTime),
    [currUnlockTime, curve, maxDays, currUnlockUtcTime],
  )
  const isMax = maxDays <= 7

  useFormSync(form, {
    minUnlockDate: toCalendarDate(currUnlockUtcTime),
    maxUnlockDate: toCalendarDate(maxUtcDate),
  })

  useEffect(() => {
    requestKeyRef.current = requestKey
    reset(defaultValues)
  }, [requestKey, reset])

  const estimateParams: ExtendLockParams =
    curve?.signerAddress && values.days > 0
      ? { chainId: curve.chainId, userAddress: curve.signerAddress, days: values.days }
      : {}
  const gas = useExtendLockGasEstimate(networks, estimateParams)
  const calculatedUtcDate = useMemo(
    () => (curve && values.days > 0 ? dayjs.utc(curve.boosting.calcUnlockTime(values.days, currUnlockTime)) : null),
    [currUnlockTime, curve, values.days],
  )
  const calculatedDateLabel =
    values.utcDate && calculatedUtcDate && !dayjs.utc(values.utcDate.toString()).isSame(calculatedUtcDate)
      ? formatDate(calculatedUtcDate.valueOf())
      : ''
  const updateUnlockDate = useCallback(
    (unlockDate: CalendarDate) => {
      const utcDate = dayjs.utc(unlockDate.toString())
      update({ utcDate: toCalendarDate(utcDate), days: utcDate.diff(currUnlockUtcTime, 'd') })
    },
    [currUnlockUtcTime, update],
  )
  const selectQuickDate = useCallback(
    (value?: number, unit?: dayjs.ManipulateType) => {
      const targetDate = value && unit ? currUnlockUtcTime.add(value, unit) : maxUtcDate
      updateUnlockDate(toCalendarDate(targetDate))
      return targetDate
    },
    [currUnlockUtcTime, maxUtcDate, updateUnlockDate],
  )
  const invalidate = useCallback(async (currentCurve: CurveApi) => {
    await Promise.all([
      invalidateLockerVecrvInfo({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
      invalidateLockerVecrvUser({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
    ])
  }, [])
  const {
    onSubmit: onSubmitExtend,
    error: extendError,
    isPending,
  } = useExtendLockMutation({
    chainId: curve?.chainId ?? 0,
    onExtended: async () => {
      if (requestKeyRef.current !== requestKey || !curve) return
      reset(defaultValues)
      await invalidate(curve)
    },
  })
  const isDisabled = !form.formState.isValid || isPending
  const onSubmit = form.handleSubmit(values => {
    if (values.utcDate) return onSubmitExtend(values)
  })

  return {
    form,
    values,
    currUnlockUtcTime,
    minUtcDate: currUnlockUtcTime,
    maxUtcDate,
    isMax,
    calculatedDateLabel,
    gas,
    isPending,
    isDisabled,
    error: extendError ?? gas.error,
    onSubmit,
    updateUnlockDate,
    selectQuickDate,
  }
}
