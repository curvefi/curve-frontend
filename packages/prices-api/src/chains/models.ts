import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { Timestamp } from '../timestamp'

export type ChainInfo = {
  chain: string
  total: {
    tvl: number
    tradingVolume24h: number
    tradingFee24h: number
    liquidityVolume24h: number
    liquidityFee24h: number
  }
}

export const activityTypes = ['crvusd', 'lending', 'pools', 'router', 'dao'] as const
export type ActivityType = (typeof activityTypes)[number]

export type Activity = {
  timestamp: Timestamp
  chain: Chain
  type: ActivityType
}

export type Transactions = Activity & {
  transactions: number
}

export type Users = Activity & {
  users: number
}

export type PoolFilter = {
  chain: Chain
  address: Address
}
