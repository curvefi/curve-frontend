import type { Address } from '@primitives/address.utils'

export type UsdPrice = {
  address: Address
  usdPrice: number
  lastUpdated: Date
}
