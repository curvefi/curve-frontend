import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getTokens, hasZapV2 } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import {
  type CreateLoanPricesReceiveParams,
  useCreateLoanPrices,
} from '@/llamalend/queries/create-loan/create-loan-prices.query'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Decimal } from '@primitives/decimal.utils'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery, type Range } from '@ui-kit/types/util'
import { updateForm, useCallbackAfterFormUpdate, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { type RouteOption } from '@ui-kit/widgets/RouteProvider'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { LoanPreset, PRESET_RANGES } from '../../../constants'
import { type CreateLoanOptions, useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useCreateLoanIsApproved } from '../../../queries/create-loan/create-loan-approved.query'
import { invalidateCreateLoanRouteQueries } from '../../../queries/create-loan/create-loan-route-invalidation'
import { createLoanQueryValidationSuite } from '../../../queries/validation/borrow.validation'
import { type CreateLoanForm } from '../types'
import { useMaxTokenValues } from './useMaxTokenValues'

// to crete a loan we need the debt/maxDebt, but we skip the market validation as that's given separately to the mutation
const resolver = vestResolver(createLoanQueryValidationSuite({ debtRequired: false, skipMarketValidation: true }))

/**
 * Hook to call the parent form to keep in sync with the chart and other components
 */
function useChartPricesCallback(
  params: CreateLoanPricesReceiveParams,
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void,
) {
  const { data } = useCreateLoanPrices(params)
  useEffect(() => onPricesUpdated(data), [onPricesUpdated, data])
  useEffect(() => () => onPricesUpdated(undefined), [onPricesUpdated]) // clear prices on unmount to avoid stale chart
}

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  market,
  network,
  network: { chainId },
  preset,
  onSuccess,
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId }
  preset: LoanPreset
  onSuccess: CreateLoanOptions['onSuccess']
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) {
  const { address: userAddress } = useConnection()
  const form = useForm<CreateLoanForm>({
    ...formDefaultOptions,
    resolver,
    defaultValues: {
      userCollateral: undefined,
      userBorrowed: `0` satisfies Decimal,
      debt: undefined,
      routeId: undefined,
      leverageEnabled: false,
      slippage: SLIPPAGE_PRESETS.STABLE,
      range: PRESET_RANGES[preset],
      maxDebt: undefined,
      maxCollateral: undefined,
    },
  })

  const values = watchForm(form)
  const params = useDebouncedValue(
    useMemo(
      () => ({
        chainId,
        marketId: market?.id,
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
      }),
      [
        chainId,
        market?.id,
        userAddress,
        values.debt,
        values.maxDebt,
        values.maxCollateral,
        values.range,
        values.slippage,
        values.leverageEnabled,
        values.userCollateral,
        values.userBorrowed,
        values.routeId,
      ],
    ),
  )

  const {
    onSubmit,
    isPending: isCreating,
    isSuccess: isCreated,
    error: creationError,
    data,
    reset: resetCreation,
  } = useCreateLoanMutation({ network, marketId: market?.id, onReset: form.reset, onSuccess, userAddress })

  const { formState } = form
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | undefined>()

  useChartPricesCallback(params, onPricesUpdated)
  useCallbackAfterFormUpdate(form, resetCreation) // reset creation state on form change

  const isPending = formState.isSubmitting || isCreating
  return {
    form,
    values,
    params,
    isPending,
    isDisabled: !formState.isValid || isPending,
    onSubmit: form.handleSubmit(onSubmit),
    maxTokenValues: useMaxTokenValues(collateralToken?.address, params, form),
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash: data?.hash,
    leverage: mapQuery(useCreateLoanExpectedCollateral(params, values.leverageEnabled), (d) => d.leverage),
    isApproved: useCreateLoanIsApproved(params),
    formErrors: useFormErrors(formState),
    routes: useMarketRoutes({
      chainId,
      tokenIn: collateralToken,
      tokenOut: borrowToken,
      amountIn: values.userCollateral,
      slippage: values.slippage,
      selectedRoute,
      enabled: params.leverageEnabled && !!market && hasZapV2(market),
      onChange: async (route: RouteOption) => {
        setSelectedRoute(route)
        updateForm(form, { routeId: route.id })
        await invalidateCreateLoanRouteQueries(params)
      },
    }),
  }
}
