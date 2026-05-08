import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { TimestampResponse } from '../timestamp'

export type GetSoftLiqRatiosResponse = {
  data: {
    timestamp: TimestampResponse
    proportion: number
  }[]
}

export type GetLiqsDetailedResponse = {
  data: {
    user: Address
    liquidator: Address
    self: boolean
    collateral_received: number
    collateral_received_usd: number
    stablecoin_received: number
    oracle_price: number
    debt: number
    n1: number
    n2: number
    dt: TimestampResponse
    tx: Address
    block: number
  }[]
}

export type GetLiqsAggregateResponse = {
  data: {
    timestamp: TimestampResponse
    self_count: number
    hard_count: number
    self_value: number
    hard_value: number
    price: number
  }[]
}

export type GetLiqOverviewResponse = {
  soft_liquidation_users: number
  median_health: number
  average_health: number
  collat_ratio: number
  liquidatable_positions: number
  liquidatable_pos_debt: string
  liquidatable_borrowed: string
  liquidatable_collateral: string
  liquidatable_pos_debt_usd: number
  liquidatable_collateral_usd: number
  liquidatable_borrowed_usd: number
}

export type GetLiqLossesResponse = {
  data: {
    timestamp: TimestampResponse
    median_pct_loss: number
    avg_pct_loss: number
    median_abs_loss: number
    avg_abs_loss: number
    total_users: number
    users_with_losses: number
    ratio: number
  }[]
}

type LiquidationHealthDistributionDecileResponse = {
  health_decile: string
  collateral: number
  borrowed?: number
  /** crvusd endpoint returns "stablecoin" instead of "borrowed" */
  stablecoin?: number
  debt: number
}

export type GetLiqHealthDecilesResponse = {
  median: number
  mean: number
  std: number
  min: number
  max: number
  data: LiquidationHealthDistributionDecileResponse[]
}

type TotalOverview = {
  chain: Chain
  soft_liquidation_users: number
  bad_debt: number
  liquidatable_positions: number
  liquidatable_pos_debt_usd: number
  liquidatable_collateral_usd: number
  // only for lending endpoint
  liquidatable_borrowed_usd: number | undefined
  // only for crvusd endpoint
  liquidatable_stablecoin_usd: number | undefined
}

export type GetTotalOverviewResponse = {
  data: TotalOverview[]
}

export type GetBadDebtResponse = {
  data: (TotalOverview & {
    market: string
    controller_address: Address
  })[]
}
