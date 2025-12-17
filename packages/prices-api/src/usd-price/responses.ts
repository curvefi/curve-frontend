import type { Address } from '..'

export type GetUsdPriceResponse = {
  data: {
    address: Address
    usd_price: number
    last_updated: string
  }
}
