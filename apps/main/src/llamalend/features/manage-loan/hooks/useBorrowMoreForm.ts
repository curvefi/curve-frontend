import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useConnection } from 'wagmi'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getTokens, isRouterRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreFutureLeverage } from '@/llamalend/queries/borrow-more/borrow-more-future-leverage.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import {
  getBorrowMoreImplementation,
  isLeverageBorrowMore,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { invalidateOrRefetchBorrowMoreRouteQueries } from '@/llamalend/queries/borrow-more/borrow-more-route-invalidation'
import {
  type BorrowMoreForm,
  borrowMoreFormValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import type { RouteResponse } from '@primitives/router.utils'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery, q, type QueryProp, type Range } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { updateForm, useCallbackSync, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { isPriceImpactTooHigh } from '@ui-kit/widgets/DetailPageLayout/FormAlerts'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const useBorrowMoreParams = <ChainId>({
  userCollateral,
  userBorrowed,
  debt,
  maxDebt,
  slippage,
  leverageEnabled,
  routeId,
  chainId,
  marketId,
  userAddress,
}: BorrowMoreForm & {
  chainId: ChainId
  marketId: string | undefined
  userAddress: Address | undefined
}) =>
  useFormDebounce(
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
        routeId,
      }),
      [chainId, marketId, userAddress, userCollateral, userBorrowed, debt, maxDebt, slippage, leverageEnabled, routeId],
    ),
  )

const emptyBorrowMoreForm = (): BorrowMoreForm => ({
  userCollateral: undefined,
  userBorrowed: undefined,
  debt: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  maxDebt: undefined,
  routeId: undefined,
  leverageEnabled: undefined,
  slippage: SLIPPAGE_PRESETS.STABLE,
})

/** Checks if we need a route for borrowing more */
const isRouteRequired = (market: LlamaMarketTemplate | undefined, leverageEnabled: boolean | undefined) => {
  const [implementation] = market ? getBorrowMoreImplementation(market, leverageEnabled) : []
  return !!implementation && isRouterRequired(implementation)
}

export const useBorrowMoreForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onPricesUpdated,
  collateralEvents,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId; name: string }
  enabled: boolean
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
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
  const [params, isDebouncing] = useBorrowMoreParams({ chainId, marketId, userAddress, ...values })
  const {
    onSubmit,
    isPending: isBorrowing,
    error: borrowError,
  } = useBorrowMoreMutation({
    network,
    marketId,
    onReset: form.reset,
    userAddress,
  })

  useCallbackSync(useBorrowMorePrices(params, enabled), onPricesUpdated)

  const isLeverageEnabled = isLeverageBorrowMore(market, values.leverageEnabled)
  const priceImpact = q(useBorrowMorePriceImpact(params, enabled && isLeverageEnabled))
  const { formState } = form
  const isPending = formState.isSubmitting || isBorrowing
  return {
    form,
    values,
    params,
    isPending,
    onSubmit: form.handleSubmit(onSubmit),
    isDisabled: !formState.isValid || isPending || isDebouncing || isPriceImpactTooHigh(priceImpact, params),
    borrowToken,
    collateralToken,
    borrowError,
    isApproved: useBorrowMoreIsApproved(params, enabled),
    priceImpact,
    formErrors: useFormErrors(formState),
    routes: useMarketRoutes({
      chainId,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: decimalSum(params.debt, params.userBorrowed),
      ...pick(params, 'slippage', 'routeId'),
      enabled: isRouteRequired(market, values.leverageEnabled),
      onChange: async (route: RouteResponse | undefined) => {
        updateForm(form, { routeId: route?.id })
        await invalidateOrRefetchBorrowMoreRouteQueries(route, { ...params, routeId: route?.id })
      },
    }),
    max: useMaxBorrowMoreValues({ params, form, market, collateralEvents }, enabled),
    isLeverageEnabled,
    leverage: mapQuery(
      useBorrowMoreFutureLeverage(params, isLeverageBorrowMore(market, values.leverageEnabled)),
      (value) => value,
    ),
  }
}
