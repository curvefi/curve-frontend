import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

export type GetEventsResponse = {
  count: number
  events: {
    action_type: 'deposit' | 'withdraw'
    sender: Address
    owner: Address
    receiver?: Address
    assets: string
    shares: string
    block_number: number
    timestamp: Timestamp
    transaction_hash: Address
  }[]
}

export type GetYieldResponse = { data: { timestamp: Timestamp; assets: number; supply: number; proj_apy: string }[] }

export type GetRevenueResponse = {
  count: number
  total_distributed: string
  history: {
    strategy: Address
    gain: string
    loss: string
    current_debt: string
    total_refunds: string
    total_fees: string
    protocol_fees: string
    tx_hash: Address
    dt: Timestamp
  }[]
}

export type GetStatisticsResponse = {
  last_updated: Timestamp
  last_updated_block: number
  proj_apy: number
  supply: number
}

export type GetUserStatsResponse = {
  total_deposited: string
  total_recieved: string
  total_withdrawn: string
  total_transferred_in: string
  total_transferred_out: string
  current_balance: string
}
