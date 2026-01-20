import { curvejsApi } from '@/dao/lib/curvejs'
import { ChainId, NetworkConfig, NetworkEnum } from '@/dao/types/dao.types'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'

const DEFAULT_NETWORK_CONFIG = { api: curvejsApi, isActiveNetwork: true, showInSelectNetwork: true }

export const { networks, networksIdMapper } = Object.entries(NETWORK_BASE_CONFIG).reduce(
  (mapper, [key, config]) => {
    const chainId = +key
    const networkConfig = {
      ...getBaseNetworksConfig<NetworkEnum, ChainId>(chainId, config),
      ...DEFAULT_NETWORK_CONFIG,
      showInSelectNetwork: chainId === 1,
    }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.networkId as NetworkEnum] = chainId
    return mapper
  },
  {
    networks: {} as Record<ChainId, NetworkConfig>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
  },
)
