import type { AlertFormErrorKey } from '@/components/AlertFormError'

import numbro from 'numbro'

export { getStorageValue, setStorageValue } from '@/utils/storage'
import { shortenAccount } from '@/ui/utils'
import type { MutationKey, QueryKey } from '@tanstack/react-query'

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

export function formatNumber(value: string | number | undefined, formatOptions?: numbro.Format) {
  if (typeof value === 'undefined' || value === 'NaN') {
    return '-'
  }

  try {
    if (Number(value) === 0) {
      return '0'
    }

    const options: numbro.Format = {
      mantissa: 3,
      trimMantissa: false,
      thousandSeparated: true,
      ...(formatOptions || {}),
    }
    const parsedValue = numbro(value).format(options)

    if (Number(parsedValue) === 0) {
      const firstTwoNonZeroDigits = Number(value)
        .toFixed(15)
        .match(/^-?\d*\.?0*\d{0,2}/)

      const num = firstTwoNonZeroDigits?.[0]

      if (num) {
        return Number(num) === 0 ? '0' : num
      }
    }
    return parsedValue
  } catch (error) {
    console.error(error)
    return ''
  }
}

export function isValidAddress(address: string) {
  return address?.length === 42 && address !== '0x0000000000000000000000000000000000000000'
}

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

enum LogStatus {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info',
  SETTLED = 'settled',
  QUERY = 'query',
  MUTATION = 'mutation',
  LOADING = 'loading',
  IDLE = 'idle',
  STALE = 'stale',
  FETCHING = 'fetching',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export function log(
  fnName: string | QueryKey | MutationKey | string[],
  status?: LogStatus | string | any,
  ...args: unknown[]
) {
  if (process.env.NODE_ENV !== 'development') return

  const timestamp = new Date().toISOString()
  const fnNameString = Array.isArray(fnName) ? fnName.join('.') : fnName

  const getStatusStyle = (status?: LogStatus | string) => {
    if (!status) return ''
    switch (String(status).toLowerCase()) {
      case LogStatus.ERROR:
        return 'background-color: #ff6b6b; color: #ffffff; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.SUCCESS:
        return 'background-color: #51cf66; color: #ffffff; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.WARNING:
      case LogStatus.MUTATION:
        return 'background-color: #feca57; color: #ffffff; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.INFO:
      case LogStatus.QUERY:
        return 'background-color: #e3f2fd; color: #1976d2; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.SETTLED:
        return 'background-color: #f3e5f5; color: #7b1fa2; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.LOADING:
      case LogStatus.FETCHING:
        return 'background-color: #e0f7fa; color: #0097a7; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      case LogStatus.IDLE:
      case LogStatus.STALE:
      case LogStatus.PAUSED:
      case LogStatus.CANCELLED:
        return 'background-color: #f5f5f5; color: #616161; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
      default:
        return 'color: inherit;'
    }
  }

  const formatFnNameString = (fnNameString: string): [string, string[]] => {
    const parts = fnNameString.split('.')
    let formattedString = ''
    const styles: string[] = []

    parts.forEach((part, index) => {
      if (index > 0) {
        formattedString += '%c.'
        styles.push('color: #666;')
      }
      formattedString += `%c${part}`
      styles.push('color: #4CAF50; font-weight: bold;')
    })

    return [formattedString, styles]
  }

  const statusStyle = getStatusStyle(status)
  const hasDefinedStatus = status && Object.values(LogStatus).includes(status as LogStatus)

  const logMethod = (status?: LogStatus | string) => {
    switch (String(status).toLowerCase()) {
      case LogStatus.ERROR:
        return console.error
      case LogStatus.WARNING:
      case LogStatus.MUTATION:
        return console.warn
      case LogStatus.INFO:
      case LogStatus.QUERY:
        return console.info
      case LogStatus.SUCCESS:
        return console.log
      default:
        return console.log
    }
  }

  const logger = logMethod(status)

  if (hasDefinedStatus) {
    const [formattedFnNameString, fnNameStyles] = formatFnNameString(fnNameString as string)
    logger(
      `%cDApp%c @ %c${timestamp}%c -> %c${status}%c\n${formattedFnNameString}${args.length > 0 ? '%c: ' : ''}%c`,
      'background: #1e63e9; color: white; padding: 2px 4px; border-radius: 3px;',
      'color: #666; font-weight: bold;',
      'color: #2196F3;',
      'color: #666;',
      statusStyle,
      'color: #4CAF50; font-weight: bold;',
      ...fnNameStyles,
      ...(args.length > 0 ? ['color: 666;'] : []),
      'color: inherit;',
      ...args
    )
  } else {
    logger(
      `%cDApp%c @ %c${timestamp}%c ->\n%c${fnNameString}${args.length > 0 ? ':' : ''}%c`,
      'background: #1e63e9; color: white; padding: 2px 4px; border-radius: 3px;',
      'color: #666; font-weight: bold;',
      'color: #2196F3;',
      'color: #666;',
      'color: #4CAF50; font-weight: bold;',
      'color: inherit;',
      ...args
    )
  }
}

export const logQuery = (queryKey: QueryKey, ...args: unknown[]) => {
  log(queryKey, LogStatus.QUERY, ...args)
}

export const logMutation = (mutationKey: MutationKey, ...args: unknown[]) => {
  log(mutationKey, LogStatus.MUTATION, ...args)
}

export function logError(key: QueryKey | MutationKey, ...args: unknown[]) {
  log(key, LogStatus.ERROR, ...args)
}

export function logSuccess(key: QueryKey | MutationKey, ...args: unknown[]) {
  log(key, LogStatus.SUCCESS, ...args)
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
  }
}

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

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

export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    setTimeout(() => cb(), 50)
  }
}

export function getChainPoolIdActiveKey(chainId: ChainId | null, poolId: string | undefined) {
  return chainId && poolId ? `${chainId}-${poolId}` : ''
}

export function getChainSignerActiveKey(chainId: ChainId | null, signerAddress: string | undefined) {
  return chainId && signerAddress ? `${chainId}-${shortenAccount(signerAddress)}` : ''
}
