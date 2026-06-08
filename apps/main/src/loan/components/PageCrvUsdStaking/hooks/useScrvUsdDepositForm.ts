import { useCallback, useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useScrvUsdDepositIsApproved } from '@/loan/entities/scrvusd-deposit-is-approved.query'
import { useScrvUsdDepositMutation } from '@/loan/entities/scrvusd-deposit.mutation'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import { type ScrvUsdDepositForm, scrvUsdDepositFormValidationSuite } from '@/loan/entities/scrvusd.validation'
import { type ChainId } from '@/loan/types/loan.types'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { mapQuery } from '@ui-kit/types/util'

const userDefaultValues = { depositAmount: undefined, approveInfinite: false }

const emptyDepositForm = (): ScrvUsdDepositForm => ({ ...userDefaultValues, maxDepositAmount: undefined })

export const useScrvUsdDepositForm = ({ chainId }: { chainId: ChainId }) => {
  const { address: userAddress } = useConnection()
  const form = useForm<ScrvUsdDepositForm>({
    defaultValues: emptyDepositForm(),
    validation: scrvUsdDepositFormValidationSuite,
  })
  const depositAmount = form.watchValue('depositAmount')
  const approveInfinite = !!form.watchValue('approveInfinite')
  const [params, isDebouncing] = useFormDebounce(
    useMemo(() => ({ chainId, userAddress, depositAmount }), [chainId, depositAmount, userAddress]),
  )
  const userBalances = useScrvUsdUserBalances({ chainId, userAddress }, !!userAddress)
  const isApproved = useScrvUsdDepositIsApproved(params, !!userAddress && form.formState.isValid)
  const {
    onSubmit: onMutationSubmit,
    isPending,
    error,
  } = useScrvUsdDepositMutation({
    chainId,
    userAddress,
    onReset: () => form.reset(userDefaultValues),
  })

  const max = { ...mapQuery(userBalances, ({ crvUSD }) => crvUSD), fieldName: 'maxDepositAmount' as const }
  useFormSync(form, { maxDepositAmount: max.data })

  return {
    form,
    params,
    approveInfinite,
    isApproved,
    isPending,
    isDisabled: !userAddress || !form.formState.isValid || isPending || isDebouncing || isApproved.isLoading,
    error,
    formErrors: form.formState.visibleErrors,
    max,
    onApproveInfiniteToggle: useCallback(
      () => form.update({ approveInfinite: !approveInfinite }),
      [approveInfinite, form],
    ),
    onSubmit: form.handleSubmit(onMutationSubmit),
  }
}
