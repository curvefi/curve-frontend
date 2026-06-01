import type { Contract } from 'ethers'

export interface EtherContract {
  contractAddress: string
  contract: Contract
  poolName: string
  poolId: string
  token: string
}

export interface Balances {
  [key: string]: {
    poolId: string
    balance: number
  }[]
}

export interface VestedTotals {
  [key: string]: {
    poolId: string
    amount: number
  }[]
}
