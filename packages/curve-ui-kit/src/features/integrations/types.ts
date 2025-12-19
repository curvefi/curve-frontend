export type Tag =
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

export type IntegrationTag = { id: string; displayName: string; color: string }

export type IntegrationsTags = {
  [k: string]: IntegrationTag
}

export type IntegrationApp = {
  appUrl: string | null
  description: string
  imageId: string | null
  name: string
  networks: { [network: string]: boolean }
  tags: { [tag: string]: boolean }
  twitterUrl: string | null
}

export type FormValues = {
  filterKey: Tag
  searchText: string
}

export type FormStatus = {
  isLoading: boolean
  noResult: boolean
}
