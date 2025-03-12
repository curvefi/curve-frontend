import { Address } from '@ui-kit/utils'

export type TokenOption = {
  address: Address
  symbol: string
  chain?: string
  label?: string
  volume?: number
}
