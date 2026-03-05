import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'

export const getLendMarket = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId)

export const getMarketPricesImpl = (marketId: LlamaMarketTemplate | string) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.prices : market
}

export const getMarketLoanImpl = (marketId: LlamaMarketTemplate | string) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.loan : market
}
