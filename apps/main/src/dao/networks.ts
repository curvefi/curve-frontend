import sortBy from 'lodash/sortBy'
import curvejsApi from '@/dao/lib/curvejs'
import { ChainId, NetworkConfig, NetworkEnum } from '@/dao/types/dao.types'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'
import { ChainOption } from '@ui-kit/features/switch-chain'

const DEFAULT_NETWORK_CONFIG = { api: curvejsApi, isActiveNetwork: true, showInSelectNetwork: true }

export const { networks, networksIdMapper, selectNetworkList } = Object.entries(NETWORK_BASE_CONFIG).reduce(
  (mapper, [key, config]) => {
    const chainId = +key
    const networkConfig = {
      ...getBaseNetworksConfig<NetworkEnum>(chainId, config),
      ...DEFAULT_NETWORK_CONFIG,
      showInSelectNetwork: chainId === 1,
    }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.networkId as NetworkEnum] = chainId

    if (networkConfig.showInSelectNetwork) {
      mapper.selectNetworkList.push({
        label: networkConfig.name,
        chainId,
        networkId: networkConfig.networkId,
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
