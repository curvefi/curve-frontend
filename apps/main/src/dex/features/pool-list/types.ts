import type { PoolData, RewardsApy } from '@/dex/types/main.types'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import type { CampaignRewards } from '@evm-ui/entities/campaigns'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { TableMeta } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import type { POOLS_COLUMN_OPTIONS } from './columns/column.options'

type PoolRowGauge = { address: Address; isKilled: boolean }

type PoolRowToken = { address: Address; symbol: string }

type PoolRowExtraReward = {
  address: Address | undefined
  apr: number
  name: string | undefined
  symbol: string | undefined
}

type PoolRowType =
  | 'main'
  | 'crypto'
  | 'factory'
  | 'factory_crypto'
  | 'crvusd'
  | 'factory_tricrypto'
  | 'stableswapng'
  | 'twocryptong'
  | 'fxswap'

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

type PoolUserPosition = {
  /** Both staked and unstaked */
  lpBalance: Decimal
  depositsUsd?: Decimal
}

/** Additional pool context not in the main pool data (contextual information sourced with external sources) */
type PoolRowContext = {
  chainId: number
  blockchainId: string
  campaigns: CampaignRewards[]
  userPosition: PoolUserPosition
  hasVyperVulnerability: boolean | undefined
  url: string
}

/** Source-independent view model containing only data consumed by the pools table. */
export type PoolRow = PoolRowData & PoolRowContext

export type PoolTableVariant = keyof typeof POOLS_COLUMN_OPTIONS
export type PoolTableMeta = TableMeta<CurveTableFeatures, PoolRow> & { variant: PoolTableVariant }

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
