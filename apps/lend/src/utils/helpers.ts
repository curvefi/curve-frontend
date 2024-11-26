import { t } from '@lingui/macro'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

export * from './utilsGasPrices'
export * from './utilsRouter'
export * from './utilsStorage'

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

export const isDevelopment = process.env.NODE_ENV === 'development'

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
    } else if (typeof error.message === 'string') {
      errorMessage = error.message
    }
  }
  return errorMessage
}

export function scrollToTop() {
  window.scroll({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
    return null
  }
}

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

declare global {
  interface Window {
    clipboardData: any
  }
}

export function copyToClipboard(text: string) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text)
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    var textarea = document.createElement('textarea')
    textarea.textContent = text
    textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea)
    textarea.select()
    try {
      return document.execCommand('copy') // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex)
      return false
    } finally {
      document.body.removeChild(textarea)
    }
  }
}

export function handleClickCopy(text: string) {
  console.log('copied', text)
  copyToClipboard(text)
}

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    setTimeout(() => cb(), 100)
  }
}

export function shortenTokenName(token: string) {
  const tokenLength = token.length
  if (tokenLength > 30) {
    return `${token.slice(0, 10)}...`
  } else {
    return token
  }
}

export function _showContent(show: boolean | undefined) {
  return typeof show === 'undefined' || (typeof show !== 'undefined' && show)
}

export function _parseStepTokensList(list: { value: string | number; symbol: string }[]) {
  return {
    symbolAndAmountList: list.map(({ value, symbol }) => `${value} ${symbol}`).join(', '),
    symbolList: list.map(({ symbol }) => symbol).join(', '),
  }
}

export function _parseActiveKey(api: Api | null, market: OneWayMarketTemplate | undefined) {
  const { chainId = '', signerAddress = '' } = api ?? {}
  const parsedSignerAddress = signerAddress.slice(0, 10)
  return `${chainId}-${parsedSignerAddress}${market?.id}`
}

export function _showNoLoanFound(signerAddress: string | undefined, isComplete: boolean, loanExists?: boolean) {
  if (!!signerAddress && !isComplete && typeof loanExists !== 'undefined' && !loanExists) return true
}
