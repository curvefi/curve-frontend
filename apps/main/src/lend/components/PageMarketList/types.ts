import { Filter, FilterType } from '@/lend/components/PageMarketList/utils'
import { SEARCH_TERM } from '@/lend/hooks/useSearchTermMapper'
import { ChainId, LlamalendApi, Order, TitleKey, TitleMapper } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'

export type FormStatus = {
  error: string
  isLoading: boolean
  noResult: boolean
}

export type FilterKey = keyof typeof Filter
export type FilterTypeKey = keyof typeof FilterType
export type FilterListProps = { id: string; displayName: string }
export type SearchTermKey = keyof typeof SEARCH_TERM
export type SearchTermMapper = Record<SearchTermKey, { label?: string; isTokenAddress?: boolean }>
export type SearchTermResult = { [id: string]: { [key: string]: { value: string } } }
export interface FilterTypeMapper extends Record<FilterType, FilterListProps> {}

export type PageMarketList = {
  rChainId: ChainId
  api: LlamalendApi | null
  isLoaded: boolean
  searchParams: SearchParams
  filterList: FilterListProps[]
  filterTypeMapper: FilterTypeMapper
  searchTermMapper: SearchTermMapper
  titleMapper: TitleMapper
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
  sortBy: TitleKey | ''
  sortByOrder: Order
}

export type TableSettings = {
  isNotSortable?: boolean
  sortBy?: TitleKey | ''
  sortByOrder?: Order
}

export type TableProps = MarketListItemResult & {
  className?: string
  pageProps: PageMarketList
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  tableLabels: TableLabel[]
  tableSettings: TableSettings
}

export type TableLabel = {
  sortIdKey: TitleKey
  className: string
  indicatorPlacement?: 'left' | 'right'
  isNotSortable?: boolean
  width?: string
  show?: boolean
}

export type TableRowProps = Pick<PageMarketList, 'rChainId' | 'api' | 'searchTermMapper' | 'titleMapper'> & {
  owmId: string
  market: LendMarketTemplate
  filterTypeKey: FilterTypeKey
  loanExists: boolean
  searchParams: SearchParams
  showBorrowSignerCell: boolean
  showSupplySignerCell: boolean
  userActiveKey: string
  handleCellClick(target?: EventTarget): void // only pass evt.target if there is a child button node
}

export type TableCellProps = {
  rChainId: ChainId
  owmId: string
  market: LendMarketTemplate
  userActiveKey: string
  filterTypeKey: FilterTypeKey
  rOwmId: string
  isBold: boolean
  size: 'md'
}
