import networks from '@/loan/networks'
import { type ChainId, LlamaApi } from '@/loan/types/loan.types'
import { t } from '@ui-kit/lib/i18n'

interface CustomError extends Error {
  data?: { message: string }
}

export const isDevelopment = process.env.NODE_ENV === 'development'

export function log(fnName: string, ...args: unknown[]) {
  if (isDevelopment) {
    console.info(`curve-frontend -> ${fnName}${args.length ? ':' : ''}`, ...args)
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

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

export function sleep(ms?: number) {
  const parsedMs = ms || Math.floor(Math.random() * (10000 - 1000 + 1) + 1000)
  return new Promise((resolve) => setTimeout(resolve, parsedMs))
}

export function curveProps(curve: LlamaApi | null) {
  if (curve) {
    const chainId = curve.chainId as ChainId
    const signerAddress = curve.signerAddress
    return {
      chainId,
      haveSigner: !!signerAddress,
      signerAddress: signerAddress,
      network: networks[chainId],
    }
  }
  return {
    chainId: null,
    haveSigner: false,
    signerAddress: '',
    network: null,
  }
}
