import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { LlamaMarketType } from '@ui-kit/types/market'

type MarketAndType =
  | [market: MintMarketTemplate, type: LlamaMarketType.Mint]
  | [market: LendMarketTemplate, type: LlamaMarketType.Lend]

export function getLlamaMarket(id: string): MarketAndType {
  const lib = requireLib('llamaApi')
  const mintMarket = lib.getMintMarket(id)
  if (mintMarket) return [mintMarket, LlamaMarketType.Mint] as const
  const lendMarket = lib.getLendMarket(id)
  if (lendMarket) return [lendMarket, LlamaMarketType.Lend] as const
  throw new Error(`Market with ID ${id} not found`)
}
