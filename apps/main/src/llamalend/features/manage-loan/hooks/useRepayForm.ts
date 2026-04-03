import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useMaxRepayTokenValues } from '@/llamalend/features/manage-loan/hooks/useMaxRepayTokenValues'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getTokens, isRouterRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getRepayImplementationType, type RepayFormFields } from '@/llamalend/queries/repay/repay-query.helpers'
import { invalidateOrRefetchRepayRouteQueries } from '@/llamalend/queries/repay/repay-route-invalidation'
import type { RepayFormData } from '@/llamalend/queries/validation/repay.types'
import { repayFormValidationSuite } from '@/llamalend/queries/validation/repay.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Decimal } from '@primitives/decimal.utils'
import { isEmpty, notFalsy, pick } from '@primitives/objects.utils'
import type { RouteResponse } from '@primitives/router.utils'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, type UserMarketParams, watchForm } from '@ui-kit/lib/model'
import type { AllowUndefined, Range } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { filterFormErrors, updateForm, useCallbackSync } from '@ui-kit/utils/react-form.utils'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

const NOT_AVAILABLE = ['root', t`Repay is not available, increase the repayment amount or repay fully.`] as const

const useRepayParams = <ChainId>({
  isFull,
  maxCollateral,
  slippage,
  stateCollateral,
  userBorrowed,
  userCollateral,
  routeId,
  chainId,
  marketId,
  userAddress,
}: RepayFormData & UserMarketParams<ChainId>) =>
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
        isFull,
        slippage,
        routeId,
      ],
    ),
  )

const formOptions = {
  ...formDefaultOptions,
  defaultValues: {
    stateCollateral: undefined,
    userCollateral: undefined,
    userBorrowed: undefined,
    maxStateCollateral: undefined,
    maxCollateral: undefined,
    maxBorrowed: undefined,
    routeId: undefined,
    isFull: false,
    slippage: SLIPPAGE_PRESETS.STABLE,
  },
} as const

const isRepayRouteRequired = (
  market: LlamaMarketTemplate | undefined,
  { stateCollateral = '0', userBorrowed = '0', userCollateral = '0' }: AllowUndefined<RepayFormFields>,
) => !!market && isRouterRequired(getRepayImplementationType(market, { stateCollateral, userCollateral, userBorrowed }))

export const useRepayForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId; name: string }
  enabled?: boolean
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const form = useForm<RepayFormData>({
    ...formOptions,
    resolver: vestResolver(useMemo(() => repayFormValidationSuite(market), [market])),
  })

  const values = watchForm(form)
  const [params, isDebouncing] = useRepayParams({ chainId, marketId, userAddress, ...values })

  const {
    onSubmit,
    isPending: isRepaying,
    error: repayError,
  } = useRepayMutation({
    network,
    marketId,
    onReset: form.reset,
    userAddress,
  })

  useCallbackSync(useRepayPrices(params, enabled), onPricesUpdated)

  const { data: isAvailable } = useRepayIsAvailable(params, enabled)
  const { isFull, max } = useMaxRepayTokenValues({ collateralToken, borrowToken, params, form }, enabled)

  const { formState } = form
  const isPending = formState.isSubmitting || isRepaying
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending || isDebouncing || isFull.isLoading,
    onSubmit: form.handleSubmit(onSubmit),
    borrowToken,
    collateralToken,
    repayError,
    isApproved: useRepayIsApproved(params, enabled),
    routes: useMarketRoutes({
      chainId,
      tokenIn: collateralToken,
      tokenOut: borrowToken,
      amountIn: decimalSum(params.userCollateral, params.stateCollateral),
      ...pick(params, 'slippage', 'routeId'),
      enabled: isRepayRouteRequired(market, params),
      onChange: async (route: RouteResponse | undefined) => {
        updateForm(form, { routeId: route?.id })
        await invalidateOrRefetchRepayRouteQueries(route, { ...params, routeId: route?.id })
      },
    }),
    formErrors: useMemo(
      // only show the 'not available' warn when there are no other form errors
      () =>
        isEmpty(formState.errors) ? notFalsy(isAvailable === false && NOT_AVAILABLE) : filterFormErrors(formState),
      [formState, isAvailable],
    ),
    isFull,
    max,
  }
}
