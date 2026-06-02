import type { Address } from '@primitives/address.utils'

export type Token = {
  address: Address
  symbol: string
  chain?: string
}
