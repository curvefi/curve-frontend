import type { PoolData, RewardsApy, NetworkConfig } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { V2Pool } from '@curvefi/prices-api/pools'
import type { Decimal } from '@primitives/decimal.utils'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'
import type { LegacyPoolTag } from './chips/LegacyPoolsChips'

export type PoolRow = V2Pool & {
  campaigns: CampaignRewards[]
  hasPosition: boolean | undefined
  hasVyperVulnerability: boolean | undefined
  network: NetworkConfig['id']
  url: string
}

export type LegacyPoolRow = PoolData & {
  rewards: RewardsApy | undefined
  volume: Decimal | undefined
  tvl: Decimal | undefined
  hasPosition: boolean | undefined
  network: INetworkName
  url: string
  tags: LegacyPoolTag[]
  totalAPR: number
}
