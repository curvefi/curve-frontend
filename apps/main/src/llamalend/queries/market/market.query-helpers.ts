import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'

export const getLendVault = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId).vault

export const getPricesImplementation = (marketId: string | LlamaMarketTemplate) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.prices : market
}

export const getLoanImplementation = (marketId: string | LlamaMarketTemplate) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.loan : market
}
