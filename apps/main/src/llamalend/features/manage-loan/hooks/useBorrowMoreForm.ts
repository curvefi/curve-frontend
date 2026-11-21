import { useEffect, useMemo } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import type { UserBorrowEvents } from '@/llamalend/features/user-position-history/hooks/useUserBorrowEvents'
import { useBorrowMoreEquityLeverage } from '@/llamalend/hooks/useEquityLeverage'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import {
  canLeverageUserBorrowed,
  getMarketLeverageSlippage,
  hasZapV2,
  isPositionLeveraged,
  isRouterRequired,
} from '@/llamalend/llama.utils'
import type { MarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreControllerApproval } from '@/llamalend/queries/borrow-more/borrow-more-controller-approval.query'
import {
  resetBorrowMoreExpectedCollateral,
  useBorrowMoreExpectedCollateral,
} from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
import { useBorrowMoreLeverage } from '@/llamalend/queries/borrow-more/borrow-more-future-leverage.query'
import { getBorrowMoreGasEstimateQueryOptions } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import {
  getBorrowMoreImplementation,
  isLeverageBorrowMore,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { invalidateBorrowMoreRouteQueries } from '@/llamalend/queries/borrow-more/borrow-more-route-invalidation'
import {
  type BorrowMoreFormValues,
  borrowMoreFormValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import { useControllerDelegationAction } from '@/llamalend/widgets/action-card/hooks/useControllerDelegationAction'
import { useLowSolvencyAction } from '@/llamalend/widgets/action-card/hooks/useLowSolvencyAction'
import { marketFormActions } from '@/llamalend/widgets/action-card/marketFormActions'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { RouteResponse } from '@evm-ui/queries/router-api/types'
import type { Decimal } from '@primitives/decimal.utils'
import { type Nullish, maybe, pick } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { useCallbackSync, useFormSync, useOnChangeCallback } from '@ui/features/forms'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { futureOrCurrentQ, mapQuery, q, type QueryProp, type Range } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'
import { IS_DEVELOPMENT } from '@ui/lib/env'
import { useMarketContext } from '../../market-context'

const userDefaultValues = {
  userCollateral: undefined,
  userBorrowed: undefined,
  debt: undefined,
  routeId: undefined,
} satisfies Partial<BorrowMoreFormValues>

/** Checks if we need a route for borrowing more */
const isRouteRequired = (market: MarketTemplate | Nullish, leverageEnabled: boolean | undefined) => {
  const [implementation] = market ? getBorrowMoreImplementation(market, leverageEnabled) : []
  return !!implementation && isRouterRequired(implementation)
}

const isLeverageBorrowMoreSupported = (
  market: MarketTemplate | Nullish,
  leverageProviders: readonly RouteProvider[] | undefined,
) => maybe(leverageProviders, providers => hasZapV2(market) && providers.length > 0)

export const useBorrowMoreForm = <ChainId extends LlamaChainId>({
  networks,
  onPricesUpdated,
  collateralEvents,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserBorrowEvents>
}) => {
  const {
    chainId,
    market,
    marketId,
    ammAddress,
    zapAddress,
    controllerAddress,
    tokens,
    marketType,
    userAddress,
    leverageProviders,
  } = useMarketContext<ChainId>()
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)
  const lowSolvency = useLowSolvencyAction({ controllerAddress, marketType, chainId })
  const disabledAlert = (marketAlert?.isBorrowDisabled ? marketAlert : undefined) ?? lowSolvency.disabledAlert
  const defaultSlippage = getMarketLeverageSlippage(chainId, controllerAddress)

  const { borrowToken, collateralToken } = tokens

  const inputs = useFormValues<
    BorrowMoreFormValues,
    UserMarketParams<ChainId> & {
      leverageProviders: readonly RouteProvider[] | undefined
      slippageType: typeof LEVERAGE
    }
  >({
    defaultValues: { ...userDefaultValues, leverageEnabled: undefined, slippage: defaultSlippage },
    context: { chainId, marketId, userAddress, leverageProviders, slippageType: LEVERAGE },
  })
  const max = useMaxBorrowMoreValues({
    params: inputs.params,
    borrowTokenAddress: borrowToken?.address,
    collateralTokenAddress: collateralToken?.address,
  })

  const {
    onSubmit: borrowMore,
    isPending,
    error: borrowError,
  } = useBorrowMoreMutation({
    network: networks[chainId],
    marketId,
    onReset: () => inputs.reset(userDefaultValues),
    userAddress,
    leverageProviders,
  })

  const form = useFormValidation({
    inputs,
    validation: useMemo(() => borrowMoreFormValidationSuite(market), [market]),
    computed: {
      maxCollateral: max.userCollateral,
      maxBorrowed: max.userBorrowed,
      maxDebt: mapQuery(max.debt, ({ maxDebt }) => maxDebt),
    },
    isSubmitting: isPending,
    disabled: !!disabledAlert,
  })
  const { values, params, formState, update: updateForm } = form

  // some borrow queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetBorrowMoreExpectedCollateral(params))
  useFormSync(form, { slippage: defaultSlippage }, !form.isTouched('slippage'))

  const isEquityLeverage = useLlamalendEquityLeverage()
  const positionLeverageEnabled = maybe(
    leverageProviders,
    providers =>
      providers.length > 0 &&
      maybe(collateralEvents.data, events =>
        isEquityLeverage ? !!events.isZapLeveraged : isPositionLeveraged(events.originalLeverage),
      ),
  )
  // Apply history changes without overwriting the user's leverage choice on form reset.
  useEffect(
    () => updateForm({ leverageEnabled: positionLeverageEnabled }, { mode: 'automatic' }),
    [positionLeverageEnabled, updateForm],
  )

  const isControllerApproved = useBorrowMoreControllerApproval({
    chainId,
    marketId,
    userAddress,
    leverageEnabled: values.leverageEnabled,
  })

  const { onSubmit, solvencyModal, delegationModal, ...formActions } = marketFormActions({
    handleSubmit: form.handleSubmit,
    lowSolvency,
    delegation: useControllerDelegationAction({ chainId, userAddress, marketId, approval: q(isControllerApproved) }),
    onConfirmed: borrowMore,
  })

  useCallbackSync(useBorrowMorePrices(params), onPricesUpdated)

  const isLeverageEnabled = isLeverageBorrowMore(market, values.leverageEnabled)
  const expectedCollateral = useBorrowMoreExpectedCollateral(params, values.leverageEnabled)
  const collateralLeverage = useBorrowMoreLeverage(params)
  const equityLeverage = useBorrowMoreEquityLeverage(params)
  return {
    form,
    values,
    params,
    isPending,
    isLoading: !market || form.isLoading || formActions.isLoading,
    onSubmit,
    userAddress,
    borrowToken,
    collateralToken,
    error: formActions.error ?? borrowError ?? form.error,
    isApproved: q(useBorrowMoreIsApproved(params)),
    isControllerApproved: q(isControllerApproved),
    delegationModal,
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal,
    priceImpact: q(useBorrowMorePriceImpact(params, !zapAddress)), // overridden by useMarketRoutes when zapv2 is enabled
    ...useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      controllerAddress,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: decimalSum(params.debt, params.userBorrowed),
      ...pick(params, 'slippage'),
      enabled: isRouteRequired(market, params.leverageEnabled),
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id }, { mode: 'immediate' })
        await invalidateBorrowMoreRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) =>
        getBorrowMoreGasEstimateQueryOptions({ ...params, routeId, isControllerApproved: isControllerApproved.data }),
      networks,
      zapAddress,
      providers: leverageProviders,
    }),
    max,
    // todo: delete this if users do not complain about it, for now dev-only feature
    showUserBorrowed: isLeverageEnabled && !!canLeverageUserBorrowed(market) && IS_DEVELOPMENT,
    isLeverageSupported: isLeverageBorrowMoreSupported(market, leverageProviders),
    isZapLeveragedPosition: isEquityLeverage && !!collateralEvents.data?.isZapLeveraged,
    leverage: isEquityLeverage
      ? equityLeverage.isZapLeveraged.data
        ? futureOrCurrentQ(equityLeverage.future, equityLeverage.current)
        : null
      : collateralLeverage,
    exchangeRate: mapQuery(expectedCollateral, data => data.avgPrice ?? null),
    zapAddress,
  }
}
