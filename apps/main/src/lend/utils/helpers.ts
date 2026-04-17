import { Api, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { isDevelopment } from '@ui-kit/utils'

export * from './utilsRouter'

export function log(fnName: string, ...args: unknown[]) {
  if (isDevelopment) {
    console.info(`curve-frontend -> ${fnName}:`, ...args)
  }
}

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
    return null
  }
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
