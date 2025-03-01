import { Address } from '@ui-kit/utils'

export type TokenOption = {
  chain: string
  address: Address
  symbol: string
  label?: string
  volume?: number
}
