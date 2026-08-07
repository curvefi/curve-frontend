import type { PoolData, RewardsApy, NetworkConfig } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { V2Pool } from '@curvefi/prices-api/pools'
import type { Decimal } from '@primitives/decimal.utils'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'

type PoolListData = Pick<
  V2Pool,
  | 'address'
  | 'baseDailyApr'
  | 'baseWeeklyApr'
  | 'coins'
  | 'crvApr'
  | 'crvAprBoosted'
  | 'extraRewardsApr'
  | 'gauge'
  | 'gauges'
  | 'isMetapool'
  | 'poolType'
  | 'tvlUsd'
> & {
  creationDate?: V2Pool['creationDate']
  name: string
  tradingVolume24h?: V2Pool['tradingVolume24h'] | null
}

export type PoolRow = PoolListData & {
  campaigns: CampaignRewards[]
  hasPosition: boolean | undefined
  hasVyperVulnerability: boolean | undefined
  network: NetworkConfig['id']
  url: string
}

export type LegacyPoolTag =
  'btc' | 'crypto' | 'kava' | 'eth' | 'usd' | 'others' | 'user' | 'crvusd' | 'tricrypto' | 'stableng' | 'cross-chain'

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
