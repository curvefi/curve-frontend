import type { Address } from '@primitives/address.utils'

export type GetUsdPriceResponse = {
  data: {
    address: Address
    usd_price: number
    last_updated: string
  }
}
