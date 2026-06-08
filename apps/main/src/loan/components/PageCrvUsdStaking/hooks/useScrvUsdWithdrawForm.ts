import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useScrvUsdUserBalances } from '@/loan/entities/scrvusd-userBalances.query'
import { useScrvUsdWithdrawMutation } from '@/loan/entities/scrvusd-withdraw.mutation'
import { type ScrvUsdWithdrawForm, scrvUsdWithdrawFormValidationSuite } from '@/loan/entities/scrvusd.validation'
import type { ChainId } from '@/loan/types/loan.types'
import { maybes } from '@primitives/objects.utils'
import { useForm, useFormSync } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { mapQuery } from '@ui-kit/types/util'
import { decimalEqual } from '@ui-kit/utils'

const userDefaultValues = { withdrawAmount: undefined, userVaultShares: undefined }

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
  const withdrawAmount = form.watchValue('withdrawAmount')
  const isFull = form.watchValue('isFull')
  const userVaultShares = form.watchValue('userVaultShares')
  const maxWithdrawAmount = form.watchValue('maxWithdrawAmount')
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({
        chainId,
        userAddress,
        withdrawAmount,
        isFull,
        userVaultShares,
        maxWithdrawAmount,
      }),
      [chainId, isFull, maxWithdrawAmount, userAddress, userVaultShares, withdrawAmount],
    ),
  )
  const userBalances = useScrvUsdUserBalances({ chainId, userAddress }, !!userAddress)
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

  useFormSync(form, { maxWithdrawAmount: max.data, userVaultShares: max.data })
  useFormSync(form, { isFull: maybes([withdrawAmount, max.data], ([val, max]) => decimalEqual(val, max)) })

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
