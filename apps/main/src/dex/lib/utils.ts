import fetch from 'cross-fetch'
import { CurveApi, NetworkConfig } from '@/dex/types/main.types'

export const httpFetcher = (uri: string) => fetch(uri).then((res) => res.json())

export function curveProps(curve: CurveApi | null, networks: Record<number, NetworkConfig>) {
  if (curve) {
    const { chainId, signerAddress } = curve
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
