import type { Address, Chain } from '..'

export type GetChainsResponse = {
  data: Chain[]
}

export type GetMarketsResponse = {
  count: number
  data: {
    name: string
    controller: Address
    vault: Address
    llamma: Address
    policy: Address
    oracle: Address
    oracle_pools: Address[]
    rate: number
    borrow_apy: number
    borrow_total_apy: number | null
    borrow_apr: number
    borrow_total_apr: number | null
    lend_apy: number
    lend_apr: number
    lend_apr_crv_0_boost: number
    lend_apr_crv_max_boost: number
    n_loans: number
    price_oracle: number
    amm_price: number
    base_price: number
    total_debt: number
    total_assets: number
    total_debt_usd: number
    total_assets_usd: number
    minted: number
    redeemed: number
    minted_usd: number
    redeemed_usd: number
    loan_discount: number
    liquidation_discount: number
    min_band: number
    max_band: number
    collateral_balance: number
    borrowed_balance: number
    collateral_balance_usd: number
    borrowed_balance_usd: number
    collateral_token: {
      symbol: string
      address: Address
      rebasing_yield: number | null
    }
    borrowed_token: {
      symbol: string
      address: Address
      rebasing_yield: number | null
    }
    leverage: number
    extra_reward_apr: {
      address: Address
      symbol: string
      apr: number
    }[]
    created_at: string
    max_ltv: number
  }[]
}

export type GetAllMarketsResponse = {
  chains: Record<Chain, GetMarketsResponse>
}

export type GetSnapshotsResponse = {
  data: [
    {
      rate: string
      borrow_apy: number
      lend_apy: number
      lend_apr: number
      lend_apr_crv_0_boost: number
      lend_apr_crv_max_boost: number
      liquidation_discount: number
      loan_discount: number
      n_loans: number
      price_oracle: string
      amm_price: string
      base_price: string
      total_debt: string
      total_debt_usd: string
      total_assets: string
      total_assets_usd: string
      minted: string
      redeemed: string
      minted_usd: string
      redeemed_usd: string
      min_band: string
      max_band: string
      collateral_balance: string
      collateral_balance_usd: string
      borrowed_balance: string
      borrowed_balance_usd: string
      amm_a: string
      sum_debt_squared: string
      extra_rewards_apr: {
        address: Address
        symbol: string
        apr: number
      }[]
      collateral_token: {
        symbol: string
        address: Address
        rebasing_yield: number | null
      }
      borrowed_token: {
        symbol: string
        address: Address
        rebasing_yield: number | null
      }
      timestamp: string
      max_ltv: number
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

export type GetAllUserMarketsResponse = {
  user: Address
  chains: Record<Chain, Pick<GetUserMarketsResponse, 'markets' | 'count'>>
}

export type GetUserLendingPositionsResponse = {
  user: Address
  markets: {
    market_name: string
    vault_address: Address
    first_deposit: string
    last_activity: string
    current_shares: string
    current_shares_in_gauge: string
    boost_multiplier: number
  }[]
  page: number
  per_page: number
  count: number
}

export type GetAllUserLendingPositionsResponse = {
  user: Address
  chains: Record<Chain, Pick<GetUserLendingPositionsResponse, 'markets' | 'count'>>
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

type UserMarketEarnings = {
  user: Address
  earnings: string
  deposited: string
  withdrawn: string
  transfers_in_shares: string
  transfers_out_shares: string
  transfers_in_assets: string
  transfers_out_assets: string
  transfers_shares_to_gauge: string
  transfers_shares_from_gauge: string
  transfers_assets_to_gauge: string
  transfers_assets_from_gauge: string
  transfers_shares_to_convex: string
  transfers_shares_from_convex: string
  transfers_assets_to_convex: string
  transfers_assets_from_convex: string
  current_shares: string
  current_shares_in_gauge: string
  current_shares_in_convex: string
  current_assets: string
  current_assets_in_gauge: string
  current_assets_in_convex: string
  total_current_shares: string
  total_current_assets: string
  boost_multiplier: number | null
}

export type GetUserMarketEarningsResponse = UserMarketEarnings

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
