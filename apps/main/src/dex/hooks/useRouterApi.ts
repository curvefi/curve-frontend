import { useEffect, useMemo } from 'react'
import type {
  FormValues,
  Route,
  RoutesAndOutput,
  RoutesAndOutputModal,
  SearchedParams,
} from '@/dex/components/PageRouterSwap/types'
import { useOptimalRoute } from '@/dex/entities/router.query'
import useTokensNameMapper from '@/dex/hooks/useTokensNameMapper'
import { getRouterWarningModal } from '@/dex/store/createQuickSwapSlice'
import useStore from '@/dex/store/useStore'
import { ChainId } from '@/dex/types/main.types'
import { getExchangeRates } from '@/dex/utils/utilsSwap'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { Address, decimal } from '@ui-kit/utils'

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
    data: useMemo((): RoutesAndOutput | undefined => {
      if (!response?.length) return undefined

      const { amountIn, amountOut, priceImpact, route, warnings = [], isStableswapRoute } = response[0]

      const routes: Route[] = route.map((step: any) => ({
        inputCoinAddress: step.tokenIn[0],
        outputCoinAddress: step.tokenOut[0],
        ...step.args,
        name: step.primary,
        routeUrlId: step.args?.poolId ?? '',
      }))

      const fromAmount = formValues.isFrom ? formValues.fromAmount : amountIn
      const [rateAB, rateBA] = getExchangeRates(amountOut, fromAmount)
      const fromLabel = tokensNameMapper[fromAddress] ?? fromAddress
      const toLabel = tokensNameMapper[toAddress] ?? toAddress

      const args = {
        isExchangeRateLow: warnings.includes('low-exchange-rate'),
        priceImpact,
        toAmount: formValues.toAmount,
        fromAmount: formValues.fromAmount,
        toAmountOutput: amountOut,
        fetchedToAmount: amountOut,
      }

      const maxSlippage = useUserProfileStore.getState().maxSlippage[isStableswapRoute ? 'stable' : 'crypto']

      return {
        loading: isPending,
        exchangeRates: [
          { from: fromLabel, to: toLabel, fromAddress, value: rateAB, label: `${fromLabel}/${toLabel}` },
          { from: toLabel, to: fromLabel, fromAddress: toAddress, value: rateBA, label: `${toLabel}/${fromLabel}` },
        ],
        isHighSlippage: warnings.includes('high-slippage'),
        isStableswapRoute,
        routes,
        modal: getRouterWarningModal(
          args,
          { toAddress, fromAddress },
          maxSlippage,
          tokensNameMapper,
        ) as RoutesAndOutputModal | null,
        ...args,
      }
    }, [
      response,
      isPending,
      tokensNameMapper,
      fromAddress,
      toAddress,
      formValues.isFrom,
      formValues.toAmount,
      formValues.fromAmount,
    ]),
    isLoading,
  }
}
