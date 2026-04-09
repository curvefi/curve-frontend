import type { Address } from '@primitives/address.utils'

export type GetUsdPriceResponse = {
  data: {
    address: Address
    usd_price: number
    last_updated: string
  }
}

export type GetUsdPriceHistoryResponse = {
  address: Address
  data: {
    price: number
    timestamp: string
  }[]
}
