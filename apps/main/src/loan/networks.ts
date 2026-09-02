import { ChainId, NetworkConfig, NetworkEnum } from '@/loan/types/loan.types'
import { Chain } from '@evm-ui/utils'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@legacy-ui/utils'

const DEFAULT_NETWORK_CONFIG = { showInSelectNetwork: true }

export const { networks, networksIdMapper } = Object.entries([NETWORK_BASE_CONFIG[Chain.Ethereum]]).reduce(
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
