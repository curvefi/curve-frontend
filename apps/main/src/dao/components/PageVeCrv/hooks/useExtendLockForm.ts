import { useCallback, useMemo } from 'react'
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
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { dayjs } from '@evm-ui/lib/dayjs'
import { VECRV_MAX_LOCK_DAYS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { formatDate } from '@legacy-ui/utils'
import { maybes } from '@primitives/objects.utils'

const defaultValues: ExtendLockFormValues = { utcDate: null, days: 0, minUnlockDate: null, maxUnlockDate: null }
const userDefaultValues = { days: 0 }
const MAX_LOCK_REMAINDER_DAYS = 7

export const useExtendLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<ExtendLockFormValues>({ defaultValues, validation: extendLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const currUnlockTime = vecrvInfo.lockedAmountAndUnlockTime.unlockTime
  const currUnlockUtcTime = dayjs.utc(currUnlockTime)
  const currentUtcDate = dayjs.utc(useCurrentDate())
  const remainingLockedDays = dayjs(currUnlockUtcTime.format('YYYY-MM-DD')).diff(
    currentUtcDate.format('YYYY-MM-DD'),
    'day',
    false,
  )
  const maxDays = VECRV_MAX_LOCK_DAYS - remainingLockedDays
  const maxUtcDate = useMemo(
    () => (curve ? dayjs.utc(curve.boosting.calcUnlockTime(maxDays, currUnlockTime)) : currUnlockUtcTime),
    [currUnlockTime, curve, maxDays, currUnlockUtcTime],
  )
  const isMax = maxDays <= MAX_LOCK_REMAINDER_DAYS

  useFormSync(form, {
    minUnlockDate: toCalendarDate(currUnlockUtcTime),
    maxUnlockDate: toCalendarDate(maxUtcDate),
  })

  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId: curve?.chainId, userAddress: curve?.signerAddress, days: values.days }),
      [curve?.chainId, curve?.signerAddress, values.days],
    ),
    userDefaultValues,
  )
  const estimateParams: ExtendLockParams = params
  const gas = useExtendLockGasEstimate(networks, estimateParams)
  const calculatedUtcDate = useMemo(
    () => (curve && values.days > 0 ? dayjs.utc(curve.boosting.calcUnlockTime(values.days, currUnlockTime)) : null),
    [currUnlockTime, curve, values.days],
  )
  const dateLabel = maybes([values.utcDate, calculatedUtcDate], (utcDate, calculatedUtcDate) =>
    dayjs.utc(utcDate.toString()).isSame(calculatedUtcDate) ? undefined : formatDate(calculatedUtcDate.valueOf()),
  )
  const updateUnlockDate = useCallback(
    (unlockDate: DateValue) => {
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
    onReset: () => form.reset(defaultValues),
    onExtended: async () => curve && invalidate(curve),
  })
  const isDisabled = !form.formState.isValid || isPending || isDebouncing
  const onSubmit = form.handleSubmit(onSubmitExtend)

  return {
    form,
    values,
    currUnlockUtcTime,
    minUtcDate: currUnlockUtcTime,
    maxUtcDate,
    isMax,
    dateLabel,
    gas,
    isPending,
    isDisabled,
    error: extendError ?? gas.error,
    onSubmit,
    updateUnlockDate,
    selectQuickDate,
  }
}
