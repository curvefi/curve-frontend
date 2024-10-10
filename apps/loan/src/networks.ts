import type { SelectNetworkItem } from '@/ui/Select/SelectNetwork'

import sortBy from 'lodash/sortBy'

import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@/ui/utils'
import curvejsApi from '@/lib/apiCrvusd'

const DEFAULT_NETWORK_CONFIG = {
  api: curvejsApi,
  isActiveNetwork: true,
  showInSelectNetwork: true,
}

const networksConfig = {
  1: {},
}

export const { networks, networksIdMapper, selectNetworkList } = Object.entries(networksConfig).reduce(
  (mapper, [key, config]) => {
    const chainId = Number(key) as ChainId
    const networkConfig = {
      ...getBaseNetworksConfig(chainId, NETWORK_BASE_CONFIG[chainId]),
      ...DEFAULT_NETWORK_CONFIG,
      ...config,
    }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.networkId as NetworkEnum] = chainId

    if (networkConfig.showInSelectNetwork) {
      mapper.selectNetworkList.push({
        label: networkConfig.name,
        chainId,
        src: networkConfig.logoSrc,
        srcDark: networkConfig.logoSrcDark,
      })
    }
    return mapper
  },
  {
    networks: {} as Record<ChainId, NetworkConfig>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
    selectNetworkList: [] as SelectNetworkItem[],
  },
)

export const visibleNetworksList: Iterable<SelectNetworkItem> = sortBy(selectNetworkList, (n) => n.label)

export default networks
