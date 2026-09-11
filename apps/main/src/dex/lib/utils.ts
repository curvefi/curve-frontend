import { CurveApi, NetworkConfig } from '@/dex/types/main.types'

export function curveProps(curve: CurveApi | null, networks: Record<number, NetworkConfig>) {
  const { chainId = null, signerAddress = '' } = curve ?? {}
  return { chainId, haveSigner: !!signerAddress, signerAddress, network: chainId && networks[chainId] }
}
