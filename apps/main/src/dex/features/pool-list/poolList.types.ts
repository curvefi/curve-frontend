import type { NetworkConfig } from '@/dex/types/main.types'
import type { V2Pool } from '@curvefi/prices-api/pools'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'

export type PoolListCampaignsByAddress = Record<string, CampaignRewards[]>

export type PoolListItem = V2Pool & {
  campaigns: CampaignRewards[]
  hasPosition: boolean | undefined
  hasVyperVulnerability: boolean | undefined
  network: NetworkConfig['id']
  url: string
}
