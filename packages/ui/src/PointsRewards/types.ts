export interface RewardsCampaign {
  campaignName: string
  platform: string
  description: string
  platformImageId: string
  dashboardLink: string
  pools: RewardsCampaignPool[]
}

export interface RewardsCampaignPool {
  id: string
  poolId: string
  campaignStart: string
  campaignEnd: string
  poolAddress: string
  gaugeAddress: string
  network: string
  multiplier: string
  tags: string[]
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
  tags: string[]
}

export type RewardsPoolMapper = { [poolAddress: string]: RewardsPool[] }

export interface RewardsCompSmallProps {
  rewardsPool: RewardsPool
  highContrast?: boolean
}

export interface RewardsBannerCompProps {
  rewardsPool: RewardsPool[]
}
