import type { Params } from 'react-router'
import { SEARCH_TERM } from '@/dex/hooks/useSearchTermMapper'
import { COLUMN_KEYS } from '@/dex/components/PagePoolList/utils'
import { CurveApi, ChainId } from '@/dex/types/main.types'

export type FormStatus = {
  error: string
  isLoading: boolean
  noResult: boolean
}

export type SearchTermKey = keyof typeof SEARCH_TERM
export type SearchTermMapper = Record<SearchTermKey, { label?: string; isTokenAddress?: boolean }>
export type SearchTermsResult = { [poolId: string]: { [key: string]: { value: string } } }
export type Order = 'desc' | 'asc'
export type FilterKey =
  | 'all'
  | 'btc'
  | 'crypto'
  | 'kava'
  | 'eth'
  | 'usd'
  | 'others'
  | 'user'
  | 'crvusd'
  | 'tricrypto'
  | 'stableng'
  | 'cross-chain'

export type SortKey =
  | 'name'
  | 'factory'
  | 'referenceAsset'
  | 'rewardsBase'
  | 'rewardsCrv'
  | 'rewardsOther'
  | 'tvl'
  | 'volume'
  | 'points'
  | ''

export type FormValues = {
  searchTextByTokensAndAddresses: { [address: string]: boolean }
  searchTextByOther: { [address: string]: boolean }
  hideSmallPools: boolean
  hideZero: boolean
}

export type PoolListTableLabel = {
  [label: string]: {
    name: string
    mobile?: string | undefined
  }
}

export type SearchParams = {
  filterKey: FilterKey
  hideSmallPools: boolean
  searchText: string
  sortBy: SortKey
  sortByOrder: Order
}

export type PagePoolList = {
  rChainId: ChainId
  curve: CurveApi | null
  isLite: boolean
  params: Params
  tableLabels: PoolListTableLabel
  searchParams: SearchParams
  searchTermMapper: SearchTermMapper
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}

export type PoolListFilter = {
  key: FilterKey
  label: string
}

export type ColumnKeys = keyof typeof COLUMN_KEYS
