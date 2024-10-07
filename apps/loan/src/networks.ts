import sortBy from 'lodash/sortBy'

import { baseNetworksConfig } from '@/ui/utils'
import curvejsApi from '@/lib/apiCrvusd'

const isDevelopment = process.env.NODE_ENV === 'development'
const drpcUrl = (network: string) =>
  `https://lb.drpc.org/ogrpc?network=${network}&dkey=${process.env.NEXT_PUBLIC_FRONTEND_DRPC_KEY}`

const DEFAULT_NETWORK_CONFIG = {
  api: curvejsApi,
  showInSelectNetwork: true,
}

const networks: Record<ChainId, NetworkConfig> = {
  1: {
    ...DEFAULT_NETWORK_CONFIG,
    ...baseNetworksConfig['1'],
    rpcUrl: isDevelopment ? process.env.NEXT_PUBLIC_ETHEREUM_DEV_RPC_URL! : drpcUrl('ethereum'),
  },
}

export const networksIdMapper = Object.keys(networks).reduce((prev, chainId: unknown) => {
  const networkConfig = networks[chainId as ChainId]
  prev[networkConfig.id] = networkConfig.networkId
  return prev
}, {} as Record<NetworkEnum, ChainId>)

export const visibleNetworksList = sortBy(
  Object.keys(networks)
    .filter((chainId) => networks[+chainId as ChainId].showInSelectNetwork)
    .map((chainId: unknown) => {
      const networkConfig = networks[chainId as ChainId]
      return { icon: networkConfig.icon, label: networkConfig.name, chainId: networkConfig.networkId }
    }),
  (n) => n.label
)

export default networks
