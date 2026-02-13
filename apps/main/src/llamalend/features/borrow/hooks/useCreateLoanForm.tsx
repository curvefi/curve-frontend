import { useEffect, useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zeroAddress } from 'viem'
import { useConnection } from 'wagmi'
import { getTokens, isRouterMetaRequired } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { isLeverageBorrowMoreSupported } from '@/llamalend/queries/borrow-more/borrow-more-query.helpers'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import { useOptimalRoute } from '@ui-kit/entities/router.query'
import { useDebouncedValue } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { mapQuery, q, type Query } from '@ui-kit/types/util'
import { Address, Decimal } from '@ui-kit/utils'
import { setValueOptions, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { type RouteOption, type RouteProvider } from '@ui-kit/widgets/RouteProvider'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { LoanPreset, PRESET_RANGES } from '../../../constants'
import { type CreateLoanOptions, useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useCreateLoanIsApproved } from '../../../queries/create-loan/create-loan-approved.query'
import { createLoanQueryValidationSuite } from '../../../queries/validation/borrow.validation'
import { type CreateLoanForm } from '../types'
import { useMaxTokenValues } from './useMaxTokenValues'

const useCallbackAfterFormUpdate = (form: UseFormReturn<CreateLoanForm>, callback: () => void) =>
  useEffect(() => form.subscribe({ formState: { values: true }, callback }), [form, callback])

type SelectedRoutes = Query<RouteOption[]> & {
  selected: RouteOption | undefined
  onChange: (route: RouteOption) => void
  onRefresh: () => void
  outputTokenAddress: Address
  outputTokenSymbol: string
}
export type UseCreateLoanFormRoutes = SelectedRoutes | undefined

// to crete a loan we need the debt/maxDebt, but we skip the market validation as that's given separately to the mutation
const resolver = vestResolver(createLoanQueryValidationSuite({ debtRequired: false, skipMarketValidation: true }))

function useMarketRoutes({
  market,
  route,
  slippage,
  leverageEnabled,
  userBorrowed,
  chainId,
  onChangeRoute,
}: {
  market: LlamaMarketTemplate | undefined
  chainId: LlamaChainId
  route: RouteOption | undefined | null
  slippage: Decimal | undefined
  leverageEnabled: boolean
  userBorrowed: Decimal | undefined
  onChangeRoute: (route: RouteOption) => void
}): SelectedRoutes | undefined {
  const allRouters: RouteProvider[] = ['curve', 'odos', 'enso']
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const [impl] = market ? getCreateLoanImplementation(market, leverageEnabled) : []
  const routeRequired = !!impl && isRouterMetaRequired(impl)
  const { address: userAddress } = useConnection()
  const routesQuery = useOptimalRoute(
    {
      chainId,
      tokenIn: collateralToken?.address,
      tokenOut: borrowToken?.address,
      amountIn: userBorrowed,
      router: allRouters,
      fromAddress: userAddress as Address | undefined,
      slippage,
    },
    routeRequired,
  )
  const routes = useMemo(
    () =>
      routesQuery.data?.map((item) => ({
        provider: item.router,
        toAmountOutput: item.amountOut,
        priceImpact: item.priceImpact ?? 0,
        routerAddress: item.tx?.to ?? zeroAddress,
        calldata: item.tx?.data ?? '0x',
      })),
    [routesQuery.data],
  )
  const selected = routes?.find((next) => next.provider === route?.provider) ?? route ?? routes?.[0]

  useEffect(() => {
    if (!routeRequired || !selected || route?.provider === selected.provider) return
    onChangeRoute(selected)
  }, [onChangeRoute, route?.provider, routeRequired, selected])

  if (!routeRequired || !borrowToken?.address || !borrowToken?.symbol) return undefined

  return {
    ...q(routesQuery),
    data: routes,
    selected,
    onChange: onChangeRoute,
    onRefresh: () => {
      void routesQuery.refetch()
    },
    outputTokenAddress: borrowToken.address,
    outputTokenSymbol: borrowToken.symbol,
  }
}

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  market,
  network,
  network: { chainId },
  preset,
  onCreated,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId }
  preset: LoanPreset
  onCreated: CreateLoanOptions['onCreated']
}) {
  const { address: userAddress } = useConnection()
  const form = useForm<CreateLoanForm>({
    ...formDefaultOptions,
    resolver,
    defaultValues: {
      userCollateral: undefined,
      userBorrowed: `0` satisfies Decimal,
      debt: undefined,
      route: undefined,
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
        route: values.route,
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
        values.route,
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
  } = useCreateLoanMutation({ network, marketId: market?.id, onReset: form.reset, onCreated, userAddress })

  const { borrowToken, collateralToken } = market ? getTokens(market) : {}

  useCallbackAfterFormUpdate(form, resetCreation) // reset creation state on form change
  const onChangeRoute = (route: RouteOption) => form.setValue('route', route, setValueOptions)

  return {
    form,
    values,
    params,
    isPending: form.formState.isSubmitting || isCreating,
    onSubmit: form.handleSubmit(onSubmit),
    maxTokenValues: useMaxTokenValues(collateralToken?.address, params, form),
    borrowToken,
    collateralToken,
    isCreated,
    creationError,
    txHash: data?.hash,
    leverage: mapQuery(
      useCreateLoanExpectedCollateral(params, isLeverageBorrowMoreSupported(market)),
      (d) => d.leverage,
    ),
    isApproved: useCreateLoanIsApproved(params),
    formErrors: useFormErrors(form.formState),
    routes: useMarketRoutes({ market, chainId, ...values, onChangeRoute }),
  }
}
