import { useMemo } from 'react'
import { LEVERAGE } from '@/llamalend/constants'
import { useMaxRepayTokenValues } from '@/llamalend/features/manage-loan/hooks/useMaxRepayTokenValues'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { isRouterRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { getRepayLoanEstimateGasOptions } from '@/llamalend/queries/repay/repay-gas-estimate.query'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import { useRepayPriceImpact } from '@/llamalend/queries/repay/repay-price-impact.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import {
  getRepayImplementationType,
  isRepayLeveraged,
  type RepayFormFields,
} from '@/llamalend/queries/repay/repay-query.helpers'
import { invalidateRepayRouteQueries } from '@/llamalend/queries/repay/repay-route-invalidation'
import type { RepayFormData, RepayFormParams } from '@/llamalend/queries/validation/repay.types'
import { repayFormValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy, pick } from '@primitives/objects.utils'
import type { RouteResponse } from '@ui-kit/entities/router-api'
import { useCallbackSync, useForm } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { type AllowUndefined, q, type Range } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { shouldBlockTransaction } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { useMarketContext } from '../../market-context'

const NOT_AVAILABLE = ['root', t`Repay is not available, increase the repayment amount or repay fully.`] as const

const useRepayParams = ({
  chainId,
  marketId,
  userAddress,
  stateCollateral,
  userCollateral,
  userBorrowed,
  maxCollateral,
  maxStateCollateral,
  maxBorrowed,
  isFull,
  slippage,
  routeId,
}: RepayFormParams) =>
  useFormDebounce(
    useMemo(
      () => ({
        chainId,
        marketId,
        userAddress,
        stateCollateral,
        userCollateral,
        userBorrowed,
        maxCollateral,
        maxStateCollateral,
        maxBorrowed,
        isFull,
        slippage,
        routeId,
      }),
      [
        chainId,
        marketId,
        userAddress,
        stateCollateral,
        userCollateral,
        userBorrowed,
        maxCollateral,
        maxStateCollateral,
        maxBorrowed,
        isFull,
        slippage,
        routeId,
      ],
    ),
  )

const userDefaultValues = {
  stateCollateral: undefined,
  userCollateral: undefined,
  userBorrowed: undefined,
  routeId: undefined,
}

const defaultValues = {
  ...userDefaultValues,
  maxStateCollateral: undefined,
  maxCollateral: undefined,
  maxBorrowed: undefined,
  isFull: false,
  slippage: SLIPPAGE[LEVERAGE].default,
}
const formOptions = {
  defaultValues,
} as const

const isRepayRouteRequired = (
  market: LlamaMarketTemplate | undefined,
  { stateCollateral = '0', userBorrowed = '0', userCollateral = '0' }: AllowUndefined<RepayFormFields>,
) => !!market && isRouterRequired(getRepayImplementationType(market, { stateCollateral, userCollateral, userBorrowed }))

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
    tokens: { borrowToken, collateralToken },
    userAddress,
  } = useMarketContext<ChainId>()
  const form = useForm<RepayFormData>({
    ...formOptions,
    validation: useMemo(() => repayFormValidationSuite(market), [market]),
  })

  const values = form.watchValues()
  const [params, isDebouncing] = useRepayParams({ chainId, marketId, userAddress, ...values })

  const {
    onSubmit,
    isPending: isRepaying,
    error: repayError,
  } = useRepayMutation({
    network: networks[chainId],
    marketId,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  useCallbackSync(useRepayPrices(params), onPricesUpdated)

  const { data: isAvailable } = useRepayIsAvailable(params)
  const { isFull, max } = useMaxRepayTokenValues({
    market,
    borrowTokenAddress: borrowToken?.address,
    collateralTokenAddress: collateralToken?.address,
    params,
    form,
  })

  const priceImpact = q(useRepayPriceImpact(params))
  const { formState } = form
  const isPending = formState.isSubmitting || isRepaying
  return {
    form,
    values,
    params,
    isPending,
    isLoading: !market,
    isDisabled:
      !formState.isValid ||
      isPending ||
      isDebouncing ||
      isFull.isLoading ||
      shouldBlockTransaction(priceImpact, {
        ...values,
        leverageEnabled: isRepayLeveraged(values),
        slippageType: LEVERAGE,
      }),
    onSubmit: form.handleSubmit(onSubmit),
    borrowToken,
    collateralToken,
    repayError,
    priceImpact,
    isApproved: useRepayIsApproved(params),
    ...useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      tokenIn: collateralToken,
      tokenOut: borrowToken,
      amountIn: decimalSum(params.userCollateral, params.stateCollateral),
      ...pick(params, 'slippage'),
      enabled: isRepayRouteRequired(market, params),
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id })
        await invalidateRepayRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) => getRepayLoanEstimateGasOptions({ ...params, routeId }),
      networks,
      zapAddress,
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
