import sortBy from 'lodash/sortBy'
import curvejsApi from '@/loan/lib/apiCrvusd'
import { ChainId, NetworkConfig, NetworkEnum } from '@/loan/types/loan.types'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'
import { ChainOption } from '@ui-kit/features/switch-chain'
import { Chain } from '@ui-kit/utils'

const DEFAULT_NETWORK_CONFIG = {
  api: curvejsApi,
  isActiveNetwork: false,
  showInSelectNetwork: false,
}

const networksConfig = {
  [Chain.Ethereum]: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
  },
  [Chain.Optimism]: {},
  [Chain.Fraxtal]: {},
  [Chain.Sonic]: {},
  [Chain.Gnosis]: {},
  [Chain.Moonbeam]: {},
  [Chain.Polygon]: {},
  [Chain.Kava]: {},
  [Chain.Fantom]: {},
  [Chain.Arbitrum]: {},
  [Chain.Avalanche]: {},
  [Chain.Celo]: {},
  [Chain.Aurora]: {},
  [Chain.ZkSync]: {},
  [Chain.Base]: {},
  [Chain.Bsc]: {},
  [Chain.XLayer]: {},
  [Chain.Mantle]: {},
}

export const { networks, networksIdMapper, selectNetworkList } = Object.entries(networksConfig).reduce(
  (mapper, [key, config]) => {
    const chainId = Number(key) as ChainId
    const networkConfig = {
      ...getBaseNetworksConfig<NetworkEnum, ChainId>(chainId, NETWORK_BASE_CONFIG[chainId]),
      ...DEFAULT_NETWORK_CONFIG,
      ...config,
      chainId,
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
