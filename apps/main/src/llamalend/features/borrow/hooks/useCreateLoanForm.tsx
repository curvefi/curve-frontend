import { useMemo } from 'react'
import { useConnection } from 'wagmi'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { useMarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { type MarketTokens } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate, NetworkDict } from '@/llamalend/llamalend.types'
import { getCreateLoanEstimateGasOptions } from '@/llamalend/queries/create-loan/create-loan-estimate-gas.query'
import { useCreateLoanExpectedCollateral } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { useCreateLoanPriceImpact } from '@/llamalend/queries/create-loan/create-loan-price-impact.query'
import { useCreateLoanPrices } from '@/llamalend/queries/create-loan/create-loan-prices.query'
import { useFormLowSolvency } from '@/llamalend/widgets/action-card/hooks/useFormLowSolvency'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { pick } from '@primitives/objects.utils'
import type { RouteResponse } from '@ui-kit/entities/router-api'
import { useForm, useCallbackSync } from '@ui-kit/features/forms'
import { useFormDebounce } from '@ui-kit/hooks/useDebounce'
import { combineQueryState } from '@ui-kit/lib/queries/combine'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { q, type Range } from '@ui-kit/types/util'
import { decimalSum } from '@ui-kit/utils'
import { shouldBlockTransaction } from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'
import { LoanPreset, PRESET_RANGES, LEVERAGE } from '../../../constants'
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

const validation = createLoanQueryValidationSuite({
  debtRequired: false,
  skipMarketValidation: true, // given separately to the mutation
  collateralRequired: true,
})

export function useCreateLoanForm<ChainId extends LlamaChainId>({
  market,
  marketId,
  ammAddress,
  zapAddress,
  controllerAddress,
  tokens,
  marketType,
  networks,
  chainId,
  preset,
  onPricesUpdated,
}: {
  market: LlamaMarketTemplate | undefined
  marketId: string | undefined
  ammAddress: Address | undefined
  zapAddress: Address | undefined
  controllerAddress: Address | undefined
  tokens: Partial<MarketTokens>
  marketType: LlamaMarketType
  networks: NetworkDict<ChainId>
  chainId: ChainId
  preset: LoanPreset
  onPricesUpdated: (prices: Range<Decimal> | undefined) => void
}) {
  const { address: userAddress } = useConnection()
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)
  const formOptions = {
    validation,
    defaultValues: {
      ...userDefaultValues,
      leverageEnabled: false,
      slippage: SLIPPAGE[LEVERAGE].default,
      range: PRESET_RANGES[preset],
      maxDebt: undefined,
      maxCollateral: undefined,
    },
  }
  const form = useForm<CreateLoanForm>(formOptions)

  const values = form.watchValues()
  const [params, isDebouncing] = useFormDebounce(
    useMemo(
      () => ({
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
        slippageType: LEVERAGE,
      }),
      [
        chainId,
        marketId,
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
    onSubmit: onMutationSubmit,
    isPending: isCreating,
    error: creationError,
  } = useCreateLoanMutation({
    network: networks[chainId],
    marketId,
    onReset: () => form.reset(userDefaultValues),
    userAddress,
  })

  const {
    solvency: { isLoading: isSolvencyLoading, error: solvencyError },
    solvencyDisabledAlert,
    onSubmit,
    onConfirm,
    onClose,
    isOpen,
  } = useFormLowSolvency({
    controllerAddress,
    marketType,
    chainId,
    onSubmit: onMutationSubmit,
    handleFormSubmit: form.handleSubmit,
  })

  const disabledAlert = (marketAlert?.isBorrowDisabled ? marketAlert : undefined) ?? solvencyDisabledAlert

  const { formState } = form
  const { borrowToken, collateralToken } = tokens
  const maxTokenValues = useMaxTokenValues({
    market,
    marketId,
    collateralTokenAddress: collateralToken?.address,
    params,
    form,
  })
  const expectedCollateral = useCreateLoanExpectedCollateral(params, values.leverageEnabled)

  useCallbackSync(useCreateLoanPrices(params), onPricesUpdated)

  const priceImpact = q(useCreateLoanPriceImpact(params, values.leverageEnabled))
  const isHighLiquidationRisk = q(useIsHighLiquidationRisk(params))

  const isPending = formState.isSubmitting || isCreating

  return {
    form,
    values,
    params,
    isPending,
    isLoading: isPending || !marketId || isSolvencyLoading,
    isDisabled:
      !!disabledAlert || !formState.isValid || isPending || isDebouncing || shouldBlockTransaction(priceImpact, params),
    onSubmit,
    maxTokenValues,
    borrowToken,
    collateralToken,
    error: creationError ?? solvencyError,
    leverage: {
      data: expectedCollateral.data?.leverage,
      // expectedCollateral is gated by maxDebt validation, so include maxDebt state for loading in the UI.
      ...combineQueryState(maxTokenValues.debt, expectedCollateral),
    },
    isApproved: useCreateLoanIsApproved(params),
    priceImpact,
    isHighLiquidationRisk,
    formErrors: formState.visibleErrors,
    disabledAlert,
    solvencyModal: {
      isOpen,
      onClose,
      onConfirm,
    },
    routes: useMarketRoutes({
      chainId,
      marketAddress: ammAddress,
      tokenIn: borrowToken,
      tokenOut: collateralToken,
      amountIn: decimalSum(params.debt, params.userBorrowed),
      ...pick(params, 'slippage'),
      enabled: params.leverageEnabled && !!zapAddress,
      onChange: async (route: RouteResponse | undefined) => {
        form.update({ routeId: route?.id })
        await invalidateCreateLoanRouteQueries(route, params)
      },
      getRouteGasOptions: (routeId: string | undefined) => getCreateLoanEstimateGasOptions({ ...params, routeId }),
      networks,
      zapAddress,
    }),
  }
}
