import type { QueryFunction } from '@tanstack/react-query'
import type {
  LowExchangeRateModal,
  PriceImpactLowExchangeRateModal,
  PriceImpactModal,
  SwapEstGasApprovalResp,
  SwapExchangeDetailsResp,
  SwapQueryKeyType,
} from '@/entities/swap'

import { Contract, Interface, JsonRpcProvider } from 'ethers'

import {
  excludeLowExchangeRateCheck,
  getExchangeRates,
  getSwapActionModalType,
  getSwapIsLowExchangeRate,
} from '@/utils/utilsSwap'
import { warnIncorrectEstGas } from '@/lib/curvejs'
import useStore from '@/store/useStore'
import networks from '@/networks'

export const swapIgnoreExchangeRateCheck: QueryFunction<boolean, SwapQueryKeyType<'ignoreExchangeRateCheck'>> = async ({
  queryKey,
}) => {
  const [, chainId, , poolId] = queryKey

  if (!chainId || !poolId) return false

  const { curve, wallet } = useStore.getState()
  const pool = curve.getPool(poolId)

  const provider = wallet.getProvider('') || new JsonRpcProvider(networks[chainId].rpcUrl)

  if (!provider) return false

  try {
    const json = await import('@/components/PagePool/abis/stored_rates.json').then((module) => module.default)
    const iface = new Interface(json)
    const contract = new Contract(pool.address, iface.format(), provider)
    const storedRates = await contract.stored_rates()

    return Object.values(storedRates).some((rate) => {
      // if rate is > 1, then number cannot be checked for exchange rate
      const parsedRate = BigInt(rate as bigint)
        .toString()
        .replace(/0+$/, '')
      return Number(parsedRate) > 1
    })
  } catch (error) {
    // ignore error, only stablswap ng pools have stored_rates
    return false
  }
}

export const swapExchangeDetails: QueryFunction<
  SwapExchangeDetailsResp,
  SwapQueryKeyType<'swapExchangeDetails'>
> = async ({ queryKey }) => {
  const [
    ,
    chainId,
    ,
    poolId,
    ,
    isFrom,
    fromAmount,
    fromAddress,
    fromToken,
    toAddress,
    toAmount,
    toToken,
    isWrapped,
    maxSlippage,
    ignoreExchangeRateCheck,
  ] = queryKey

  let resp: SwapExchangeDetailsResp = {
    exchangeRates: [],
    isExchangeRateLow: false,
    isHighImpact: false,
    priceImpact: 0,
    fromAmount: '',
    toAmount: '',
    modal: null,
    warning: '',
  }

  if (!poolId || typeof ignoreExchangeRateCheck === 'undefined') return resp

  const { curve } = useStore.getState()
  const pool = curve.getPool(poolId)

  // get swap from/to amount
  const [swapExpected, swapRequired] = await Promise.all([
    isFrom
      ? isWrapped
        ? pool.swapWrappedExpected(fromAddress, toAddress, fromAmount)
        : pool.swapExpected(fromAddress, toAddress, fromAmount)
      : '',
    !isFrom
      ? isWrapped
        ? pool.swapWrappedRequired(fromAddress, toAddress, toAmount)
        : pool.swapRequired(fromAddress, toAddress, toAmount)
      : '',
  ])

  // update price impact
  const parsedFromAmount = isFrom ? fromAmount : swapRequired
  const priceImpact = await (isWrapped
    ? pool.swapWrappedPriceImpact(fromAddress, toAddress, parsedFromAmount)
    : pool.swapPriceImpact(fromAddress, toAddress, parsedFromAmount))

  const exchangeRates = isFrom ? getExchangeRates(swapExpected, fromAmount) : getExchangeRates(toAmount, swapRequired)

  resp.exchangeRates = [
    {
      from: fromToken,
      to: toToken,
      fromAddress,
      value: exchangeRates[0] || '',
      label: `${fromToken}/${toToken}`,
    },
    {
      from: toToken,
      to: fromToken,
      fromAddress: toAddress,
      value: exchangeRates[1] || '',
      label: `${toToken}/${fromToken}`,
    },
  ]

  resp.isExchangeRateLow =
    ignoreExchangeRateCheck || excludeLowExchangeRateCheck(fromAddress, toAddress, [])
      ? false
      : getSwapIsLowExchangeRate(pool.isCrypto, exchangeRates[0])
  resp.isHighImpact = priceImpact > +maxSlippage
  resp.priceImpact = priceImpact
  resp.fromAmount = isFrom ? fromAmount : swapRequired
  resp.toAmount = isFrom ? swapExpected : toAmount
  resp.modal = getRouterWarningModal(resp, toToken)
  resp.warning = resp.isExchangeRateLow ? 'warning-exchange-rate-low' : ''
  return resp
}

