import { ChainId, NetworkConfig, NetworkEnum } from '@/dao/types/dao.types'
import { CHAIN_BLOCKCHAIN_IDS } from '@evm-ui/features/connect-wallet/lib/wagmi/constants'
import { Chain } from '@primitives/network.utils'

export const { networks, networksIdMapper } = Object.entries({
  [Chain.Ethereum]: CHAIN_BLOCKCHAIN_IDS[Chain.Ethereum],
}).reduce(
  (
    mapper,
    [key, blockchainId],
  ): {
    networks: Record<ChainId, NetworkConfig>
    networksIdMapper: Record<NetworkEnum, ChainId>
  } => {
    const chainId = +key
    const networkConfig = { chainId, blockchainId }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.blockchainId] = chainId
    return mapper
  },
  {
    networks: {},
    networksIdMapper: {},
  },
)
