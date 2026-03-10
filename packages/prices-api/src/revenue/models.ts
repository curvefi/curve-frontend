import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'

export type ChainRevenue = {
  chain: string
  totalDailyFeesUSD: number
}

export type ChainTopPoolRevenue = {
  name: string
  totalDailyFeesUSD: number
}

export type CrvUsdWeekly = {
  timestamp: Date
  controller: Address
  collateral: string
  feesUsd: number
}

export type PoolsWeekly = {
  timestamp: Date
  chain: Chain
  feesUsd: number
}

export type Cushion = {
  pool: Address
  name: string
  adminFees: number[]
  usdValue: number
}

export type Distribution = {
  timestamp: Date
  feesUsd: number
}

export type CowSwapSettlement = {
  timestamp: Date
  coin: {
    lpToken: boolean
    symbol: string
    address: Address
    precision: number
  }
  amount: bigint
  amountFee: bigint
  amountReceived: number
  routerReceived: number
  epoch: number
  txHash: Address
  blockNumber: number
}

type Fees = {
  coin: {
    lpToken: boolean
    symbol: string
    address: Address
    decimals: number
  }
  amount: number
  amountUsd: number
}

export type FeesCollected = Fees
export type FeesStaged = Fees
