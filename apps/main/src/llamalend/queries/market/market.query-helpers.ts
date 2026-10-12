import { getMarket, isLendMarket } from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { requireLib } from '@evm-ui/features/connect-wallet'
import { fromEntries, recordEntries } from '@primitives/objects.utils'

export const getLendVault = (marketId: string) => requireLib('llamaApi').getLendMarket(marketId).vault

export const getPricesImplementation = (marketId: string | MarketTemplate) => {
  const market = getMarket(marketId)
  return isLendMarket(market) ? market.prices : market
}

export const getStatsImplementation = (marketId: string | MarketTemplate) => {
  const market = getMarket(marketId)
  return isLendMarket(market) ? market.stats : market
}

export const getUserPositionImplementation = (marketId: string | MarketTemplate) => {
  const market = getMarket(marketId)
  return isLendMarket(market) ? market.userPosition : market
}

export const getLoanImplementation = (marketId: string | MarketTemplate) => {
  const market = getMarket(marketId)
  return isLendMarket(market) ? market.loan : market
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
