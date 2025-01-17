import ethers from 'ethers'
import { Balances } from '@/types/main.types'

export type EtherContract = {
  contractAddress: string
  contract: ethers.ethers.Contract
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
