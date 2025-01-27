import sortBy from 'lodash/sortBy'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'
import { ChainOption } from '@ui-kit/features/switch-chain'
import { ChainId, NetworkEnum, NetworkConfig } from '@/lend/types/lend.types'

const DEFAULT_NETWORK_CONFIG = {
  hideMarketsInUI: {},
  smallMarketAmount: 10000,
  marketListFilter: ['all', 'leverage', 'user'],
  marketListFilterType: ['borrow', 'lend'],
  marketListShowOnlyInSmallMarkets: {},
  isActiveNetwork: false,
  showInSelectNetwork: false,
  pricesData: false,
}

const networksConfig = {
  1: {
    hideMarketsInUI: { 'one-way-market-19': true },
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  10: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  252: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  100: {},
  1284: {},
  137: {},
  2222: {},
  250: {},
  42161: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    marketListShowOnlyInSmallMarkets: { 'one-way-market-7': true },
    pricesData: true,
  },
  43114: {},
  42220: {},
  1313161554: {},
  324: {},
  8453: {},
  56: {},
  196: {},
  5000: {},
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
