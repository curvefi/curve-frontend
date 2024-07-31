import { Filter, FilterType, SortId } from '@/components/PageMarketList/utils'

export type FormStatus = {
  error: string
  isLoading: boolean
  noResult: boolean
}

export type FilterKey = keyof typeof Filter
export type FilterTypeKey = keyof typeof FilterType
export type FilterListProps = { id: string; displayName: string }
export type SortKey = keyof typeof SortId
export interface FilterTypeMapper extends Record<FilterType, FilterListProps> {}
export interface TableLabelsMapper extends Record<SortId, { name: string }> {}

export type PageMarketList = {
  rChainId: ChainId
  api: Api | null
  isLoaded: boolean
  searchParams: SearchParams
  filterList: FilterListProps[]
  filterTypeMapper: FilterTypeMapper
  tableLabelsMapper: TableLabelsMapper
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}

export type MarketListItem = {
  address: string
  symbol: string
  markets: { [owmId: string]: boolean }
}

export type MarketListMapper = {
  [tokenAddress: string]: MarketListItem
}

export type MarketListItemResult = {
  address: string
  symbol: string
  markets: string[]
}

export type SearchParams = {
  filterKey: FilterKey
  filterTypeKey: FilterTypeKey
  hideSmallMarkets: boolean
  searchText: string
  sortBy: SortKey | ''
  sortByOrder: Order
}

export type TableSettings = {
  isNotSortable?: boolean
  sortBy?: SortKey | ''
  sortByOrder?: Order
}

export type TableProps = MarketListItemResult & {
  pageProps: PageMarketList
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  tableLabels: TableLabel[]
  tableSettings: TableSettings
}

export type TableLabel = {
  sortIdKey: SortKey
  className: string
  indicatorPlacement?: 'left' | 'right'
  isNotSortable?: boolean
  width?: string
  show?: boolean
}

export type TableRowProps = Pick<PageMarketList, 'rChainId' | 'api' | 'tableLabelsMapper'> & {
  owmId: string
  owmDataCachedOrApi: OWMDataCacheOrApi
  filterTypeKey: FilterTypeKey
  loanExists: boolean
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  userActiveKey: string
  handleCellClick(target?: EventTarget): void // only pass evt.target if there is a child button node
}

export type TableCellProps = {
  rChainId: ChainId
  owmId: string
  owmDataCachedOrApi: OWMDataCacheOrApi
  userActiveKey: string
  filterTypeKey: FilterTypeKey
  rOwmId: string
  isBold: boolean
  size: 'md'
}
