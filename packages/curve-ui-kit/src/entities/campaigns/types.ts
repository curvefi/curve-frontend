import type { Campaign, CampaignPool } from '@external-rewards'

export type CampaignPoolRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'tags' | 'address' | 'network'> & {
    description: CampaignPool['description'] | null
    steps?: string[]
    lock: boolean
    multiplier?: number | string // Can be 5 as parsed from "5x", or just the token like "FXN". Kept as number for sorting.
    period?: readonly [Date, Date]
  }

export type Campaigns = Record<string, CampaignPoolRewards[]>
