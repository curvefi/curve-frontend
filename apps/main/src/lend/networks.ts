import { ChainId, NetworkConfig, NetworkEnum } from '@/lend/types/lend.types'
import { Chain } from '@evm-ui/utils'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@legacy-ui/utils'

const DEFAULT_NETWORK_CONFIG = {
  hideMarketsInUI: {},
  marketListFilter: ['all', 'leverage', 'user'],
  marketListFilterType: ['borrow', 'lend'],
  showInSelectNetwork: false,
  pricesData: false,
}

const networksConfig = {
  [Chain.Ethereum]: {
    hideMarketsInUI: { 'one-way-market-19': true },
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Optimism]: {
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Fraxtal]: {
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Sonic]: {
    showInSelectNetwork: true,
    pricesData: true,
  },
  [Chain.Arbitrum]: {
    showInSelectNetwork: true,
    pricesData: true,
  },
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
    mapper.networksIdMapper[networkConfig.blockchainId] = chainId
    return mapper
  },
  {
    networks: {} as Record<ChainId, NetworkConfig<NetworkEnum, ChainId>>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
  },
)
