import { ChainOption } from '@ui-kit/features/switch-chain'

import sortBy from 'lodash/sortBy'

import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'
import { Chain } from '@ui-kit/utils'
import curvejsApi from '@/dao/lib/curvejs'
import { ChainId, NetworkEnum, NetworkConfig } from '@/dao/types/dao.types'

const DEFAULT_NETWORK_CONFIG = { api: curvejsApi, isActiveNetwork: true, showInSelectNetwork: true }

const networksConfig = Object.values(Chain).reduce(
  (acc, chainId) => {
    if (typeof chainId === 'number') {
      acc[chainId] = {}
    }
    return acc
  },
  {} as Record<number, {}>,
)

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
        isTestnet: networkConfig.isTestnet,
      })
    }
    return mapper
  },
  {
    networks: {} as Record<ChainId, NetworkConfig>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
    selectNetworkList: [] as ChainOption<ChainId>[],
  },
)

export const visibleNetworksList: ChainOption<ChainId>[] = sortBy(selectNetworkList, (n) => n.label)

export default networks
