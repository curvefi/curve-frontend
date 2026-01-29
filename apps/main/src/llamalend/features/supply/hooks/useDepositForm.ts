import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, LlamaNetwork } from '@/llamalend/llamalend.types'
import { type DepositOptions, useDepositMutation } from '@/llamalend/mutations/deposit.mutation'
import { useDepositIsApproved } from '@/llamalend/queries/supply/supply-deposit-approved.query'
import { useDepositMax } from '@/llamalend/queries/supply/supply-max-deposit.query'
import {
  depositFormValidationSuite,
  DepositParams,
  type DepositForm,
} from '@/llamalend/queries/validation/supply.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { useFormErrors } from '@ui-kit/utils/react-form.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<DepositForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const emptyDepositForm = (): DepositForm => ({
  depositAmount: undefined,
  maxDepositAmount: undefined,
})

export const useDepositForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onDeposited,
}: {
  market: LlamaMarketTemplate | undefined
  network: LlamaNetwork<ChainId>
  enabled?: boolean
  onDeposited?: NonNullable<DepositOptions['onDeposited']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken } = market ? getTokens(market) : {}

  // Maximum amount a user can deposit
  const maxDeposit = useDepositMax({ chainId, marketId }, enabled)

  const form = useForm<DepositForm>({
    ...formDefaultOptions,
    resolver: vestResolver(depositFormValidationSuite),
    defaultValues: emptyDepositForm(),
  })

  const values = watchForm(form)

  const params = useDebouncedValue(
    useMemo(
      (): DepositParams<ChainId> => ({
        chainId,
        marketId,
        userAddress,
        depositAmount: values.depositAmount,
      }),
      [chainId, marketId, userAddress, values.depositAmount],
    ),
  )

  const {
    onSubmit,
    isPending: isDepositing,
    isSuccess: isDeposited,
    error: depositError,
    data,
    reset: resetDeposit,
  } = useDepositMutation({
    marketId,
    network,
    onDeposited,
    onReset: form.reset,
    userAddress,
  })

  const formErrors = useFormErrors(form.formState)

  useCallbackAfterFormUpdate(form, resetDeposit)

  useEffect(() => {
    form.setValue('maxDepositAmount', maxDeposit.data, { shouldValidate: true })
  }, [form, maxDeposit.data])

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isDepositing,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: formErrors.length > 0,
    borrowToken,
    isDeposited,
    depositError,
    txHash: data?.hash,
    max: maxDeposit,
    isApproved: useDepositIsApproved(params, enabled),
    formErrors,
  }
}
