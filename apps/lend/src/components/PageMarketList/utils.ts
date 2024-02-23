import type { MarketListMapper } from '@/components/PageMarketList/types'

import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import startsWith from 'lodash/startsWith'

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
export function _searchByTokensAddresses(parsedSearchText: string, searchText: string, datas: OWMData[]) {
  const searchTextByList = _parseSearchTextToList(parsedSearchText)

  return datas.filter(({ owm }) => {
    const { borrowed_token, collateral_token } = owm
    return (
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
    )
  })
}

export function _getMarketList(owmDatas: OWMData[], crvusdAddress: string) {
  let marketListMapper: MarketListMapper = {}
  let marketListMapperCache: { [tokenAddress: string]: { symbol: string; address: string } } = {}

  owmDatas.forEach((d) => {
    const { id, collateral_token, borrowed_token } = d.owm
    const { address: cAddress, symbol: cSymbol } = collateral_token
    const { address: bAddress, symbol: bSymbol } = borrowed_token

    if (!marketListMapper[cAddress]) {
      marketListMapper[cAddress] = { long: {}, short: {}, symbol: cSymbol, address: cAddress }
    }
    if (!marketListMapper[bAddress]) {
      marketListMapper[bAddress] = { long: {}, short: {}, symbol: bSymbol, address: bAddress }
    }
    marketListMapper[cAddress].long[id] = true
    marketListMapper[bAddress].short[id] = true
  })

  // filter crvusd
  delete marketListMapper[crvusdAddress]
  delete marketListMapperCache[crvusdAddress]

  const sortedMarketListMapperCache = sortBy(marketListMapperCache, (l) => l.symbol)
  return { marketListMapper, sortedMarketListMapperCache }
}
