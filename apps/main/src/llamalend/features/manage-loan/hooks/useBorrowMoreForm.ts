import { useMemo } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { useSyncMarketLeverageSlippage } from '@/llamalend/hooks/useSyncMarketLeverageSlippage'
import { canLeverageUserBorrowed, getMarketLeverageSlippage, hasZapV2, isRouterRequired } from '@/llamalend/llama.utils'
import type { MarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreExpectedCollateral } from '@/llamalend/queries/borrow-more/borrow-more-expected-collateral.query'
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
  type BorrowMoreForm,
  borrowMoreFormValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { RouteResponse } from '@evm-ui/entities/router-api'
import { useCallbackSync, useForm } from '@evm-ui/features/forms'
import { useFormDebounce } from '@evm-ui/hooks/useDebounce'
import { mapQuery, q, type QueryProp, type Range } from '@evm-ui/types/util'
import { decimalSum, IS_DEVELOPMENT } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, pick } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { useMarketContext } from '../../market-context'

const useBorrowMoreParams = <ChainId extends LlamaChainId>({
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
  leverageProviders,
}: BorrowMoreForm & {
  chainId: ChainId
  marketId: string | undefined
  userAddress: Address | undefined
  leverageProviders: readonly RouteProvider[] | undefined
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
        slippageType: LEVERAGE,
        leverageProviders,
      }),
      [
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
        leverageProviders,
      ],
    ),
    userDefaultValues,
  )

const userDefaultValues = {
  userCollateral: undefined,
  userBorrowed: undefined,
  debt: undefined,
} satisfies Partial<BorrowMoreForm>

const emptyBorrowMoreForm = (slippage: Decimal): BorrowMoreForm => ({
  ...userDefaultValues,
  routeId: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  maxDebt: undefined,
  leverageEnabled: undefined,
  slippage,
})

/** Checks if we need a route for borrowing more */
const isRouteRequired = (market: MarketTemplate | undefined, leverageEnabled: boolean | undefined) => {
  const [implementation] = market ? getBorrowMoreImplementation(market, leverageEnabled) : []
  return !!implementation && isRouterRequired(implementation)
}

const isLeverageBorrowMoreSupported = (
  market: MarketTemplate | undefined,
  leverageProviders: readonly RouteProvider[] | undefined,
) => maybe(leverageProviders, providers => hasZapV2(market) && providers.length > 0)

export const useBorrowMoreForm = <ChainId extends LlamaChainId>({
  networks,
  onPricesUpdated,
  collateralEvents,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
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
  const defaultSlippage = getMarketLeverageSlippage(chainId, controllerAddress)

  const { borrowToken, collateralToken } = tokens

  const form = useForm<BorrowMoreForm>({
    validation: borrowMoreFormValidationSuite,
    defaultValues: emptyBorrowMoreForm(defaultSlippage),
  })
  useSyncMarketLeverageSlippage(form, defaultSlippage)

  const values = form.watchValues()
  const [params, isDebouncing] = useBorrowMoreParams({ chainId, marketId, userAddress, leverageProviders, ...values })
  const {
    onSubmit: onMutationSubmit,
    isPending: isBorrowing,
    error: borrowError,
  } = useBorrowMoreMutation({
    network: networks[chainId],
    marketId,
    onReset: () => form.reset({ ...userDefaultValues, routeId: undefined }),
    userAddress,
    leverageProviders,
  })

  const {
    solvency: { isLoading: isSolvencyLoading, error: solvencyError },
    solvencyDisabledAlert,
    onSubmit,
    onConfirm,
    onClose,
    isOpen,
  } = useFormLowSolvency({
    controllerAddress,
    marketType,
    chainId,
    onSubmit: onMutationSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  const disabledAlert = (marketAlert?.isBorrowDisabled ? marketAlert : undefined) ?? solvencyDisabledAlert

  useCallbackSync(useBorrowMorePrices(params), onPricesUpdated)

  const isLeverageEnabled = isLeverageBorrowMore(market, values.leverageEnabled)
  const expectedCollateral = useBorrowMoreExpectedCollateral(params, values.leverageEnabled)
  const { formState } = form
  const isPending = formState.isSubmitting || isBorrowing
  return {
    form,
    values,
    params,
    isPending,
    isLoading: isPending || !market || isSolvencyLoading,
    onSubmit,
    isDisabled: !!disabledAlert || !formState.isValid || isPending || isDebouncing,
    borrowToken,
    collateralToken,
    error: borrowError ?? solvencyError,
    isApproved: useBorrowMoreIsApproved(params),
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal: { isOpen, onClose, onConfirm },
    priceImpact: q(useBorrowMorePriceImpact(params, !zapAddress)), // overridden by useMarketRoutes when zapv2 is enabled
    ...useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: decimalSum(params.debt, params.userBorrowed),
      ...pick(params, 'slippage'),
      enabled: isRouteRequired(market, values.leverageEnabled),
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id })
        await invalidateBorrowMoreRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) => getBorrowMoreGasEstimateQueryOptions({ ...params, routeId }),
      networks,
      zapAddress,
      providers: leverageProviders,
    }),
    max: useMaxBorrowMoreValues({
      params,
      form,
      market,
      borrowTokenAddress: borrowToken?.address,
      collateralTokenAddress: collateralToken?.address,
      collateralEvents,
    }),
    // todo: delete this if users do not complain about it, for now dev-only feature
    showUserBorrowed: isLeverageEnabled && !!canLeverageUserBorrowed(market) && IS_DEVELOPMENT,
    isLeverageSupported: isLeverageBorrowMoreSupported(market, leverageProviders),
    leverage: useBorrowMoreLeverage(params),
    exchangeRate: mapQuery(expectedCollateral, data => data.avgPrice ?? null),
    zapAddress,
  }
}
