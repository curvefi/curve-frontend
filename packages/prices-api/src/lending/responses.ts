import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'

type Bar = {
  value: number
  label: string
}

export type GetLoanDistributionResponse = {
  stablecoin: Bar[]
  debt: Bar[]
  collateral: Bar[]
}

export type GetOracleResponse = {
  chain: Chain
  controller: Address
  oracle: Address
  price_source_pools: [
    {
      address: Address
      borrowed_ix: number
      borrowed_symbol: string
      borrowed_address: Address
      collateral_ix: number
      collateral_symbol: string
      collateral_address: Address
    },
  ]
  data: {
    time: number
    open: number
    close: number
    high: number
    low: number
    base_price: number
    oracle_price: number
  }[]
}

export type GetUserCollateralEventsResponse = {
  chain: string
  controller: Address
  user: Address
  total_deposit: number
  total_deposit_from_user: number
  total_borrowed: number
  total_deposit_precise: string
  total_borrowed_precise: string
  total_deposit_from_user_precise: string
  total_deposit_from_user_usd_value: number
  total_deposit_usd_value: number
  count: number
  pagination: number
  page: number
  data: [
    {
      dt: string
      transaction_hash: Address
      type: 'Borrow' | 'Liquidate' | 'Repay' | 'RemoveCollateral'
      user: Address
      collateral_change: number
      collateral_change_usd: number
      loan_change: number
      loan_change_usd: number
      liquidation?: {
        user: Address
        liquidator: Address
        collateral_received: number
        stablecoin_received: number
        collateral_received_usd: number
        stablecoin_received_usd: number
        debt: number
        debt_usd: number
      }
      leverage?: {
        event_type: 'Deposit' | 'Repay'
        user: Address
        user_collateral: number
        user_borrowed: number
        user_collateral_from_borrowed: number
        debt: number
        leverage_collateral: number
        state_collateral_used: number
        borrowed_from_state_collateral: number
        user_collateral_used: number
        borrowed_from_user_collateral: number
      }
      n1: number
      n2: number
      oracle_price: number
      is_position_closed: boolean
    },
  ]
}
