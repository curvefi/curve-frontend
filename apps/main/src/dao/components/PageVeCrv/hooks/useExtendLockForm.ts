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
import { useCurve } from '@evm-ui/features/connect-wallet'
import { dayjs } from '@evm-ui/utils/dayjs'
import { VECRV_MAX_LOCK_DAYS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { assert, fromEntries, maybe } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui/features/forms'
import { mapQuery } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'

const defaultValues: ExtendLockFormValues = { utcDate: null, days: 0, minUnlockDate: null, maxUnlockDate: null }
const userDefaultValues = { days: 0 }
const MAX_LOCK_REMAINDER_DAYS = 7

// Form synchronization compares values by reference, so only stabilize the calendar dates it stores.
const useCalendarDate = (timestamp: number | undefined) =>
  useMemo(() => maybe(timestamp, timestamp => toCalendarDate(dayjs.utc(timestamp))), [timestamp])

export const useExtendLockForm = ({ chainId }: { chainId: number }) => {
  const { curveApi } = useCurve()
  const form = useForm<ExtendLockFormValues>({ defaultValues, validation: extendLockFormValidationSuite })
  const { update, values } = form
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  const currentVeCrv = useLockerVeCrv({ chainId, userAddress })

  const currentUnlockTime = lockedAmountAndUnlockTime.data?.unlockTime
  const currentDate = new Date(lockedAmountAndUnlockTime.dataUpdatedAt)
  const currentUnlockUtcTime = maybe(currentUnlockTime, unlockTime => dayjs.utc(unlockTime)) ?? null
  const currentUtcDate = dayjs.utc(currentDate)
  const remainingLockedDays = getRemainingLockedDays(currentUnlockUtcTime, currentUtcDate)
  const maxDays = maybe(remainingLockedDays, remainingLockedDays => VECRV_MAX_LOCK_DAYS - remainingLockedDays)
  const maxUnlockTime = calcUnlockTime({ curveApi, days: maxDays, unlockTime: currentUnlockTime })
  const maxUtcDate = maybe(maxUnlockTime, unlockTime => dayjs.utc(unlockTime)) ?? null

  useFormSync(form, {
    minUnlockDate: useCalendarDate(currentUnlockTime),
    maxUnlockDate: useCalendarDate(maxUnlockTime),
  })

  const [params, isDebouncing] = useFormDebounce({ chainId, userAddress, days: values.days }, userDefaultValues)

  const updateUnlockDate = (unlockDate: DateValue) =>
    currentUnlockUtcTime && update(getUnlockDateUpdate(unlockDate, currentUnlockUtcTime))

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
      calculateVeCrv({ curveApi, lockedAmount, unlockTime: maybe(values.utcDate, getDateValueTimestamp) }),
    ),
    effectiveUnlockDateLabel: getEffectiveUnlockDateLabel({
      selectedDate: values.utcDate,
      unlockTime: calcUnlockTime({ curveApi, days: values.days, unlockTime: currentUnlockTime }),
    }),
    isPending,
    isDisabled: !form.formState.isValid || isPending || isDebouncing,
    userAddress,
    error: extendError,
    validationErrors: fromEntries(form.formState.visibleErrors),
    onSubmit: form.handleSubmit(onSubmitExtend),
    updateUnlockDate,
    selectQuickDate: (value: number | undefined, unit: dayjs.ManipulateType | undefined) => {
      const { utcDate, quickActionValue, days } = getExtendQuickDateUpdate({
        curveApi: assert(curveApi, 'Curve API is required to select an unlock date'),
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
  }
}
