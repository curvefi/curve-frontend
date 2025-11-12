import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import type { INetworkName } from '@curvefi/llamalend-api/lib/interfaces'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { notFalsy, recordEntries } from '@curvefi/prices-api/objects.util'
import { vestResolver } from '@hookform/resolvers/vest'
import type { BaseConfig } from '@ui/utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { BORROW_PRESET_RANGES } from './constants'
import { useMaxTokenValues } from './hooks/useMaxTokenValues'
import { borrowFormValidationSuite } from './queries/borrow.validation'
import { type CreateLoanOptions, useCreateLoanMutation } from './queries/create-loan.mutation'
import { type BorrowForm, BorrowPreset } from './types'

const useCallbackAfterFormUpdate = (form: UseFormReturn<BorrowForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

export function useBorrowForm<ChainId extends IChainId>({
  market,
  network,
  network: { id: chain, chainId },
  preset,
  onCreated,
}: {
  market: LlamaMarketTemplate | undefined
  network: BaseConfig<INetworkName, ChainId>
  preset: BorrowPreset
  onCreated: CreateLoanOptions['onCreated']
}) {
  const { address: userAddress } = useAccount()
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
      () => ({ chainId, poolId: market?.id, userAddress, ...values }),
      [chainId, market?.id, userAddress, values],
    ),
  )

  const {
    onSubmit,
    isPending: isCreating,
    isSuccess: isCreated,
    error: creationError,
    txHash,
    reset: resetCreation,
  } = useCreateLoanMutation({ network, poolId: market?.id, reset: form.reset, onCreated })

  const { borrowToken, collateralToken } = useMemo(() => market && getTokens(market, chain), [market, chain]) ?? {}

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
    txHash,
    tooMuchDebt: !!form.formState.errors['maxDebt'],
    formErrors: useMemo(
      () =>
        notFalsy(
          ...recordEntries(form.formState.errors)
            .filter(([field, error]) => field in form.formState.dirtyFields && error?.message)
            .map(([field, error]) => [field, error!.message!] as const),
        ),
      [form.formState],
    ),
  }
}
