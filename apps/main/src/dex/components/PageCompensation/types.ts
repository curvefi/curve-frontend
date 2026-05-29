import type { Contract } from 'ethers'

export interface EtherContract {
  contractAddress: string
  contract: Contract
  poolName: string
  poolId: string
  token: string
}

export type Balances = Record<
  string,
  {
    poolId: string
    balance: number
  }[]
>

export type VestedTotals = Record<
  string,
  {
    poolId: string
    amount: number
  }[]
>
