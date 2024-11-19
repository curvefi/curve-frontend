import type { FormStatus, MarketListMapper, SearchTermResult } from '@/components/PageMarketList/types'

import sortBy from 'lodash/sortBy'
import startsWith from 'lodash/startsWith'
import Fuse from 'fuse.js'
import FuseResult = Fuse.FuseResult

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

export function _getMarketList(owmDatas: OWMData[], crvusdAddress: string) {
  let marketListMapper: MarketListMapper = {}
  let marketListMapperCache: { [tokenAddress: string]: { symbol: string; address: string } } = {}

  owmDatas.forEach((d) => {
    const { id, collateral_token, borrowed_token } = d.owm
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
  delete marketListMapper[crvusdAddress]
  delete marketListMapperCache[crvusdAddress]

  const sortedMarketListMapperCache = sortBy(marketListMapperCache, (l) => l.symbol)
  return { marketListMapper, sortedMarketListMapperCache }
}

export function parseSearchTermResults(searchedTermsResults: FuseResult<OWMData>[]) {
  return searchedTermsResults.reduce((prev, r) => {
    if (!r.matches) return prev
    prev[r.item.owm.id] = r.matches.reduce((prev, { key, value = '' }) => {
      if (!key || !value) return prev
      prev[key] = { value }
      return prev
    }, {} as { [k: string]: { value: string } })
    return prev
  }, {} as SearchTermResult)
}
