import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useConnection } from 'wagmi'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import { getTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { OnBorrowedMore, useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import { isLeverageBorrowMore } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import {
  type BorrowMoreParams,
  type BorrowMoreForm,
  borrowMoreFormValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery } from '@ui-kit/types/util'
import { type Range } from '@ui-kit/types/util'
import { type Decimal, decimal } from '@ui-kit/utils'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const useBorrowMoreParams = <ChainId>({
  userCollateral,
  userBorrowed,
  debt,
  maxDebt,
  slippage,
  leverageEnabled,
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
        maxDebt,
        slippage,
        leverageEnabled,
      }),
      [chainId, marketId, userAddress, userCollateral, userBorrowed, debt, maxDebt, slippage, leverageEnabled],
    ),
  )

const emptyBorrowMoreForm = (): BorrowMoreForm => ({
  userCollateral: undefined,
  userBorrowed: undefined,
  debt: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  maxDebt: undefined,
  leverageEnabled: false,
  slippage: SLIPPAGE_PRESETS.STABLE,
})

const useChartPricesCallback = (
  params: BorrowMoreParams,
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void,
  enabled: boolean | undefined,
) => {
  const { data } = useBorrowMorePrices(params, enabled)
  useEffect(() => onPricesUpdated(data), [onPricesUpdated, data])
  useEffect(() => () => onPricesUpdated(undefined), [onPricesUpdated]) // clear prices on unmount to avoid stale chart
}

export const useBorrowMoreForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onSuccess,
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId; name: string }
  enabled?: boolean
  onSuccess?: NonNullable<OnBorrowedMore>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
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

  useEffect(() => {
    if (!values.leverageEnabled) {
      updateForm(form, { userCollateral: undefined, userBorrowed: undefined })
    }
  }, [form, values.leverageEnabled])

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
    onSuccess,
    onReset: form.reset,
    userAddress,
  })

  useChartPricesCallback(params, onPricesUpdated, enabled)
  useCallbackAfterFormUpdate(form, resetBorrow)

  const { formState } = form
  const isPending = formState.isSubmitting || isBorrowing
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending,
    borrowToken,
    collateralToken,
    isBorrowed,
    borrowError,
    txHash: data?.hash,
    isApproved: useBorrowMoreIsApproved(params, enabled),
    formErrors: useFormErrors(formState),
    max: useMaxBorrowMoreValues({ params, form, market }, enabled),
    /** Current leverage calculated for now, but it's probably incorrect. It's in development in llamalend-js. */
    leverage: mapQuery(
      useBorrowMoreExpectedCollateral(params, isLeverageBorrowMore(market, values.leverageEnabled)),
      ({ collateralFromDebt, collateralFromUserBorrowed, userCollateral }) => {
        const base = new BigNumber(userCollateral).plus(collateralFromUserBorrowed)
        return base.isZero() ? null : decimal(new BigNumber(collateralFromDebt).plus(base).div(base).toString())
      },
    ),
  }
}
