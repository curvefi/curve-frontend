import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useCreateLockMutation } from '@/dao/components/PageVeCrv/mutations/create-lock.mutation'
import { useCreateLockIsApproved } from '@/dao/components/PageVeCrv/queries/create-lock-approved.query'
import { useCreateLockGasEstimate } from '@/dao/components/PageVeCrv/queries/create-lock-estimate-gas.query'
import type { CreateLockFormValues } from '@/dao/components/PageVeCrv/queries/create-lock.types'
import { createLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/create-lock.validation'
import { calcUnlockTime } from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import { invalidateVeCrvQueries, useLockerCrv } from '@/dao/entities/locker-vecrv-info'
import { networks } from '@/dao/networks'
import { toCalendarDate } from '@/dao/utils/utilsDates'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { dayjs } from '@evm-ui/lib/dayjs'
import { VECRV_MAX_LOCK_YEARS } from '@evm-ui/utils/vecrv'
import type { DateValue } from '@internationalized/date'
import { formatDate } from '@legacy-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'

const defaultValues: CreateLockFormValues = {
  lockedAmount: undefined,
  maxLockedAmount: undefined,
  utcDate: null,
  days: 0,
}
const userDefaultValues = { lockedAmount: undefined, days: 0 }

export const useCreateLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<CreateLockFormValues>({ defaultValues, validation: createLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const { address: userAddress } = useConnection()
  const crv = useLockerCrv({ chainId, userAddress })

  useFormSync(form, { maxLockedAmount: crv.data })
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId, userAddress, lockedAmount: values.lockedAmount, days: values.days }),
      [chainId, userAddress, values.days, values.lockedAmount],
    ),
    userDefaultValues,
  )
  const isApproved = useCreateLockIsApproved(params)
  const gas = useCreateLockGasEstimate(networks, params)

  const currUtcDate = dayjs.utc(useCurrentDate())
  const minUtcDate = currUtcDate
  const maxUtcDate = currUtcDate.add(VECRV_MAX_LOCK_YEARS, 'year')

  const updateUnlockDate = useCallback(
    (unlockDate: DateValue) => {
      const utcDate = dayjs.utc(unlockDate.toString())
      update({ utcDate: toCalendarDate(utcDate), days: utcDate.diff(currUtcDate, 'd') })
    },
    [currUtcDate, update],
  )
  const selectQuickDate = useCallback(
    (value?: number, unit?: dayjs.ManipulateType) => {
      const targetDate = value && unit ? dayjs.utc().add(value, unit) : maxUtcDate
      updateUnlockDate(toCalendarDate(targetDate))
      return targetDate
    },
    [maxUtcDate, updateUnlockDate],
  )

  const {
    onSubmit: onSubmitCreate,
    error: createError,
    isPending: isCreating,
  } = useCreateLockMutation({
    chainId,
    userAddress,
    onReset: () => form.reset(defaultValues),
    onCreated: useCallback(() => invalidateVeCrvQueries({ chainId, userAddress }), [chainId, userAddress]),
  })
  const error = createError ?? isApproved.error ?? gas.error
  const isPending = isCreating
  const isDisabled = !form.formState.isValid || isPending || isDebouncing
  const onSubmit = form.handleSubmit(({ lockedAmount, utcDate, days }) => {
    if (lockedAmount == null || utcDate == null) return
    onSubmitCreate({ lockedAmount, utcDate, days })
  })

  const calculatedUnlockTime = calcUnlockTime({ days: values.days })

  return {
    form,
    values,
    currUtcDate,
    minUtcDate,
    maxUtcDate,
    dateLabel: maybes([values.utcDate, calculatedUnlockTime], (utcDate, calculatedUnlockTime) =>
      dayjs.utc(utcDate.toString()).isSame(calculatedUnlockTime) ? undefined : formatDate(calculatedUnlockTime),
    ),
    gas,
    isApproved: isApproved.data,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateAmount: (lockedAmount: Decimal | undefined) => update({ lockedAmount }),
    updateUnlockDate,
    selectQuickDate,
  }
}
