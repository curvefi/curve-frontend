import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { PRESET_RANGES, LoanPreset } from '../../../constants'
import { type CreateLoanOptions, useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useCreateLoanIsApproved } from '../../../queries/create-loan/create-loan-approved.query'
import { createLoanQueryValidationSuite } from '../../../queries/validation/borrow.validation'
import { useFormErrors } from '../react-form.utils'
import { type CreateLoanForm } from '../types'
import { useMaxTokenValues } from './useMaxTokenValues'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CreateLoanForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

// to crete a loan we need the debt/maxDebt, but we skip the market validation as that's given separately to the mutation
const resolver = vestResolver(createLoanQueryValidationSuite({ debtRequired: false, skipMarketValidation: true }))

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  market,
  network,
  network: { chainId },
  preset,
  onCreated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId }
  preset: LoanPreset
  onCreated: CreateLoanOptions['onCreated']
}) {
  const { address: userAddress } = useConnection()
  const form = useForm<CreateLoanForm>({
    ...formDefaultOptions,
    resolver,
    defaultValues: {
      userCollateral: undefined,
      userBorrowed: `0` satisfies Decimal,
      debt: undefined,
      leverageEnabled: false,
      slippage: SLIPPAGE_PRESETS.STABLE,
      range: PRESET_RANGES[preset],
      maxDebt: undefined,
      maxCollateral: undefined,
    },
  })

  const values = watchForm(form)
  const params = useDebouncedValue(
    useMemo(
      () => ({
        chainId,
        marketId: market?.id,
        userAddress,
        debt: values.debt,
        maxDebt: values.maxDebt,
        maxCollateral: values.maxCollateral,
        range: values.range,
        slippage: values.slippage,
        leverageEnabled: values.leverageEnabled,
        userCollateral: values.userCollateral,
        userBorrowed: values.userBorrowed,
      }),
      [
        chainId,
        market?.id,
        userAddress,
        values.debt,
        values.maxDebt,
        values.maxCollateral,
        values.range,
        values.slippage,
        values.leverageEnabled,
        values.userCollateral,
        values.userBorrowed,
      ],
    ),
  )

  const {
    onSubmit,
    isPending: isCreating,
    isSuccess: isCreated,
    error: creationError,
    data,
    reset: resetCreation,
  } = useCreateLoanMutation({ network, marketId: market?.id, onReset: form.reset, onCreated, userAddress })

  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  useCallbackAfterFormUpdate(form, resetCreation) // reset creation state on form change

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isCreating,
    onSubmit: form.handleSubmit(onSubmit),
    maxTokenValues: useMaxTokenValues(collateralToken?.address, params, form),
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash: data?.hash,
    isApproved: useCreateLoanIsApproved(params),
    formErrors: useFormErrors(form.formState),
  }
}
