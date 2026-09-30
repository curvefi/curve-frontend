import type { Address } from 'viem'
import type { Campaign, CampaignPool } from '@external-rewards'

type CampaignReward =
  { type: 'apr'; value: number; address: Address; price?: number } | { type: 'points'; value: number }

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
