import BigNumber from 'bignumber.js'
import { ethAddress } from 'viem'
import { zeroAddress } from 'viem'
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
    [`${ethAddress}-0x5979d7b546e38e414f7e9822514be443a4800529`]: true,
    [`${ethAddress}-0xe95a203b1a91a908f9b9ce46459d101078c2c3cb`]: true, // ETH, ankrETH
    [`0xe95a203b1a91a908f9b9ce46459d101078c2c3cb-${ethAddress}`]: true,
  }
  return exclusionPairs[pair1] || exclusionPairs[pair2]
}

// router swap
export function getIsLowExchangeRate(
  isCrypto: boolean,
  expected: string,
  fromAmount: string,
  toStoredRate: string | undefined,
) {
  if (isCrypto || Number(expected) === 0) {
    return false
  }

  /**
   * toStoredRate is above 1 if the "toToken" is a token of type oracle or of type erc4626 in a stableswap-ng pool.
   */
  if (toStoredRate && Number(toStoredRate) > 1) {
    return Number(fromAmount) / Number(expected) < Number(toStoredRate) * LOW_EXCHANGE_RATE
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
  toAmount: string,
  toAddress: string,
  toStoredRate: string | undefined,
  fromAmount: string,
  fromAddress: string,
  fetchedToAmount?: string,
) {
  const { routes: parseRoutes, haveCryptoRoutes } = parseRouterRoutes(routes, poolsMapper, curve.getPool)
  const exchangeRates = getExchangeRates(toAmount, fromAmount)

  return {
    exchangeRates,
    isExchangeRateLow: excludeLowExchangeRateCheck(fromAddress, toAddress, parseRoutes)
      ? false
      : getIsLowExchangeRate(haveCryptoRoutes, toAmount, fromAmount, toStoredRate),
    isHighSlippage: haveCryptoRoutes ? false : Number(exchangeRates[0]) > 0.98,
    isStableswapRoute: !haveCryptoRoutes,
    priceImpact,
    routes: parseRoutes,
    toAmount,
    toAmountOutput: output,
    fromAmount,
    fetchedToAmount: fetchedToAmount || '',
  }
}

/**
 * Parameters for calculating slippage impact
 * @typedef {Object} GetSlippageImpactParams
 * @property {string} maxSlippage - Maximum allowed slippage percentage
 * @property {string} toAmount - Target amount the user wants to receive
 * @property {number|null} priceImpact - Calculated price impact of the swap
 * @property {string} [fetchedToAmount] - Optional actual amount that will be received after the swap
 */
type GetSlippageImpactParams = {
  maxSlippage: string
  toAmount: string
  priceImpact: number | null
  fetchedToAmount?: string
}

/**
 * Calculates the slippage impact of a swap.
 * Used to be part of the _parseRoutesAndOutput function, but was extracted out.
 *
 * @param {GetSlippageImpactParams} params - Parameters for slippage calculation
 * @returns {Object} Object containing:
 *   - isHighImpact: true if price impact exceeds max slippage
 *   - isExpectedToAmount: true if difference between desired and actual amount exceeds max slippage
 */
export function getSlippageImpact({ maxSlippage, toAmount, priceImpact, fetchedToAmount }: GetSlippageImpactParams) {
  return {
    isHighImpact: priceImpact !== null && priceImpact > +maxSlippage,
    // if input toAmount and fetchedToAmount differ is more than slippage, inform user they will get expected not desired
    ...(fetchedToAmount ? { isExpectedToAmount: +toAmount - +(fetchedToAmount ?? 0) > +maxSlippage } : {}),
  }
}

/**
 * Get the stored rate for the to token in the last route.
 * Stored rate is important for checking if a token is of type oracle or erc4626.
 * Tokens of type oracle or erc4626 can have stored rates above 1 and should be handled differently when checking for low exchange rate.
 * @returns The stored rate for the to token in the last route.
 */
export async function routerGetToStoredRate(routes: IRoute, curve: CurveApi, toAddress: string) {
  if (routes.length === 0) {
    return undefined
  }

  const lastRoute = routes[routes.length - 1]

  // zero address has no stored rate
  if (lastRoute.poolAddress === zeroAddress) {
    return undefined
  }

  const pool = curve.getPool(lastRoute.poolId)
  const storedRates = await pool.getStoredRates()
  const ratesWithAddresses = pool.underlyingCoinAddresses.map((address, index) => ({
    coinAddress: address.toLowerCase(),
    rate: storedRates[index],
  }))

  const toStoredRate = ratesWithAddresses.find((r) => r.coinAddress === toAddress.toLowerCase())?.rate

  return toStoredRate
}
