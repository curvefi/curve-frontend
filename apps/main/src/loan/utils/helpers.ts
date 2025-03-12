import networks from '@/loan/networks'
import { Curve } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

interface CustomError extends Error {
  data?: { message: string }
}

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

export function isNumber<T>(val: T) {
  return !(typeof val === 'undefined' || val === null)
}

export const isDevelopment = process.env.NODE_ENV === 'development'

export function removeExtraSpaces(str: string) {
  return str.replace(/ +(?= )/g, '').trim()
}

export function isHighSlippage(slippage: number, maxSlippage: string) {
  return slippage < 0 && Math.abs(slippage) > Number(maxSlippage)
}

export function log(fnName: string, ...args: unknown[]) {
  if (isDevelopment) {
    console.log(`curve-frontend -> ${fnName}:`, ...args)
  }
}

export function getErrorMessage(error: CustomError, defaultErrorMessage: string) {
  let errorMessage = defaultErrorMessage

  if (error?.message) {
    if (error.message.startsWith('user rejected transaction')) {
      errorMessage = t`User rejected transaction`
    } else if ('data' in error && typeof error.data?.message === 'string') {
      errorMessage = error.data.message
    } else {
      errorMessage = error.message
    }
  }
  return errorMessage
}

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
    return null
  }
}

export const shortenAccount = (account: string, visibleLength = 4): string =>
  account.slice(0, account.startsWith('0x') ? visibleLength + 2 : visibleLength) +
  '…' +
  account.slice(account.length - visibleLength)

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

export function curveProps(curve: Curve | null) {
  if (curve) {
    const chainId = curve.chainId
    const signerAddress = curve.signerAddress
    return {
      chainId,
      haveSigner: !!signerAddress,
      signerAddress: signerAddress,
      network: networks[chainId],
    }
  } else {
    return {
      chainId: null,
      haveSigner: false,
      signerAddress: '',
      network: null,
    }
  }
}

export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    setTimeout(() => cb(), 100)
  }
}
