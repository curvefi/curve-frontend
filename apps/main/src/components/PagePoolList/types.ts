import React from 'react'
import type { Params } from 'react-router'


export type FormStatus = {
  error: string
  isLoading: boolean
  noResult: boolean
}

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

export type FormValues = {
  searchTextByTokensAndAddresses: { [address: string]: boolean }
  searchTextByOther: { [address: string]: boolean }
  hideSmallPools: boolean
  hideZero: boolean
}

export type PoolListTableLabel = {
  [label: string]: {
    name: string | React.ReactNode
    mobile?: string
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
  params: Params
  tableLabels: PoolListTableLabel
  searchParams: SearchParams
  updatePath(updatedSearchParams: Partial<SearchParams>): void
}

export type PoolListFilter = {
  key: FilterKey
  label: string
}
