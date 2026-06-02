import type { Address } from '@primitives/address.utils'

export type TokenOption = {
  address: Address
  symbol: string
  chain?: string
  volume?: number
}
