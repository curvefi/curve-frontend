import type { Address, Chain, PaginationMeta } from '..'

export type GetMarketsResponse = {
  data: {
    address: Address
    factory_address: Address
    llamma: Address
    rate: number
    borrow_apy: number
    borrow_total_apy: number
    borrow_apr: number
    borrow_total_apr: number
    total_debt: number
    total_debt_usd: number
    n_loans: number
    debt_ceiling: number
    borrowable: number
    leverage: number
    pending_fees: number
    collected_fees: number
    collateral_amount: number
    collateral_amount_usd: number
    stablecoin_amount: number
    collateral_token: {
      symbol: string
      address: Address
      rebasing_yield: number | null
    }
    stablecoin_token: {
      symbol: string
      address: Address
      rebasing_yield: number | null
    }
    created_at: string
    max_ltv: number
  }[]
  count: number
}

export type GetAllMarketsResponse = {
  chains: Record<Chain, GetMarketsResponse>
}

export type GetSnapshotsResponse = {
  data: {
    rate: number
    minted: number
    redeemed: number
    total_collateral: number
    total_collateral_usd: number
    total_stablecoin: number
    total_stablecoin_usd: number
    total_debt: number
    total_debt_usd: number
    n_loans: number
    amm_price: number
    amm_a: number
    price_oracle: number
    base_price: number
    min_band: number
    max_band: number
    borrowable: number
    dt: string
    liquidation_discount: number
    loan_discount: number
    sum_debt_squared: number
    collateral_token: {
      symbol: string
      address: string
      rebasing_yield: number
    }
    stablecoin_token: {
      symbol: string
      address: string
      rebasing_yield: number
    }
    max_ltv: number
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

export type GetUserMarketsResponse = PaginationMeta & {
  user: string
  markets: {
    collateral: string
    controller: Address
    first_snapshot: string
    last_snapshot: string
  }[]
}

export type GetAllUserMarketsResponse = {
  user: Address
  chains: Record<Chain, Pick<GetUserMarketsResponse, 'markets' | 'count'>>
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

export type GetUserMarketSnapshotsResponse = PaginationMeta & {
  user: string
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
      transaction_hash: Address
      type: 'Borrow' | 'Liquidate' | 'Repay' | 'RemoveCollateral'
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
        stablecoin_received_usd: number
        debt: number
        debt_usd: number
      } | null
      n1: number
      n2: number
      oracle_price: number
      is_position_closed: boolean
    },
  ]
}

export type GetCrvUsdTvlResponse = {
  chain: Chain
  tvl: number
}
