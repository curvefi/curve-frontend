import { Api, OneWayMarketTemplate } from '@/lend/types/lend.types'

export * from './utilsRouter'

export const isDevelopment = process.env.NODE_ENV === 'development'

export function log(fnName: string, ...args: unknown[]) {
  if (isDevelopment) {
    console.info(`curve-frontend -> ${fnName}:`, ...args)
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
    return null
  }
}

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

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
