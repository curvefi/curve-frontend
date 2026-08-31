import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useExtendLockMutation } from '@/dao/components/PageVeCrv/mutations/extend-lock.mutation'
import { useExtendLockGasEstimate } from '@/dao/components/PageVeCrv/queries/extend-lock-estimate-gas.query'
import type { ExtendLockFormValues, ExtendLockParams } from '@/dao/components/PageVeCrv/queries/extend-lock.types'
import { extendLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/extend-lock.validation'
import { calcUnlockTime } from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import { invalidateVeCrvQueries, useLockerLockedAmountAndUnlockTime } from '@/dao/entities/locker-vecrv-info'
import { networks } from '@/dao/networks'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { dayjs } from '@evm-ui/lib/dayjs'
import { VECRV_MAX_LOCK_DAYS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { formatDate } from '@legacy-ui/utils'
import { fromEntries, maybe, maybes } from '@primitives/objects.utils'

const defaultValues: ExtendLockFormValues = { utcDate: null, days: 0, minUnlockDate: null, maxUnlockDate: null }
const userDefaultValues = { days: 0 }
const MAX_LOCK_REMAINDER_DAYS = 7

export const useExtendLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<ExtendLockFormValues>({ defaultValues, validation: extendLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })

  const currentUnlockTime = lockedAmountAndUnlockTime.data?.unlockTime
  const currentUnlockUtcTime = maybe(currentUnlockTime, dayjs.utc)
  const currentUtcDate = dayjs.utc(useCurrentDate())
  const remainingLockedDays = maybe(currentUnlockUtcTime, currUnlockUtcTime =>
    dayjs(currUnlockUtcTime.format('YYYY-MM-DD')).diff(currentUtcDate.format('YYYY-MM-DD'), 'day', false),
  )
  const maxDays = maybe(remainingLockedDays, remainingLockedDays => VECRV_MAX_LOCK_DAYS - remainingLockedDays)
  const maxUnlockTime = calcUnlockTime({ days: maxDays, unlockTime: currentUnlockTime })
  const maxUtcDate = useMemo(() => maybe(maxUnlockTime, dayjs.utc), [maxUnlockTime])

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

  const estimateParams: ExtendLockParams = params
  const gas = useExtendLockGasEstimate(networks, estimateParams)
  const updateUnlockDate = useCallback(
    (unlockDate: DateValue) => {
      if (!currentUnlockUtcTime) return
      const utcDate = dayjs.utc(unlockDate.toString())
      update({ utcDate: toCalendarDate(utcDate), days: utcDate.diff(currentUnlockUtcTime, 'd') })
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
    values,
    currUnlockUtcTime: currentUnlockUtcTime,
    minUtcDate: currentUnlockUtcTime,
    maxUtcDate,
    isMax: maybe(maxDays, maxDays => maxDays <= MAX_LOCK_REMAINDER_DAYS),
    effectiveUnlockDateLabel: maybes(
      [values.utcDate, calcUnlockTime({ days: values.days, unlockTime: currentUnlockTime })],
      (utcDate, unlockTime) =>
        dayjs.utc(utcDate.toString()).isSame(dayjs.utc(unlockTime)) ? undefined : formatDate(unlockTime),
    ),
    gas,
    isPending,
    isDisabled: !form.formState.isValid || isPending || isDebouncing,
    error: extendError ?? gas.error,
    validationErrors: fromEntries(form.formState.visibleErrors),
    onSubmit: form.handleSubmit(onSubmitExtend),
    updateUnlockDate,
    selectQuickDate: useCallback(
      (value?: number, unit?: dayjs.ManipulateType) => {
        if (!currentUnlockTime || !currentUnlockUtcTime || !maxUtcDate) return currentUtcDate
        const targetDate = value && unit ? currentUnlockUtcTime.add(value, unit) : maxUtcDate
        const days = targetDate.diff(currentUnlockUtcTime, 'd')
        const unlockTime = calcUnlockTime({ days, unlockTime: currentUnlockTime })
        const utcDate = dayjs.utc(unlockTime)
        update({ utcDate: toCalendarDate(utcDate), days })
        return utcDate
      },
      [currentUnlockTime, currentUnlockUtcTime, currentUtcDate, maxUtcDate, update],
    ),
  }
}
