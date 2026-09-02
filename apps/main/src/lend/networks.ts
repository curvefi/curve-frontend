import { ChainId, NetworkConfig, NetworkEnum } from '@/lend/types/lend.types'
import { CHAIN_BLOCKCHAIN_IDS } from '@evm-ui/features/connect-wallet/lib/wagmi/constants'
import { Chain } from '@evm-ui/utils'

const DEFAULT_NETWORK_CONFIG = {
  hideMarketsInUI: {},
  marketListFilter: ['all', 'leverage', 'user'],
  marketListFilterType: ['borrow', 'lend'],
  pricesData: false,
}

const networksConfig = {
  [Chain.Ethereum]: { hideMarketsInUI: { 'one-way-market-19': true }, pricesData: true },
  [Chain.Optimism]: { pricesData: true },
  [Chain.Fraxtal]: { pricesData: true },
  [Chain.Sonic]: { pricesData: true },
  [Chain.Arbitrum]: { pricesData: true },
}

export const { networks, networksIdMapper } = Object.entries(networksConfig).reduce(
  (mapper, [key, config]) => {
    const chainId = Number(key) as ChainId
    const networkConfig = {
      ...DEFAULT_NETWORK_CONFIG,
      ...config,
      chainId,
      blockchainId: CHAIN_BLOCKCHAIN_IDS[chainId],
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
