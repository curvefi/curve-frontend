import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { fallbackQ, mapQuery, q, type Query } from '@ui/features/queries/util'
import type { MarketTemplate } from '../llamalend.types'
import { type LlamaMarketParams, useLlamaMarkets } from '../queries/market-list/llama-markets'

export const useLlamaMarket = (
  { rMarket, network, ...params }: LlamaMarketParams & { rMarket: string; network: string },
  marketQuery: Query<MarketTemplate | null>,
) => {
  const markets = useLlamaMarkets(params)
  const blockchainId = getPricesApiBlockchainId(network)
  const apiMarket = mapQuery(
    markets,
    ({ markets }) =>
      markets.find(m => m.blockchainId === blockchainId && m.url.toLowerCase().endsWith(`/${rMarket.toLowerCase()}`)) ??
      null,
  )

  return { query: fallbackQ(q(marketQuery), apiMarket), apiMarket }
}
