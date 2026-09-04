import { ChainId, NetworkConfig, NetworkEnum } from '@/loan/types/loan.types'
import { Chain } from '@primitives/network.utils'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@legacy-ui/utils'

const DEFAULT_NETWORK_CONFIG = {
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

export const { networks, networksIdMapper } = Object.entries(networksConfig).reduce(
  (mapper, [key, config]) => {
    const chainId = Number(key) as ChainId
    const networkConfig = {
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
    networks: {} as Record<ChainId, NetworkConfig>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
  },
)
