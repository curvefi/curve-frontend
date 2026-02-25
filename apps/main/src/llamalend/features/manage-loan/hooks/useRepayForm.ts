import BigNumber from 'bignumber.js'
import { useEffect, useMemo, useRef, useState } from 'react'
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
import { decimal } from '@ui-kit/utils'
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
  const previousRouteRefresh = useRef<{ id: string; createdAt: number } | undefined>(undefined)
  const params = useRepayParams({ chainId, marketId, userAddress, ...values })
  const implementation = marketId
    ? getRepayImplementationType(marketId, {
        stateCollateral: values.stateCollateral ?? '0',
        userCollateral: values.userCollateral ?? '0',
        userBorrowed: values.userBorrowed ?? '0',
      })
    : undefined
  const swapAmountIn = decimal(new BigNumber(values.stateCollateral ?? 0).plus(values.userCollateral ?? 0).toString())
  const routeRequired = !!implementation && isRouterMetaRequired(implementation) && Number(swapAmountIn) > 0
  const onChangeRoute = (route: RouteOption) => {
    setSelectedRoute(route)
    updateForm(form, { routeId: route.id })
  }

  useEffect(() => {
    const current = selectedRoute ? { id: selectedRoute.id, createdAt: selectedRoute.createdAt } : undefined
    const previous = previousRouteRefresh.current
    previousRouteRefresh.current = current
    if (!previous || !current) return
    if (previous.id === current.id && previous.createdAt !== current.createdAt) {
      void invalidateRepayRouteQueries(params)
    }
  }, [params, selectedRoute?.id, selectedRoute?.createdAt])

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
      amountIn: swapAmountIn,
      slippage: values.slippage,
      selectedRoute,
      enabled: routeRequired,
      onChange: onChangeRoute,
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
