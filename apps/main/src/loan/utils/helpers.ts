import networks from '@/loan/networks'
import { Curve } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

interface CustomError extends Error {
  data?: { message: string }
}

export function isNumber<T>(val: T) {
  return !(typeof val === 'undefined' || val === null)
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

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
    return null
  }
}

export const shortenAccount = (account: string, visibleLength = 4): string =>
  account.slice(0, account.startsWith('0x') ? visibleLength + 2 : visibleLength) +
  '…' +
  account.slice(account.length - visibleLength)

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

export function curveProps(curve: Curve | null) {
  if (curve) {
    const chainId = curve.chainId
    const signerAddress = curve.signerAddress
    return {
      chainId,
      haveSigner: !!signerAddress,
      signerAddress: signerAddress,
      network: networks[chainId],
    }
  } else {
    return {
      chainId: null,
      haveSigner: false,
      signerAddress: '',
      network: null,
    }
  }
}
