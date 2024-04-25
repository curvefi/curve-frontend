import { Params } from 'react-router'

export type FormStatus = {
  error: string
  isLoading: boolean
  noResult: boolean
}

export type TableLabelsMapper = {
  isInMarket: { name: string }
  name: { name: string }
  available: { name: string }
  cap: { name: string }
  utilization: { name: string }
  capUtilization: { name: string }
  rateBorrow: { name: string }
  rateLend: { name: string }
  myHealth: { name: string }
  myDebt: { name: string }
  myVaultShares: { name: string }
  myWalletBorrowed: { name: string }
  myWalletCollateral: { name: string }
  tokenCollateral: { name: string }
  tokenBorrow: { name: string }
  tokenSupply: { name: string }
  totalCollateralValue: { name: string }
  totalDebt: { name: string }
  totalLiquidity: { name: string }
  rewardsCRV: { name: string }
  rewardsOthers: { name: string }
}

export type FilterMapper = {
  [key: string]: {
    id: string
    displayName: string
  }
}

export type Order = 'desc' | 'asc'
export type FilterKey = 'all' | 'user'
export type FilterTypeKey = 'borrow' | 'supply'
export type SortKey = keyof TableLabelsMapper
export type BorrowKey = 'long' | 'short'
export type MarketListToken = { address: string; symbol: string }

export type PageMarketList = {
  rChainId: ChainId
  api: Api | null
  isBorrow: boolean
  isLoaded: boolean
  params: Params
  searchParams: SearchParams
  filterMapper: FilterMapper
  filterTypeMapper: FilterMapper
  tableLabelsMapper: TableLabelsMapper
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}

export type MarketListItem = {
  address: string
  symbol: string
  long: { [owmId: string]: boolean }
  short: { [owmId: string]: boolean }
}

export type FoldTableLabels = {
  borrow: TableLabel[]
  supply: TableLabel[]
}

export type MarketListMapper = {
  [tokenAddress: string]: MarketListItem
}

export type SearchParams = {
  filterKey: FilterKey
  filterTypeKey: FilterTypeKey
  borrowKey: BorrowKey
  hideSmallMarkets: boolean
  searchText: string
  sortBy: keyof TableLabelsMapper
  sortByOrder: Order
}

export type TableLabel = {
  sortIdKey: keyof TableLabelsMapper | ''
  label: string
  className: string
  buttons?: { sortIdKey: keyof TableLabelsMapper; label: string }[]
  isNotSortable?: boolean
  width?: string
  show?: boolean
}

export type TableRowProps = Pick<PageMarketList, 'rChainId' | 'api' | 'searchParams'> & {
  owmId: string
  owmDataCachedOrApi: OWMDataCacheOrApi
  isBorrow: boolean
  loanExists: boolean | undefined
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  userActiveKey: string
  handleCellClick(target?: EventTarget): void // only pass evt.target if there is a child button node
}

export type TableCellProps = {
  rChainId: ChainId
  rOwmId: string
  owmId: string
  owmDataCachedOrApi: OWMDataCacheOrApi
  userActiveKey: string
  isBorrow: boolean
  isBold: boolean
  size: 'md'
}

export type TableRowSettings = {
  isOpen?: boolean
  filterTypeKey?: FilterTypeKey
  borrowKey?: BorrowKey
  sortBy?: keyof TableLabelsMapper
  sortByOrder?: Order
}
