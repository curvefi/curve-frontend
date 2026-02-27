import type { Address, Token } from '@primitives/address.utils'
import type { Chain } from '..'

export type Market = {
  name: string
  address: Address
  factoryAddress: Address
  llamma: Address
  rate: number
  // borrowApy = rate * 100
  borrowApy: number
  // @deprecated compute this using borrowApy and collateralToken.rebasingYield: borrowTotalApy = borrowApy - collateral_yield_apy
  borrowTotalApy: number
  borrowApr: number
  // @deprecated compute this using borrowApr and collateralToken.rebasingYieldApr
  borrowTotalApr: number
  borrowed: number
  borrowedUsd: number
  borrowable: number
  leverage: number
  collateralAmount: number
  collateralAmountUsd: number
  debtCeiling: number
  loans: number
  collateralToken: {
    symbol: string
    address: Address
    rebasingYield: number | null
    rebasingYieldApr: number | null
  }
  stablecoinToken: {
    symbol: string
    address: Address
    rebasingYield: number | null
    rebasingYieldApr: number | null
  }
  fees: {
    pending: number
    collected: number
  }
  createdAt: Date
  maxLtv: number
}

export type Snapshot = {
  timestamp: Date
  rate: number
  borrowApy: number
  borrowApr: number
  nLoans: number
  minted: number
  redeemed: number
  totalCollateral: number
  totalCollateralUsd: number
  totalStablecoin: number
  totalStablecoinUsd: number
  totalDebt: number
  totalDebtUsd: number
  priceAMM: number
  priceOracle: number
  borrowable: number
  discountLiquidation: number
  discountLoan: number
  ammA: number
  basePrice: number
  minBand: number
  maxBand: number
  sumDebtSquared: number
  collateralToken: {
    symbol: string
    address: string
    rebasingYield: number
    rebasingYieldApr: number
  }
  stablecoinToken: {
    symbol: string
    address: string
    rebasingYield: number
    rebasingYieldApr: number
  }
  maxLtv: number
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
  pair: Token[]
  active: boolean
  totalDebt: number
  totalProfit: number
}

/** More specifically, the markets where a user holds a position */
export type UserMarkets = {
  collateral: string
  controller: Address
  snapshotFirst: Date
  snapshotLast: Date
}[]

export type UserMarketStats = {
  health: number
  healthFull: number
  n1: number
  n2: number
  n: number
  /** The amount of borrow token borrowed by the user, so what you'd normally expect as 'borrowed' */
  debt: number
  collateral: number
  /** The amount of collateral token converted into debt token (due to soft liq) */
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

export type UserCollateralEvent = {
  timestamp: Date
  txHash: Address
  type: 'Borrow' | 'Liquidate' | 'Repay' | 'RemoveCollateral'
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
    stablecoinReceivedUsd: number
    debt: number
    debtUsd: number
  }
  n1: number
  n2: number
  oraclePrice: number
  isPositionClosed: boolean
}

export type UserCollateralEvents = {
  controller: Address
  user: Address
  totalDeposit: number
  totalDepositPrecise: string
  totalDepositUsd: number
  totalBorrowed: number
  totalBorrowedPrecise: string
  events: UserCollateralEvent[]
}

export type CrvUsdTvl = {
  chain: Chain
  tvl: number
}
