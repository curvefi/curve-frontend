import type { Campaign, CampaignPool } from '@external-rewards'

export type CampaignRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'tags' | 'address' | 'network'> & {
    description: CampaignPool['description'] | null
    steps?: string[]
    lock: boolean
    /** Can be 5 as parsed from "5x", or just the token like "FXN". Kept as number for sorting. Could also be an APR if it ends with % */
    multiplier?: number | string
    period?: readonly [Date, Date]
  }

export type Campaigns = Record<string, CampaignRewards[]>
