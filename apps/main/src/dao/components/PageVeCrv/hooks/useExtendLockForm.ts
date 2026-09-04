import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useExtendLockMutation } from '@/dao/components/PageVeCrv/mutations/extend-lock.mutation'
import type { ExtendLockFormValues } from '@/dao/components/PageVeCrv/queries/extend-lock.types'
import { extendLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/extend-lock.validation'
import {
  calcUnlockTime,
  calculateVeCrv,
  getDateValueTimestamp,
  getExtendQuickDateUpdate,
  getEffectiveUnlockDateLabel,
  getRemainingLockedDays,
  getUnlockDateUpdate,
} from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import {
  invalidateVeCrvQueries,
  useLockerLockedAmountAndUnlockTime,
  useLockerVeCrv,
} from '@/dao/entities/locker-vecrv-info'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { dayjs } from '@evm-ui/lib/dayjs'
import { VECRV_MAX_LOCK_DAYS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { fromEntries, maybe } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'

const defaultValues: ExtendLockFormValues = { utcDate: null, days: 0, minUnlockDate: null, maxUnlockDate: null }
const userDefaultValues = { days: 0 }
const MAX_LOCK_REMAINDER_DAYS = 7

export const useExtendLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<ExtendLockFormValues>({ defaultValues, validation: extendLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  const currentVeCrv = useLockerVeCrv({ chainId, userAddress })

  const currentUnlockTime = lockedAmountAndUnlockTime.data?.unlockTime
  const currentUnlockUtcTime = maybe(currentUnlockTime, dayjs.utc) ?? null
  const currentDate = useCurrentDate()
  const currentUtcDate = dayjs.utc(currentDate)
  const remainingLockedDays = getRemainingLockedDays(currentUnlockUtcTime, currentUtcDate)
  const maxDays = maybe(remainingLockedDays, remainingLockedDays => VECRV_MAX_LOCK_DAYS - remainingLockedDays)
  const maxUnlockTime = calcUnlockTime({ days: maxDays, unlockTime: currentUnlockTime })
  const maxUtcDate = useMemo(() => maybe(maxUnlockTime, dayjs.utc) ?? null, [maxUnlockTime])

  useFormSync(
    form,
    useMemo(
      () => ({
        minUnlockDate: maybe(currentUnlockTime, unlockTime => toCalendarDate(dayjs.utc(unlockTime))),
        maxUnlockDate: maybe(maxUtcDate, toCalendarDate),
      }),
      [currentUnlockTime, maxUtcDate],
    ),
  )

  const [params, isDebouncing] = useFormDebounce(
    useMemo(() => ({ chainId, userAddress, days: values.days }), [chainId, userAddress, values.days]),
    userDefaultValues,
  )

  const updateUnlockDate = useCallback(
    (unlockDate: DateValue) => {
      if (!currentUnlockUtcTime) return
      update(getUnlockDateUpdate(unlockDate, currentUnlockUtcTime))
    },
    [currentUnlockUtcTime, update],
  )

  const {
    onSubmit: onSubmitExtend,
    error: extendError,
    isPending,
  } = useExtendLockMutation({
    chainId,
    onReset: () => form.reset(defaultValues),
    onExtended: useCallback(() => invalidateVeCrvQueries({ chainId, userAddress }), [chainId, userAddress]),
  })

  return {
    form,
    params,
    values,
    currentUnlockUtcTime,
    minUtcDate: currentUnlockUtcTime,
    maxUtcDate,
    isMax: maybe(maxDays, maxDays => maxDays <= MAX_LOCK_REMAINDER_DAYS),
    currentVeCrv,
    futureVeCrv: mapQuery(lockedAmountAndUnlockTime, ({ lockedAmount }) =>
      calculateVeCrv({
        lockedAmount,
        unlockTime: maybe(values.utcDate, getDateValueTimestamp),
      }),
    ),
    effectiveUnlockDateLabel: getEffectiveUnlockDateLabel({
      selectedDate: values.utcDate,
      unlockTime: calcUnlockTime({ days: values.days, unlockTime: currentUnlockTime }),
    }),
    isPending,
    isDisabled: !form.formState.isValid || isPending || isDebouncing,
    error: extendError,
    validationErrors: fromEntries(form.formState.visibleErrors),
    onSubmit: form.handleSubmit(onSubmitExtend),
    updateUnlockDate,
    selectQuickDate: useCallback(
      (value: number | undefined, unit: dayjs.ManipulateType | undefined) => {
        const { utcDate, quickActionValue, days } = getExtendQuickDateUpdate({
          currentDate,
          currentUnlockTime,
          currentUnlockUtcTime,
          maxUtcDate,
          value,
          unit,
        })
        update({ utcDate, days })
        return quickActionValue
      },
      [currentDate, currentUnlockTime, currentUnlockUtcTime, maxUtcDate, update],
    ),
  }
}
