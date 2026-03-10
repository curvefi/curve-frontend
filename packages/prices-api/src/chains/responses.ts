import type { Address } from '@primitives/address.utils'
import type { Chain } from '..'
import type { ActivityType } from './models'

export type GetSupportedChainsResponse = {
  data: { name: string }[]
}

export type GetChainInfoResponse = {
  chain: Chain
  total: {
    total_tvl: number
    trading_volume_24h: number
    trading_fee_24h: number
    liquidity_volume_24h: number
    liquidity_fee_24h: number
  }
}

export type GetTransactionsResponse = {
  data: {
    chain: Chain
    transactions: {
      type: ActivityType
      transactions: number
      timestamp: string
    }[]
  }[]
}

export type GetUsersResponse = {
  data: {
    chain: Chain
    users: {
      type: ActivityType
      users: number
      timestamp: string
    }[]
  }[]
}

export type GetPoolFilters = {
  data: {
    chain: Chain
    pools: {
      name: string
      address: Address
    }[]
  }[]
}
