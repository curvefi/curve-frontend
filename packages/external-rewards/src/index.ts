import { default as campaignList } from './campaign-list.json'
import * as campaignsJsons from './campaigns'

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
export type RewardsAction = 'supply' | 'borrow' | 'lp' | 'loan'

const parsedCampaignsJsons = campaignsJsons as Record<string, Campaign>

export const campaigns = campaignList
  .map(({ campaign }) => {
    const campaignName = campaign.split('.')?.[0]
    if (!campaignName || !(campaignName in parsedCampaignsJsons)) return null

    return {
      ...parsedCampaignsJsons[campaignName],
      pools: parsedCampaignsJsons[campaignName].pools.filter((pool: CampaignPool) => {
        const currentTime = Date.now() / 1000

        // allow campaigns with no set period
        if (pool.campaignStart === '0' || pool.campaignEnd === '0') {
          return true
        }

        // check if current time is within the campaign period
        const startTime = new Date(+pool.campaignStart).getTime()
        const endTime = new Date(+pool.campaignEnd).getTime()
        return currentTime >= startTime && currentTime <= endTime
      }),
    }
  })
  .filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign))
