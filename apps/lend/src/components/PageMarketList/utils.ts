import type { FormStatus, MarketListMapper } from '@/components/PageMarketList/types'

import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import startsWith from 'lodash/startsWith'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

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

export function _isStartPartOrEnd(searchString: string, string: string) {
  return startsWith(string, searchString) || string.includes(searchString) || string === searchString
}

export function _parseSearchTextToList(searchText: string) {
  return searchText
    .toLowerCase()
    .split(searchText.indexOf(',') !== -1 ? ',' : ' ')
    .filter((st) => st !== '')
    .map((st) => st.trim())
}

// search by tokens or token addresses
export function _searchByTokensAddresses(parsedSearchText: string, searchText: string, datas: OneWayMarketTemplate[]) {
  const searchTextByList = _parseSearchTextToList(parsedSearchText)

  return datas.filter(({ borrowed_token, collateral_token }) => (
    differenceWith(
      searchTextByList,
      [borrowed_token.symbol.toLowerCase(), collateral_token.symbol.toLowerCase()],
      isEqual
    ).length === 0 ||
    differenceWith(
      searchTextByList,
      [borrowed_token.address, collateral_token.address],
      (parsedSearchText, tokenAddress) => _isStartPartOrEnd(parsedSearchText, tokenAddress)
    ).length === 0
  ))
}

export function _getMarketList(markets: OneWayMarketTemplate[]) {
  let marketListMapper: MarketListMapper = {}
  let marketListMapperCache: { [tokenAddress: string]: { symbol: string; address: string } } = {}

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
  const crvUsdAddress = markets.map((m) => m.borrowed_token).find(({ symbol }) => symbol.toLowerCase() === 'crvusd')?.address
  if (crvUsdAddress) {
    delete marketListMapper[crvUsdAddress]
    delete marketListMapperCache[crvUsdAddress]
  }

  const sortedMarketListMapperCache = sortBy(marketListMapperCache, (l) => l.symbol)
  return { marketListMapper, sortedMarketListMapperCache }
}
