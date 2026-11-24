import { useMemo } from 'react'
import { useMaxRepayTokenValues } from '@/llamalend/features/manage-loan/hooks/useMaxRepayTokenValues'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getMarketLeverageSlippage, isRouterRequired } from '@/llamalend/llama.utils'
import type { MarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useRepayControllerApproval } from '@/llamalend/queries/repay/repay-controller-approval.query'
import {
  resetRepayExpectedBorrowed,
  useRepayExpectedBorrowed,
} from '@/llamalend/queries/repay/repay-expected-borrowed.query'
import { getRepayLoanEstimateGasOptions } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getRepayImplementationType, type RepayFormFields } from '@/llamalend/queries/repay/repay-query.helpers'
import { invalidateRepayRouteQueries } from '@/llamalend/queries/repay/repay-route-invalidation'
import type { RepayFormValues } from '@/llamalend/queries/validation/repay.types'
import { repayFormValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import { useControllerDelegationAction } from '@/llamalend/widgets/action-card/hooks/useControllerDelegationAction'
import { marketFormActions } from '@/llamalend/widgets/action-card/marketFormActions'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { UserMarketParams } from '@evm-ui/queries/query-types'
import type { RouteResponse } from '@evm-ui/queries/router-api/types'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy, pick } from '@primitives/objects.utils'
import { useCallbackSync, useFormSync, useOnChangeCallback } from '@ui/features/forms'
import { useFormValidation } from '@ui/features/forms/useFormValidation'
import { useFormValues } from '@ui/features/forms/useFormValues'
import { type AllowUndefined, mapQuery, q, type Range } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../../market-context'

const NOT_AVAILABLE = ['root', t`Repay is not available, increase the repayment amount or repay fully.`] as const

const userDefaultValues = { stateCollateral: undefined, userBorrowed: undefined, routeId: undefined }

const isRepayRouteRequired = (
  market: MarketTemplate | undefined,
  { stateCollateral = '0', userBorrowed = '0' }: AllowUndefined<RepayFormFields>,
) => !!market && isRouterRequired(getRepayImplementationType(market, { stateCollateral, userBorrowed }))

export const useRepayForm = <ChainId extends LlamaChainId>({
  networks,
  onPricesUpdated,
}: {
  networks: NetworkDict<ChainId>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) => {
  const {
    chainId,
    market,
    marketId,
    ammAddress,
    zapAddress,
    controllerAddress,
    tokens: { borrowToken, collateralToken },
    userAddress,
    leverageProviders,
  } = useMarketContext<ChainId>()
  const defaultSlippage = getMarketLeverageSlippage(chainId, controllerAddress)
  const inputs = useFormValues<RepayFormValues, UserMarketParams<ChainId>>({
    defaultValues: { ...userDefaultValues, slippage: defaultSlippage },
    context: { chainId, marketId, userAddress },
  })
  const { isFull, max } = useMaxRepayTokenValues({ borrowTokenAddress: borrowToken?.address, params: inputs.params })

  const {
    onSubmit: repay,
    isPending,
    error: repayError,
  } = useRepayMutation({
    network: networks[chainId],
    marketId,
    onReset: () => inputs.reset(userDefaultValues),
    userAddress,
    leverageProviders,
  })

  const form = useFormValidation({
    inputs,
    validation: useMemo(() => repayFormValidationSuite(market), [market]),
    computed: { maxBorrowed: max.userBorrowed, maxStateCollateral: max.stateCollateral, isFull },
    isSubmitting: isPending,
    disabled: isFull.isLoading,
  })
  const { values, params, formState } = form

  // some repay queries depend on LL internal cache for expected collateral, reset when new market data arrives
  useOnChangeCallback(market, () => resetRepayExpectedBorrowed(params))
  useFormSync(form, { slippage: defaultSlippage }, !form.isTouched('slippage'))

  const isControllerApproved = useRepayControllerApproval({ chainId, marketId, userAddress, ...values })

  const { onSubmit, delegationModal, ...formActions } = marketFormActions({
    handleSubmit: form.handleSubmit,
    delegation: useControllerDelegationAction({ chainId, userAddress, marketId, approval: q(isControllerApproved) }),
    onConfirmed: repay,
  })

  useCallbackSync(useRepayPrices(params), onPricesUpdated)

  const { data: isAvailable } = useRepayIsAvailable(params)
  return {
    form,
    values,
    params,
    isPending,
    isLoading: !market || form.isLoading || formActions.isLoading,
    userAddress,
    onSubmit,
    borrowToken,
    collateralToken,
    repayError: formActions.error ?? repayError ?? form.error,
    isControllerApproved: q(isControllerApproved),
    delegationModal,
    isApproved: q(useRepayIsApproved(params)),
    exchangeRate: mapQuery(useRepayExpectedBorrowed(params), data => data.avgPrice ?? null),
    priceImpact: q(useRepayPriceImpact(params, !zapAddress)), // overridden by useMarketRoutes when zapv2 is enabled
    ...useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      controllerAddress,
      tokenIn: collateralToken,
      tokenOut: borrowToken,
      amountIn: params.stateCollateral,
      ...pick(params, 'slippage'),
      enabled: isRepayRouteRequired(market, params),
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id }, { mode: 'immediate' })
        await invalidateRepayRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) =>
        getRepayLoanEstimateGasOptions({ ...params, routeId, isControllerApproved: isControllerApproved.data }),
      networks,
      zapAddress,
      providers: leverageProviders,
    }),
    formErrors: useMemo(
      // only show the 'not available' warn when there are no other form errors
      () => (formState.isValid ? notFalsy(isAvailable === false && NOT_AVAILABLE) : formState.visibleErrors),
      [formState.visibleErrors, formState.isValid, isAvailable],
    ),
    isFull,
    max,
  }
}
