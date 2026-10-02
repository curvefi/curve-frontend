import type { Address } from '@primitives/address.utils'
import type { Campaign, CampaignPool } from '@external-rewards'

type CampaignReward =
  { type: 'apr'; value: number; address: Address; price?: number } | { type: 'points'; value: number }

export type CampaignRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'tags' | 'address' | 'network'> & {
    isMerkl: boolean
    description: CampaignPool['description'] | null
    steps?: string[]
    lock: boolean
    reward?: CampaignReward
    symbol?: string
    period?: readonly [Date, Date]
  }

export type Campaigns = Record<string, CampaignRewards[]>
