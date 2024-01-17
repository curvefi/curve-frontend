export type FilterKey =
  | 'all'
  | 'automation'
  | 'bots'
  | 'defi'
  | 'gameNft'
  | 'learningData'
  | 'votingIncentives'
  | 'portfolio'
  | 'crvusd'
  | 'other'

export type FormValues = {
  filterKey: FilterKey
  filterNetworkId: string
  searchText: string
}

export type FormStatus = {
  isLoading: boolean
  noResult: boolean
}
