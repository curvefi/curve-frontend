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

export type IntegrationTag = { id: Tag; displayName: string; color: string }
