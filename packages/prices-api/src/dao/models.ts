import type { Address } from '..'

export type VotesOverview = {
  proposals: number
  votesProposals: number
  votesGauges: number
  votersUnique: number
  epoch: number
}

export type LocksDaily = {
  day: number
  amount: bigint
}

export type UserLock = {
  timestamp: number
  amount: bigint
  unlockTime: number
  lockType: 'CREATE_LOCK' | 'INCREASE_LOCK_AMOUNT' | 'INCREASE_UNLOCK_TIME'
  lockedBalance: bigint
  txHash: string
}

export type Supply = {
  timestamp: number
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
  unlockTime: number
}
