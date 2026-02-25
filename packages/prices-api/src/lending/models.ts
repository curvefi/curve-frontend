import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'

type Bar = {
  value: number
  label: string
}

export type LoanDistribution = {
  stablecoin: Bar[]
  debt: Bar[]
  collateral: Bar[]
}

export type Oracle = {
  chain: Chain
  controller: Address
  oracle: Address
  pools: OraclePool[]
  ohlc: OracleOHLC[]
}

export type OraclePool = {
  address: Address
  borrowedIndex: number
  borrowedSymbol: string
  borrowedAddress: Address
  collateralIndex: number
  collateralSymbol: string
  collateralAddress: Address
}

export type OracleOHLC = {
  time: Date
  open: number
  close: number
  high: number
  low: number
  basePrice: number
  oraclePrice: number
}

export type UserCollateralEvent = {
  timestamp: Date
  txHash: Address
  type: 'Borrow' | 'Liquidate' | 'Repay' | 'RemoveCollateral'
  user: Address
  collateralChange: number
  collateralChangeUsd: number
  loanChange: number
  loanChangeUsd: number
  liquidation?: {
    user: Address
    liquidator: Address
    collateralReceived: number
    collateralReceivedUsd: number
    stablecoinReceived: number
    stablecoinRecievedUsd: number
    debt: number
    debtUsd: number
  }
  leverage?: {
    eventType: 'Deposit' | 'Repay'
    user: Address
    userCollateral: number
    userBorrowed: number
    userCollateralFromBorrowed: number
    debt: number
    leverageCollateral: number
    stateCollateralUsed: number
    borrowedFromStateCollateral: number
    userCollateralUsed: number
    borrowedFromUserCollateral: number
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
  totalBorrowed: number
  totalDepositPrecise: string
  totalBorrowedPrecise: string
  totalDepositFromUser: number
  totalDepositFromUserPrecise: string
  totalDepositUsdValue: number
  totalBorrowedUsdValue: number
  events: UserCollateralEvent[]
}
