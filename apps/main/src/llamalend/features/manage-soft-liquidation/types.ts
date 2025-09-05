import { Address } from '@ui-kit/utils'

export type Token = {
  address: Address
  symbol: string
  chain?: string
  balance?: number
}
