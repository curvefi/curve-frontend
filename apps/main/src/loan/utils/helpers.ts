import { networks } from '@/loan/networks'
import { type ChainId, LlamaApi } from '@/loan/types/loan.types'

export { log } from '@ui-kit/lib/logging'

export function fulfilledValue<T>(result: PromiseSettledResult<T>) {
  if (result.status === 'fulfilled') {
    return result.value
  } else {
    console.error(result.reason)
    return null
  }
}

export const curveProps = (curve: LlamaApi | null) =>
  curve
    ? {
        chainId: curve.chainId as ChainId,
        haveSigner: !!curve.signerAddress,
        signerAddress: curve.signerAddress,

        network: networks[curve.chainId as ChainId],
      }
    : {
        chainId: null,
        haveSigner: false,
        signerAddress: '',
        network: null,
      }
