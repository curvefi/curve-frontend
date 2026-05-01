import type { Address } from '@primitives/address.utils'
import type { TimestampResponse } from '../timestamp'

export type GetUsdPriceResponse = {
  data: {
    address: Address
    usd_price: number
    last_updated: TimestampResponse
  }
}

export type GetUsdPriceHistoryResponse = {
  address: Address
  data: {
    price: number
    timestamp: TimestampResponse
  }[]
}
