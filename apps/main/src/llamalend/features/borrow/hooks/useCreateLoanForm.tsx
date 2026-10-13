import { useMemo } from 'react'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { useSyncMarketLeverageSlippage } from '@/llamalend/hooks/useSyncMarketLeverageSlippage'
import { getMarketLeverageSlippage, hasLegacyMintLeverage, hasZapV2 } from '@/llamalend/llama.utils'
import type { MarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useCreateLoanControllerApproval } from '@/llamalend/queries/create-loan/create-loan-controller-approval.query'
import { getCreateLoanEstimateGasOptions } from '@/llamalend/queries/create-loan/create-loan-estimate-gas.query'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'
import { useControllerDelegation } from '@/llamalend/widgets/action-card/hooks/useControllerDelegation'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { RouteResponse } from '@evm-ui/queries/router-api'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe, pick } from '@primitives/objects.utils'
import type { RouteProvider } from '@primitives/router.utils'
import { useCallbackSync, useForm, useFormSync } from '@ui/features/forms'
import { combineQueryState } from '@ui/features/queries/combine'
import { mapQuery, q, type Range } from '@ui/features/queries/util'
import { useFormDebounce } from '@ui/hooks/useDebounce'
import { decimalSum } from '@ui/lib/decimal'
import { LEVERAGE, LoanPreset, PRESET_RANGES } from '../../../constants'
import { useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useCreateLoanIsApproved } from '../../../queries/create-loan/create-loan-approved.query'
import { invalidateCreateLoanRouteQueries } from '../../../queries/create-loan/create-loan-route-invalidation'
import { createLoanFormValidationSuite } from '../../../queries/validation/borrow.validation'
import { useMarketContext } from '../../market-context'
import { type CreateLoanForm } from '../types'
import { useIsHighLiquidationRisk } from './useIsHighLiquidationRisk'
import { useMaxTokenValues } from './useMaxTokenValues'

const isLeverageCreateLoanSupported = <T extends MarketTemplate | undefined>(
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
  const validation = useMemo(() => createLoanFormValidationSuite(marketId), [marketId])
  const userDefaultValues = useMemo(
    () =>
      ({
        userCollateral: undefined,
        userBorrowed: `0` satisfies Decimal,
        debt: undefined,
        range: PRESET_RANGES[preset],
      }) satisfies Partial<CreateLoanForm>,
    [preset],
  )
  const formOptions = {
    validation,
    defaultValues: {
      ...userDefaultValues,
      routeId: undefined,
      leverageEnabled: false,
      slippage: defaultSlippage,
      maxDebt: undefined,
      maxCollateral: undefined,
    },
  }
  const form = useForm<CreateLoanForm>(formOptions)
  useSyncMarketLeverageSlippage(form, defaultSlippage)
  const isLeverageSupported = isLeverageCreateLoanSupported(market, leverageProviders)
  // Clear leverage state if the loaded market is not supported by the current provider
  useFormSync(form, { leverageEnabled: false, routeId: undefined }, isLeverageSupported === false)

  const values = form.watchValues()
  const [params, isDebouncing] = useFormDebounce(
    {
      chainId,
      marketId,
      userAddress,
      debt: values.debt,
      maxDebt: values.maxDebt,
      maxCollateral: values.maxCollateral,
      range: values.range,
      slippage: values.slippage,
      leverageEnabled: values.leverageEnabled,
      userCollateral: values.userCollateral,
      userBorrowed: values.userBorrowed,
      routeId: values.routeId,
      leverageProviders,
      slippageType: LEVERAGE,
    },
    userDefaultValues,
  )

  const {
    onSubmit: onMutationSubmit,
    isPending: isCreating,
    error: creationError,
  } = useCreateLoanMutation({
    network: networks[chainId],
    marketId,
    onReset: () => form.reset({ ...userDefaultValues, routeId: undefined }),
    userAddress,
    leverageProviders,
  })

  const isControllerApproved = useCreateLoanControllerApproval({
    chainId,
    marketId,
    userAddress,
    leverageEnabled: values.leverageEnabled,
  })

  const { onSubmit: onDelegationSubmit, modal: delegationModal } = useControllerDelegation<CreateLoanForm>({
    chainId,
    userAddress,
    marketId,
    approval: q(isControllerApproved),
    handleFormSubmit: form.handleSubmit,
    onSubmit: onMutationSubmit,
  })

  const {
    solvency: { isLoading: isSolvencyLoading, error: solvencyError },
    solvencyDisabledAlert,
    onSubmit,
    modal: solvencyModal,
  } = useFormLowSolvency({
    controllerAddress,
    marketType,
    chainId,
    onSubmit: onDelegationSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  const disabledAlert = (marketAlert?.isBorrowDisabled ? marketAlert : undefined) ?? solvencyDisabledAlert

  const { formState } = form
  const collateralTokenAddress = collateralToken?.address
  const maxTokenValues = useMaxTokenValues({ market, collateralTokenAddress, params, form })
  const expectedCollateral = useCreateLoanExpectedCollateral(params, values.leverageEnabled)

  useCallbackSync(useCreateLoanPrices(params), onPricesUpdated)

  const isHighLiquidationRisk = q(useIsHighLiquidationRisk(params))

  const isPending = formState.isSubmitting || isCreating

  return {
    form,
    values,
    params,
    isPending,
    isLoading: isPending || isSolvencyLoading || isControllerApproved.isLoading,
    isDisabled: !!disabledAlert || !formState.isValid || isPending || isDebouncing,
    userAddress,
    onSubmit,
    maxTokenValues,
    borrowToken,
    collateralToken,
    error: isControllerApproved.error ?? creationError ?? solvencyError,
    leverage: {
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
        form.update({ routeId: route?.id })
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
