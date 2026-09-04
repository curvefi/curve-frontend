import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import { useScrvUsdWithdrawMutation } from '@/loan/entities/scrvusd-withdraw.mutation'
import { type ScrvUsdWithdrawForm, scrvUsdWithdrawFormValidationSuite } from '@/loan/entities/scrvusd.validation'
import type { ChainId } from '@/loan/types/loan.types'
import { useForm, useFormSync } from '@evm-ui/features/forms'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { decimalEqual } from '@evm-ui/utils'
import { maybes } from '@primitives/objects.utils'
import { mapQuery } from '@ui/features/queries/util'

const userDefaultValues = { withdrawAmount: undefined }

const emptyWithdrawForm = (): ScrvUsdWithdrawForm => ({
  ...userDefaultValues,
  isFull: undefined,
  maxWithdrawAmount: undefined,
})

export const useScrvUsdWithdrawForm = ({ chainId }: { chainId: ChainId }) => {
  const { address: userAddress } = useConnection()
  const form = useForm<ScrvUsdWithdrawForm>({
    defaultValues: emptyWithdrawForm(),
    validation: scrvUsdWithdrawFormValidationSuite,
  })
  const { maxWithdrawAmount, withdrawAmount, isFull } = form.watchValues()
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({ chainId, userAddress, maxWithdrawAmount, withdrawAmount, isFull }),
      [chainId, userAddress, maxWithdrawAmount, withdrawAmount, isFull],
    ),
    userDefaultValues,
  )
  const userBalances = useScrvUsdUserBalances({ chainId, userAddress })
  const {
    onSubmit: onMutationSubmit,
    isPending,
    error,
  } = useScrvUsdWithdrawMutation({
    chainId,
    userAddress,
    onReset: () => form.reset(userDefaultValues),
  })
  const max = { ...mapQuery(userBalances, ({ scrvUSD }) => scrvUSD), fieldName: 'maxWithdrawAmount' as const }

  useFormSync(form, { maxWithdrawAmount: max.data })
  useFormSync(form, { isFull: maybes([withdrawAmount, max.data], (val, max) => decimalEqual(val, max)) })

  return {
    form,
    params,
    isPending,
    isDisabled: !userAddress || !form.formState.isValid || isPending || isDebouncing,
    error,
    formErrors: form.formState.visibleErrors,
    max,
    positionBalance: mapQuery(userBalances, ({ scrvUSD }) => scrvUSD),
    onSubmit: form.handleSubmit(onMutationSubmit),
  }
}
