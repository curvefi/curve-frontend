import type { FormStatus, MarketListMapper } from '@/components/PageMarketList/types'

import differenceWith from 'lodash/differenceWith'
import isEqual from 'lodash/isEqual'
import sortBy from 'lodash/sortBy'
import startsWith from 'lodash/startsWith'

export enum SortId {
  isInMarket = 'isInMarket',
  name = 'name',
  available = 'available',
  cap = 'cap',
  utilization = 'utilization',
  rateBorrow = 'rateBorrow',
  rateLend = 'rateLend',
  myDebt = 'myDebt',
  myHealth = 'myHealth',
  myVaultShares = 'myVaultShares',
  tokenCollateral = 'tokenCollateral',
  tokenBorrow = 'tokenBorrow',
  tokenSupply = 'tokenSupply',
  totalCollateralValue = 'totalCollateralValue',
  totalDebt = 'totalDebt',
  totalLiquidity = 'totalLiquidity',
  leverage = 'leverage',
  totalApr = 'totalApr',
  points = 'points',
}

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
