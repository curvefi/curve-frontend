import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useMaxRepayTokenValues } from '@/llamalend/features/manage-loan/hooks/useMaxRepayTokenValues'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getTokens, isRouterMetaRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { type RepayOptions, useRepayMutation } from '@/llamalend/mutations/repay.mutation'
import { useRepayIsApproved } from '@/llamalend/queries/repay/repay-is-approved.query'
import { useRepayIsAvailable } from '@/llamalend/queries/repay/repay-is-available.query'
import { useRepayPrices } from '@/llamalend/queries/repay/repay-prices.query'
import { getRepayImplementationType } from '@/llamalend/queries/repay/repay-query.helpers'
import { invalidateRepayRouteQueries } from '@/llamalend/queries/repay/repay-route-invalidation'
import type { RepayIsFullParams } from '@/llamalend/queries/validation/manage-loan.types'
import { type RepayForm, repayFormValidationSuite } from '@/llamalend/queries/validation/manage-loan.validation'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { isEmpty, notFalsy } from '@primitives/objects.utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import type { Range } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { filterFormErrors, updateForm, useCallbackAfterFormUpdate } from '@ui-kit/utils/react-form.utils'
import { type RouteOption } from '@ui-kit/widgets/RouteProvider'
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
}: RepayForm & {
  chainId: ChainId
  marketId: string | undefined
  userAddress: Address | undefined
}): RepayIsFullParams<ChainId> =>
  useDebouncedValue(
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

const useChartPricesCallback = (
  params: RepayIsFullParams,
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void,
  enabled: boolean | undefined,
) => {
  const { data } = useRepayPrices(params, enabled)
  useEffect(() => onPricesUpdated(data), [onPricesUpdated, data])
  useEffect(() => () => onPricesUpdated(undefined), [onPricesUpdated]) // clear prices on unmount to avoid stale chart
}

const formOptions = {
  ...formDefaultOptions,
  resolver: vestResolver(repayFormValidationSuite),
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
  { stateCollateral = '0', userBorrowed = '0', userCollateral = '0' }: RepayForm,
) =>
  !!market &&
  isRouterMetaRequired(getRepayImplementationType(market, { stateCollateral, userCollateral, userBorrowed }))

export const useRepayForm = <ChainId extends LlamaChainId>({
  market,
  network,
  enabled,
  onSuccess,
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId; name: string }
  enabled?: boolean
  onSuccess?: NonNullable<RepayOptions['onSuccess']>
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) => {
  const { address: userAddress } = useConnection()
  const { chainId } = network
  const marketId = market?.id

  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  const form = useForm<RepayForm>(formOptions)

  const values = watchForm(form)
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | undefined>()
  const params = useRepayParams({ chainId, marketId, userAddress, ...values })

  const {
    onSubmit,
    isPending: isRepaying,
    isSuccess: isRepaid,
    error: repayError,
    data,
    reset: resetRepay,
  } = useRepayMutation({
    network,
    marketId,
    onSuccess,
    onReset: form.reset,
    userAddress,
  })

  useChartPricesCallback(params, onPricesUpdated, enabled)
  useCallbackAfterFormUpdate(form, resetRepay) // reset mutation state on form change

  const { data: isAvailable } = useRepayIsAvailable(params, enabled)
  const { isFull, max } = useMaxRepayTokenValues({ collateralToken, borrowToken, params, form }, enabled)

  const { formState } = form
  const isPending = formState.isSubmitting || isRepaying
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending,
    onSubmit: form.handleSubmit(onSubmit),
    borrowToken,
    collateralToken,
    isRepaid,
    repayError,
    txHash: data?.hash,
    isApproved: useRepayIsApproved(params, enabled),
    routes: useMarketRoutes({
      chainId,
      tokenIn: collateralToken,
      tokenOut: borrowToken,
      amountIn: decimalSum(values.stateCollateral, values.userCollateral),
      slippage: values.slippage,
      selectedRoute,
      enabled: isRepayRouteRequired(market, values),
      onChange: async (route: RouteOption) => {
        setSelectedRoute(route)
        const routeId = route.id
        updateForm(form, { routeId })
        await invalidateRepayRouteQueries({ ...params, routeId })
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
