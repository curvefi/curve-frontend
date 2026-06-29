import { useMemo } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { useMaxBorrowMoreValues } from '@/llamalend/features/manage-loan/hooks/useMaxBorrowMoreValues'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import type { UserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { isRouterRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useBorrowMoreMutation } from '@/llamalend/mutations/borrow-more.mutation'
import { useBorrowMoreLeverage } from '@/llamalend/queries/borrow-more/borrow-more-future-leverage.query'
import { getBorrowMoreGasEstimateQueryOptions } from '@/llamalend/queries/borrow-more/borrow-more-gas-estimate.query'
import { useBorrowMoreIsApproved } from '@/llamalend/queries/borrow-more/borrow-more-is-approved.query'
import { useBorrowMorePriceImpact } from '@/llamalend/queries/borrow-more/borrow-more-price-impact.query'
import { useBorrowMorePrices } from '@/llamalend/queries/borrow-more/borrow-more-prices.query'
import {
  getBorrowMoreImplementation,
  isLeverageBorrowMore,
  isLeverageBorrowMoreSupported,
} from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { invalidateBorrowMoreRouteQueries } from '@/llamalend/queries/borrow-more/borrow-more-route-invalidation'
import {
  type BorrowMoreForm,
  borrowMoreFormValidationSuite,
} from '@/llamalend/queries/validation/borrow-more.validation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import type { RouteResponse } from '@ui-kit/entities/router-api'
import { useCallbackSync, useForm } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { q, type QueryProp, type Range } from '@ui-kit/types/util'
import { shouldBlockTransaction } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { useMarketContext } from '../../market-context'

const useBorrowMoreParams = <ChainId extends LlamaChainId>({
  userCollateral,
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
        debt,
        maxDebt,
        slippage,
        leverageEnabled,
        routeId,
        slippageType: LEVERAGE,
      }),
      [chainId, marketId, userAddress, userCollateral, debt, maxDebt, slippage, leverageEnabled, routeId],
    ),
  )

const userDefaultValues = {
  userCollateral: undefined,
  debt: undefined,
  routeId: undefined,
} satisfies Partial<BorrowMoreForm>

const emptyBorrowMoreForm = (): BorrowMoreForm => ({
  ...userDefaultValues,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  maxDebt: undefined,
  leverageEnabled: undefined,
  slippage: SLIPPAGE[LEVERAGE].default,
})

/** Checks if we need a route for borrowing more */
const isRouteRequired = (market: LlamaMarketTemplate | undefined, leverageEnabled: boolean | undefined) => {
  const [implementation] = market ? getBorrowMoreImplementation(market, leverageEnabled) : []
  return !!implementation && isRouterRequired(implementation)
}

export const useBorrowMoreForm = <ChainId extends LlamaChainId>({
  networks,
  onPricesUpdated,
  collateralEvents,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  collateralEvents: QueryProp<UserCollateralEvents>
}) => {
  const { chainId, market, marketId, ammAddress, zapAddress, controllerAddress, tokens, marketType, userAddress } =
    useMarketContext<ChainId>()
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)

  const { borrowToken, collateralToken } = tokens

  const form = useForm<BorrowMoreForm>({
    validation: borrowMoreFormValidationSuite,
    defaultValues: emptyBorrowMoreForm(),
  })

  const values = form.watchValues()
  const [params, isDebouncing] = useBorrowMoreParams({ chainId, marketId, userAddress, ...values })
  const {
    onSubmit: onMutationSubmit,
    isPending: isBorrowing,
    error: borrowError,
  } = useBorrowMoreMutation({
    network: networks[chainId],
    marketId,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
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
  const priceImpact = q(useBorrowMorePriceImpact(params, isLeverageEnabled))
  const { formState } = form
  const isPending = formState.isSubmitting || isBorrowing
  return {
    form,
    values,
    params,
    isPending,
    isLoading: isPending || !market || isSolvencyLoading,
    onSubmit,
    isDisabled:
      !!disabledAlert || !formState.isValid || isPending || isDebouncing || shouldBlockTransaction(priceImpact, params),
    borrowToken,
    collateralToken,
    error: borrowError ?? solvencyError,
    isApproved: useBorrowMoreIsApproved(params),
    priceImpact,
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal: {
      isOpen,
      onClose,
      onConfirm,
    },
    routes: useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: params.debt,
      ...pick(params, 'slippage'),
      enabled: isRouteRequired(market, values.leverageEnabled),
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id })
        await invalidateBorrowMoreRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) => getBorrowMoreGasEstimateQueryOptions({ ...params, routeId }),
      networks,
      zapAddress,
    }),
    max: useMaxBorrowMoreValues({
      params,
      form,
      market,
      collateralTokenAddress: collateralToken?.address,
      collateralEvents,
    }),
    isLeverageEnabled,
    isLeverageSupported: isLeverageBorrowMoreSupported(market),
    leverage: useBorrowMoreLeverage(params),
    zapAddress,
  }
}
