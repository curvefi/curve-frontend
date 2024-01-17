import React from 'react'
import { Params } from 'react-router'

export type FormStatus = {
  error: string
  isLoading: boolean
  noResult: boolean
}

export type Order = 'desc' | 'asc'
export type FilterKey = 'all' // move to networks
export type SortKey =
  | 'name'
  | 'myHealth'
  | 'myDebt'
  | 'rate'
  | 'totalBorrowed'
  | 'cap'
  | 'available'
  | 'totalCollateral'

export type FormValues = {
  filterKey: FilterKey
  searchText: string
  sortBy: SortKey
  sortByOrder: Order
}

export type PageCollateralList = {
  curve: Curve | null
  params: Params
  rChainId: ChainId
}

export type TableLabel = {
  [label: string]: {
    name: string | React.ReactNode
  }
}

export type TableRowProps = {
  className?: string
  collateralId: string
  collateralData: CollateralData
  collateralDataCachedOrApi: CollateralDataCache | CollateralData | undefined
  loanDetails: Partial<LoanDetails> | undefined
  loanExists: boolean | undefined
  handleCellClick(): void
}
