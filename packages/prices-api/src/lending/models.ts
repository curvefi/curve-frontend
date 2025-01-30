import type { Address, Chain } from '..'

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
