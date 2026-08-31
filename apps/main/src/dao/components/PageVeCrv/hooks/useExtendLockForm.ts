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
import { maybe, maybes } from '@primitives/objects.utils'

const defaultValues: ExtendLockFormValues = { utcDate: null, days: 0, minUnlockDate: null, maxUnlockDate: null }
const userDefaultValues = { days: 0 }
const MAX_LOCK_REMAINDER_DAYS = 7

export const useExtendLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<ExtendLockFormValues>({ defaultValues, validation: extendLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const { address: userAddress } = useConnection()
  const lockedAmountAndUnlockTime = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })

  const currUnlockTime = lockedAmountAndUnlockTime.data?.unlockTime
  const currUnlockUtcTime = maybe(currUnlockTime, dayjs.utc) ?? null
  const currentUtcDate = dayjs.utc(useCurrentDate())
  const remainingLockedDays = maybe(currUnlockUtcTime, currUnlockUtcTime =>
    dayjs(currUnlockUtcTime.format('YYYY-MM-DD')).diff(currentUtcDate.format('YYYY-MM-DD'), 'day', false),
  )
  const maxDays = maybe(remainingLockedDays, remainingLockedDays => VECRV_MAX_LOCK_DAYS - remainingLockedDays)
  const maxUnlockTime = calcUnlockTime({ days: maxDays, unlockTime: currUnlockTime })
  const maxUtcDate = useMemo(() => (maxUnlockTime ? dayjs.utc(maxUnlockTime) : null), [maxUnlockTime])

  useFormSync(
    form,
    useMemo(
      () => ({
        minUnlockDate: maybe(currUnlockTime, unlockTime => toCalendarDate(dayjs.utc(unlockTime))),
        maxUnlockDate: maybe(maxUtcDate, toCalendarDate),
      }),
      [currUnlockTime, maxUtcDate],
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
      if (!currUnlockUtcTime) return
      const utcDate = dayjs.utc(unlockDate.toString())
      update({ utcDate: toCalendarDate(utcDate), days: utcDate.diff(currUnlockUtcTime, 'd') })
    },
    [currUnlockUtcTime, update],
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
    currUnlockUtcTime,
    minUtcDate: currUnlockUtcTime,
    maxUtcDate,
    isMax: maybe(maxDays, maxDays => maxDays <= MAX_LOCK_REMAINDER_DAYS),
    effectiveUnlockDateLabel: maybes(
      [values.utcDate, calcUnlockTime({ days: values.days, unlockTime: currUnlockTime })],
      (utcDate, unlockTime) =>
        dayjs.utc(utcDate.toString()).isSame(dayjs.utc(unlockTime)) ? undefined : formatDate(unlockTime),
    ),
    gas,
    isPending,
    isDisabled: !form.formState.isValid || isPending || isDebouncing,
    error: extendError ?? gas.error,
    onSubmit: form.handleSubmit(onSubmitExtend),
    updateUnlockDate,
    selectQuickDate: useCallback(
      (value?: number, unit?: dayjs.ManipulateType) => {
        if (!currUnlockTime || !currUnlockUtcTime || !maxUtcDate) return currentUtcDate
        const targetDate = value && unit ? currUnlockUtcTime.add(value, unit) : maxUtcDate
        const days = targetDate.diff(currUnlockUtcTime, 'd')
        const unlockTime = calcUnlockTime({ days, unlockTime: currUnlockTime })
        const utcDate = dayjs.utc(unlockTime)
        update({ utcDate: toCalendarDate(utcDate), days })
        return utcDate
      },
      [currUnlockTime, currUnlockUtcTime, currentUtcDate, maxUtcDate, update],
    ),
  }
}
