import { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketMaxEquityLeverage } from '@/llamalend/queries/market/market-max-equity-leverage.query'
import { useMarketMaxLeverage } from '@/llamalend/queries/market/market-max-leverage.query'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { useLlamalendEquityLeverage } from '@evm-ui/hooks/useFeatureFlags'
import type { MarketParams } from '@evm-ui/queries/query-types'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'

/** The max leverage of a market from the chain and from the prices API, as equity leverage behind the flag */
export const useMaxLeverage = ({
  chainId,
  marketId,
  marketQuery,
  apiMarket,
}: MarketParams & { marketQuery: QueryProp<MarketTemplate | null>; apiMarket: QueryProp<LlamaMarket | null> }) => {
  const isEquityLeverage = useLlamalendEquityLeverage()
  const params = { chainId, marketId, range: mapQuery(marketQuery, m => m?.minBands) }
  const maxLegacyLeverage = useMarketMaxLeverage(params, !isEquityLeverage)
  const maxEquityLeverage = useMarketMaxEquityLeverage(params, isEquityLeverage)
  return {
    onChain: isEquityLeverage ? maxEquityLeverage : maxLegacyLeverage,
    api: mapQuery(apiMarket, market => (isEquityLeverage ? market?.maxEquityLeverage : market?.maxLegacyLeverage)),
  }
}
