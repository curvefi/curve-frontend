import BigNumber from 'bignumber.js'
import type { Route } from '@/dex/components/PageRouterSwap/types'
import { parseRouterRoutes } from '@/dex/components/PageRouterSwap/utils'
import { CurveApi, PoolData } from '@/dex/types/main.types'
import type { IRoute } from '@curvefi/api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'

const LOW_EXCHANGE_RATE = 0.98

// exclude these pairs from displaying Exchange rate is low
export function excludeLowExchangeRateCheck(fromAddress: string, toAddress: string, routes: Route[]) {
  // if routes does not have a pool, exclude from low exchange rate check
  if (Array.isArray(routes) && routes.some((r) => r.routeUrlId === '')) {
    return true
  }

  // exclude sDAI check
  const sDAI = '0x83f20f44975d03b1b09e64809b757c47f942beea'
  if (toAddress === sDAI || fromAddress === sDAI) return true

  const pair1 = `${fromAddress}-${toAddress}`
  const pair2 = `${toAddress}-${fromAddress}`

  const exclusionPairs = {
    '0xae78736cd615f374d3085123a210448e74fc6393-0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': true, // rETH, wstETH
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-0x5979d7b546e38e414f7e9822514be443a4800529': true,
    '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee-0xe95a203b1a91a908f9b9ce46459d101078c2c3cb': true, // ETH, ankrETH
    '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb-0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': true,
  }
  // @ts-ignore
  return exclusionPairs[pair1] || exclusionPairs[pair2]
}

// router swap
export function getIsLowExchangeRate(isCrypto: boolean, expected: string, fromAmount: string) {
  if (isCrypto || Number(expected) === 0) {
    return false
  }

  const rate = Number(expected) / Number(fromAmount)
  return rate < LOW_EXCHANGE_RATE
}

// pool swap
export function getSwapIsLowExchangeRate(isCrypto: boolean, firstExchangeRate: string) {
  if (isCrypto || !firstExchangeRate) {
    return false
  } else {
    return +firstExchangeRate < LOW_EXCHANGE_RATE
  }
}

export function getSwapActionModalType(isHighImpact: boolean, isLowExchangeRate: boolean) {
  const modalType: { type: 'priceImpactLowExchangeRate' | 'priceImpact' | 'lowExchangeRate' | ''; title: string } = {
    type: '',
    title: '',
  }

  if (isHighImpact || isLowExchangeRate) {
    if (isHighImpact && isLowExchangeRate) {
      modalType.type = 'priceImpactLowExchangeRate'
      modalType.title = t`High price impact and low exchange rate!`
    } else if (isHighImpact) {
      modalType.type = 'priceImpact'
      modalType.title = t`High price impact!`
    } else {
      modalType.type = 'lowExchangeRate'
      modalType.title = t`Low Exchange Rate!`
    }
  }

  return modalType
}

export function getExchangeRates(expected: string, fromAmount: string) {
  if (Number(expected) === 0 || Number(fromAmount) === 0) {
    return ['0', '0']
  }

  const parsedExpected = new BigNumber(expected).dividedBy(fromAmount).toString()
  let parsedExpectedReversed = ''
  if (Number(parsedExpected) !== 0) {
    parsedExpectedReversed = new BigNumber(1).dividedBy(parsedExpected).toString()
  }
  return [parsedExpected, parsedExpectedReversed]
}

export function _parseRoutesAndOutput(
  curve: CurveApi,
  routes: IRoute,
  priceImpact: number,
  output: string,
  poolsMapper: { [poolId: string]: PoolData },
  maxSlippage: string | undefined,
  toAmount: string,
  toAddress: string,
  fromAmount: string,
  fromAddress: string,
  fetchedToAmount?: string,
) {
  const parsedRouterRoutes = parseRouterRoutes(routes, poolsMapper, curve.getPool)
  const haveCryptoRoutes = parsedRouterRoutes.haveCryptoRoutes
  const parsedMaxSlippage = maxSlippage ? maxSlippage : haveCryptoRoutes ? '0.1' : '0.03'

  const exchangeRates = getExchangeRates(toAmount, fromAmount)

  return {
    exchangeRates: exchangeRates,
    isExchangeRateLow: excludeLowExchangeRateCheck(fromAddress, toAddress, parsedRouterRoutes.routes)
      ? false
      : getIsLowExchangeRate(haveCryptoRoutes, toAmount, fromAmount),
    isHighImpact: priceImpact > +parsedMaxSlippage,
    isHighSlippage: haveCryptoRoutes ? false : Number(exchangeRates[0]) > 0.98,
    isStableswapRoute: !haveCryptoRoutes,
    maxSlippage: parsedMaxSlippage,
    priceImpact: priceImpact,
    routes: parsedRouterRoutes.routes,
    toAmount: toAmount,
    toAmountOutput: output,
    fromAmount: fromAmount,
    // if input toAmount and fetchedToAmount differ is more than slippage, inform user they will get expected not desired
    ...(fetchedToAmount ? { isExpectedToAmount: +toAmount - +fetchedToAmount > +parsedMaxSlippage } : {}),
  }
}
