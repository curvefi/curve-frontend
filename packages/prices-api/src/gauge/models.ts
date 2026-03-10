import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'

export type Gauge = {
  address: Address
  type: string
  name?: string
  version?: string
  lpToken?: Address
  pool?: {
    address: Address
    name: string
    chain: Chain
    tvlUsd: number
    tradingVolume24h: number
  }
  tokens: {
    symbol: string
    address: Address
    precision: number
  }[]
  market?: {
    name: string
    chain: Chain
  }
  killed: boolean
  emissions: number
  weight: bigint
  weightDelta7d?: number
  weightDelta60d?: number
  weightRelative: number
  weightRelativeDelta7d?: number
  weightRelativeDelta60d?: number
  creationTx: Address
  creationDate: Date
  lastVoteTx?: Address
  lastVoteDate?: Date
}

export type GaugeVote = {
  user: Address
  weight: number
  blockNumber: number
  timestamp: Date
  tx: Address
}

export type WeightHistory = {
  killed: boolean
  weight: number
  weightRelative: number
  emissions: number
  epoch: number
}

export type Deployment = {
  addressFrom: Address
  addressTo?: Address
  calldata: string
  calldataDecoded?: string
  blockNumber: number
  timestamp: Date
}

export type UserGaugeVote = {
  timestamp: Date
  gauge: Address
  gaugeName: string
  weight: number
  blockNumber: number
  txHash: Address
}
