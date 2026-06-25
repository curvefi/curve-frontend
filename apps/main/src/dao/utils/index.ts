import lodash from 'lodash'
import { isAddress, zeroAddress } from 'viem'
import { TOP_HOLDERS } from '@/dao/constants'
import { GaugeFormattedData, GaugeMapper } from '@/dao/types/dao.types'
import { Chain, shortenAddress } from '@ui-kit/utils'

export * from './utilsRouter'
export * from './utilsDates'

export function delayAction<T>(cb: T) {
  if (typeof cb === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return -- Existing violation before enabling this rule.
    setTimeout(() => cb(), 50)
  }
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

export const formatHolderName = (user: string) =>
  TOP_HOLDERS[user.toLowerCase()]?.title ?? (isAddress(user, { strict: false }) ? shortenAddress(user) : user)

const ELLIPSIS = '...'

// Keep chart label truncation aligned with the default EVM address display length used by formatHolderName.
const SHORTENED_ADDRESS_LENGTH = shortenAddress(zeroAddress).length

export const truncateToShortenedAddressLength = (value: string) =>
  value.length > SHORTENED_ADDRESS_LENGTH
    ? `${value.slice(0, SHORTENED_ADDRESS_LENGTH - ELLIPSIS.length)}${ELLIPSIS}`
    : value
