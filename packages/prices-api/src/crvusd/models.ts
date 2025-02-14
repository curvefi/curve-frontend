import type { Address } from '..'

export type Market = {
  name: string
  address: Address
  factoryAddress: Address
  llamma: Address
  rate: number
  borrowed: number
  borrowable: number
  collateralAmount: number
  collateralAmountUsd: number
  debtCeiling: number
  loans: number
  collateralToken: {
    symbol: string
    address: Address
  }
  stablecoinToken: {
    symbol: string
    address: Address
  }
  fees: {
    pending: number
    collected: number
  }
}

export type Snapshot = {
  timestamp: Date
  rate: number
  nLoans: number
  minted: number
  redeemed: number
  totalCollateral: number
  totalCollateralUsd: number
  totalStablecoin: number
  totalDebt: number
  priceAMM: number
  priceOracle: number
  borrowable: number
  discountLiquidation: number
  discountLoan: number
}

export type PoolPrice = {
  timestamp: number
  [token: string]: number
}

export type PriceHistogram = {
  x: number[]
  y: number[]
}

export type CrvUsdSupply = {
  timestamp: Date
  market: string
  supply: number
  borrowable: number
}

export type Keeper = {
  address: Address
  pool: string
  poolAddress: Address
  pair: {
    symbol: string
    address: Address
  }[]
  active: boolean
  totalDebt: number
  totalProfit: number
}

/** More specifically, the markets where a user holds a position */
export type UserMarkets = {
  collateral: string
  controller: string
  snapshotFirst: Date
  snapshotLast: Date
}[]

export type UserMarketStats = {
  health: number
  healthFull: number
  n1: number
  n2: number
  n: number
  debt: number
  collateral: number
  stablecoin: number
  softLiquidation: boolean
  totalDeposited: number
  loss: number
  lossPct: number
  collateralUp: number
  oraclePrice: number
  blockNumber: number
  timestamp: Date
}

export type UserMarketSnapshots = UserMarketStats[]

export type UserCollateralEvents = {
  controller: Address
  user: Address
  totalDeposit: number
  totalDepositPrecise: string
  totalDepositUsd: number
  totalBorrowed: number
  totalBorrowedPrecise: string
  events: {
    timestamp: Date
    txHash: Address
    type: 'Borrow' | 'Deposit'
    user: Address
    collateralChange: number
    collateralChangeUsd?: number
    loanChange: number
    loanChangeUsd?: number
    liquidation?: {
      user: Address
      liquidator: Address
      collateralReceived: number
      collateralReceivedUsd: number
      stablecoinReceived: number
      debt: number
    }
    n1: number
    n2: number
    oraclePrice: number
  }[]
}
