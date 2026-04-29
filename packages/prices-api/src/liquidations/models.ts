import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { Timestamp } from '../timestamp'

export type SoftLiqRatio = {
  timestamp: Timestamp
  proportion: number
}

export type LiquidationDetails = {
  timestamp: Timestamp
  user: Address
  liquidator: Address
  self: boolean
  collateralReceived: number
  collateralReceivedUsd: number
  stablecoinReceived: number
  priceOracle: number
  debt: number
  n1: number
  n2: number
  tx: Address
  block: number
}

export type LiquidationAggregate = {
  timestamp: Timestamp
  selfCount: number
  hardCount: number
  selfValue: number
  hardValue: number
  price: number
}

export type LiqOverview = {
  softLiqUsers: number
  liqablePositions: number
  liqableDebtUsd: number
  liqableCollatUsd: number
  liqableBorrowedUsd: number
  medianHealth: number
  avgHealth: number
  collatRatio: number
}

export type LiqLosses = {
  timestamp: Timestamp
  pctLossMedian: number
  pctLossAverage: number
  absoluteLossMedian: number
  absoluteLossAverage: number
  numTotalUsers: number
  numUsersWithLosses: number
  ratio: number
}

export type LiqHealthDecile = {
  healthDecile: string
  collateral: number
  debt: number
  borrowed: number
}

export type LiqHealthDeciles = {
  meanHealth: number
  medianHealth: number
  stdHealth: number
  minHealth: number
  maxHealth: number
  deciles: LiqHealthDecile[]
}

export type TotalOverview = {
  chain: Chain
  softLiquidationUsers: number
  badDebt: number
  liquidatablePositions: number
  liquidatablePosDebtUsd: number
  liquidatableCollateralUsd: number
  liquidatableBorrowedUsd: number | null
  liquidatableStablecoinUsd: number | null
}[]

export type BadDebt = (TotalOverview[number] & {
  market: string
  controllerAddress: Address
})[]
