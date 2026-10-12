export type Campaign = {
  campaignName: string
  platform: string
  description: string
  platformImageId: string
  dashboardLink: string
  pools: CampaignPool[]
}

export type CampaignPool = {
  id: string
  action: RewardsAction
  description: string
  campaignStart: string
  campaignEnd: string
  address: string
  network: string
  multiplier: string
  tags: RewardsTags[]
  lock: string
}

export type RewardsTags = 'points' | 'tokens'
export type RewardsAction = 'supply' | 'borrow' | 'lp'
