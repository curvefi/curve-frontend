import { useEffect, useMemo } from 'react'
import { getAddress, isAddress } from 'viem'
import type { FormValues, RoutesAndOutput, SearchedParams } from '@/dex/components/PageRouterSwap/types'
import { useTokenNames, useTokens } from '@/dex/queries/tokens.query'
import { useStore } from '@/dex/store/useStore'
import { TokensNameMapper } from '@/dex/types/main.types'
import { getExchangeRates, getRouterWarningModal } from '@/dex/utils/utilsSwap'
import type { IRouteStep } from '@curvefi/api/lib/interfaces'
import { type RouteResponse, type RoutesQuery, useRouterApi as useRouterApiQuery } from '@evm-ui/entities/router-api'
import { fromWei } from '@evm-ui/utils'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { useUserProfileStore } from '@ui/features/user-profile'
import { toWei } from '@ui/lib/decimal'

/** Calculate exchange rates for display, retaining the API quote's direction convention. */
const calculateExchangeRate = (
  [rateAB, rateBA]: [Decimal, Decimal],
  { fromAddress, toAddress }: { fromAddress: Address; toAddress: Address },
  tokensNameMapper: TokensNameMapper,
) => {
  const fromLabel = tokensNameMapper[fromAddress] ?? fromAddress
  const toLabel = tokensNameMapper[toAddress] ?? toAddress
  return rateAB > rateBA
    ? { from: fromLabel, to: toLabel, fromAddress, value: rateAB, label: `${fromLabel}/${toLabel}` }
    : { from: toLabel, to: fromLabel, fromAddress: toAddress, value: rateBA, label: `${toLabel}/${fromLabel}` }
}

/** Convert a quote using the metadata, form values and slippage from the current render. */
const convertRoute = (
  {
    amountIn: [amountIn],
    amountOut: [amountOut],
    priceImpact,
    route,
    warnings = [],
    isStableswapRoute = false,
    router,
  }: RouteResponse,
  {
    fromAddress,
    toAddress,
    fromDecimals,
    toDecimals,
    isPending,
  }: { fromAddress: Address; toAddress: Address; fromDecimals: number; toDecimals: number; isPending: boolean },
  { isFrom, fromAmount, toAmount }: FormValues,
  tokensNameMapper: TokensNameMapper,
  maxSlippage: Decimal,
): RoutesAndOutput => {
  const fromAmountOutput = fromWei(amountIn, fromDecimals)
  const toAmountOutput = fromWei(amountOut, toDecimals)
  const exchangeRates = getExchangeRates(toAmountOutput, isFrom ? fromAmount : fromAmountOutput)
  const modalArgs = {
    isExchangeRateLow: warnings.includes('low-exchange-rate'),
    priceImpact,
    toAmount: isFrom ? toAmountOutput : toAmount,
    fromAmount: isFrom ? fromAmount : fromAmountOutput,
    toAmountOutput,
    fetchedToAmount: toAmountOutput,
  }

  return {
    router,
    loading: isPending,
    exchangeRates,
    exchangeRate: calculateExchangeRate(exchangeRates, { fromAddress, toAddress }, tokensNameMapper),
    isHighSlippage: warnings.includes('high-slippage'),
    isStableswapRoute,
    routes: (route ?? []).map(({ args, name, tokenIn: [inputCoinAddress], tokenOut: [outputCoinAddress] }) => ({
      inputCoinAddress,
      outputCoinAddress,
      name,
      routeUrlId: (args as { poolId: string }).poolId ?? '',
      ...(args as Omit<IRouteStep, 'inputCoinAddress' | 'outputCoinAddress'>),
    })),
    modal: getRouterWarningModal(modalArgs, { toAddress, fromAddress }, maxSlippage, tokensNameMapper),
    ...modalArgs,
  }
}