export const swapApproval: QueryFunction<boolean, SwapQueryKeyType<'swapApproval'>> = async ({ queryKey }) => {
  const [, chainId, , poolId, signerAddress, , isWrapped, fromAddress, toAddress, fromAmount, maxSlippage] = queryKey

  let resp = false

  if (!chainId || !signerAddress || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  return await (isWrapped
    ? pool.swapWrappedIsApproved(fromAddress, fromAmount)
    : pool.swapIsApproved(fromAddress, fromAmount))
}

export const swapEstGas: QueryFunction<EstimatedGas, SwapQueryKeyType<'swapEstGas'>> = async ({ queryKey }) => {
  const [, chainId, , poolId, signerAddress, , isApproved, isWrapped, fromAddress, toAddress, fromAmount, maxSlippage] =
    queryKey

  let resp: EstimatedGas = null

  if (!chainId || !signerAddress || !poolId) return resp

  const curve = useStore.getState().curve
  const pool = curve.getPool(poolId)

  if (isApproved) {
    resp = await (isWrapped
      ? pool.estimateGas.swapWrapped(fromAddress, toAddress, fromAmount, +maxSlippage)
      : pool.estimateGas.swap(fromAddress, toAddress, fromAmount, +maxSlippage))
  }

  if (!isApproved) {
    resp = await (isWrapped
      ? pool.estimateGas.swapWrappedApprove(fromAddress, fromAmount)
      : pool.estimateGas.swapApprove(fromAddress, fromAmount))
  }
  warnIncorrectEstGas(chainId, resp)
  return resp
}

// helpers
function getRouterWarningModal(
  {
    isHighImpact,
    isExchangeRateLow,
    priceImpact,
    toAmount,
    fromAmount,
  }: Pick<SwapExchangeDetailsResp, 'isHighImpact' | 'isExchangeRateLow' | 'priceImpact' | 'toAmount' | 'fromAmount'>,
  toToken: string
): LowExchangeRateModal | PriceImpactModal | PriceImpactLowExchangeRateModal | null {
  const swapModalProps = getSwapActionModalType(isHighImpact, isExchangeRateLow)
  const exchangeRate = (+toAmount / +fromAmount).toString()
  const exchangeValues = { toAmount, toToken }

  if (!swapModalProps.type) return null

  if (swapModalProps.type === 'lowExchangeRate') {
    return {
      lowExchangeRate: true,
      title: swapModalProps.title,
      exchangeRate,
      ...exchangeValues,
    }
  }

  if (swapModalProps.type === 'priceImpact') {
    return {
      priceImpact: true,
      title: swapModalProps.title,
      value: `${priceImpact || 0}`,
      ...exchangeValues,
    }
  }

  if (swapModalProps.type === 'priceImpactLowExchangeRate') {
    return {
      priceImpactLowExchangeRate: true,
      title: swapModalProps.title,
      value: `${priceImpact || 0}`,
      exchangeRate,
      ...exchangeValues,
    }
  }

  return null
}
