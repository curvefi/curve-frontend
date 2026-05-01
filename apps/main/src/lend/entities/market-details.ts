import { ChainId } from '@/lend/types/lend.types'
import {
  invalidateMarketCapAndAvailable,
  invalidateMarketTotalCollateral,
  invalidateMarketVaultOnChainRewards,
  invalidateMarketVaultPricePerShare,
  invalidateMarketRates,
} from '@/llamalend/queries/market'

export const invalidateMarketDetails = ({ chainId, marketId }: { chainId: ChainId; marketId: string }) =>
  Promise.all([
    invalidateMarketVaultOnChainRewards({ chainId, marketId }),
    invalidateMarketVaultPricePerShare({ chainId, marketId }),
    invalidateMarketRates({ chainId, marketId }),
    invalidateMarketTotalCollateral({ chainId, marketId }),
    invalidateMarketCapAndAvailable({ chainId, marketId }),
  ])
