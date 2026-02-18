import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useConnection } from 'wagmi'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getTokens, isRouterMetaRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { OnBorrowedMore, useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreHealth } from '@/llamalend/queries/borrow-more/borrow-more-health.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import {
  getBorrowMoreImplementation,
  isLeverageBorrowMore,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
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
import { decimal } from '@ui-kit/utils'
import { setValueOptions, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { type RouteOption } from '@ui-kit/widgets/RouteProvider'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const useCallbackAfterFormUpdate = (form: UseFormReturn<BorrowMoreForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

const useBorrowMoreParams = <ChainId>({
  userCollateral,
  userBorrowed,
  debt,
  maxDebt,
  slippage,
  leverageEnabled,
  route,
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
        route,
      }),
      [chainId, marketId, userAddress, userCollateral, userBorrowed, debt, maxDebt, slippage, leverageEnabled, route],
    ),
  )

const emptyBorrowMoreForm = (): BorrowMoreForm => ({
  userCollateral: undefined,
  userBorrowed: undefined,
  debt: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  maxDebt: undefined,
  route: undefined,
  leverageEnabled: false,
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
  onBorrowedMore?: NonNullable<OnBorrowedMore>
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
  const [implementation] = market ? getBorrowMoreImplementation(market, values.leverageEnabled) : []
  const routeRequired = !!implementation && isRouterMetaRequired(implementation)
  const routeAmountIn = decimal(new BigNumber(values.debt ?? 0).plus(values.userBorrowed ?? 0).toString())
  const onChangeRoute = (route: RouteOption) => form.setValue('route', route, setValueOptions)

  useEffect(() => {
    if (!values.leverageEnabled) {
      form.setValue('userCollateral', undefined, setValueOptions)
      form.setValue('userBorrowed', undefined, setValueOptions)
      form.setValue('route', undefined, setValueOptions)
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
    routes: useMarketRoutes({
      chainId,
      tokenIn: borrowToken?.address,
      tokenOut: collateralToken?.address,
      amountIn: routeAmountIn,
      slippage: values.slippage,
      selectedRoute: values.route,
      enabled: routeRequired,
      onChange: onChangeRoute,
    }),
    max: useMaxBorrowMoreValues({ params, form, market }, enabled),
    health: useBorrowMoreHealth(params, enabled && !!values.debt),
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
