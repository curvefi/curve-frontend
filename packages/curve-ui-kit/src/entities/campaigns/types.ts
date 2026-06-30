import type { Campaign, CampaignPool } from '@external-rewards'

export type CampaignReward = { type: 'apr'; value: number } | { type: 'points'; value: number }

export type CampaignRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'tags' | 'address' | 'network'> & {
    description: CampaignPool['description'] | null
    steps?: string[]
    lock: boolean
    reward?: CampaignReward
    symbol?: string
    period?: readonly [Date, Date]
  }

export type Campaigns = Record<string, CampaignRewards[]>
