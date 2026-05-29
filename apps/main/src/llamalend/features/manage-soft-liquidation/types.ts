import type { Address } from '@primitives/address.utils'

export interface Token {
  address: Address
  symbol: string
  chain?: string
}
