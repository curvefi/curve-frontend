import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useWagmiConnection } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { BORROW_PRESET_RANGES, BorrowPreset } from '../../../constants'
import { type CreateLoanOptions, useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useBorrowCreateLoanIsApproved } from '../../../queries/create-loan/borrow-create-loan-approved.query'
import { borrowFormValidationSuite } from '../../../queries/validation/borrow.validation'
import { useFormErrors } from '../react-form.utils'
import { type BorrowForm } from '../types'
import { useMaxTokenValues } from './useMaxTokenValues'

const useCallbackAfterFormUpdate = (form: UseFormReturn<BorrowForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  market,
  network,
  network: { chainId },
  preset,
  onCreated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId }
  preset: BorrowPreset
  onCreated: CreateLoanOptions['onCreated']
}) {
  const { address: userAddress } = useWagmiConnection()
  const form = useForm<BorrowForm>({
    ...formDefaultOptions,
    // todo: also validate maxLeverage and maxCollateral
    resolver: vestResolver(borrowFormValidationSuite),
    defaultValues: {
      userCollateral: undefined,
      userBorrowed: `0` satisfies Decimal,
      debt: undefined,
      leverageEnabled: false,
      slippage: SLIPPAGE_PRESETS.STABLE,
      range: BORROW_PRESET_RANGES[preset],
      maxDebt: undefined,
      maxCollateral: undefined,
    },
  })
  const values = form.watch()
  const params = useDebouncedValue(
    useMemo(
      () => ({ chainId, marketId: market?.id, userAddress, ...values }),
      [chainId, market?.id, userAddress, values],
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

  const { borrowToken, collateralToken } = useMemo(() => market && getTokens(market), [market]) ?? {}

  useCallbackAfterFormUpdate(form, resetCreation) // reset creation state on form change

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isCreating,
    onSubmit: form.handleSubmit(onSubmit), // todo: handle form errors
    maxTokenValues: useMaxTokenValues(collateralToken, params, form),
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash: data?.hash,
    isApproved: useBorrowCreateLoanIsApproved(params),
    tooMuchDebt: !!form.formState.errors['maxDebt'],
    formErrors: useFormErrors(form.formState),
  }
}
