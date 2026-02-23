import { useEffect, useMemo } from 'react'
import type {
  FormValues,
  Route,
  RoutesAndOutput,
  RoutesAndOutputModal,
  SearchedParams,
} from '@/dex/components/PageRouterSwap/types'
import { getRouterWarningModal } from '@/dex/store/createQuickSwapSlice'
import { useStore } from '@/dex/store/useStore'
import { TokensNameMapper } from '@/dex/types/main.types'
import { getExchangeRates } from '@/dex/utils/utilsSwap'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import {
  type Route as RouteApiResponse,
  type RoutesQuery,
  useRouterApi as useRouterApiQuery,
} from '@ui-kit/entities/router-api.query'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Address, type Decimal, fromWei, toWei } from '@ui-kit/utils'

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
  { amountIn, amountOut, priceImpact, route, warnings = [], isStableswapRoute, router }: RouteApiResponse,
  { fromAddress, toAddress, chainId, isPending }: SearchedParams & { chainId: number; isPending: boolean },
): RoutesAndOutput => {
  const { isFrom, fromAmount, toAmount } = useStore.getState().quickSwap.formValues
  const { tokensMapper, tokensNameMapper } = useStore.getState().tokens
  const fromAmountOutput = fromWei(amountIn, tokensMapper[chainId][fromAddress]!.decimals)
  const toAmountOutput = fromWei(amountOut, tokensMapper[chainId][toAddress]!.decimals)

  const modalArgs = {
    isExchangeRateLow: warnings.includes('low-exchange-rate'),
    priceImpact,
    toAmount,
    fromAmount,
    toAmountOutput,
    fetchedToAmount: toAmountOutput,
  }

  return {
    router,
    loading: isPending,
    exchangeRates: calculateExchangeRates(
      toAmountOutput,
      isFrom ? fromAmount : fromAmountOutput,
      { fromAddress, toAddress },
      tokensNameMapper[chainId],
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
        poolId,
        ...args,
      }),
    ),
    modal: getRouterWarningModal(
      modalArgs,
      { toAddress, fromAddress },
      getMaxSlippage(isStableswapRoute),
      tokensNameMapper[chainId],
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
    userAddress,
    searchedParams: { toAddress, fromAddress },
  }: {
    searchedParams: SearchedParams
  } & Pick<RoutesQuery, 'chainId' | 'userAddress'>,
  enabled?: boolean,
): {
  data: RoutesAndOutput | undefined
  isLoading: boolean
} {
  const formValues = useStore((state) => state.quickSwap.formValues) as FormValues
  const tokensMapper = useStore((state) => state.tokens.tokensMapper[chainId])
  const fromDecimals = tokensMapper?.[fromAddress]?.decimals
  const toDecimals = tokensMapper?.[toAddress]?.decimals

  const { data, isLoading, isPending, error } = useRouterApiQuery(
    {
      chainId,
      tokenIn: fromAddress as Address,
      tokenOut: toAddress as Address,
      router: 'curve',
      userAddress,
      ...(formValues.isFrom
        ? { ...(fromDecimals && { amountIn: toWei(formValues.fromAmount, fromDecimals) }) }
        : { ...(toDecimals && { amountOut: toWei(formValues.toAmount, toDecimals) }) }),
    } as const,
    enabled && !!fromDecimals && !!toDecimals,
  )
  const route = data?.[0]

  /** Update the store with the fetched amounts and error status */
  useEffect(() => {
    const route = data?.[0]
    const { setAppStateByKeys, quickSwap } = useStore.getState()
    setAppStateByKeys('quickSwap', {
      ...quickSwap,
      formStatus: {
        ...quickSwap.formStatus,
        error: notFalsy(error?.message, data?.length === 0 && 'error-swap-not-available')[0] ?? '',
      },
      ...(route && {
        formValues: {
          ...quickSwap.formValues,
          ...(quickSwap.formValues.isFrom
            ? { toAmount: fromWei(route.amountOut, toDecimals!) }
            : { fromAmount: fromWei(route.amountIn, fromDecimals!) }),
        },
      }),
    })
  }, [data, error, fromDecimals, toDecimals])

  return {
    data: useMemo(
      () => route && convertRoute(route, { fromAddress, toAddress, chainId, isPending }),
      [route, fromAddress, toAddress, isPending, chainId],
    ),
    isLoading,
  }
}
