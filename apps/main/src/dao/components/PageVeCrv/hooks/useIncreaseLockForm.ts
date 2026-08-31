import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useIncreaseLockMutation } from '@/dao/components/PageVeCrv/mutations/increase-lock.mutation'
import { useIncreaseLockIsApproved } from '@/dao/components/PageVeCrv/queries/increase-lock-approved.query'
import { useIncreaseLockGasEstimate } from '@/dao/components/PageVeCrv/queries/increase-lock-estimate-gas.query'
import type { IncreaseLockFormValues } from '@/dao/components/PageVeCrv/queries/increase-lock.types'
import { increaseLockFormValidationSuite } from '@/dao/components/PageVeCrv/queries/increase-lock.validation'
import { invalidateVeCrvQueries, useLockerCrv } from '@/dao/entities/locker-vecrv-info'
import { networks } from '@/dao/networks'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import type { Decimal } from '@primitives/decimal.utils'

const defaultValues: IncreaseLockFormValues = { lockedAmount: undefined, maxLockedAmount: undefined }
const userDefaultValues = { lockedAmount: undefined }

export const useIncreaseLockForm = ({ chainId }: { chainId: number }) => {
  const form = useForm<IncreaseLockFormValues>({ defaultValues, validation: increaseLockFormValidationSuite })
  const { update } = form
  const values = form.watchValues()
  const { address: userAddress } = useConnection()
  const crv = useLockerCrv({ chainId, userAddress })

  useFormSync(form, { maxLockedAmount: crv.data })
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId, userAddress, lockedAmount: values.lockedAmount }),
      [chainId, userAddress, values.lockedAmount],
    ),
    userDefaultValues,
  )
  const isApproved = useIncreaseLockIsApproved(params)
  const gas = useIncreaseLockGasEstimate(networks, params)

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

  const error = increaseError ?? isApproved.error ?? gas.error
  const isPending = isIncreasing
  const isDisabled = !form.formState.isValid || isPending || isDebouncing
  const onSubmit = form.handleSubmit(({ lockedAmount }) => {
    if (lockedAmount == null) return
    onSubmitIncrease({ lockedAmount })
  })

  return {
    form,
    values,
    gas,
    isApproved: isApproved.data,
    isPending,
    isDisabled,
    error,
    onSubmit,
    updateAmount: (lockedAmount: Decimal | undefined) => update({ lockedAmount }),
  }
}
