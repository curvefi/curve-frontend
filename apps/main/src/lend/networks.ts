import { Chain } from 'curve-ui-kit/src/utils'
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
  [Chain.Ethereum]: {
    hideMarketsInUI: { 'one-way-market-19': true },
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Optimism]: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Fraxtal]: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Sonic]: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Gnosis]: {},
  [Chain.Moonbeam]: {},
  [Chain.Polygon]: {},
  [Chain.Kava]: {},
  [Chain.Fantom]: {},
  [Chain.Arbitrum]: {
    isActiveNetwork: true,
    showInSelectNetwork: true,
    marketListShowOnlyInSmallMarkets: { 'one-way-market-7': true },
    pricesData: true,
  },
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
