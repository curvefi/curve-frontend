import { useMemo } from 'react'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useCreateLoanEquityLeverage } from '@/llamalend/hooks/useEquityLeverage'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getMarketLeverageSlippage, hasLegacyMintLeverage, hasZapV2 } from '@/llamalend/llama.utils'
import type { MarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanControllerApproval } from '@/llamalend/queries/create-loan/create-loan-controller-approval.query'
import { getCreateLoanEstimateGasOptions } from '@/llamalend/queries/create-loan/create-loan-estimate-gas.query'
import {
  resetCreateLoanExpectedCollateral,
  useCreateLoanExpectedCollateral,
} from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'
import { useControllerDelegationAction } from '@/llamalend/widgets/action-card/hooks/useControllerDelegationAction'
import { useLowSolvencyAction } from '@/llamalend/widgets/action-card/hooks/useLowSolvencyAction'
import { marketFormActions } from '@/llamalend/widgets/action-card/marketFormActions'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { RouteResponse } from '@evm-ui/queries/router-api/types'
import type { Decimal } from '@primitives/decimal.utils'
import { type Nullish, maybe, pick } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { useCallbackSync, useFormSync, useOnChangeCallback } from '@ui/features/forms'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { combineQueryState } from '@ui/features/queries/combine'
import { futureOrCurrentQ, mapQuery, q, type Range } from '@ui/features/queries/util'
import { decimalSum } from '@ui/lib/decimal'
import { LEVERAGE, LoanPreset, PRESET_RANGES } from '../../../constants'
import { useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useCreateLoanIsApproved } from '../../../queries/create-loan/create-loan-approved.query'
import { invalidateCreateLoanRouteQueries } from '../../../queries/create-loan/create-loan-route-invalidation'
import { createLoanFormValidationSuite } from '../../../queries/validation/borrow.validation'
import { useMarketContext } from '../../market-context'
import { type CreateLoanFormValues } from '../types'
import { useIsHighLiquidationRisk } from './useIsHighLiquidationRisk'
import { useMaxTokenValues } from './useMaxTokenValues'

const isLeverageCreateLoanSupported = <T extends MarketTemplate | Nullish>(
  market: T,
  leverageProviders: readonly RouteProvider[] | undefined,
) => maybe(market, market => hasLegacyMintLeverage(market) || (hasZapV2(market) && !!leverageProviders?.length))

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  networks,
  preset,
  onPricesUpdated,
}: {
  networks: NetworkDict<ChainId>
  preset: LoanPreset
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) {
  const {
    chainId,
    market,
    marketId,
    ammAddress,
    zapAddress,
    controllerAddress,
    tokens: { borrowToken, collateralToken },
    marketType,
    userAddress,
    leverageProviders,
  } = useMarketContext<ChainId>()
  const defaultSlippage = getMarketLeverageSlippage(chainId, controllerAddress)
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)
  const lowSolvency = useLowSolvencyAction({ controllerAddress, marketType, chainId })
  const disabledAlert = (marketAlert?.isBorrowDisabled ? marketAlert : undefined) ?? lowSolvency.disabledAlert

  const userDefaultValues = {
    userCollateral: undefined,
    userBorrowed: `0` satisfies Decimal,
    debt: undefined,
    range: PRESET_RANGES[preset],
    routeId: undefined,
  } satisfies Partial<CreateLoanFormValues>

  const inputs = useFormValues<CreateLoanFormValues>({
    defaultValues: { ...userDefaultValues, leverageEnabled: false, slippage: defaultSlippage },
    context: { chainId, marketId, userAddress, leverageProviders, slippageType: LEVERAGE },
  })
  const isLeverageSupported = isLeverageCreateLoanSupported(market, leverageProviders)

  const maxTokenValues = useMaxTokenValues({ market, collateralTokenAddress: collateralToken?.address, inputs })

  const {
    onSubmit: createLoan,
    isPending,
    error: creationError,
  } = useCreateLoanMutation({
    network: networks[chainId],
    marketId,
    onReset: () => inputs.reset(userDefaultValues),
    userAddress,
    leverageProviders,
  })

  const form = useFormValidation({
    inputs,
    validation: useMemo(() => createLoanFormValidationSuite(marketId), [marketId]),
    computed: {
      maxDebt: mapQuery(maxTokenValues.debt, ({ maxDebt }) => maxDebt),
      maxCollateral: maxTokenValues.collateral,
    },
    isSubmitting: isPending,
    disabled: !!disabledAlert,
  })
  const { values, params, formState } = form

  // some loan queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetCreateLoanExpectedCollateral(params))
  // use the default market slippage, unless the user changed it in this form
  useFormSync(form, { slippage: defaultSlippage }, !form.isTouched('slippage'))
  // Clear leverage state if the loaded market is not supported by the current provider
  useFormSync(form, { leverageEnabled: false, routeId: undefined }, isLeverageSupported === false)

  const isControllerApproved = useCreateLoanControllerApproval({
    chainId,
    marketId,
    userAddress,
    leverageEnabled: values.leverageEnabled,
  })

  const { onSubmit, solvencyModal, delegationModal, ...formActions } = marketFormActions({
    handleSubmit: form.handleSubmit,
    lowSolvency,
    delegation: useControllerDelegationAction({ chainId, userAddress, marketId, approval: q(isControllerApproved) }),
    onConfirmed: createLoan,
  })

  const expectedCollateral = useCreateLoanExpectedCollateral(params, values.leverageEnabled)
  const isEquityLeverage = useLlamalendEquityLeverage()
  const equityLeverage = useCreateLoanEquityLeverage(params)

  useCallbackSync(useCreateLoanPrices(params), onPricesUpdated)

  const isHighLiquidationRisk = q(useIsHighLiquidationRisk(params))

  return {
    form,
    values,
    params,
    isPending,
    isLoading: form.isLoading || formActions.isLoading,
    userAddress,
    onSubmit,
    maxTokenValues,
    borrowToken,
    collateralToken,
    error: formActions.error ?? creationError ?? form.error,
    leverage: isEquityLeverage
      ? equityLeverage.isZapLeveraged.data
        ? futureOrCurrentQ(equityLeverage.future, equityLeverage.current)
        : null
      : {
          data: expectedCollateral.data?.leverage,
          // expectedCollateral is gated by maxDebt validation, so include maxDebt state for loading in the UI.
          ...combineQueryState(maxTokenValues.debt, expectedCollateral),
        },
    exchangeRate: mapQuery(expectedCollateral, data => data.avgPrice ?? null),
    isApproved: q(useCreateLoanIsApproved(params)),
    isControllerApproved: q(isControllerApproved),
    delegationModal,
    isHighLiquidationRisk,
    isLeverageSupported,
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal,
    priceImpact: q(useCreateLoanPriceImpact(params, !zapAddress)), // overridden by useMarketRoutes when zapv2 is enabled
    ...useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      controllerAddress,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: decimalSum(params.debt, params.userBorrowed),
      ...pick(params, 'slippage'),
      enabled: params.leverageEnabled && !!zapAddress,
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id }, { mode: 'immediate' })
        await invalidateCreateLoanRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) =>
        getCreateLoanEstimateGasOptions({ ...params, routeId, isControllerApproved: isControllerApproved.data }),
      networks,
      zapAddress,
      providers: leverageProviders,
    }),
  }
}
