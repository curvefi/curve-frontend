import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

export type LockType = 'CREATE_LOCK' | 'INCREASE_LOCK_AMOUNT' | 'INCREASE_UNLOCK_TIME' | 'WITHDRAW'

export type VotesOverview = {
  proposals: number
  votesProposals: number
  votesGauges: number
  votersUnique: number
  epoch: number
}

export type LocksDaily = {
  day: Timestamp
  amount: bigint
}

export type UserLock = {
  timestamp: Timestamp
  amount: bigint
  unlockTime: Timestamp
  lockType: LockType
  lockedBalance: bigint
  txHash: string
}

export type Supply = {
  timestamp: Timestamp
  veCrvTotal: bigint
  crvEscrowed: bigint
  crvSupply: bigint
  circulatingSupply: bigint
  lockedSupplyDetails: {
    address: Address
    label: string
    locked: bigint
  }[]
  blockNumber: number
  txHash: Address
}

export type Locker = {
  user: Address | `Others(${string})`
  locked: bigint
  weight: bigint
  weightRatio: number
  unlockTime: Timestamp | null
}
