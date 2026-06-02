import { curvejsApi } from '@/dao/lib/curvejs'
import { ChainId, NetworkConfig, NetworkEnum } from '@/dao/types/dao.types'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'

const DEFAULT_NETWORK_CONFIG = { api: curvejsApi, isActiveNetwork: true, showInSelectNetwork: true }

export const { networks, networksIdMapper } = Object.entries(NETWORK_BASE_CONFIG).reduce(
  (
    mapper,
    [key, config],
  ): {
    networks: Record<ChainId, NetworkConfig>
    networksIdMapper: Record<NetworkEnum, ChainId>
  } => {
    const chainId = +key
    const networkConfig = {
      ...getBaseNetworksConfig<NetworkEnum, ChainId>(chainId, config),
      ...DEFAULT_NETWORK_CONFIG,
      showInSelectNetwork: chainId === 1,
    }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.networkId] = chainId
    return mapper
  },
  {
    networks: {},
    networksIdMapper: {},
  },
)
