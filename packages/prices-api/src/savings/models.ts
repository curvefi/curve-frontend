import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

export type Event = {
  type: 'deposit' | 'withdraw'
  sender: Address
  owner: Address
  receiver?: Address
  assets: bigint
  supply: bigint
  blockNumber: number
  timestamp: Timestamp
  txHash: Address
}

export type Yield = { timestamp: Timestamp; assets: number; supply: number; apyProjected: number }

export type Revenue = {
  strategy: Address
  gain: bigint
  loss: bigint
  currentDebt: bigint
  totalRefunds: bigint
  feesTotal: bigint
  feesProtocol: bigint
  txHash: Address
  timestamp: Timestamp
}

export type Statistics = { lastUpdated: Timestamp; lastUpdatedBlock: number; apyProjected: number; supply: number }

export type UserStats = {
  totalDeposited: bigint
  totalReceived: bigint
  totalWithdrawn: bigint
  totalTransferredIn: bigint
  totalTransferredOut: bigint
  currentBalance: bigint
}
