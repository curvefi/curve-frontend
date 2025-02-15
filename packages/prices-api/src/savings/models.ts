import type { Address } from '..'

export type Event = {
  type: 'deposit' | 'withdraw'
  sender: Address
  owner: Address
  receiver?: Address
  assets: bigint
  supply: bigint
  blockNumber: number
  timestamp: Date
  txHash: Address
}

export type Yield = { timestamp: Date; assets: number; supply: number; apyProjected: string }

export type Revenue = {
  strategy: Address
  gain: bigint
  loss: bigint
  currentDebt: bigint
  totalRefunds: bigint
  feesTotal: bigint
  feesProtocol: bigint
  txHash: Address
  timestamp: Date
}

export type Statistics = { lastUpdated: Date; lastUpdatedBlock: number; aprProjected: number; supply: number }

export type UserStats = {
  totalDeposited: string
  totalReceived: string
  totalWithdrawn: string
  totalTransferredIn: string
  totalTransferredOut: string
  currentBalance: string
}
