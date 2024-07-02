export interface CampaignRewardsItem {
  campaignName: string
  platform: string
  description: string
  platformImageId: string
  dashboardLink: string
  pools: CampaignRewardsPool[]
}

export interface CampaignRewardsPool {
  id: string
  poolId: string
  campaignStart: string
  campaignEnd: string
  poolAddress: string
  gaugeAddress: string
  network: string
  multiplier: string
  tags: RewardsTags[]
}

export interface RewardsPool {
  campaignName: string
  platform: string
  description: string
  platformImageSrc: string
  dashboardLink: string
  id: string
  poolId: string
  campaignStart: string
  campaignEnd: string
  poolAddress: string
  gaugeAddress: string
  network: string
  multiplier: string
  tags: RewardsTags[]
}

export type CampaignRewardsMapper = { [poolAddress: string]: RewardsPool[] }

export interface CampaignRewardsCompProps {
  rewardsPool: RewardsPool
  highContrast?: boolean
  mobile?: boolean
}

export interface CampaignRewardsBannerCompProps {
  campaignRewardsPool: RewardsPool[]
}

export type RewardsTags = 'points' | 'merkle' | 'tokens'
