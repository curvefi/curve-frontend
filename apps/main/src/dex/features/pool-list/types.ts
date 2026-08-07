import type { PoolData, RewardsApy, NetworkConfig } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { CampaignRewards } from '@ui-kit/entities/campaigns'

type PoolRowGauge = {
  address: Address
  isKilled: boolean
}

type PoolRowToken = {
  address: Address
  symbol: string
}

type PoolRowExtraReward = {
  address: Address | undefined
  apr: number
  name: string | undefined
  symbol: string | undefined
}

type PoolRowType =
  'main' | 'crypto' | 'factory' | 'factory_crypto' | 'crvusd' | 'factory_tricrypto' | 'stableswapng' | 'twocryptong'

/** Normalized pool data shared by all pool-list API adapters. */
export type PoolRowData = {
  address: Address
  baseDailyApr: number | undefined
  baseWeeklyApr: number | undefined
  coins: PoolRowToken[]
  creationDate: number | undefined
  crvApr: number | undefined
  crvAprBoosted: number | undefined
  extraRewardsApr: PoolRowExtraReward[]
  gauge: PoolRowGauge | undefined
  gauges: PoolRowGauge[]
  isMetapool: boolean
  name: string
  poolType: PoolRowType | undefined
  tradeableCoins: PoolRowToken[]
  tradingVolume24h: number | undefined
  tvlUsd: number | undefined
}

/** Additional pool context not in the main pool data (contextual information sourced with external sources) */
type PoolRowContext = {
  campaigns: CampaignRewards[]
  hasPosition: boolean | undefined
  hasVyperVulnerability: boolean | undefined
  network: NetworkConfig['id']
  url: string
}

/** Source-independent view model containing only data consumed by the pools table. */
export type PoolRow = PoolRowData & PoolRowContext

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
