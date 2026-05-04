import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { getTokens, hasZapV2 } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { vestResolver } from '@hookform/resolvers/vest'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import type { RouteResponse } from '@primitives/router.utils'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import { q, type Range } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { cancelSubmit, resetForm, updateForm, useCallbackSync, useFormErrors } from '@ui-kit/utils/react-form.utils'
import { shouldBlockTransaction } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { SLIPPAGE_PRESETS } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { LoanPreset, PRESET_RANGES } from '../../../constants'
import { useCreateLoanMutation } from '../../../mutations/create-loan.mutation'
import { useCreateLoanIsApproved } from '../../../queries/create-loan/create-loan-approved.query'
import { invalidateCreateLoanRouteQueries } from '../../../queries/create-loan/create-loan-route-invalidation'
import { createLoanQueryValidationSuite } from '../../../queries/validation/borrow.validation'
import { type CreateLoanForm } from '../types'
import { useIsHighLiquidationRisk } from './useIsHighLiquidationRisk'
import { useMaxTokenValues } from './useMaxTokenValues'

const userDefaultValues = {
  userCollateral: undefined,
  userBorrowed: `0` satisfies Decimal,
  debt: undefined,
  routeId: undefined,
} satisfies Partial<CreateLoanForm>

// to crete a loan we need the debt/maxDebt, but we skip the market validation as that's given separately to the mutation
const resolver = vestResolver(
  createLoanQueryValidationSuite({ debtRequired: false, skipMarketValidation: true, collateralRequired: true }),
)

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  market,
  network,
  network: { chainId },
  preset,
  onPricesUpdated,
  disabled,
}: {
  market: LlamaMarketTemplate | undefined
  network: { id: LlamaNetworkId; chainId: ChainId }
  preset: LoanPreset
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
  disabled: boolean
}) {
  const { address: userAddress } = useConnection()
  const formOptions = {
    ...formDefaultOptions,
    resolver,
    defaultValues: {
      ...userDefaultValues,
      leverageEnabled: false,
      slippage: SLIPPAGE_PRESETS.STABLE,
      range: PRESET_RANGES[preset],
      maxDebt: undefined,
      maxCollateral: undefined,
    },
  }
  const form = useForm<CreateLoanForm>(formOptions)

  const values = watchForm(form)
  const [params, isDebouncing] = useFormDebounce(
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
    error: creationError,
  } = useCreateLoanMutation({
    network,
    marketId: market?.id,
    onReset: () => resetForm(form, userDefaultValues),
    userAddress,
  })

  const { formState } = form
  const { borrowToken, collateralToken } = market ? getTokens(market) : {}
  const maxTokenValues = useMaxTokenValues(collateralToken?.address, params, form)
  const expectedCollateral = useCreateLoanExpectedCollateral(params, values.leverageEnabled)

  useCallbackSync(useCreateLoanPrices(params), onPricesUpdated)

  const priceImpact = q(useCreateLoanPriceImpact(params, values.leverageEnabled))
  const isHighLiquidationRisk = q(useIsHighLiquidationRisk(params))

  const isPending = formState.isSubmitting || isCreating
  const isDisabled =
    disabled || !formState.isValid || isPending || isDebouncing || shouldBlockTransaction(priceImpact, params)
  return {
    form,
    values,
    params,
    isPending,
    isDisabled,
    onSubmit: isDisabled ? cancelSubmit : form.handleSubmit(onSubmit),
    maxTokenValues,
    borrowToken,
    collateralToken,
    creationError,
    leverage: {
      data: expectedCollateral.data?.leverage,
      // expectedCollateral is gated by maxDebt validation, so include maxDebt state for loading in the UI.
      ...combineQueryState(maxTokenValues.debt, expectedCollateral),
    },
    isApproved: useCreateLoanIsApproved(params),
    priceImpact,
    isHighLiquidationRisk,
    formErrors: useFormErrors(formState),
    routes: useMarketRoutes({
      chainId,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: decimalSum(params.debt, params.userBorrowed),
      ...pick(params, 'slippage', 'routeId'),
      enabled: params.leverageEnabled && !!market && hasZapV2(market),
      onChange: async (route: RouteResponse | undefined) => {
        updateForm(form, { routeId: route?.id })
        await invalidateCreateLoanRouteQueries(route, params)
      },
    }),
  }
}
