import { type ChainId, NetworkEnum } from '@/dex/types/main.types'
import { useNetworks } from '../entities/networks'

export const useChainId = (networkId: NetworkEnum): ChainId => {
  const { data: networks } = useNetworks()
  return Object.values(networks).find((network) => network.networkId === networkId)!.chainId as ChainId
}
