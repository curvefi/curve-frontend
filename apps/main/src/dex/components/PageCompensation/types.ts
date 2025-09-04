import type { Contract } from 'ethers'

export type EtherContract = {
  contractAddress: string
  contract: Contract
  poolName: string
  poolId: string
  token: string
}

export type Balances = {
  [key: string]: {
    poolId: string
    balance: number
  }[]
}

export type VestedTotals = {
  [key: string]: {
    poolId: string
    amount: number
  }[]
}
