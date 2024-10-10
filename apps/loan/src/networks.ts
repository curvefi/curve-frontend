import type { SelectNetworkItem } from '@/ui/Select/SelectNetwork'

import sortBy from 'lodash/sortBy'

import { getBaseNetworksConfig } from '@/ui/utils'
import curvejsApi from '@/lib/apiCrvusd'

const DEFAULT_NETWORK_CONFIG = {
  api: curvejsApi,
  isActiveNetwork: true,
  showInSelectNetwork: true,
}

const networks1 = {
  1: {},
}

export const { networks, networksIdMapper, selectNetworkList } = Object.entries(networks1).reduce(
  (mapper, [key, config]) => {
    const chainId = Number(key) as ChainId
    const baseConfig = getBaseNetworksConfig(chainId)
    const customConfig = { ...DEFAULT_NETWORK_CONFIG, ...config }

    mapper.networks[chainId] = {
      ...baseConfig,
      ...customConfig,
    }
    mapper.networksIdMapper[baseConfig.networkId as NetworkEnum] = chainId

    if (customConfig.showInSelectNetwork) {
      mapper.selectNetworkList.push({
        label: baseConfig.name,
        chainId,
        src: baseConfig.logoSrc,
        srcDark: baseConfig.logoSrcDark,
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
