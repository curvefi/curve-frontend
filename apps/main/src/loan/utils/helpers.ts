import networks from '@/loan/networks'
import { type ChainId, LlamaApi } from '@/loan/types/loan.types'

interface CustomError extends Error {
  data?: { message: string }
}

export const isDevelopment = process.env.NODE_ENV === 'development'

export function log(fnName: string, ...args: unknown[]) {
  if (isDevelopment) {
    console.info(`curve-frontend -> ${fnName}${args.length ? ':' : ''}`, ...args)
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
