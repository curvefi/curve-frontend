import upperFirst from 'lodash/upperFirst'
import { AlertFormErrorKey, GaugeFormattedData, GaugeMapper } from '@/dao/types/dao.types'
import { todayInMilliseconds } from '@/dex/utils/utilsDates'
import { Chain } from '@ui-kit/utils'

export * from './utilsRouter'
export * from './utilsDates'

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

export const findRootGauge = (gaugeAddress: string, gaugeMapper: GaugeMapper) => {
  for (const key in gaugeMapper) {
    if (gaugeMapper[key].address === gaugeAddress) {
      return gaugeMapper[key].effective_address ?? gaugeMapper[key].address
    }
  }
  return ''
}

export function getIsLockExpired(lockedAmount: string, unlockTime: number) {
  return unlockTime && unlockTime < todayInMilliseconds() && +lockedAmount > 0
}