/** Fetch optimal swap routes and synchronize the current quote's amounts with the form. */
export function useRouterApi(
  {
    chainId,
    userAddress,
    searchedParams,
  }: { searchedParams: SearchedParams } & Pick<RoutesQuery, 'chainId' | 'userAddress'>,
  enabled = true,
): { data: RoutesAndOutput | undefined; isLoading: boolean; error: Error | null } {
  const formValues = useStore(state => state.quickSwap.formValues)
  const activeKey = useStore(state => state.quickSwap.activeKey)
  const { data: tokenData, error: tokensError, isLoading: tokensLoading } = useTokens({ chainId })
  const { data: tokensNameMapper } = useTokenNames({ chainId })
  const fromAddress = isAddress(searchedParams.fromAddress, { strict: false })
    ? getAddress(searchedParams.fromAddress)
    : undefined
  const toAddress = isAddress(searchedParams.toAddress, { strict: false })
    ? getAddress(searchedParams.toAddress)
    : undefined
  const fromDecimals = fromAddress && tokenData?.tokens[fromAddress]?.decimals
  const toDecimals = toAddress && tokenData?.tokens[toAddress]?.decimals
  const metadataReady = fromDecimals != null && toDecimals != null && !tokensError
  const { isFrom, fromAmount, toAmount } = formValues
  const enteredAmount = isFrom ? fromAmount : toAmount

  const { data, isLoading, isPending, error } = useRouterApiQuery(
    {
      chainId,
      tokenIn: fromAddress,
      tokenOut: toAddress,
      router: 'curve',
      userAddress,
      ...(isFrom
        ? { ...(fromDecimals != null && { amountIn: toWei(fromAmount, fromDecimals) }) }
        : { ...(toDecimals != null && { amountOut: toWei(toAmount, toDecimals) }) }),
    },
    enabled && metadataReady,
  )
  const route = data?.[0]
  const maxSlippage = useUserProfileStore(state => state.maxSlippage[route?.isStableswapRoute ? 'stable' : 'crypto'])

  useEffect(() => {
    if (!enabled || !metadataReady || fromDecimals == null || toDecimals == null) return
    const { setAppStateByKeys, quickSwap } = useStore.getState()
    const currentForm = quickSwap.formValues
    if (
      quickSwap.activeKey !== activeKey ||
      currentForm.isFrom !== isFrom ||
      (isFrom ? currentForm.fromAmount : currentForm.toAmount) !== enteredAmount
    )
      return

    const nextError = error?.message ?? (data?.length === 0 ? 'error-swap-not-available' : '')
    const outputAmount =
      route && (isFrom ? fromWei(route.amountOut[0], toDecimals) : fromWei(route.amountIn[0], fromDecimals))
    if (
      quickSwap.formStatus.error === nextError &&
      (outputAmount == null || outputAmount === (isFrom ? currentForm.toAmount : currentForm.fromAmount))
    )
      return

    setAppStateByKeys('quickSwap', {
      formStatus: { ...quickSwap.formStatus, error: nextError },
      ...(outputAmount != null && {
        formValues: { ...currentForm, ...(isFrom ? { toAmount: outputAmount } : { fromAmount: outputAmount }) },
      }),
    })
  }, [enabled, metadataReady, data, route, error, fromDecimals, toDecimals, activeKey, isFrom, enteredAmount])

  return {
    data: useMemo(
      () =>
        enabled &&
        metadataReady &&
        route &&
        fromAddress &&
        toAddress &&
        fromDecimals != null &&
        toDecimals != null &&
        tokensNameMapper
          ? convertRoute(
              route,
              { fromAddress, toAddress, fromDecimals, toDecimals, isPending },
              formValues,
              tokensNameMapper,
              maxSlippage,
            )
          : undefined,
      [
        enabled,
        metadataReady,
        route,
        fromAddress,
        toAddress,
        fromDecimals,
        toDecimals,
        isPending,
        formValues,
        tokensNameMapper,
        maxSlippage,
      ],
    ),
    isLoading: enabled && (tokensLoading || isLoading),
    error: tokensError ?? error,
  }
}
