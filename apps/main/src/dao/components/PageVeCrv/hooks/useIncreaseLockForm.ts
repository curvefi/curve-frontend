import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useIncreaseLockMutation } from '@/dao/components/PageVeCrv/mutations/increase-lock.mutation'
import { useIncreaseLockIsApproved } from '@/dao/components/PageVeCrv/queries/increase-lock-approved.query'
import type { IncreaseLockFormValues } from '@/dao/components/PageVeCrv/queries/increase-lock.types'
import { increaseLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/increase-lock.validation'
import {
  invalidateVeCrvQueries,
  useLockerCrv,
  useLockerLockedAmountAndUnlockTime,
  useLockerVeCrv,
} from '@/dao/entities/locker-vecrv-info'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { MILLISECONDS_PER_SECOND, decimalSum } from '@evm-ui/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybes } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'
import { calculateVeCrv } from '../utils/vecrv-calculations'

const defaultValues: IncreaseLockFormValues = { lockedAmount: undefined, maxLockedAmount: undefined }
const userDefaultValues = { lockedAmount: undefined }

export const useIncreaseLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<IncreaseLockFormValues>({ defaultValues, validation: increaseLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const { address: userAddress } = useConnection()
  const crv = useLockerCrv({ chainId, userAddress })
  const currentLock = useLockerLockedAmountAndUnlockTime({ chainId, userAddress })
  const currentVeCrv = useLockerVeCrv({ chainId, userAddress })

  useFormSync(form, { maxLockedAmount: crv.data })
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId, userAddress, lockedAmount: values.lockedAmount }),
      [chainId, userAddress, values.lockedAmount],
    ),
    userDefaultValues,
  )
  const isApproved = useIncreaseLockIsApproved(params)

  const {
    onSubmit: onSubmitIncrease,
    error: increaseError,
    isPending: isIncreasing,
  } = useIncreaseLockMutation({
    chainId,
    userAddress,
    onReset: () => form.reset(defaultValues),
    onIncreased: useCallback(
      async () => await invalidateVeCrvQueries({ chainId, userAddress }),
      [chainId, userAddress],
    ),
  })

  const error = increaseError ?? isApproved.error
  const isPending = isIncreasing
  const isDisabled = !form.formState.isValid || isPending || isDebouncing

  return {
    form,
    params,
    values,
    currentVeCrv,
    futureVeCrv: mapQuery(currentLock, ({ lockedAmount, unlockTime }) =>
      calculateVeCrv({
        lockedAmount: maybes([values.lockedAmount, lockedAmount], decimalSum),
        unlockTime: Math.floor(unlockTime / MILLISECONDS_PER_SECOND),
      }),
    ),
    isApproved: isApproved.data,
    isPending,
    isDisabled,
    error,
    onSubmit: form.handleSubmit(onSubmitIncrease),
    updateAmount: (lockedAmount: Decimal | undefined) => update({ lockedAmount }),
  }
}
