import { LlamalendApi } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { t } from '@ui-kit/lib/i18n'

export * from './utilsRouter'

interface CustomError extends Error {
  data?: { message: string }
}

export const isDevelopment = process.env.NODE_ENV === 'development'

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

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
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

export function _parseActiveKey(api: LlamalendApi | null, market: LendMarketTemplate | undefined) {
  const { chainId = '', signerAddress = '' } = api ?? {}
  const parsedSignerAddress = signerAddress.slice(0, 10)
  return `${chainId}-${parsedSignerAddress}${market?.id}`
}

export function _showNoLoanFound(signerAddress: string | undefined, isComplete: boolean, loanExists?: boolean) {
  if (!!signerAddress && !isComplete && typeof loanExists !== 'undefined' && !loanExists) return true
}
