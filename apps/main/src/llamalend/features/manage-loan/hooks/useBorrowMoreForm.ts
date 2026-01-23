import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useConnection } from 'wagmi'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type BorrowMoreOptions, useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import {
  type BorrowMoreParams,
  type BorrowMoreForm,
  borrowMoreFormValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { useFormErrors } from '@ui-kit/utils/react-form.utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<BorrowMoreForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const useBorrowMoreParams = <ChainId>({
  userCollateral,
  userBorrowed,
  debt,
  slippage,
  chainId,
  marketId,
  userAddress,
}: BorrowMoreForm & {
  chainId: ChainId
  marketId: string | undefined
  userAddress: Address | undefined
}): BorrowMoreParams<ChainId> =>
  useDebouncedValue(
    useMemo(
      () => ({
        chainId,
        marketId,
        userAddress,
        userCollateral,
        userBorrowed,
        debt,
        slippage,
      }),
      [chainId, marketId, userAddress, userCollateral, userBorrowed, debt, slippage],
    ),
  )

const emptyBorrowMoreForm = (): BorrowMoreForm => ({
  userCollateral: undefined,
  userBorrowed: undefined,
  debt: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  maxDebt: undefined,
  slippage: SLIPPAGE_PRESETS.STABLE,
})

export const useBorrowMoreForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onBorrowedMore,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId; name: string }
  enabled?: boolean
  onBorrowedMore?: NonNullable<BorrowMoreOptions['onBorrowedMore']>
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const form = useForm<BorrowMoreForm>({
    ...formDefaultOptions,
    resolver: vestResolver(borrowMoreFormValidationSuite),
    defaultValues: emptyBorrowMoreForm(),
  })

  const values = watchForm(form)
  const params = useBorrowMoreParams({ chainId, marketId, userAddress, ...values })

  const {
    onSubmit,
    isPending: isBorrowing,
    isSuccess: isBorrowed,
    error: borrowError,
    data,
    reset: resetBorrow,
  } = useBorrowMoreMutation({
    network,
    marketId,
    onBorrowedMore,
    onReset: form.reset,
    userAddress,
  })

  useCallbackAfterFormUpdate(form, resetBorrow)

  const formErrors = useFormErrors(form.formState)
  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isBorrowing,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: formErrors.length > 0,
    borrowToken,
    collateralToken,
    isBorrowed,
    borrowError,
    txHash: data?.hash,
    isApproved: useBorrowMoreIsApproved(params, enabled),
    formErrors,
    max: useMaxBorrowMoreValues({ collateralToken, borrowToken, params, form }, enabled),
    health: useBorrowMoreHealth(params, enabled && !!values.debt),
  }
}
