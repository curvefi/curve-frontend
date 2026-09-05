import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useCreateLockMutation } from '@/dao/components/PageVeCrv/mutations/create-lock.mutation'
import { useCreateLockIsApproved } from '@/dao/components/PageVeCrv/queries/create-lock-approved.query'
import type { CreateLockFormValues } from '@/dao/components/PageVeCrv/queries/create-lock.types'
import { createLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/create-lock.validation'
import {
  calcUnlockTime,
  calculateVeCrv,
  getCreateLockDates,
  getCreateQuickDateUpdate,
  getDateValueTimestamp,
  getEffectiveUnlockDateLabel,
  getUnlockDateUpdate,
} from '@/dao/components/PageVeCrv/utils/vecrv-calculations'
import { invalidateVeCrvQueries, useLockerCrv } from '@/dao/entities/locker-vecrv-info'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { dayjs } from '@evm-ui/lib/dayjs'
import type { DateValue } from '@internationalized/date'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { constQ } from '@ui/features/queries/util'

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
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId, userAddress, lockedAmount: values.lockedAmount, days: values.days }),
      [chainId, userAddress, values.days, values.lockedAmount],
    ),
    userDefaultValues,
  )
  const isApproved = useCreateLockIsApproved(params)
  useFormSync(form, { maxLockedAmount: crv.data })

  const { currentUtcDate, currentUtcDay, minUtcDate, maxUtcDate } = getCreateLockDates(useCurrentDate())

  const updateUnlockDate = useCallback(
    (unlockDate: DateValue) => {
      update(getUnlockDateUpdate(unlockDate, currentUtcDay))
    },
    [currentUtcDay, update],
  )

  const {
    onSubmit: onSubmitCreate,
    error: createError,
    isPending,
  } = useCreateLockMutation({
    chainId,
    userAddress,
    onReset: () => form.reset(defaultValues),
    onCreated: () => invalidateVeCrvQueries({ chainId, userAddress }),
  })

  return {
    form,
    params,
    values,
    currentUtcDate,
    minUtcDate,
    maxUtcDate,
    futureVeCrv: constQ(
      calculateVeCrv({
        lockedAmount: values.lockedAmount,
        unlockTime: maybe(values.utcDate, getDateValueTimestamp),
      }),
    ),
    effectiveUnlockDateLabel: getEffectiveUnlockDateLabel({
      selectedDate: values.utcDate,
      unlockTime: calcUnlockTime({ days: values.days, unlockTime: undefined }),
    }),
    isApproved: isApproved.data,
    isPending,
    isDisabled: !form.formState.isValid || isPending || isDebouncing,
    userAddress,
    error: createError ?? isApproved.error,
    onSubmit: form.handleSubmit(onSubmitCreate),
    updateAmount: (lockedAmount: Decimal | undefined) => update({ lockedAmount }),
    updateUnlockDate,
    selectQuickDate: useCallback(
      (value: number | undefined, unit: dayjs.ManipulateType | undefined) => {
        const { utcDate, quickActionValue, days } = getCreateQuickDateUpdate({
          currentUtcDay,
          maxUtcDate,
          value,
          unit,
        })
        update({ utcDate, days })
        return quickActionValue
      },
      [currentUtcDay, maxUtcDate, update],
    ),
  }
}
