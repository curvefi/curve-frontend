import lodash from 'lodash'
import { GaugeFormattedData, GaugeMapper } from '@/dao/types/dao.types'
import { Chain } from '@ui-kit/utils'

export * from './utilsRouter'
export * from './utilsDates'

export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    setTimeout(() => cb(), 50)
  }
}

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

export function getChainIdFromGaugeData(gaugeData: GaugeFormattedData | undefined) {
  if (!gaugeData) return 1
  const gaugeNetwork = gaugeData?.pool?.chain ?? gaugeData?.market?.chain ?? 'ethereum'
  return Chain[lodash.upperFirst(gaugeNetwork) as keyof typeof Chain] ?? 1
}

export const findRootGauge = (gaugeAddress: string, gaugeMapper: GaugeMapper) => {
  for (const key in gaugeMapper) {
    if (gaugeMapper[key].address === gaugeAddress) {
      return gaugeMapper[key].effective_address ?? gaugeMapper[key].address
    }
  }
  return ''
}
