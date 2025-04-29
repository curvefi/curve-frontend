import { FuseResult } from 'fuse.js'
import sortBy from 'lodash/sortBy'
import type { FormStatus, MarketListMapper, SearchTermResult } from '@/lend/components/PageMarketList/types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

export enum Filter {
  all = 'all',
  leverage = 'leverage',
  user = 'user',
}

export enum FilterType {
  borrow = 'borrow',
  supply = 'supply',
}

export const DEFAULT_FORM_STATUS: FormStatus = {
  error: '',
  isLoading: true,
  noResult: false,
}

export function _getMarketList(markets: LendMarketTemplate[]) {
  const marketListMapper: MarketListMapper = {}
  const marketListMapperCache: { [tokenAddress: string]: { symbol: string; address: string } } = {}

  markets.forEach(({ id, collateral_token, borrowed_token }) => {
    const { address: cAddress, symbol: cSymbol } = collateral_token
    const { address: bAddress, symbol: bSymbol } = borrowed_token

    if (!marketListMapper[cAddress]) {
      marketListMapper[cAddress] = { markets: {}, symbol: cSymbol, address: cAddress }
    }
    if (!marketListMapper[bAddress]) {
      marketListMapper[bAddress] = { markets: {}, symbol: bSymbol, address: bAddress }
    }
    marketListMapper[cAddress].markets[id] = true
    marketListMapper[bAddress].markets[id] = true
  })

  // filter crvusd
  const crvUsdAddress = markets
    .map((m) => m.borrowed_token)
    .find(({ symbol }) => symbol.toLowerCase() === 'crvusd')?.address
  if (crvUsdAddress) {
    delete marketListMapper[crvUsdAddress]
    delete marketListMapperCache[crvUsdAddress]
  }

  const sortedMarketListMapperCache = sortBy(marketListMapperCache, (l) => l.symbol)
  return { marketListMapper, sortedMarketListMapperCache }
}

export function parseSearchTermResults(searchedTermsResults: FuseResult<LendMarketTemplate>[]) {
  return searchedTermsResults.reduce((prev, r) => {
    if (!r.matches) return prev
    prev[r.item.id] = r.matches.reduce(
      (prev, { key, value = '' }) => {
        if (!key || !value) return prev
        prev[key] = { value }
        return prev
      },
      {} as { [k: string]: { value: string } },
    )
    return prev
  }, {} as SearchTermResult)
}
