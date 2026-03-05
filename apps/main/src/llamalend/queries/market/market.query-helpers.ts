import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import { requireLib } from '@ui-kit/features/connect-wallet'

export const getLendVault = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId).vault

export const getPricesImplementation = (marketId: string | LlamaMarketTemplate) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.prices : market
}

export const getUserPositionImplementation = (marketId: string | LlamaMarketTemplate) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.userPosition : market
}

export const getLoanImplementation = (marketId: string | LlamaMarketTemplate) => {
  const market = getLlamaMarket(marketId)
  return market instanceof LendMarketTemplate ? market.loan : market
}

type LendBalances = { collateral: string; borrowed: string }
type MintBalances = { collateral: string; stablecoin: string }
export const normalizeBands = (bands: Record<number, MintBalances | LendBalances>): Record<number, LendBalances> =>
  fromEntries(
    recordEntries(bands).map(([key, item]) => [
      key,
      'stablecoin' in item ? { borrowed: item.stablecoin, collateral: item.collateral } : item,
    ]),
  )
