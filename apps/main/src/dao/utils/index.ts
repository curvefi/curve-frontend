import upperFirst from 'lodash/upperFirst'
import { AlertFormErrorKey, GaugeFormattedData } from '@/dao/types/dao.types'
import { Chain } from '@ui-kit/utils'

export * from './utilsRouter'
export * from './utilsDates'

export function copyToClipboard(text: string) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', text)
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    const textarea = document.createElement('textarea')
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

export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    setTimeout(() => cb(), 50)
  }
}

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

export function getChainIdFromGaugeData(gaugeData: GaugeFormattedData | undefined) {
  if (!gaugeData) return 1
  const gaugeNetwork = gaugeData?.pool?.chain ?? gaugeData?.market?.chain ?? 'ethereum'
  return Chain[upperFirst(gaugeNetwork) as keyof typeof Chain] ?? 1
}
