import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'

export type GetSoftLiqRatiosResponse = {
  data: {
    timestamp: string
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
    dt: string
    tx: Address
    block: number
  }[]
}

export type GetLiqsAggregateResponse = {
  data: {
    timestamp: string
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
    timestamp: string
    median_pct_loss: number
    avg_pct_loss: number
    median_abs_loss: number
    avg_abs_loss: number
    total_users: number
    users_with_losses: number
    ratio: number
  }[]
}

export type GetLiqHealthDecilesResponse = {
  data: {
    health_decile: string
    collateral: number
    stablecoin: number
    debt: number
  }[]
}

export type GetTotalOverviewResponse = {
  data: {
    chain: Chain
    soft_liquidation_users: number
    bad_debt: number
    liquidatable_positions: number
    liquidatable_pos_debt_usd: number
    liquidatable_collateral_usd: number
    liquidatable_borrowed_usd: number
  }[]
}
