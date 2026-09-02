import { ChainId, NetworkConfig, NetworkEnum } from '@/loan/types/loan.types'
import { CHAIN_BLOCKCHAIN_IDS } from '@evm-ui/features/connect-wallet/lib/wagmi/constants'
import { Chain } from '@evm-ui/utils'

export const { networks, networksIdMapper } = Object.entries([CHAIN_BLOCKCHAIN_IDS[Chain.Ethereum]]).reduce(
  (mapper, [key, blockchainId]) => {
    const chainId = Number(key) as ChainId
    const networkConfig = { chainId, blockchainId }
    mapper.networks[chainId] = networkConfig
    mapper.networksIdMapper[networkConfig.blockchainId] = chainId
    return mapper
  },
  {
    networks: {} as Record<ChainId, NetworkConfig>,
    networksIdMapper: {} as Record<NetworkEnum, ChainId>,
  },
)
