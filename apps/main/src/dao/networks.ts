import { ChainId, NetworkConfig, NetworkEnum } from '@/dao/types/dao.types'
import { Chain } from '@evm-ui/utils'
import { getBaseNetworksConfig, NETWORK_BASE_CONFIG } from '@legacy-ui/utils'

const DEFAULT_NETWORK_CONFIG = { isActiveNetwork: true, showInSelectNetwork: true }

export const { networks, networksIdMapper } = Object.entries([NETWORK_BASE_CONFIG[Chain.Ethereum]]).reduce(
  (
    mapper,
    [key, config],
  ): {
    networks: Record<ChainId, NetworkConfig>
    networksIdMapper: Record<NetworkEnum, ChainId>
  } => {
    const chainId = +key
    const networkConfig = {
      ...getBaseNetworksConfig<NetworkEnum, ChainId>(chainId, config),
      ...DEFAULT_NETWORK_CONFIG,
    }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.blockchainId] = chainId
    return mapper
  },
  {
    networks: {},
    networksIdMapper: {},
  },
)
