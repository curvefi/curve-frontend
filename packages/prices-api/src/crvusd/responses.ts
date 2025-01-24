import type { Address } from '..'

export type GetMarketsResponse = {
  data: {
    address: Address
    factory_address: Address
    llamma: Address
    rate: number
    total_debt: number
    n_loans: number
    debt_ceiling: number
    borrowable: number
    pending_fees: number
    collected_fees: number
    collateral_amount: number
    collateral_amount_usd: number
    stablecoin_amount: number
    collateral_token: {
      symbol: string
      address: Address
    }
    stablecoin_token: {
      symbol: string
      address: Address
    }
  }[]
  count: number
}

export type GetSnapshotsResponse = {
  data: {
    rate: number
    minted: number
    redeemed: number
    total_collateral: number
    total_collateral_usd: number
    total_stablecoin: number
    total_debt: number
    n_loans: number
    amm_price: number
    price_oracle: number
    borrowable: number
    dt: string
    liquidation_discount: number
    loan_discount: number
  }[]
}

export type GetKeepersResponse = {
  keepers: {
    address: Address
    pool: string
    pool_address: Address
    pair: {
      symbol: string
      address: Address
    }[]
    active: boolean
    total_debt: number
    total_profit: number
  }[]
}

export type GetSupplyResponse = {
  data: {
    market: string
    supply: number
    borrowable: number
    timestamp: string
  }[]
}

export type GetUserMarketsResponse = {
  user: string
  page: number
  per_page: number
  count: number
  markets: {
    collateral: string
    controller: string
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
  stablecoin: number
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
  user: string
  page: number
  per_page: number
  count: number
  data: UserMarketStats[]
}

export type GetUserCollateralEventsResponse = {
  controller: Address
  user: Address
  total_deposit: number
  total_borrowed: number
  total_deposit_precise: string
  total_borrowed_precise: string
  total_deposit_usd_value: number
  count: number
  pagination: number
  page: number
  data: [
    {
      dt: string
      transaction_hash: string
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
        collateral_received_usd: number
        stablecoin_received: number
        debt: number
      } | null
      n1: number
      n2: number
      oracle_price: number
    },
  ]
}
