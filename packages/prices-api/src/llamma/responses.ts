import type { Address, Token } from '@primitives/address.utils'
import type { PaginationMeta } from '..'

export type GetLlammaEventsResponse = PaginationMeta & {
  data: {
    provider: Address
    deposit: {
      amount: number
      n1: number
      n2: number
    } | null
    withdrawal?: {
      amount_borrowed: number
      amount_collateral: number
    } | null
    block_number: number
    timestamp: number
    transaction_hash: Address
  }[]
}

export type GetLlammaTradesResponse = PaginationMeta & {
  data: {
    sold_id: number
    bought_id: number
    token_sold: Token
    token_bought: Token
    amount_sold: number
    amount_bought: number
    price: number
    buyer: Address
    fee_x: number
    fee_y: number
    block_number: number
    timestamp: number
    transaction_hash: Address
  }[]
}

export type GetLlammaOHLCResponse = {
  data: {
    time: number
    open: number | null
    close: number | null
    high: number | null
    low: number | null
    base_price: number | null
    oracle_price: number | null
    volume: number | null
  }[]
}
