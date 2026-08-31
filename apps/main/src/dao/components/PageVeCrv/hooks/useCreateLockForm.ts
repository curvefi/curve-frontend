import { useCallback, useMemo } from 'react'
import { useCreateLockMutation } from '@/dao/components/PageVeCrv/mutations/create-lock.mutation'
import { useCreateLockIsApproved } from '@/dao/components/PageVeCrv/queries/create-lock-approved.query'
import { useCreateLockGasEstimate } from '@/dao/components/PageVeCrv/queries/create-lock-estimate-gas.query'
import type { CreateLockFormValues } from '@/dao/components/PageVeCrv/queries/create-lock.types'
import { createLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/create-lock.validation'
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
import { decimal } from '@evm-ui/utils'
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

export const useCreateLockForm = ({ curve, vecrvInfo }: { curve: CurveApi | null; vecrvInfo: VecrvInfo }) => {
  const form = useForm<CreateLockFormValues>({ defaultValues, validation: createLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()

  const crvBalance = decimal(vecrvInfo.crv)
  useFormSync(form, { maxLockedAmount: crvBalance })
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({
        chainId: curve?.chainId,
        userAddress: curve?.signerAddress,
        lockedAmount: values.lockedAmount,
        days: values.days,
      }),
      [curve?.chainId, curve?.signerAddress, values.days, values.lockedAmount],
    ),
    userDefaultValues,
  )
  const isApproved = useCreateLockIsApproved(params)
  const gas = useCreateLockGasEstimate(networks, params)

  const invalidate = useCallback(async (currentCurve: CurveApi) => {
    await Promise.all([
      invalidateLockerVecrvInfo({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
      invalidateLockerVecrvUser({ chainId: currentCurve.chainId, userAddress: currentCurve.signerAddress }),
    ])
  }, [])

  const currUtcDate = dayjs.utc(useCurrentDate())
  const minUtcDate = currUtcDate
  const maxUtcDate = currUtcDate.add(VECRV_MAX_LOCK_YEARS, 'year')

  const updateUnlockDate = useCallback(
    (unlockDate: DateValue) => {
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
    onReset: () => form.reset(defaultValues),
    onCreated: async () => curve && invalidate(curve),
  })
  const error = createError ?? isApproved.error ?? gas.error
  const isPending = isCreating
  const isDisabled = !form.formState.isValid || isPending || isDebouncing
  const onSubmit = form.handleSubmit(({ lockedAmount, utcDate, days }) => {
    if (lockedAmount == null || utcDate == null) return
    onSubmitCreate({ lockedAmount, utcDate, days })
  })

  return {
    form,
    values,
    currUtcDate,
    minUtcDate,
    maxUtcDate,
    dateLabel: maybes(
      [
        values.utcDate,
        useMemo(
          () => (curve && values.days > 0 ? dayjs.utc(curve.boosting.calcUnlockTime(values.days)) : null),
          [curve, values.days],
        ),
      ],
      (utcDate, calculatedUtcDate) =>
        dayjs.utc(utcDate.toString()).isSame(calculatedUtcDate) ? undefined : formatDate(calculatedUtcDate.valueOf()),
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
