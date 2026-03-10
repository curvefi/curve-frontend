import type { Address, Token } from '@primitives/address.utils'

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
  tokenSold: Token
  tokenBought: Token
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
  open: number | null
  close: number | null
  high: number | null
  low: number | null
  basePrice: number | null
  oraclePrice: number | null
  volume: number | null
}
