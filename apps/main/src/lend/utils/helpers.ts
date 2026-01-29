import { Api, OneWayMarketTemplate } from '@/lend/types/lend.types'
import { t } from '@ui-kit/lib/i18n'
import { isDevelopment } from '@ui-kit/utils'

export * from './utilsRouter'

interface CustomError extends Error {
  data?: { message: string }
}

export function log(fnName: string, ...args: unknown[]) {
  if (isDevelopment) {
    console.info(`curve-frontend -> ${fnName}:`, ...args)
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
