import sortBy from 'lodash/sortBy'
import curvejsApi from '@/dao/lib/curvejs'
import { ChainId, NetworkEnum, NetworkConfig } from '@/dao/types/dao.types'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'
import { ChainOption } from '@ui-kit/features/switch-chain'
import { Chain } from '@ui-kit/utils'

const DEFAULT_NETWORK_CONFIG = { api: curvejsApi, isActiveNetwork: true, showInSelectNetwork: true }

export const { networks, networksIdMapper, selectNetworkList } = Object.values(Chain).reduce(
  (mapper, chainId) => {
    if (typeof chainId === 'number') {
      const networkConfig = {
        ...getBaseNetworksConfig(chainId, NETWORK_BASE_CONFIG[chainId]),
        ...DEFAULT_NETWORK_CONFIG,
        showInSelectNetwork: chainId === 1,
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
