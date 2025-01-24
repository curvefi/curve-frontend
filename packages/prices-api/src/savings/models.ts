import type { Address } from '..'

export type Event = {
  type: 'deposit' | 'withdraw'
  sender: Address
  owner: Address
  receiver?: Address
  assets: bigint
  supply: bigint
  blockNumber: number
  timestamp: number
  txHash: Address
}

export type Yield = {
  timestamp: number
  assets: number
  supply: number
  apyProjected: string
}

export type Revenue = {
  strategy: Address
  gain: bigint
  loss: bigint
  currentDebt: bigint
  totalRefunds: bigint
  feesTotal: bigint
  feesProtocol: bigint
  txHash: Address
  timestamp: number
}

export type Statistics = {
  lastUpdated: number
  lastUpdatedBlock: number
  aprProjected: number
  supply: number
}
