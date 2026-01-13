import { Chain } from 'curve-ui-kit/src/utils'
import { ChainId, NetworkConfig, NetworkEnum } from '@/lend/types/lend.types'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@ui/utils'
import { SMALL_POOL_TVL } from '@ui-kit/features/user-profile/store'

const DEFAULT_NETWORK_CONFIG = {
  hideMarketsInUI: {},
  smallMarketAmount: SMALL_POOL_TVL,
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

export const { networks, networksIdMapper } = Object.entries(networksConfig).reduce(
  (mapper, [key, config]) => {
    const chainId = Number(key) as ChainId

    const networkConfig: NetworkConfig<NetworkEnum, ChainId> = {
      ...getBaseNetworksConfig<NetworkEnum, ChainId>(chainId, NETWORK_BASE_CONFIG[chainId]),
      ...DEFAULT_NETWORK_CONFIG,
      ...config,
      chainId,
    }

    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.networkId as NetworkEnum] = chainId
    return mapper
  },
  {
    networks: {} as Record<ChainId, NetworkConfig<NetworkEnum, ChainId>>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
  },
)
