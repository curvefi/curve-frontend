import type { AlertFormErrorKey } from '@/dex/components/AlertFormError'
export { getStorageValue, setStorageValue } from '@/dex/utils/storage'
import { shortenAccount } from '@ui/utils'
import { ChainId } from '@/dex/types/main.types'

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent#mobile_device_detection
export function isMobile() {
  let hasTouchScreen

  if ('maxTouchPoints' in navigator) {
    hasTouchScreen = navigator.maxTouchPoints > 0
  } else if ('msMaxTouchPoints' in navigator) {
    // @ts-ignore
    hasTouchScreen = navigator.msMaxTouchPoints > 0
  } else {
    const mQ = matchMedia?.('(pointer:coarse)')
    if (mQ?.media === '(pointer:coarse)') {
      // @ts-ignore
      hasTouchScreen = mQ.matches
    } else if ('orientation' in window) {
      hasTouchScreen = true // deprecated, but good fallback
    } else {
      // Only as a last resort, fall back to user agent sniffing
      // @ts-ignore
      const UA = navigator.userAgent
      hasTouchScreen =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) || /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA)
    }
  }

  return hasTouchScreen
}

export function shortenTokenName(token: string) {
  const tokenLength = token.length
  if (tokenLength > 30) {
    return `${token.slice(0, 10)}...`
  } else {
    return token
  }
}

export const isValidAddress = (address: string) =>
  address?.length === 42 && address !== '0x0000000000000000000000000000000000000000'

export function shortenTokenAddress(tokenAddress: string, startOnly?: boolean) {
  if (!tokenAddress) return
  const start = tokenAddress.slice(0, 4)
  const end = tokenAddress.slice(-4)
  return startOnly ? start : `${start}...${end}`
}

export function removeExtraSpaces(str: string) {
  return str.replace(/ +(?= )/g, '').trim()
}

export function isHighSlippage(slippage: number, maxSlippage: string) {
  return slippage < 0 && Math.abs(slippage) > Number(maxSlippage)
}

export function isBonus(slippage: number) {
  return Number(slippage) > 0
}

export function getErrorMessage(error: Error, errorMessage: AlertFormErrorKey | string) {
  if (error?.message) {
    const message = error.message.toString()
    if (message.includes('Bad swap type')) {
      return 'error-swap-not-available'
    } else if (message.includes('user rejected action')) {
      return 'error-user-rejected-action'
    } else {
      return error.message
    }
  } else {
    return errorMessage
  }
}

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
  }
}

export const sleep = (ms: number = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// curve.fi url
export function getCurvefiUrl(poolId: string, host: string) {
  const v2Key = 'factory-v2-'
  const cryptoKey = 'factory-crypto-'

  if (poolId.match(v2Key)) {
    return `${host}/factory/${poolId.split(v2Key)[1]}`
  } else if (poolId.match(cryptoKey)) {
    return `${host}/factory-crypto/${poolId.split(cryptoKey)[1]}`
  } else {
    return `${host}/${poolId}`
  }
}

export const delayAction = <T extends () => unknown>(cb: T) => setTimeout(() => cb(), 50)

export const getChainPoolIdActiveKey = (chainId: ChainId | null, poolId: string | undefined) =>
  chainId && poolId ? `${chainId}-${poolId}` : ''

export const getChainSignerActiveKey = (chainId: ChainId | null, signerAddress: string | undefined) =>
  chainId && signerAddress ? `${chainId}-${shortenAccount(signerAddress)}` : ''

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())
