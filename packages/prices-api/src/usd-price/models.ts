import type { Address } from '@primitives/address.utils'
import type { Timestamp } from '../timestamp'

export type UsdPrice = {
  address: Address
  usdPrice: number
  lastUpdated: Timestamp
}

export type UsdPriceHistory = {
  price: number
  timestamp: Timestamp
}[]
