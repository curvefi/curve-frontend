import { useMemo } from 'react'
import { ChainId, NetworkEnum, type NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from '@evm-ui/hooks/router'
import { useNetworks } from '../entities/networks'

const useNetwork = (blockchainId: string) => {
  const { data: networks } = useNetworks()
  return useMemo(
    () => Object.values(networks).find(network => network.blockchainId === blockchainId),
    [networks, blockchainId],
  )
}

export const useNetworkFromUrl = () => useNetwork(useParams<NetworkUrlParams>().network)

// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
export const useChainId = (blockchainId: NetworkEnum): ChainId => useNetwork(blockchainId)?.chainId!
