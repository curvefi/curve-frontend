import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

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
  // borrowApy = rate * 100
  borrowApy: number
  // @deprecated compute this using borrowApy and collateralToken.rebasingYield
  borrowTotalApy: number
  borrowApr: number
  // @deprecated compute this using borrowApr and collateralToken.rebasingYieldApr
  borrowTotalApr: number
  apyLend: number
  aprLend: number
  aprLendCrv0Boost: number
  aprLendCrvMaxBoost: number
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
    rebasingYield: number | null
    rebasingYieldApr: number | null
  }
  borrowedToken: {
    symbol: string
    address: Address
    rebasingYield: number | null
    rebasingYieldApr: number | null
  }
  leverage: number
  extraRewardApr: {
    address: Address
    symbol: string
    rate: number
  }[]
  createdAt: Timestamp
  maxLtv: number
}

export type Snapshot = {
  rate: number
  borrowApy: number
  borrowApr: number
  lendApy: number
  lendApr: number
  lendAprCrv0Boost: number
  lendAprCrvMaxBoost: number
  discountLiquidation: number
  discountLoan: number
  numLoans: number
  priceOracle: number
  ammPrice: number
  basePrice: number
  totalDebt: number
  totalDebtUsd: number
  totalAssets: number
  totalAssetsUsd: number
  minted: number
  redeemed: number
  mintedUsd: number
  redeemedUsd: number
  minBand: number
  maxBand: number
  collateralBalance: number
  collateralBalanceUsd: number
  borrowedBalance: number
  borrowedBalanceUsd: number
  ammA: number
  sumDebtSquared: number
  extraRewardApr: {
    address: Address
    symbol: string
    rate: number
  }[]
  collateralToken: {
    symbol: string
    address: Address
    rebasingYield: number | null
    rebasingYieldApr: number | null
  }
  borrowedToken: {
    symbol: string
    address: Address
    rebasingYield: number | null
    rebasingYieldApr: number | null
  }
  timestamp: Timestamp
  maxLtv: number
}

/** More specifically, the markets where a user holds a position */
export type UserMarket = {
  name: string
  controller: Address
  snapshotFirst: Timestamp
  snapshotLast: Timestamp
}

export type UserLendingPosition = {
  marketName: string
  vaultAddress: Address
  firstDeposit: Timestamp
  lastActivity: Timestamp
  currentShares: number
  currentSharesInGauge: number
  boostMultiplier: number
}

export type UserMarketStats = {
  health: number
  healthFull: number
  n1: number
  n2: number
  n: number
  activeBand: number
  /** The amount of borrow token borrowed by the user, so what you'd normally expect as 'borrowed' */
  debt: number
  collateral: number
  /** The amount of collateral token converted into debt token (due to soft liq) */
  borrowed: number
  softLiquidation: boolean
  totalDeposited: number
  loss: number
  lossPct: number
  collateralUp: number
  oraclePrice: number
  blockNumber: number
  timestamp: Timestamp
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
  transfersSharesToGauge: number
  transfersSharesFromGauge: number
  transfersAssetsToGauge: number
  transfersAssetsFromGauge: number
  transfersSharesToConvex: number
  transfersSharesFromConvex: number
  transfersAssetsToConvex: number
  transfersAssetsFromConvex: number
  currentShares: number
  currentSharesInGauge: number
  currentSharesInConvex: number
  currentAssets: number
  currentAssetsInGauge: number
  currentAssetsInConvex: number
  totalCurrentShares: number
  totalCurrentAssets: number
  boostMultiplier: number | null
}

export type UserMarketSnapshots = UserMarketStats[]

export type MarketUser = {
  user: string
  first: Timestamp
  last: Timestamp
  debt: number
  health: number
  healthFull: number
  loss: number
  borrowed: number
  collateral: number
  softLiquidation: boolean
}

export type MarketUsers = {
  count: number
  users: MarketUser[]
}

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
    timestamp: Timestamp
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
