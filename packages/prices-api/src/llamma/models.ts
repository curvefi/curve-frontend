import type { Address } from '..'

type Deposit = {
  amount: number
  n1: number
  n2: number
}

type Withdrawal = {
  amountBorrowed: number
  amountCollateral: number
}

export type LlammaEvent = {
  provider: Address
  deposit?: Deposit | null
  withdrawal?: Withdrawal | null
  blockNumber: number
  timestamp: Date
  txHash: Address
}

export type LlammaTrade = {
  idSold: number
  idBought: number
  tokenSold: {
    symbol: string
    address: Address
  }
  tokenBought: {
    symbol: string
    address: Address
  }
  amountSold: number
  amountBought: number
  price: number
  buyer: Address
  feeX: number
  feeY: number
  blockNumber: number
  timestamp: Date
  txHash: Address
}

export type LlammaOHLC = {
  time: Date
  open: number
  close: number
  high: number
  low: number
  basePrice: number
  oraclePrice: number
  volume: number
}
