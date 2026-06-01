import type { Address } from '@primitives/address.utils'

export interface TokenOption {
  address: Address
  symbol: string
  chain?: string
  volume?: number
}
