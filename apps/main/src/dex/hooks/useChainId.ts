import { useMemo } from 'react'
import { ChainId, NetworkEnum, type NetworkUrlParams } from '@/dex/types/main.types'
import { useParams } from '@ui-kit/hooks/router'
import { Chain } from '@ui-kit/utils'
import { useNetworks } from '../entities/networks'

const useNetwork = (networkId: string) => {
  const { data: networks } = useNetworks()
  return useMemo(() => Object.values(networks).find(network => network.networkId === networkId), [networks, networkId])
}

export const useNetworkFromUrl = () => useNetwork(useParams<NetworkUrlParams>().network)

export const useChainId = (networkId: NetworkEnum): ChainId => useNetwork(networkId)?.chainId ?? Chain.Ethereum
