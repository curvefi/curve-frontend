import type { SelectNetworkItem } from '@/ui/Select/SelectNetwork'

import sortBy from 'lodash/sortBy'

import { getBaseNetworksConfig } from '@/ui/utils'

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

const networks1 = {
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
