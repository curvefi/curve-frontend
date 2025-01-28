import type { Address, Chain } from '..'

export type GetChainsResponse = {
  data: Chain[]
}

export type GetMarketsResponse = {
  data: {
    name: Address
    controller: Address
    vault: Address
    llamma: Address
    policy: Address
    oracle: Address
    rate: string
    borrow_apy: string
    lend_apy: string
    n_loans: 0
    price_oracle: string
    amm_price: string
    total_debt: string
    total_assets: string
    total_debt_usd: string
    total_assets_usd: string
    minted: string
    redeemed: string
    minted_usd: string
    redeemed_usd: string
    collateral_balance: string
    borrowed_balance: string
    collateral_balance_usd: string
    borrowed_balance_usd: string
    collateral_token: {
      symbol: string
      address: Address
    }
    borrowed_token: {
      symbol: string
      address: Address
    }
  }[]
}

export type GetSnapshotsResponse = {
  data: [
    {
      rate: string
      borrow_apy: string
      lend_apy: string
      n_loans: number
      price_oracle: string
      amm_price: string
      total_debt: string
      total_debt_usd: string
      total_assets: string
      total_assets_usd: string
      minted: string
      redeemed: string
      collateral_balance: string
      collateral_balance_usd: string
      borrowed_balance: string
      borrowed_balance_usd: string
      timestamp: string
      liquidation_discount: number
      loan_discount: number
    },
  ]
}

export type GetUserMarketsResponse = {
  user: Address
  page: number
  per_page: number
  count: number
  markets: {
    market_name: string
    controller: Address
    first_snapshot: string
    last_snapshot: string
  }[]
}

type UserMarketStats = {
  health: number
  health_full: number
  n1: number
  n2: number
  n: number
  debt: number
  collateral: number
  borrowed: number
  soft_liquidation: boolean
  total_deposited: number
  loss: number
  loss_pct: number
  collateral_up: number
  oracle_price: number
  block_number: number
  timestamp: string
}

export type GetUserMarketStatsResponse = UserMarketStats

export type GetUserMarketSnapshotsResponse = {
  user: Address
  page: number
  per_page: number
  count: number
  data: UserMarketStats[]
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
  total_deposit_usd_value: number
  count: number
  pagination: number
  page: number
  data: {
    dt: string
    transaction_hash: Address
    type: 'Borrow' | 'Deposit'
    user: Address
    collateral_change: number
    collateral_change_usd: number | null
    loan_change: number
    loan_change_usd: number | null
    liquidation: {
      user: Address
      liquidator: Address
      collateral_received: number
      stablecoin_received: number
      collateral_received_usd: number
      stablecoin_received_usd: number
      debt: number
      debt_usd: number
    } | null
    leverage: {
      event_type: string
      user: Address
      user_borrowed: number
      user_collateral: number
      user_collateral_from_borrowed: number
      user_collateral_used: number
      debt: number
      leverage_collateral: number
      state_collateral_used: number
      borrowed_from_state_collateral: number
      borrowed_from_user_collateral: number
    } | null
    n1: number
    n2: number
    oracle_price: number
  }[]
}
