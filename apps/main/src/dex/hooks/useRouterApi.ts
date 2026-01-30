import { useEffect, useMemo } from 'react'
import type {
  FormValues,
  Route,
  RoutesAndOutput,
  RoutesAndOutputModal,
  SearchedParams,
} from '@/dex/components/PageRouterSwap/types'
import { type RouterApiResponse, useOptimalRoute } from '@/dex/entities/router.query'
import { useTokensNameMapper } from '@/dex/hooks/useTokensNameMapper'
import { getRouterWarningModal } from '@/dex/store/createQuickSwapSlice'
import { useStore } from '@/dex/store/useStore'
import { ChainId, TokensNameMapper } from '@/dex/types/main.types'
import { getExchangeRates } from '@/dex/utils/utilsSwap'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Address, type Decimal, decimal } from '@ui-kit/utils'

/** Calculate exchange rates for display */
const calculateExchangeRates = (
  amountOut: Decimal,
  fromAmount: string,
  { fromAddress, toAddress }: SearchedParams,
  tokensNameMapper: TokensNameMapper,
) => {
  const [rateAB, rateBA] = getExchangeRates(amountOut, fromAmount)
  const fromLabel = tokensNameMapper[fromAddress] ?? fromAddress
  const toLabel = tokensNameMapper[toAddress] ?? toAddress
  return [
    { from: fromLabel, to: toLabel, fromAddress, value: rateAB, label: `${fromLabel}/${toLabel}` },
    { from: toLabel, to: fromLabel, fromAddress: toAddress, value: rateBA, label: `${toLabel}/${fromLabel}` },
  ]
}

/** Get max slippage from user profile store depending on route type */
const getMaxSlippage = (isStableswapRoute: boolean) =>
  useUserProfileStore.getState().maxSlippage[isStableswapRoute ? 'stable' : 'crypto']

/** Convert the API response to the format used in the app */
const convertRoute = (
  { amountIn, amountOut, priceImpact, route, warnings = [], isStableswapRoute, provider }: RouterApiResponse[0],
  { fromAddress, toAddress }: SearchedParams,
  tokensNameMapper: TokensNameMapper,
  isPending: boolean,
): RoutesAndOutput => {
  const formValues = useStore.getState().quickSwap.formValues
  const modalArgs = {
    isExchangeRateLow: warnings.includes('low-exchange-rate'),
    priceImpact,
    toAmount: formValues.toAmount,
    fromAmount: formValues.fromAmount,
    toAmountOutput: amountOut,
    fetchedToAmount: amountOut,
  }

  return {
    provider,
    loading: isPending,
    exchangeRates: calculateExchangeRates(
      amountOut,
      formValues.isFrom ? formValues.fromAmount : amountIn,
      { fromAddress, toAddress },
      tokensNameMapper,
    ),
    isHighSlippage: warnings.includes('high-slippage'),
    isStableswapRoute,
    routes: route.map(
      ({
        args: { poolId = '', ...args },
        name,
        tokenIn: [inputCoinAddress],
        tokenOut: [outputCoinAddress],
      }): Route => ({
        inputCoinAddress,
        outputCoinAddress,
        name,
        routeUrlId: poolId ?? '',
        poolId: poolId,
        ...args,
      }),
    ),
    modal: getRouterWarningModal(
      modalArgs,
      { toAddress, fromAddress },
      getMaxSlippage(isStableswapRoute),
      tokensNameMapper,
    ) as RoutesAndOutputModal | null,
    ...modalArgs,
  }
}

/**
 * Hook to fetch optimal swap routes from the router API and update the store accordingly.
 * This hook uses the `useOptimalRoute` hook to fetch data and processes it to fit the application's state.
 */
export function useRouterApi(
  {
    chainId,
    searchedParams: { toAddress, fromAddress },
  }: {
    chainId: ChainId
    searchedParams: SearchedParams
  },
  enabled: boolean,
): {
  data: RoutesAndOutput | undefined
  isLoading: boolean
} {
  const formValues = useStore((state) => state.quickSwap.formValues) as FormValues
  const { tokensNameMapper } = useTokensNameMapper(chainId)

  const {
    data: response,
    isLoading,
    isPending,
    error,
  } = useOptimalRoute(
    {
      chainId: chainId,
      tokenIn: fromAddress as Address,
      tokenOut: toAddress as Address,
      ...(formValues.isFrom
        ? { amountIn: decimal(formValues.fromAmount) }
        : { amountOut: decimal(formValues.toAmount) }),
    },
    enabled,
  )

  /** Update the store with the fetched amounts and error status */
  useEffect(() => {
    if (!response) return
    const { amountIn, amountOut } = response[0] ?? {}
    const {
      setAppStateByKeys,
      quickSwap: { formStatus, formValues, ...state },
    } = useStore.getState()
    setAppStateByKeys('quickSwap', {
      ...state,
      formStatus: {
        ...formStatus,
        error: response.length === 0 ? 'error-swap-not-available' : error ? 'error-swap-exchange-and-output' : '',
      },
      formValues: {
        ...formValues,
        ...(response.length && (formValues.isFrom ? { toAmount: amountOut } : { fromAmount: amountIn })),
      },
    })
  }, [error, response])

  return {
    data: useMemo(
      () =>
        response?.length
          ? convertRoute(response[0], { fromAddress, toAddress }, tokensNameMapper, isPending)
          : undefined,
      [response, isPending, fromAddress, toAddress, tokensNameMapper],
    ),
    isLoading,
  }
}
