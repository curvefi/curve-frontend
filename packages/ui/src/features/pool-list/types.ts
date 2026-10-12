import { type ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import type { TableMeta } from '@tanstack/react-table'
import type { EmptyStateCardProps } from '@ui/components/EmptyStateCard'
import type { CampaignRewards } from '@ui/features/campaigns/types'
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
  depositsUsd: QueryProp<Decimal>
  /** Rows are derived outside the query cache, so query errors can remain Error instances. */
  claimables: QueryProp<PoolClaimables>
  claimablesUsd: QueryProp<Decimal>
}

/** Additional pool context not in the main pool data (contextual information sourced with external sources) */
type PoolRowContext = {
  chainId: number
  blockchainId: string
  campaigns: CampaignRewards[] | undefined
  /** Absent until a position is known; do not fabricate a zero LP balance. */
  userPosition: PoolUserPosition | undefined
  hasVyperVulnerability: boolean | undefined
  url: string
}

export type PoolRates = {
  extraRewardsTotalApr: number
  campaignRewardsApr: number
  rewardsApr: number
  incentivesApr: number
  netApr: number
  netAprBoosted: number | undefined
}

/** Source-independent view model containing only data consumed by the pools table. */
export type PoolRow = PoolRowData & PoolRowContext & PoolRates

/** Only the alert fields used by pool-list presentation; Main supplies the rich content. */
export type PoolListAlert = {
  alertType: 'info' | 'warning' | 'error' | 'danger' | ''
  message?: ReactNode
  banner?: { title: ReactNode; subtitle?: ReactNode }
  isPoolPageOnly?: boolean
}

/** Main keys alerts to the exact row addresses; rich messages stay outside the rows. */
export type PoolAlerts = {
  pools: Readonly<Record<string, PoolListAlert | undefined>> | undefined
  tokens: Readonly<Record<string, PoolListAlert | undefined>> | undefined
  /** Used only when a vulnerable pool has no explicit pool alert. */
  vyper: PoolListAlert
}

export type PoolTableVariant = keyof typeof POOLS_COLUMN_OPTIONS
export type UserPositionsTableVariant = Extract<PoolTableVariant, 'userPositions' | 'residualClaims'>

/** Query results supplied by the host without importing its data hooks into UI. */
export type PoolTableData = {
  tableQuery: QueryProp<PoolRow[]>
  isFetching: boolean
  onReload: () => Promise<unknown>
  alerts: PoolAlerts
}

export type PoolsTableData = PoolTableData & { pageCount: number; userHasPositions: boolean | undefined }

type EmptyStateDescription = Pick<EmptyStateCardProps, 'title' | 'description' | 'icon'>

export type ResidualClaimsTableData = PoolTableData & {
  claimablesTotalUsd: QueryProp<Decimal>
  labels: { errorTitle: string; loading: EmptyStateDescription; empty: EmptyStateDescription }
}

export type UserPositionsTableData = ResidualClaimsTableData & { totalLiquidityUsd: QueryProp<Decimal> }

/**
 * Host-supplied presentation dependencies for static columns and expanded panels.
 * Access through getPoolTableMeta so the temporary metadata cast stays in one place.
 */
export type PoolTableMeta = TableMeta<CurveTableFeatures, PoolRow> & {
  variant: PoolTableVariant
  alerts: PoolAlerts
  /** Formatting and explorer links remain app-specific without duplicating them onto each row. */
  addressDisplay: AddressDisplay
  crvToken?: { address: Address; blockchainId: string }
}
