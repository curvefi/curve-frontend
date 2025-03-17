import type { Address } from '..'

/*
 * Note that collateral can be two tokens due to soft-liquidations.
 * You can have a crvUSD borrow (partially) being collateralized by crvUSD.
 */
export type Market = {
  name: string
  controller: Address
  vault: Address
  llamma: Address
  policy: Address
  oracle: Address
  oraclePools: Address[]
  rate: number
  apyBorrow: number
  apyLend: number
  nLoans: number
  priceOracle: number
  ammPrice: number
  basePrice: number
  totalDebt: number // Borrowed
  totalAssets: number // Supplied
  totalDebtUsd: number
  totalAssetsUsd: number
  minted: number
  mintedUsd: number
  redeemed: number
  redeemedUsd: number
  loanDiscount: number
  liquidationDiscount: number
  minBand: number
  maxBand: number
  collateralBalance: number // Collateral (like CRV)
  collateralBalanceUsd: number
  borrowedBalance: number // Collateral (like crvUSD)
  borrowedBalanceUsd: number
  collateralToken: {
    symbol: string
    address: Address
  }
  borrowedToken: {
    symbol: string
    address: Address
  }
  leverage: number
}

export type MarketPair = { long?: Market; short?: Market }

export type Snapshot = {
  rate: number
  borrowApy: number
  lendApy: number
  numLoans: number
  priceOracle: number
  ammPrice: number
  totalDebt: number
  totalDebtUsd: number
  totalAssets: number
  totalAssetsUsd: number
  minted: number
  redeemed: number
  collateralBalance: number
  collateralBalanceUsd: number
  borrowedBalance: number
  borrowedBalanceUsd: number
  timestamp: Date
  discountLiquidation: number
  discountLoan: number
}

/** More specifically, the markets where a user holds a position */
export type UserMarkets = {
  name: string
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
  debt: number
  collateral: number
  borrowed: number
  softLiquidation: boolean
  totalDeposited: number
  loss: number
  lossPct: number
  collateralUp: number
  oraclePrice: number
  blockNumber: number
  timestamp: Date
}

export type UserMarketEarnings = {
  user: Address
  earnings: number
  deposited: number
  withdrawn: number
  transfersInShares: number
  transfersOutAssets: number
  transfersInAssets: number
  transfersOutShares: number
}

export type UserMarketSnapshots = UserMarketStats[]

export type UserCollateralEvents = {
  controller: Address
  user: Address
  totalDeposit: number
  totalDepositUsd: number
  totalDepositFromUser: number
  totalDepositFromUserPrecise: string
  totalDepositPrecise: string
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
      stablecoinReceivedUsd: number
      debt: number
      debtUsd: number
    }
    leverage?: {
      type: string
      user: Address
      userCollateral: number
      userCollateralFromBorrowed: number
      userCollateralUsed: number
      userBorrowed: number
      debt: number
      leverageCollateral: number
      stateCollateralUsed: number
      borrowedFromStateCollateral: number
      borrowedFromUserCollateral: number
    }
    n1: number
    n2: number
    oraclePrice: number
  }[]
}
