import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

export type GetUsdPriceResponse = {
  data: {
    address: Address
    usd_price: number
    last_updated: Timestamp
  }
}

export type GetUsdPriceHistoryResponse = {
  address: Address
  data: {
    price: number
    timestamp: Timestamp
  }[]
}
