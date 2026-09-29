import type { PoolAlert } from '@/dex/types/main.types'
import type { CampaignRewards } from '@evm-ui/queries/campaigns'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { TableMeta } from '@tanstack/react-table'
import type { AddressDisplay } from '@ui/features/forms/action-info/AddressActionInfo'
import type { QueryProp } from '@ui/features/queries/util'
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

export type PoolClaimables = { token: string; symbol: string; price: number; amount: Decimal; amountUsd: Decimal }[]

type PoolUserPosition = {
  /** Both staked and unstaked */
  lpBalance: Decimal
  depositsUsd: Decimal | undefined
  /** Rows are derived outside the query cache, so query errors can remain Error instances. */
  claimables: QueryProp<PoolClaimables>
  claimablesUsd: Decimal | undefined
}

/** Additional pool context not in the main pool data (contextual information sourced with external sources) */
type PoolRowContext = {
  chainId: number
  blockchainId: string
  campaigns: CampaignRewards[]
  /** Absent until a position is known; do not fabricate a zero LP balance. */
  userPosition: PoolUserPosition | undefined
  hasVyperVulnerability: boolean | undefined
  url: string
}

/** Source-independent view model containing only data consumed by the pools table. */
export type PoolRow = PoolRowData &
  PoolRowContext & {
    extraRewardsTotalApr: number
    campaignRewardsApr: number
    rewardsApr: number
    incentivesApr: number
    netApr: number
    netAprBoosted: number | undefined
  }

/** Main keys alerts to the exact row addresses; rich messages stay outside the rows. */
export type PoolAlerts = {
  pools: Readonly<Record<string, PoolAlert | undefined>> | undefined
  tokens: Readonly<Record<string, PoolAlert | undefined>> | undefined
  /** Used only when a vulnerable pool has no explicit pool alert. */
  vyper: PoolAlert
}

export type PoolTableVariant = keyof typeof POOLS_COLUMN_OPTIONS
/**
 * Host-supplied presentation dependencies for static columns and expanded panels.
 * Access through getPoolTableMeta so the temporary metadata cast stays in one place.
 */
export type PoolTableMeta = TableMeta<CurveTableFeatures, PoolRow> & {
  variant: PoolTableVariant
  alerts: PoolAlerts
  /** Formatting and explorer links remain app-specific without duplicating them onto each row. */
  addressDisplay: AddressDisplay
}
